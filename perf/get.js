const { createFlatData, doManyTimes } = require('./buildData')

module.exports = () => ({
  label: 'get',
  membranes: {
    pojo: require('./membranes/pojo')(),
    simpleProxy: require('./membranes/simpleProxy')(),
    recursiveProxy: require('./membranes/recursiveProxy')(),
    simpleMembrane: require('./membranes/simpleMembrane')(),
    fastSymbol: require('./membranes/fastSymbol')(),
    fastWeakMap: require('./membranes/fastWeakMap')(),
    observable: require('./membranes/observable')(),
    cytoplasmTransparent: require('./membranes/cytoplasmTransparent')()
  },
  setup (membrane, count) {
    return doManyTimes(count, () => createFlatData(10000)).map(membrane.wrap)
  },
  run (runData) {
    let sum = ''
    for (let i = 0; i < runData.length; i++) {
      const entry = runData[i]
      sum += entry.id
      sum += entry.label
      sum += entry.className
    }
    return sum
  }
})
