const test = require('tape')
const { Membrane } = require('../src/index')

test('basic - bridge', (t) => {

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


test('basic - 3-side', (t) => {

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

test('getter - throw custom Error', (t) => {

  const membrane = new Membrane()

  const graphA = membrane.makeObjectGraph({ label: 'a' })
  const graphB = membrane.makeObjectGraph({ label: 'b' })

  class CustomError extends Error {}

  const objA = {
    get a () {
      throw new CustomError('custom getter error')
    }
  }

  const wrappedA = membrane.bridge(objA, graphA, graphB)
  const wrappedError = membrane.bridge(CustomError, graphA, graphB)
  const wrappedErrorPrototype = membrane.bridge(CustomError.prototype, graphA, graphB)
  t.equal(wrappedErrorPrototype, wrappedError.prototype, 'custom error dot-prototype is proxied correctly')

  try {
    // trigger getter err
    wrappedA.a
    // should never reach here
    t.fail('did not throw error')
  } catch (err) {
    t.notEqual(err.constructor, CustomError, 'custom error constructor is not raw')
    t.equal(err.constructor, wrappedError, 'custom error constructor is proxied')
    t.notEqual(Reflect.getPrototypeOf(err), CustomError.prototype, 'custom error prototype is not raw')
    t.equal(Reflect.getPrototypeOf(err), wrappedErrorPrototype, 'custom error prototype is proxied errors dot-proto')
  }

  t.end()

})