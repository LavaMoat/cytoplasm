const SymbolMembrane = require('fast-membrane/dist/umd/symbol/fast-membrane.min.js')

module.exports = () => {
  const membrane = new SymbolMembrane()
  return {
    wrap: (obj) => membrane.getProxy(obj)
  }
}
