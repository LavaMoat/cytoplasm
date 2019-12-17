module.exports = createDistortion

// still allows functions that cause side effects
function createDistortion ({ setHandlerForRef }) {
  // clone Reflect for base handler
  const baseHandler = Object.defineProperties({}, Object.getOwnPropertyDescriptors(Reflect))
  return Object.assign(baseHandler, {
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
  })
}