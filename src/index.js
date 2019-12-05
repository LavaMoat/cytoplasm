class ObjectGraph {
  constructor ({ label }) {
    this.rawToBridged = new WeakMap()
    this.label = label
  }
}

/*

ProxyHandler
  get
    out: key
    out: receiver

*/

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
    // TODO use replacement proxyTarget for flexible distortions less restrained by "Proxy invariant"
    // e.g. hide otherwise non-configurable properties
    // const proxyTarget = typeof rawRef === 'function' ? function(){} : {}
    const proxyTarget = rawRef
    const bridgedRef = new Proxy(proxyTarget, {
      get: (_, outKey, outReceiver) => {
        // for debugging
        if (outKey === '_isProxy') return true
        // console.log('membrane.bridge - get!')
        // outKey, outReceiver are "raw out"
        const wrappedKey = this.bridge(outKey, outGraph, inGraph)
        const wrappedReceiver = this.bridge(outReceiver, outGraph, inGraph)
        // value is "raw in"
        const value = Reflect.get(rawRef, wrappedKey, wrappedReceiver)
        // value is bridged to "wrapped in"
        return this.bridge(value, inGraph, outGraph)
      },
      apply: (_, outThis, outArgs) => {
        // console.log('membrane.bridge - apply! bridging this+args')
        // outThis, outArgs are "raw out"
        const wrappedThis = this.bridge(outThis, outGraph, inGraph)
        const wrappedArgs = Array.prototype.map.call(outArgs, (arg) => this.bridge(arg, outGraph, inGraph))
        // value is "raw in"
        const value = Reflect.apply(rawRef, wrappedThis, wrappedArgs)
        // value is bridged to "wrapped in"
        // console.log('membrane.bridge - apply - before bridge value')
        return this.bridge(value, inGraph, outGraph)
      },
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

module.exports = { Membrane }