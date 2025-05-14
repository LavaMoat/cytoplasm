import { createDeepData } from './buildData.js'

export default (makeDefaultMembranes) => ({
  label: 'deep-get',
  membranes: {
    ...makeDefaultMembranes(),
  },
  setup (membrane, count) {
    return createDeepData(count).map(membrane.wrap)
  },
  run (runData) {
    let sum = ''
    for (let i = 0; i < runData.length; i++) {
      const entry = runData[i]
      sum += entry.a.b.c.label
    }
    return sum
  }
})
