const test = require('tape')
const { Membrane } = require('../src/index')

test('basic bridge', (t) => {

  const membrane = new Membrane()

  const graphA = membrane.makeObjectGraph({ label: 'a' })
  const graphB = membrane.makeObjectGraph({ label: 'b' })

  const objA = {
    number: 1,
    string: 'hello',
    function: () => 42,
    object: {
      child: true
    },
  }

  const bridgedA = membrane.bridge(objA, graphA, graphB)

  t.equal(bridgedA.number, objA.number, 'number matches')
  t.equal(bridgedA.string, objA.string, 'string matches')
  t.equal(bridgedA.function(), objA.function(), 'function works')
  t.deepEqual(bridgedA.object, objA.object, 'object deep equals')

  t.end()
})


test('basic 3-side', (t) => {

  const membrane = new Membrane()

  const graphA = membrane.makeObjectGraph({ label: 'a' })
  const graphB = membrane.makeObjectGraph({ label: 'b' })
  const graphC = membrane.makeObjectGraph({ label: 'c' })

  function getObjectFromFor (rawObj, originGraph, destinationGraph) {
    return membrane.bridge(rawObj, originGraph, destinationGraph)
  }

  const objA = (() => {
    const obj = {}
    return {
      name: 'a',
      get: () => {
        return obj
      },
      check: (target) => obj === target,
    }
  })()
  const objB = (() => {
    const localA = getObjectFromFor(objA, graphA, graphB)
    return {
      name: 'b',
      get: () => localA.get(),
    }
  })()
  const objC = (() => {
    const localA = getObjectFromFor(objA, graphA, graphC)
    const localB = getObjectFromFor(objB, graphB, graphC)
    return {
      name: 'c',
      testLocal: () => localA.get() === localB.get(),
      testRemote: () => {
        const ref = localB.get()
        return localA.check(ref)
      },
    }
  })()

  t.notEqual(objA.get(), objB.get(), 'manual direct comparison')
  t.ok(objC.testLocal(), 'obj-c test local')
  t.ok(objC.testRemote(), 'obj-c test remote')

  t.end()
})