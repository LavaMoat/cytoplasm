module.exports = () => ({
  wrap: (obj) => new Proxy(obj, Reflect)
})
