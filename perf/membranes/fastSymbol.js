import SymbolMembrane from 'fast-membrane/dist/umd/symbol/fast-membrane.min.js'

export default () => {
  const membrane = new SymbolMembrane()
  return {
    wrap: (obj) => membrane.getProxy(obj)
  }
}
