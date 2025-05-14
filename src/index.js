// theres some things we may need to enforce differently when in and out of strict mode
// e.g. fn.arguments
import { getIntrinsics } from './getIntrinsics.js'

const { isArray } = Array

export class MembraneSpace {
  constructor ({ label, createHandler, dangerouslyAlwaysUnwrap, passthroughFilter }) {
    this.alwaysUnwrap = Boolean(dangerouslyAlwaysUnwrap)
    this.rawToBridged = new WeakMap()
    this.handlerForRef = new WeakMap()
    this.label = label
    this.createHandler = createHandler || (() => Reflect)
    this.passthroughFilter = passthroughFilter || (() => false)
  }

  getHandlerForRef (rawRef) {
    if (this.handlerForRef.has(rawRef)) {
      return this.handlerForRef.get(rawRef)
    }
    const handler = this.createHandler({
      setHandlerForRef: (ref, newHandler) => this.handlerForRef.set(ref, newHandler)
    })
    this.handlerForRef.set(rawRef, handler)
    return handler
  }
}

export class Membrane {
  constructor ({ debugMode, primordials } = {}) {
    this.debugMode = debugMode
    this.primordials = primordials || Object.values(getIntrinsics())
    this.bridgedToRaw = new WeakMap()
    this.rawToOrigin = new WeakMap()
  }

  makeMembraneSpace (opts) {
    return new MembraneSpace(opts)
  }

  // if rawObj is not part of inGraph, should we explode?
  bridge (inRef, inGraph, outGraph) {

    // if we've been asked to bridge a ref between the same to spaces, its a no-op
    if (inGraph === outGraph) {
      return inRef
    }

    //
    // skip if should be passed directly (danger)
    //

    if (this.shouldSkipBridge(inRef)) {
      // console.log(`membrane.bridge should skip in:${inGraph.label} -> out:${outGraph.label}`)
      return inRef
    }

    //
    // unwrap ref and detect "origin" graph
    //

    let rawRef
    let originGraph

    if (this.bridgedToRaw.has(inRef)) {
      // we know this ref
      rawRef = this.bridgedToRaw.get(inRef)
      originGraph = this.rawToOrigin.get(rawRef)
    } else {
      // we've never seen this ref before - must be raw and from inGraph
      rawRef = inRef
      originGraph = inGraph
      // record origin
      // console.log(`assigning to "${inGraph.label}"`, this.debugLabelForValue(rawRef))
      this.rawToOrigin.set(inRef, inGraph)
    }

    // allow graphs to pass through some values unwrapped
    if (outGraph.passthroughFilter(rawRef)) {
      return rawRef
    }

    //
    // wrap for ref for "out" graph
    //

    // if "out" graph is set to "alwaysUnwrap", deliver unwrapped
    if (outGraph.alwaysUnwrap) {
      // workaround for the arguments array which is an unwrapped array
      // with wrapped elements
      const isRawArgumentsArray = (inRef === rawRef && Array.isArray(rawRef))
      if (isRawArgumentsArray) {
        rawRef = rawRef.map(childRef => this.bridge(childRef, inGraph, outGraph))
      }
      return rawRef
    }

    // if this ref originates in the "out" graph, deliver unwrapped
    if (originGraph === outGraph) {
      return rawRef
    }

    // if outGraph already has bridged wrapping for rawRef, use it
    if (outGraph.rawToBridged.has(rawRef)) {
      return outGraph.rawToBridged.get(rawRef)
    }

    // create new wrapping for rawRef
    const distortionHandler = originGraph.getHandlerForRef(rawRef)
    const membraneProxyHandler = this.createMembraneProxyHandler(
      distortionHandler,
      rawRef,
      originGraph,
      outGraph,
    )
    const outRef = createFlexibleProxy(rawRef, membraneProxyHandler)
    // cache both ways
    outGraph.rawToBridged.set(rawRef, outRef)
    this.bridgedToRaw.set(outRef, rawRef)

    // all done
    return outRef
  }

  // handler stack

  // ProxyInvariantHandler calls next() <-- needs to have final say
  //   MembraneHandler calls next() <-- needs to see distortion result
  //     LocalWritesHandler sets behavior

