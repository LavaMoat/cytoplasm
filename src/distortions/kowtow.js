module.exports = createKowtowDistortion

// still allows functions that cause side effects
function createKowtowDistortion () {
  // this is per-ObjectGraph so we can map
  // <x,"a"> to x's shadow of "a"
  const parentToOverwrites = new WeakMap()

  // TODO
  // propDesc might have setter and not writable

  return {
    // reads
    get: (rawTarget, key, receiver) => {
      const { writes, deletes } = getOverwrites(rawTarget)
      if (deletes.has(key)) {
        return undefined
      }
        // read from overrides
      if (writes.has(key)) {
        return writes.get(key).value
      }
      // read from proxy target
      const value = Reflect.get(rawTarget, key, receiver)
      return value
    },
    getOwnPropertyDescriptor: (rawTarget, key) => {
      const overwrites = getOverwrites(rawTarget)
      const targetPropDesc = getOwnPropertyDescriptor(overwrites, rawTarget, key)
      return targetPropDesc
    },
    getPrototypeOf: (rawTarget) => {
      const overwrites = getOverwrites(rawTarget)
      if ('prototype' in overwrites) {
        return overwrites.prototype
      } else {
        return Reflect.getPrototypeOf(rawTarget)
      }
    },
    isExtensible: (rawTarget) => {
      const overwrites = getOverwrites(rawTarget)
      return getIsExtensible(overwrites, rawTarget)
    },
    ownKeys: (rawTarget) => {
      const { writes, deletes } = getOverwrites(rawTarget)
      // add targets keys
      const targetKeys = Reflect.ownKeys(rawTarget)
      const keys = new Set(targetKeys)
      // add additional keys
      for (let key of writes.keys()) keys.add(key)
      // remove deleted keys
      for (let key of deletes.keys()) keys.delete(key)
      // tape's t.deepEqual needs this to be an array (?)
      return Array.from(keys.values())
    },
    has: (rawTarget, key) => {
      const { writes, deletes } = getOverwrites(rawTarget)
      if (writes.has(key)) {
        return true
      }
      if (deletes.has(key)) {
        return false
      }
      return Reflect.has(target, key)
    },

    //
    // writes
    //

    set: (rawTarget, key, value, localReceiver) => {
      // caution
      // be careful of parent vs receiver

      // check property descriptors for setter
      const overwrites = getOverwrites(rawTarget)
      const targetPropDesc = getOwnPropertyDescriptor(overwrites, rawTarget, key)

      // call setter if present
      if (targetPropDesc && targetPropDesc.set) {
        const setter = targetPropDesc.set
        return setter.call(receiver, value)
      }

      // writable false?
      if (!targetPropDesc.writable) return false


      // // ??
      // if (!proxyToShadows.has(receiver)) {
      //   return Reflect.set(target, key, value, receiver)
      // }

      // set on overwrites for receiver
      const receiverOverwrites = getOverwrites(localReceiver)

      receiverOverwrites.deletes.delete(key)
      receiverOverwrites.writes.set(key, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      })

      return true
    },
    defineProperty: (rawTarget, key, propDesc) => {
      // check if property configurable
      const overwrites = getOverwrites(rawTarget)
      const isExtensible = getIsExtensible(overwrites, rawTarget)
      if (!isExtensible) throw new TypeError(`Cannot define property ${key}, object is not extensible`)
      const prop = getOwnPropertyDescriptor(overwrites, rawTarget, key)
      if (prop && !prop.configurable) return false
      setOwnPropertyDescriptor(rawTarget, key, propDesc)
    },
    deleteProperty: (rawTarget, key) => {
      // check if property configurable
      const overwrites = getOverwrites(rawTarget)
      const prop = getOwnPropertyDescriptor(overwrites, rawTarget, key)
      if (prop && !prop.configurable) return false
      // put delete in overwrites
      overwrites.deletes.add(key)
      overwrites.writes.delete(key)
      return true
    },
    preventExtensions: (rawTarget) => {
      const overwrites = getOverwrites(rawTarget)
      overwrites.extensible = false
      return true
    },
    setPrototypeOf: (rawTarget, newProto) => {
      const overwrites = getOverwrites(rawTarget)
      // check if extensible
      const extensible = getIsExtensible(overwrites, rawTarget)
      if (!extensible) return false
      // set new prototype
      overwrites.prototype = newProto
      return true
    },
    // TODO: use remoteRef (this proxy) for "apply"
    apply: (rawTarget, localThis, localArgList, remoteThis) => {
      thisProxy
      return rawTarget.apply(localThis, localArgList)
    },
    // should be fine as is
    construct: Reflect.construct,
  }

  function getIsExtensible (overwrites, rawTarget) {
    if ('extensible' in overwrites) {
      return overwrites.extensible
    } else {
      return Reflect.isExtensible(rawTarget)
    }
  }

  function getOwnPropertyDescriptor (overwrites, rawTarget, key) {
    if (overwrites.deletes.has(key)) returns
    let prop = overwrites.writes.get(key)
    if (prop) return prop
    return Reflect.getOwnPropertyDescriptor(rawTarget, key)
  }

  function getOverwrites (rawTarget) {
    // get if already populated
    let overwrites = parentToOverwrites.get(rawTarget)
    if (overwrites) return overwrites
    // populate
    overwrites = {
      writes: new Map(),
      deletes: new Set(),
      // dont populate if not set
      // this allows us to fallback to the rawTarget's value
      // extensible: undefined,
      // prototype: undefined,
    }
    parentToOverwrites.set(rawTarget, overwrites)
    return overwrites
  }

}
