module.exports = createReadOnlyDistortion

// still allows functions that cause side effects
function createReadOnlyDistortion () {
  return {
    setPrototypeOf: () => false,
    preventExtensions: () => false,
    defineProperty: () => false,
    set: () => false,
    deleteProperty: () => false,
  }
}