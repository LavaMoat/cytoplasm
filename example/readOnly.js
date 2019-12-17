"use strict"

const { Membrane } = require('../src/index')
const createReadOnlyDistortion = require('../src/distortions/readOnly')

const membrane = new Membrane()
const readOnlyDistortion = createReadOnlyDistortion()
const graphA = membrane.makeObjectGraph({ label: 'a', handler: readOnlyDistortion })
const graphB = membrane.makeObjectGraph({ label: 'b' })

const objA = {
  value: 1,
  set: (newValue) => {
    this.value = newValue
  }
}

const readOnlyA = membrane.bridge(objA, graphA, graphB)

try {
  readOnlyA.value = 2
  console.log(readOnlyA.value)
} catch (err) {
  console.log('*Correctly* encountered error while trying to update value:', err)
}