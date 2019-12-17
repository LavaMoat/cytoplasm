// theres some things we may need to enforce differently when in and out of strict mode
// e.g. fn.arguments
"use strict"

class ObjectGraph {
  constructor ({ label, handler }) {
    this.rawToBridged = new WeakMap()
    this.label = label
    this.handler = handler || Reflect
  }
}

class Membrane {
  constructor () {
    this.primordials = [Object, Object.prototype]
    this.bridgedToRaw = new WeakMap()
    this.rawToOrigin = new WeakMap()
  }
  makeObjectGraph ({ label, handler }) {
    return new ObjectGraph({ label, handler })
  }
  // if rawObj is not part of inGraph, should we explode?
  bridge (inRef, inGraph, outGraph) {
    // skip if should be passed directly (danger)
    if (this.shouldSkipBridge(inRef)) {
      // console.log(`membrane.bridge should skip in:${inGraph.label} -> out:${outGraph.label}`)
      return inRef
    }
    // unwrap ref if bridged to "in"
    let rawRef
    if (this.bridgedToRaw.has(inRef)) {
      rawRef = this.bridgedToRaw.get(inRef)
      const origin = this.rawToOrigin.get(rawRef)
      // console.log('rawToOrigin get', origin)
      // if this ref originates in the outGraph, return raw!
      if (origin === outGraph) {
        // console.log(`membrane.bridge inRef known headed home in:${inGraph.label} -> out:${outGraph.label}`)
        return rawRef
      }
      // console.log(`membrane.bridge inRef known origin:${origin.label} in:${inGraph.label} -> out:${outGraph.label}`)
      // set the raw ref so it can be wrapped for outGraph
    } else {
      // console.log(`inRef is proxy`, !!inRef._isProxy, '<---')
      if (this.rawToOrigin.has(rawRef)) {
        throw new Error('something broke')
      }

      // console.log(`membrane.bridge inRef new ref (${typeof inRef}) in:${inGraph.label} -> out:${outGraph.label}`)
      // we've never seen this ref before - must be raw and from inGraph
      rawRef = inRef
      // console.log('rawToOrigin set', inGraph.label)
      this.rawToOrigin.set(rawRef, inGraph)
    }
    // if outGraph already has bridged iterface for rawRef, use it
    // check if cache available
    if (outGraph.rawToBridged.has(rawRef)) {
      // console.log(`membrane.bridge cache hit in:${inGraph.label} -> out:${outGraph.label}`)
      return outGraph.rawToBridged.get(rawRef)
    }

    const proxyTarget = getProxyTargetForValue(rawRef)
    const distortionHandler = inGraph.handler
    const membraneProxyHandler = createMembraneProxyHandler(distortionHandler, rawRef, inGraph, outGraph, this.bridge.bind(this))
    const proxyHandler = respectProxyInvariants(proxyTarget, membraneProxyHandler)
    const bridgedRef = new Proxy(proxyTarget, proxyHandler)
    // cache both ways
    outGraph.rawToBridged.set(rawRef, bridgedRef)
    this.bridgedToRaw.set(bridgedRef, rawRef)
    if (!this.rawToOrigin.has(rawRef)) {
      throw new Error('something broke')
    }
    // all done
    return bridgedRef
  }
  shouldSkipBridge (value) {
    // skip if a simple value
    if (Object(value) !== value) return true
    // skip if primodial
    if (this.primordials.includes(value)) return true
    // otherwise we cant skip it
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
function createMembraneProxyHandler (prevProxyHandler, rawRef, inGraph, outGraph, bridge) {
  const proxyHandler = {
    getPrototypeOf: createHandlerFn(prevProxyHandler.getPrototypeOf, rawRef, inGraph, outGraph, bridge),
    setPrototypeOf: createHandlerFn(prevProxyHandler.setPrototypeOf, rawRef, inGraph, outGraph, bridge),
    isExtensible: createHandlerFn(prevProxyHandler.isExtensible, rawRef, inGraph, outGraph, bridge),
    preventExtensions: createHandlerFn(prevProxyHandler.preventExtensions, rawRef, inGraph, outGraph, bridge),
    getOwnPropertyDescriptor: createHandlerFn(prevProxyHandler.getOwnPropertyDescriptor, rawRef, inGraph, outGraph, bridge),
    defineProperty: createHandlerFn(prevProxyHandler.defineProperty, rawRef, inGraph, outGraph, bridge),
    has: createHandlerFn(prevProxyHandler.has, rawRef, inGraph, outGraph, bridge),
    get: createHandlerFn(prevProxyHandler.get, rawRef, inGraph, outGraph, bridge),
    set: createHandlerFn(prevProxyHandler.set, rawRef, inGraph, outGraph, bridge),
    deleteProperty: createHandlerFn(prevProxyHandler.deleteProperty, rawRef, inGraph, outGraph, bridge),
    ownKeys: createHandlerFn(prevProxyHandler.ownKeys, rawRef, inGraph, outGraph, bridge),
    apply: createHandlerFn(prevProxyHandler.apply, rawRef, inGraph, outGraph, bridge),
    construct: createHandlerFn(prevProxyHandler.construct, rawRef, inGraph, outGraph, bridge),
  }
  return proxyHandler
}

// TODO ensure we're enforcing all proxy invariants
function respectProxyInvariants (proxyTarget, rawProxyHandler) {
  // the defaults arent needed for the membraneProxyHandler,
  // but might be for an imcomplete proxy handler
  const handlerWithDefaults = Object.assign({}, Reflect, rawProxyHandler)
  const respectfulProxyHandler = Object.assign({}, handlerWithDefaults)
  // add respect
  respectfulProxyHandler.getOwnPropertyDescriptor = (_, key) => {
    // ensure propDesc matches proxy target's non-configurable property
    const propDesc = handlerWithDefaults.getOwnPropertyDescriptor(_, key)
    if (propDesc && !propDesc.configurable) {
      const proxyTargetPropDesc = Reflect.getOwnPropertyDescriptor(proxyTarget, key)
      const proxyTargetPropIsConfigurable = (!proxyTargetPropDesc || proxyTargetPropDesc.configurable)
      // console.warn('@@ getOwnPropertyDescriptor - non configurable', String(key), !!proxyTargetPropIsConfigurable)
      // if proxy target is configurable (and real target is not) update the proxy target to ensure the invariant holds
      if (proxyTargetPropIsConfigurable) {
        Reflect.defineProperty(proxyTarget, key, propDesc)
      }
    }
    return propDesc
  }
  // return modified handler
  return respectfulProxyHandler
}

function createHandlerFn (reflectFn, rawRef, inGraph, outGraph, bridge) {
  return function (_, ...outArgs) {
    const inArgs = Array.prototype.map.call(outArgs, (arg) => {
      return bridge(arg, outGraph, inGraph)
    })
    let value, inErr
    try {
      // we also provide the outArgs, non-standard
      value = reflectFn(rawRef, ...inArgs, ...outArgs)
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

// use replacement proxyTarget for flexible distortions less restrained by "Proxy invariant"
// e.g. hide otherwise non-configurable properties
function getProxyTargetForValue (value) {
  if (typeof value === 'function') {
    if (value.prototype) {
      return function(){}
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

module.exports = { Membrane }