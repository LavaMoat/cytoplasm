module.exports = createDistortion

// still allows functions that cause side effects
function createDistortion ({ setHandlerForRef }) {
  return {
    // prevent direct mutability
    setPrototypeOf: () => false,
    preventExtensions: () => false,
    defineProperty: () => false,
    set: () => false,
    deleteProperty: () => false,
    // special case: instantiated children should be mutable
    construct: (...args) => {
      // construct child
      const result = Reflect.construct(...args)
      // set child as mutable
      setHandlerForRef(result, Reflect)
      // return constructed child
      return result
    },
    // default behavior
    apply: Reflect.apply,
    get: Reflect.get,
    getOwnPropertyDescriptor: Reflect.getOwnPropertyDescriptor,
    getPrototypeOf: Reflect.getPrototypeOf,
    has: Reflect.has,
    isExtensible: Reflect.isExtensible,
    ownKeys: Reflect.ownKeys,
  }
}