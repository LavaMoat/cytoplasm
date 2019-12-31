'use strict'

const { isArray } = Array
const { getPrototypeOf, isFrozen, prototype: ObjectPrototype } = Object

const handler = {
  get (target, prop, receiver) {
    const unwrappedReceiver = unwrap(receiver)
    const value = unwrappedReceiver[prop]
    return wrap(value)
  },
  set (target, prop, value, receiver) {
    const unwrappedReceiver = unwrap(receiver)
    unwrappedReceiver[prop] = value
    return true
  }
}

const rawToProxy = new WeakMap()
const proxyToRaw = new WeakMap()

module.exports = () => ({
  wrap,
  unwrap,
})

function wrap (raw) {
  // skip if not object-like
  if (!isWrappable(raw)) return raw
  // check cache
  if (rawToProxy.has(raw)) {
    rawToProxy.get(raw)
  }
  // return wrapped version
  const proxy = new Proxy(raw, handler)
  proxyToRaw.set(proxy, raw)
  rawToProxy.set(raw, proxy)
  return proxy
}

function unwrap (maybeProxy) {
  // return as if unwrappable
  if (!isWrappable(maybeProxy)) return maybeProxy
  // unwrap if known
  if (proxyToRaw.has(maybeProxy)) {
    return proxyToRaw.get(maybeProxy)
  }
  // return as is
  return maybeProxy
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
