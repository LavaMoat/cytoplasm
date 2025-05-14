import { Bench } from 'tinybench'
import getTest from './get.js'
import deepGetTest from './deepGet.js'
import setTest from './set.js'

import pojo from './membranes/pojo.js'
import emptyProxy from './membranes/emptyProxy.js'
import reflectProxy from './membranes/reflectProxy.js'
import recursiveProxy from './membranes/recursiveProxy.js'
import simpleMembrane from './membranes/simpleMembrane.js'
import fastSymbol from './membranes/fastSymbol.js'
import fastWeakMap from './membranes/fastWeakMap.js'
import observable from './membranes/observable.js'
import cytoplasmTransparent from './membranes/cytoplasmTransparent.js'


const makeDefaultMembranes = () => ({
  'non-membrane:pojo': pojo(),
  'non-membrane:emptyProxy': emptyProxy(),
  'non-membrane:reflectProxy': reflectProxy(),
  'non-membrane:recursiveProxy': recursiveProxy(),
  'test:simpleMembrane': simpleMembrane(),
  'fast-membrane:symbol': fastSymbol(),
  'fast-membrane:weakmap': fastWeakMap(),
  'observable-membrane': observable(),
  'cytoplasm:transparent': cytoplasmTransparent()
})

main()

async function main () {
  await runAll([
    getTest(makeDefaultMembranes),
    deepGetTest(makeDefaultMembranes),
    setTest(makeDefaultMembranes),
  ])
}

async function runSuite (suiteParams) {
  const bench = new Bench({
    time: 1000,
    iterations: 100,
    warmupTime: 100,
  })

  console.log(`\n== ${suiteParams.label} ==`)

  for (const [name, membrane] of Object.entries(suiteParams.membranes)) {
    bench.add(name, async () => {
      const data = suiteParams.setup(membrane, 100)
      return suiteParams.run(data)
    })
  }

  await bench.run()
  console.table(bench.table())
  return {
    name: suiteParams.label,
    results: bench.results.map((r, index) => ({
      name: Object.keys(suiteParams.membranes)[index],
      result: r,
    }))
  }
}

async function runAll (suites) {
  const allResults = []
  for (const suite of suites) {
    allResults.push(await runSuite(suite))
  }
  displayAllResults(allResults)
}

function displayAllResults (allResults) {
  const resultSummary = {}
  allResults.forEach(({ name: suiteName, results: suiteResults }) => {
    suiteResults.forEach(({ name: membraneName, result }) => {
      const membraneResult = resultSummary[membraneName] = resultSummary[membraneName] || {}
      membraneResult[suiteName] = Math.round(result.hz)
    })
  })
  console.log('\n== Summary ==')
  console.table(resultSummary)
}