  // currently creating handler per-object
  // perf: create only once?
  //   better to create one each time with rawRef bound?
  //   or find a way to map target to rawRef
  createMembraneProxyHandler (prevProxyHandler, rawRef, originGraph, outGraph) {
    const proxyHandler = {
      getPrototypeOf: this.createHandlerFn('getPrototypeOf', prevProxyHandler.getPrototypeOf, rawRef, originGraph, outGraph),
      setPrototypeOf: this.createHandlerFn('setPrototypeOf', prevProxyHandler.setPrototypeOf, rawRef, originGraph, outGraph),
      isExtensible: this.createHandlerFn('isExtensible', prevProxyHandler.isExtensible, rawRef, originGraph, outGraph),
      preventExtensions: this.createHandlerFn('preventExtensions', prevProxyHandler.preventExtensions, rawRef, originGraph, outGraph),
      getOwnPropertyDescriptor: this.createHandlerFn('getOwnPropertyDescriptor', prevProxyHandler.getOwnPropertyDescriptor, rawRef, originGraph, outGraph),
      defineProperty: this.createHandlerFn('defineProperty', prevProxyHandler.defineProperty, rawRef, originGraph, outGraph),
      has: this.createHandlerFn('has', prevProxyHandler.has, rawRef, originGraph, outGraph),
      get: this.createHandlerFn('get', prevProxyHandler.get, rawRef, originGraph, outGraph),
      set: this.createHandlerFn('set', prevProxyHandler.set, rawRef, originGraph, outGraph),
      deleteProperty: this.createHandlerFn('deleteProperty', prevProxyHandler.deleteProperty, rawRef, originGraph, outGraph),
      ownKeys: this.createHandlerFn('ownKeys', prevProxyHandler.ownKeys, rawRef, originGraph, outGraph),
      apply: this.createHandlerFn('apply', prevProxyHandler.apply, rawRef, originGraph, outGraph),
      construct: this.createHandlerFn('construct', prevProxyHandler.construct, rawRef, originGraph, outGraph)
    }
    return proxyHandler
  }

  createHandlerFn (action, reflectFn, rawRef, originGraph, outGraph) {
    const bridge = this.bridge.bind(this)
    if (this.debugMode) {
      // in debugMode, we dont safely catch and wrap errors
      // while this is insecure, it makes debugging much easier
      return (_, ...outArgs) => {
        const originArgs = outArgs.map(arg => bridge(arg, outGraph, originGraph))
        let value = reflectFn(rawRef, ...originArgs)
        return bridge(value, originGraph, outGraph)
      }
    }
    // this works for all proxy handlers
    // - arguments are from outside, bridge to origin
    // - call reflect fn with bridged arguments
    // - bridge return value or error back to outside
    return (_, ...outArgs) => {
      const originArgs = outArgs.map(arg => bridge(arg, outGraph, originGraph))
      let value, originErr
      try {
        value = reflectFn(rawRef, ...originArgs)
      } catch (err) {
        originErr = err
      }
      if (originErr !== undefined) {
        const outErr = bridge(originErr, originGraph, outGraph)
        throw outErr
      } else {
        return bridge(value, originGraph, outGraph)
      }
    }
  }

  // some values can/should not be membrane wrapped
  shouldSkipBridge (value) {
    // Check for null and undefined
    if (value === null) {
      return true
    }
    if (value === undefined) {
      return true
    }

    // early exit if the object is an Array instance (common)
    if (isArray(value) && value !== Array.prototype) {
      // cant skip bridge
      return false
    }

    // check for non-objects
    const valueType = typeof value
    if (valueType !== 'object' && valueType !== 'function') {
      return true
    }

    // primordials should not be wrapped
    if (this.primordials.includes(value)) {
      return true
    }

    // otherwise needs to be wrapped
    return false
  }

  getOriginSpace (ref) {
    const rawRef = this.bridgedToRaw.get(ref) || ref
    const originSpace = this.rawToOrigin.get(rawRef)
    return originSpace
  }

