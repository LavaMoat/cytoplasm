module.exports = createReadOnlyDistortion

// still allows functions that cause side effects
function createReadOnlyDistortion () {
  let revoked = false
  return {
    getPrototypeOf: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.getPrototypeOf(...args)
    },
    setPrototypeOf: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.setPrototypeOf(...args)
    },
    isExtensible: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.isExtensible(...args)
    },
    preventExtensions: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.preventExtensions(...args)
    },
    getOwnPropertyDescriptor: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.getOwnPropertyDescriptor(...args)
    },
    defineProperty: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.defineProperty(...args)
    },
    has: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.has(...args)
    },
    get: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.get(...args)
    },
    set: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.set(...args)
    },
    deleteProperty: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.deleteProperty(...args)
    },
    ownKeys: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.ownKeys(...args)
    },
    apply: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.apply(...args)
    },
    construct: (...args) => {
      if (revoked) throw new Error('membrane was revoked')
      return Reflect.construct(...args)
    },
  },
}