'use strict'

// this wraps values in Proxies, but does not handle circular refs

const { isArray } = Array
const { getPrototypeOf, prototype: ObjectPrototype } = Object

// making this a class vs object has neglible effect
const handler = {
  get (target, prop, receiver) {
    return wrap(Reflect.get(target, prop, receiver))
  }
}

module.exports = () => ({
  wrap
})

function wrap (raw) {
  // skip if not object-like
  if (!(function(object){
    // Intentionally checking for null.
    if (object === null) {
      return false
    }

    // Treat all non-object types, including undefined, as non-observable values.
    if (typeof object !== 'object') {
      return false
    }

    // Early exit if the object is an Array.
    if (isArray(object) === true) {
      return true
    }

    const proto = getPrototypeOf(object)
    const isPlainObject =
          proto === null ||
          proto === ObjectPrototype ||
          getPrototypeOf(proto) === null

    if (isPlainObject === false) {
      return false
    }

    return true
  })(raw)) return raw
  // return wrapped version
  const proxy = new Proxy(raw, handler)
  return proxy
}

function isWrappable (object) {
  // Intentionally checking for null.
  if (object === null) {
    return false
  }

  // Treat all non-object types, including undefined, as non-observable values.
  if (typeof object !== 'object') {
    return false
  }

  // Early exit if the object is an Array.
  if (isArray(object) === true) {
    return true
  }

  const proto = getPrototypeOf(object)
  const isPlainObject =
        proto === null ||
        proto === ObjectPrototype ||
        getPrototypeOf(proto) === null

  if (isPlainObject === false) {
    return false
  }

  return true
}
