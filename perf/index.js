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

  suite
    .on('start', function () {
      console.log(`== ${this.name} ==`)
    })
    .on('cycle', function (event) {
      console.log(this.name, '-', String(event.target))
    })
    .on('complete', function () {
      console.log('')
      resolve()
    })
    .on('error', function (error) {
      reject(error)
    })
    .run({ async: true })

  return promise
}

// runAll in series (important)
async function runAll (suites) {
  for (const suite of suites) {
    await runSuite(suite)
  }
}
