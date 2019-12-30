const WeakMapMembrane = require('fast-membrane/dist/umd/weakmap/fast-membrane.min.js')

module.exports = () => {
  const membrane = new WeakMapMembrane()
  return {
    wrap: (obj) => membrane.getProxy(obj)
  }
}
