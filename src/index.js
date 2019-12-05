// theres some things we may need to enforce differently when in and out of strict mode
// e.g. fn.arguments
"use strict"

class ObjectGraph {
  constructor ({ label }) {
    this.rawToBridged = new WeakMap()
    this.label = label
  }
}

class Membrane {
  constructor () {
    this.primordials = [Object, Object.prototype]
    this.bridgedToRaw = new WeakMap()
    this.rawToOrigin = new WeakMap()
  }
  makeObjectGraph ({ label }) {
    return new ObjectGraph({ label })
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
    // setup bridge
    const proxyTarget = getProxyTargetForValue(rawRef)
    const membraneProxyHandler = createMembraneProxyHandler(this, rawRef, inGraph, outGraph)
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

function createMembraneProxyHandler (thisRef, rawRef, inGraph, outGraph) {
  const proxyHandler = {
    getPrototypeOf: createHandlerFn(Reflect.getPrototypeOf, rawRef, inGraph, outGraph).bind(thisRef),
    setPrototypeOf: createHandlerFn(Reflect.setPrototypeOf, rawRef, inGraph, outGraph).bind(thisRef),
    isExtensible: createHandlerFn(Reflect.isExtensible, rawRef, inGraph, outGraph).bind(thisRef),
    preventExtensions: createHandlerFn(Reflect.preventExtensions, rawRef, inGraph, outGraph).bind(thisRef),
    getOwnPropertyDescriptor: createHandlerFn(Reflect.getOwnPropertyDescriptor, rawRef, inGraph, outGraph).bind(thisRef),
    defineProperty: createHandlerFn(Reflect.defineProperty, rawRef, inGraph, outGraph).bind(thisRef),
    has: createHandlerFn(Reflect.has, rawRef, inGraph, outGraph).bind(thisRef),
    get: createHandlerFn(Reflect.get, rawRef, inGraph, outGraph).bind(thisRef),
    set: createHandlerFn(Reflect.set, rawRef, inGraph, outGraph).bind(thisRef),
    deleteProperty: createHandlerFn(Reflect.deleteProperty, rawRef, inGraph, outGraph).bind(thisRef),
    ownKeys: createHandlerFn(Reflect.ownKeys, rawRef, inGraph, outGraph).bind(thisRef),
    apply: createHandlerFn(Reflect.apply, rawRef, inGraph, outGraph).bind(thisRef),
    construct: createHandlerFn(Reflect.construct, rawRef, inGraph, outGraph).bind(thisRef),
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

function createHandlerFn (reflectFn, rawRef, inGraph, outGraph) {
  return function (_, ...outArgs) {
    const wrappedArgs = Array.prototype.map.call(outArgs, (arg) => {
      return this.bridge(arg, outGraph, inGraph)
    })
    let value, err
    try {
      value = reflectFn(rawRef, ...wrappedArgs)
    } catch (_err) {
      err = _err
    }
    if (err !== undefined) {
      const wrappedErr = this.bridge(err, inGraph, outGraph)
      throw wrappedErr
    } else {
      return this.bridge(value, inGraph, outGraph)
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