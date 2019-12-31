const { randomPhrase, doManyTimes } = require('./buildData')

module.exports = () => ({
  label: 'set',
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
    return doManyTimes(count, () => new Array(10000)).map(membrane.wrap)
  },
  run (runData) {
    for (let i = 0; i < 10000; i++) {
      runData[i] = {}
      const obj = runData[i]

      obj.id = i
      obj.label = randomPhrase()
      obj.className = randomPhrase()
    }
  },
  context: {
    randomPhrase
  }
})
