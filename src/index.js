// theres some things we may need to enforce differently when in and out of strict mode
// e.g. fn.arguments
'use strict'

const { getIntrinsics } = require('./getIntrinsics')

const { isArray } = Array

class MembraneSpace {
  constructor ({ label, createHandler, dangerouslyAlwaysUnwrap }) {
    this.alwaysUnwrap = Boolean(dangerouslyAlwaysUnwrap)
    this.rawToBridged = new WeakMap()
    this.handlerForRef = new WeakMap()
    this.label = label
    this.createHandler = createHandler || (() => Reflect)
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

class Membrane {
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
      this.rawToOrigin.set(inRef, inGraph)
    }

    //
    // wrap for ref for "out" graph
    //

    // if "out" graph is set to "alwaysUnwrap", deliver unwrapped
    if (outGraph.alwaysUnwrap) {
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
    const membraneProxyHandler = createMembraneProxyHandler(
      this.debugMode,
      distortionHandler,
      rawRef,
      originGraph,
      outGraph,
      this.bridge.bind(this),
    )
    const outRef = createFlexibleProxy(rawRef, membraneProxyHandler)
    // cache both ways
    outGraph.rawToBridged.set(rawRef, outRef)
    this.bridgedToRaw.set(outRef, rawRef)

    // all done
    return outRef
  }

  shouldSkipBridge (value) {
    // Check for null and undefined
    if (value === null) {
      return true
    }
    if (value === undefined) {
      return true
    }

    // Check for non-objects
    const valueType = typeof value
    if (valueType !== 'object' && valueType !== 'function') {
      return true
    }

    // primordials should not be wrapped
    if (this.primordials.includes(value)) {
      return true
    }

    // Early exit if the objectis an Array.
    if (isArray(value) === true) {
      return false
    }

    return false
  }
}

// handler stack

// ProxyInvariantHandler calls next() <-- needs to have final say
//   MembraneHandler calls next() <-- needs to see distortion result
//     LocalWritesHandler sets behavior

// currently creating handler per-object
// perf: create only once?
//   better to create one each time with rawRef bound?
//   or find a way to map target to rawRef
function createMembraneProxyHandler (debugMode, prevProxyHandler, rawRef, inGraph, outGraph, bridge) {
  const proxyHandler = {
    getPrototypeOf: createHandlerFn(debugMode, prevProxyHandler.getPrototypeOf, rawRef, inGraph, outGraph, bridge),
    setPrototypeOf: createHandlerFn(debugMode, prevProxyHandler.setPrototypeOf, rawRef, inGraph, outGraph, bridge),
    isExtensible: createHandlerFn(debugMode, prevProxyHandler.isExtensible, rawRef, inGraph, outGraph, bridge),
    preventExtensions: createHandlerFn(debugMode, prevProxyHandler.preventExtensions, rawRef, inGraph, outGraph, bridge),
    getOwnPropertyDescriptor: createHandlerFn(debugMode, prevProxyHandler.getOwnPropertyDescriptor, rawRef, inGraph, outGraph, bridge),
    defineProperty: createHandlerFn(debugMode, prevProxyHandler.defineProperty, rawRef, inGraph, outGraph, bridge),
    has: createHandlerFn(debugMode, prevProxyHandler.has, rawRef, inGraph, outGraph, bridge),
    get: createHandlerFn(debugMode, prevProxyHandler.get, rawRef, inGraph, outGraph, bridge),
    set: createHandlerFn(debugMode, prevProxyHandler.set, rawRef, inGraph, outGraph, bridge),
    deleteProperty: createHandlerFn(debugMode, prevProxyHandler.deleteProperty, rawRef, inGraph, outGraph, bridge),
    ownKeys: createHandlerFn(debugMode, prevProxyHandler.ownKeys, rawRef, inGraph, outGraph, bridge),
    apply: createHandlerFn(debugMode, prevProxyHandler.apply, rawRef, inGraph, outGraph, bridge),
    construct: createHandlerFn(debugMode, prevProxyHandler.construct, rawRef, inGraph, outGraph, bridge)
  }
  return proxyHandler
}

function createHandlerFn (debugMode, reflectFn, rawRef, inGraph, outGraph, bridge) {
  if (debugMode) {
    // in debugMode, we dont safely catch and wrap errors
    // while this is insecure, it makes debugging much easier
    return function (_, ...outArgs) {
      const inArgs = outArgs.map(arg => bridge(arg, outGraph, inGraph))
      let value = reflectFn(rawRef, ...inArgs)
      return bridge(value, inGraph, outGraph)
    }
  }
  return function (_, ...outArgs) {
    const inArgs = outArgs.map(arg => bridge(arg, outGraph, inGraph))
    let value, inErr
    try {
      value = reflectFn(rawRef, ...inArgs)
    } catch (err) {
      inErr = err
    }
    if (inErr !== undefined) {
      const outErr = bridge(inErr, inGraph, outGraph)
      throw outErr
    } else {
      return bridge(value, inGraph, outGraph)
    }
  }
}

module.exports = { Membrane, MembraneSpace }

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
      const proxyTargetPropDesc = Reflect.getOwnPropertyDescriptor(fakeTarget, key)
      const proxyTargetPropIsConfigurable = (!proxyTargetPropDesc || proxyTargetPropDesc.configurable)
      // console.warn('@@ getOwnPropertyDescriptor - non configurable', String(key), !!proxyTargetPropIsConfigurable)
      // if proxy target is configurable (and real target is not) update the proxy target to ensure the invariant holds
      if (proxyTargetPropIsConfigurable) {
        Reflect.defineProperty(fakeTarget, key, propDesc)
      }
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