  isWrapped (ref) {
    return this.bridgedToRaw.has(ref)
  }

  // this returns a string representing the passed in value
  // it is used for debugging
  debugLabelForValue (inRef) {
    let rawRef, originLabel
    if (this.bridgedToRaw.has(inRef)) {
      // we know this ref
      rawRef = this.bridgedToRaw.get(inRef)
      originLabel = this.rawToOrigin.get(rawRef).label
    } else {
      // we dont know it
      rawRef = inRef
      originLabel = 'raw'
    }
    let valueLabel
    const type = typeof rawRef
    if (type === 'string') return `"${rawRef}"`
    if (type === 'object' && Array.isArray(rawRef)) {
      // && rawRef !== Array.prototype
      valueLabel = `[${rawRef.map(value => {
        if (Array.isArray(value)) return `<array>(${originLabel})`
        return this.debugLabelForValue(value)
      }).join(', ')}]`
      // return '<array>'
    } else if (type === 'function') {
      valueLabel= `<function: ${rawRef.name}>`
    } else {
      valueLabel = `<${type}>`
    }
    return `${valueLabel}(${originLabel})`
  }

}

//
// FlexibleProxy
//

function createFlexibleProxy (realTarget, realHandler) {
  const flexibleTarget = getProxyTargetForValue(realTarget)
  const flexibleHandler = respectProxyInvariants(realHandler)
  return new Proxy(flexibleTarget, flexibleHandler)
}

// use replacement proxyTarget for flexible distortions less restrained by "Proxy invariant"
// e.g. hide otherwise non-configurable properties
function getProxyTargetForValue (value) {
  if (typeof value === 'function') {
    if (value.prototype) {
      return function () {}
    } else {
      return () => {}
    }
  } else {
    if (Array.isArray(value)) {
      return []
    } else {
      return {}
    }
  }
}

// TODO ensure we're enforcing all proxy invariants
function respectProxyInvariants (rawProxyHandler) {
  // the defaults arent needed for the membraneProxyHandler,
  // but might be for an imcomplete proxy handler
  const handlerWithDefaults = Object.assign({}, Reflect, rawProxyHandler)
  const respectfulProxyHandler = Object.assign({}, handlerWithDefaults)
  // enforce configurable false props
  respectfulProxyHandler.getOwnPropertyDescriptor = (fakeTarget, key) => {
    // ensure propDesc matches proxy target's non-configurable property
    const propDesc = handlerWithDefaults.getOwnPropertyDescriptor(fakeTarget, key)
    if (propDesc && !propDesc.configurable) {
      // if real target prop is non-configurable, update the fake target to ensure the invariant holds
      Reflect.defineProperty(fakeTarget, key, propDesc)
    }
    return propDesc
  }
  // enforce preventing extensions
  respectfulProxyHandler.preventExtensions = (fakeTarget) => {
    // check if provided handler allowed the preventExtensions call
    const didAllow = handlerWithDefaults.preventExtensions(fakeTarget)
    // if it did allow, we need to enforce this on the fakeTarget
    if (didAllow === true) {
      // transfer all keys onto fakeTarget
      const propDescs = handlerWithDefaults.ownKeys(fakeTarget).map(prop => {
        const propDesc = handlerWithDefaults.getOwnPropertyDescriptor(fakeTarget, prop)
        Reflect.defineProperty(fakeTarget, prop, propDesc)
      })
      // transfer prototype
      Reflect.setPrototypeOf(fakeTarget, handlerWithDefaults.getPrototypeOf(fakeTarget))
      // prevent extensions on fakeTarget
      Reflect.preventExtensions(fakeTarget)
    }
    // return the result
    return didAllow
  }
  // enforce defineProperty configurable: false
  respectfulProxyHandler.defineProperty = (fakeTarget, prop, propDesc) => {
    const didAllow = handlerWithDefaults.defineProperty(fakeTarget, prop, propDesc)
    // need to also define on the fakeTarget
    if (didAllow && !propDesc.configurable) {
      Reflect.defineProperty(fakeTarget, prop, propDesc)
    }
    return didAllow
  }
  // return modified handler
  return respectfulProxyHandler
}