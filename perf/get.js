import { createFlatData } from './buildData.js'

export default (makeDefaultMembranes) => ({
  label: 'get',
  membranes: {
    ...makeDefaultMembranes(),
  },
  setup (membrane, count) {
    return createFlatData(count).map(membrane.wrap)
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
