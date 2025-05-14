import WeakMapMembrane from 'fast-membrane/dist/umd/weakmap/fast-membrane.min.js'

export default () => {
  const membrane = new WeakMapMembrane()
  return {
    wrap: (obj) => membrane.getProxy(obj)
  }
}
