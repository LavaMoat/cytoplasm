const { Membrane } = require('../../src/index')

module.exports = () => {
  const membrane = new Membrane()
  const cytoplasmSpaceA = membrane.makeObjectGraph({ label: 'a' })
  const cytoplasmSpaceB = membrane.makeObjectGraph({ label: 'b' })

  return {
    wrap: (obj) => membrane.bridge(obj, cytoplasmSpaceA, cytoplasmSpaceB)
  }
}
