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
    // TODO enforce proxy invariants
    const proxyTarget = getProxyTargetForValue(rawRef)
    const bridgedRef = new Proxy(proxyTarget, {
      getPrototypeOf: createHandlerFn(Reflect.getPrototypeOf, rawRef, inGraph, outGraph).bind(this),
      setPrototypeOf: createHandlerFn(Reflect.setPrototypeOf, rawRef, inGraph, outGraph).bind(this),
      isExtensible: createHandlerFn(Reflect.isExtensible, rawRef, inGraph, outGraph).bind(this),
      preventExtensions: createHandlerFn(Reflect.preventExtensions, rawRef, inGraph, outGraph).bind(this),
      getOwnPropertyDescriptor: createHandlerFn(Reflect.getOwnPropertyDescriptor, rawRef, inGraph, outGraph).bind(this),
      defineProperty: createHandlerFn(Reflect.defineProperty, rawRef, inGraph, outGraph).bind(this),
      has: createHandlerFn(Reflect.has, rawRef, inGraph, outGraph).bind(this),
      get: createHandlerFn(Reflect.get, rawRef, inGraph, outGraph).bind(this),
      set: createHandlerFn(Reflect.set, rawRef, inGraph, outGraph).bind(this),
      deleteProperty: createHandlerFn(Reflect.deleteProperty, rawRef, inGraph, outGraph).bind(this),
      ownKeys: createHandlerFn(Reflect.ownKeys, rawRef, inGraph, outGraph).bind(this),
      apply: createHandlerFn(Reflect.apply, rawRef, inGraph, outGraph).bind(this),
      construct: createHandlerFn(Reflect.construct, rawRef, inGraph, outGraph).bind(this),

    })
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