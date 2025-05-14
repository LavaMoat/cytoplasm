import { createFlatData } from './buildData.js'

export default (makeDefaultMembranes) => ({
  label: 'set',
  membranes: {
    ...makeDefaultMembranes(),
  },
  setup (membrane, count) {
    return createFlatData(count).map(membrane.wrap)
  },
  run (runData) {
    for (let i = 0; i < 10000; i++) {
      runData[i] = {}
      const obj = runData[i]
      obj.id = i
      obj.label = `new label ${i}`
      obj.className = `new className ${i}`
    }
  },
})
