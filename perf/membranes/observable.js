import { ObservableMembrane } from 'observable-membrane'

export default () => {
  const membrane = new ObservableMembrane()
  return {
    wrap: (obj) => membrane.getProxy(obj)
  }
}
