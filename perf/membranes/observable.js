const ObservableMembrane = require('observable-membrane/dist/umd/observable-membrane.min.js')

module.exports = () => {
  const membrane = new ObservableMembrane()
  return {
    wrap: (obj) => membrane.getProxy(obj)
  }
}
