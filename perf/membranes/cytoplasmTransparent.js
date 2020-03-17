const { Membrane } = require('../../src/index')

module.exports = () => {
  const membrane = new Membrane()
  const cytoplasmSpaceA = membrane.makeMembraneSpace({ label: 'a' })
  const cytoplasmSpaceB = membrane.makeMembraneSpace({ label: 'b' })

  return {
    wrap: (obj) => membrane.bridge(obj, cytoplasmSpaceA, cytoplasmSpaceB)
  }
}
