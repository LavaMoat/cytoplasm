const SimpleProxyHandler = {
  get (target, prop, receiver) {
    return Reflect.get(target, prop, receiver)
  }
}

module.exports = () => ({
  wrap: (obj) => new Proxy(obj, SimpleProxyHandler)
})
