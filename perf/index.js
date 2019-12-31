const { Suite } = require('benchmark')

main()

async function main () {
  runAll([
    require('./get')(),
    require('./deepGet')(),
    require('./set')()
  ])
}

async function runSuite (suiteParams) {
  let resolve; let reject; const promise = new Promise((res, rej) => { resolve = res; reject = rej })

  Object.assign(global, {
    suiteParams
  }, suiteParams.context)

  const suite = new Suite(suiteParams.label)
  Object.entries(suiteParams.membranes).map(([name, membrane]) => {
    suite.add(name, () => {
      // this is run in a special eval context within the scope of `setup`
      suiteParams.run(seriesData.pop())
    }, {
      // this is run in a special eval context
      setup: Function(`
        const membrane = suiteParams.membranes['${name}']
        const seriesData = suiteParams.setup(membrane, this.count)
      `)
    })
  })

  const suiteResults = []

  suite
    .on('start', function () {
      console.log(`== ${this.name} ==`)
    })
    .on('cycle', function (event) {
      const benchmark = event.target
      suiteResults.push({
        name: benchmark.name,
        hz: benchmark.hz,
      })
      console.log(this.name, '-', String(benchmark))
      // console.log(`${benchmark.name}: ${benchmark.hz.toFixed(2)}`)
    })
    .on('complete', function () {
      suiteResults.sort((a,b) => b.hz - a.hz)
      console.table(suiteResults)
      resolve({
        name: this.name,
        results: suiteResults,
      })
    })
    .on('error', function (event) {
      const { error } = event.target
      reject(error)
    })
    .run({ async: true })

  return promise
}

// runAll in series (important)
async function runAll (suites) {
  const allResults = []
  for (const suite of suites) {
    allResults.push(await runSuite(suite))
  }
  displayAllResults(allResults)
}

function displayAllResults (allResults) {
  const structured = {}
  allResults.forEach(({ name: suiteName, results: suiteResults }) => {
    suiteResults.forEach(({ name: stratName, hz }) => {
      const strat = structured[stratName] = structured[stratName] || {}
      strat[suiteName] = hz
    })
  })
  console.table(structured)
}
