import ObservableMembrane from 'observable-membrane/dist/umd/observable-membrane.min.js'

export default () => {
  const membrane = new ObservableMembrane()
  return {
    wrap: (obj) => membrane.getProxy(obj)
  }
}
