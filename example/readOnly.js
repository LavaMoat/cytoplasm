const { Membrane } = require('../src/index')
const createReadOnlyDistortion = require('../src/distortions/readOnly')

const membrane = new Membrane()
const graphA = membrane.makeObjectGraph({ label: 'a' })
const graphB = membrane.makeObjectGraph({ label: 'b' })
const readOnlyDistortion = createReadOnlyDistortion()

const objA = {
  value: 1,
  set: (newValue) => {
    this.value = newValue
  }
}

const readOnlyA = membrane.bridge(objA, graphA, graphB, readOnlyDistortion)
