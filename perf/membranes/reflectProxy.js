export default () => ({
  wrap: (obj) => new Proxy(obj, Reflect)
})
