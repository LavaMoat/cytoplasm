
// still allows functions that cause side effects
export default function createAlwaysThrowDistortion () {
  const handler = {
    getPrototypeOf: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    setPrototypeOf: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    isExtensible: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    preventExtensions: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    getOwnPropertyDescriptor: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    defineProperty: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    has: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    get: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    set: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    deleteProperty: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    ownKeys: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    apply: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    },
    construct: (...args) => {
      throw new Error('Cytoplasm AlwaysThrowDistorion exploded as planned')
    }
  }

  return handler
}
