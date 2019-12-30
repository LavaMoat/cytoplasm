'use strict'

const test = require('tape')
const { Membrane } = require('../src/index')
const createReadOnlyDistortion = require('../src/distortions/readOnly')

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

//
// kowtow tests borrowed from kowtow module
// primarily to check that copies behave as expected
// assertions checking that originals were unmodified have been disabled
//

function createCopyFactory () {
  const membrane = new Membrane()
  const graphA = membrane.makeObjectGraph({ label: 'a' })
  const graphB = membrane.makeObjectGraph({ label: 'b' })

  return (target) => {
    return membrane.bridge(target, graphA, graphB)
  }
}

test('kowtow - basic - plain values', (t) => {
  const createCopy = createCopyFactory()
  t.equal(createCopy(null), null, 'copy of null')
  t.equal(createCopy(undefined), undefined, 'copy of undefined')
  t.equal(createCopy(1), 1, 'copy of number')

  t.end()
})

test('kowtow - basic - get and set', (t) => {
  const orig = {}
  const copy = createCopyFactory()(orig)

  // copy doesnt affect orig
  t.equal(orig.xyz, undefined, 'orig doesnt have xyz property')
  copy.xyz = 456
  t.equal(copy.xyz, 456, 'copy gets xyz assigned')
  // t.equal(orig.xyz, undefined, 'orig does not get xyz assigned')

  // orig late set
  t.equal(copy.abc, undefined, 'copy does not have abc')
  orig.abc = 123
  t.equal(orig.abc, 123, 'orig gets abc assigned')
  t.equal(copy.abc, 123, 'copy gets abc assigned')

  t.end()
})

test('kowtow - basic - deep set', (t) => {
  const orig = { child: {} }
  const copy = createCopyFactory()(orig)

  copy.child.abc = 123

  const copyChild = copy.child
  copyChild.xyz = 456

  // t.deepEqual(orig, { child: {} }, 'orig unmodified')
  t.deepEqual(copy, { child: { abc: 123, xyz: 456 } }, 'copy modified')

  t.end()
})

test('kowtow - basic - method this', (t) => {
  const orig = { xyz: function () { this.value = 123 } }
  const copy = createCopyFactory()(orig)

  t.equal(orig.value, undefined, 'orig correct start state')
  t.equal(copy.value, undefined, 'copy correct start state')

  copy.xyz()

  // t.equal(orig.value, undefined, 'orig unmodified')
  t.equal(copy.value, 123, 'copy correctly modified')

  t.end()
})

test('kowtow - basic - method return wrapped', (t) => {
  const orig = {
    child: {},
    abc: function () { return this },
    xyz: function () { return this.child },
  }
  const copy = createCopyFactory()(orig)

  t.equal(copy.abc(), copy, 'copy returns self without additional wrapper')
  t.equal(copy.xyz(), copy.child, 'copy returns wrapped child')

  t.end()
})

test('kowtow - basic - function return wrapped self', (t) => {
  const orig = function () { return orig }
  const copy = createCopyFactory()(orig)

  t.equal(copy(), copy, 'copy returns self without additional wrapper')

  t.end()
})

test('kowtow - basic - function return wrapped obj', (t) => {
  const createCopy = createCopyFactory()
  const child = {}
  const orig = function () { return child }
  const copy = createCopy(orig)

  t.notEqual(copy(), child, 'copy does not return unwrapped obj')
  t.equal(copy(), createCopy(child), 'copy returns clone of child')

  t.end()
})

test('kowtow - basic - delete and "in" keyword', (t) => {
  const orig = {}
  const copy = createCopyFactory()(orig)

  // copy doesnt affect orig
  t.equal('xyz' in orig, false, 'orig doesnt have xyz property')
  copy.xyz = 456
  t.equal('xyz' in copy, true, 'copy gets xyz property')
  // t.equal('xyz' in orig, false, 'orig does not get xyz property')

  // orig late set
  t.equal('abc' in orig, false, 'orig does not have abc')
  t.equal('abc' in copy, false, 'copy does not have abc')
  orig.abc = 123
  t.equal('abc' in orig, true, 'orig has abc property')
  t.equal('abc' in copy, true, 'copy has abc property')

  // orig delete
  delete orig.abc
  t.equal('abc' in orig, false, 'orig no longer has abc property')
  t.equal('abc' in copy, false, 'copy no longer has abc property')

  delete copy.xyz
  t.equal('xyz' in orig, false, 'orig still doesnt have xyz property')
  t.equal('xyz' in copy, false, 'copy no longer has xyz property')
  t.notOk(Object.getOwnPropertyDescriptor(copy, 'xyz'), 'has no property descriptor for xyz')

  // set again
  copy.xyz = 789
  // t.equal('xyz' in orig, false, 'orig still doesnt have xyz property')
  t.equal('xyz' in copy, true, 'copy now has xyz property')
  t.ok(Object.getOwnPropertyDescriptor(copy, 'xyz'), 'has property descriptor for xyz')

  t.end()
})

test('kowtow - basic - ref matching', (t) => {
  const child = {}
  const orig = { a: child, b: child }
  const copy = createCopyFactory()(orig)

  t.equal(orig.a, orig.b, 'orig refs match')
  t.equal(copy.a, copy.b, 'copy refs match')
  t.notEqual(orig.a, copy.a, 'orig and copy refs dont match')

  t.end()
})

test('kowtow - basic - circ refs', (t) => {
  const orig = {}
  orig.self = orig
  const copy = createCopyFactory()(orig)

  t.equal(orig.self, orig, 'orig circ refs match')
  t.equal(copy.self, copy, 'copy circ refs match')
  t.notEqual(orig.self, copy.self, 'orig and copy circ refs dont match')

  t.end()
})

test('kowtow - createCopyFactory - identity in spaces', (t) => {
  const createCopyA = createCopyFactory()

  const orig = {}
  orig.self = orig
  const copy = createCopyA(orig)

  t.notEqual(orig, copy)

  t.equal(orig.self, orig)
  t.equal(copy.self, copy)

  t.equal(createCopyA(orig), createCopyA(orig))
  t.equal(createCopyA(orig), copy)
  t.equal(createCopyA(copy), copy)

  const createCopyB = createCopyFactory()

  t.notEqual(createCopyA(orig), createCopyB(orig))
  t.notEqual(createCopyB(orig), copy)
  t.notEqual(createCopyB(copy), copy)

  t.end()
})

test('kowtow - propertyDescriptors - getOwnPropertyDescriptor', (t) => {
  const orig = { child: {} }
  const copy = createCopyFactory()(orig)

  const copyChildProp = Object.getOwnPropertyDescriptor(copy, 'child')

  t.notEqual(orig.child, copy.child, 'not equal using dot syntax')
  t.notEqual(orig.child, copyChildProp.value, 'not equal using getOwnPropertyDescriptor')
  t.equal(copy.child, copyChildProp.value, 'dot syntax returns same as getOwnPropertyDescriptor')
  t.deepEqual(orig, copy, 'copy structure matches orig')

  t.end()
})

test('kowtow - propertyDescriptors - getOwnPropertyDescriptors', (t) => {
  const { Buffer } = require('buffer')
  const Copy = createCopyFactory()(Buffer)

  const origDecs = Object.getOwnPropertyDescriptors(Buffer)
  const copyDecs = Object.getOwnPropertyDescriptors(Copy)

  t.deepEqual(Object.keys(copyDecs), Object.keys(origDecs), 'getOwnPropertyDescriptors keys match')

  for (let key of Object.keys(origDecs)) {
    const origProp = origDecs[key]
    const copyProp = copyDecs[key]
    if ('value' in origProp) {
      t.equal(typeof copyProp.value, typeof origProp.value, `types match for prop value ${key}`)
      delete copyProp.value
      delete origProp.value
    }
    t.deepEqual(copyProp, origProp, `expected prop to match for key ${key}`)
  }

  // work around for object-inspect and Buffer
  // calling get on TypedArray.prototype.length throws error
  delete origDecs.prototype
  delete copyDecs.prototype

  t.deepEqual(copyDecs, origDecs, 'expect ownKeys result to match')

  t.end()
})

test('kowtow - propertyDescriptors - defineProperty', (t) => {
  const orig = {}
  const copy = createCopyFactory()(orig)

  const config = {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  }

  Object.defineProperty(copy, 'a', config)

  // t.notOk(orig.a, 'orig not modified')
  t.equal(copy.a, 42, 'copy correctly modified')
  // t.notEqual(orig.child, copyChildProp.value, 'not equal using getOwnPropertyDescriptor')
  // t.equal(copy.child, copyChildProp.value, 'dot syntax returns same as getOwnPropertyDescriptor')
  // t.deepEqual(orig, copy, 'copy structure matches orig')

  t.end()
})

test('kowtow - propertyDescriptors - getter on original', (t) => {
  const orig = {}
  const copy = createCopyFactory()(orig)

  const correctValue = { isCorrect: true }
  let calledGetter = 0
  Object.defineProperty(orig, 'xyz', {
    get () {
      calledGetter++
      return correctValue
    }
  })

  t.equal(calledGetter, 0, 'getter not called')
  t.equal('xyz' in orig, true, 'orig has xyz')
  t.equal('xyz' in copy, true, 'copy has xyz')
  t.equal(calledGetter, 0, 'getter not called')

  const copyGetterValue = copy.xyz
  t.equal(calledGetter, 1, 'getter called')

  t.end()
})

test('kowtow - propertyDescriptors - getter that re-defines itself on original', (t) => {
  const orig = {}
  const copy = createCopyFactory()(orig)

  Object.defineProperty(orig, 'xyz', {
    get () {
      Object.defineProperty(orig, 'xyz', {
        value: 2,
      })
      return 1
    },
    configurable: true
  })

  t.equal('xyz' in orig, true, 'orig has xyz')
  t.equal('xyz' in copy, true, 'copy has xyz')

  t.equal(copy.xyz, 1, 'returned first static value')
  t.equal(copy.xyz, 2, 'returned second static value')
  t.equal(copy.xyz, 2, 'returned second static value again')

  t.end()
})

test('kowtow - propertyDescriptors - setter on original', (t) => {
  const orig = {}
  const copy = createCopyFactory()(orig)

  Object.defineProperty(orig, 'xyz', {
    set () {
      this.abc = 123
    },
  })

  t.equal(orig.abc, undefined, 'orig correct start state')
  t.equal(copy.abc, undefined, 'copy correct start state')

  copy.xyz = 999

  // t.equal(orig.abc, undefined, 'orig unmodified')
  t.equal(copy.abc, 123, 'copy correctly modified')
  t.notEqual(copy.xyz, 999, 'setter intercepted setting value')

  t.end()
})

test('kowtow - propertyDescriptors - non configurable property', (t) => {
  const orig = {}
  const copy = createCopyFactory()(orig)

  Object.defineProperty(orig, 'abc', {
    value: 123,
    configurable: false,
  })

  t.equal(orig.abc, 123, 'orig correct start state')
  t.equal(copy.abc, 123, 'copy correct start state')

  let getOwnPropertyDescriptorError
  try {
    const propDesc = Object.getOwnPropertyDescriptor(copy, 'abc')
  } catch (err) {
    getOwnPropertyDescriptorError = err
  }

  t.notOk(getOwnPropertyDescriptorError, 'should not throw error on prop lookup')

  t.end()
})

test('kowtow - prototype - sanity checks', (t) => {
  const copy = createCopyFactory()({})
  t.notOk(copy.prototype, 'copy.prototype')
  t.ok(Reflect.getPrototypeOf(copy), 'copy has prototype')
  t.notOk(Reflect.getPrototypeOf(Reflect.getPrototypeOf(copy)), 'copy prototype has no prototype')

  t.end()
})

test('kowtow - traps - ownKeys', (t) => {
  const { Buffer } = require('buffer')
  const Copy = createCopyFactory()(Buffer)

  const origKeys = Reflect.ownKeys(Buffer)
  const copyKeys = Reflect.ownKeys(Copy)

  t.deepEqual(copyKeys, origKeys, 'expect ownKeys result to match')

  t.end()
})

test('kowtow - traps - for in', (t) => {
  const { Buffer } = require('buffer')
  const Copy = createCopyFactory()(Buffer)

  for (let key in Copy) {
    t.ok(key)
  }

  t.end()
})


test('kowtow - class - function class', (t) => {
  function Orig () { this.b = 123 }
  Orig.prototype.a = function () { this.b = 456 }

  const Copy = createCopyFactory()(Orig)
  Copy.prototype.a = function () { this.b = 789 }

  function Child () { Copy.call(this) }
  Child.prototype = Object.create(Copy.prototype)

  const orig = new Orig()
  const copy = new Copy()
  const child = new Child()

  t.equal(orig.b, 123, 'orig should have expected start state')
  t.equal(copy.b, 123, 'copy should have expected start state')
  t.equal(child.b, 123, 'child should have expected start state')

  t.equal(child.b, 123, 'child should have same start state as Orig')
  child.a()
  t.equal(child.b, 789, 'child uses new method for "a"')

  t.equal(copy.b, 123, 'copy as a seperate instance shouldnt be changed')
  copy.a()
  t.equal(copy.b, 789, 'copy uses new method for "a"')

  t.equal(orig.b, 123, 'orig as a separate instance shouldnt be changed')
  orig.a()
  // t.equal(orig.b, 456, 'orig should be unmodified')

  t.notEqual(Copy.prototype, Orig.prototype, 'class prototypes are not equal')
  t.notEqual(Child.prototype, Copy.prototype, 'class prototypes are not equal')
  t.notEqual(Reflect.getPrototypeOf(copy), Reflect.getPrototypeOf(orig), 'instance prototypes are not equal')
  t.notEqual(Reflect.getPrototypeOf(child), Reflect.getPrototypeOf(copy), 'instance prototypes are not equal')

  t.end()
})

test('kowtow - class - class syntax', (t) => {
  class Original {
    constructor () {
      this.b = 123
    }
    a () {
      this.b = 456
    }
  }
  const Copy = createCopyFactory()(Original)
  const copy = new Copy()

  t.equal(Reflect.getPrototypeOf(copy), Copy.prototype, 'prototype matches')
  t.equal(copy.b, 123)

  copy.a()

  t.equal(copy.b, 456)

  Original.prototype.a = function () { this.b = 789 }
  copy.a()

  t.equal(copy.b, 789)

  t.end()
})

test('kowtow - class - class syntax subclass minimal', (t) => {
  class Original {}
  Original.prototype.label = 'original'

  const Copy = createCopyFactory()(Original)
  Copy.prototype.label = 'copy'

  class NewClass extends Copy {}
  NewClass.prototype.label = 'new'

  const inst = new NewClass()

  const instProto = Reflect.getPrototypeOf(inst)

  t.equal(instProto, NewClass.prototype, 'prototype of inst is NewClass prototype')
  t.notEqual(instProto, Copy.prototype, 'Copy prototype is NOT inst proto')
  t.notEqual(instProto, Original.prototype, 'Original prototype is NOT inst proto')

  t.end()
})


test('kowtow - class - class syntax subclass', (t) => {
  class Orig {
    constructor () {
      this.b = 123
    }
    a () {
      this.b = 456
    }
  }
  Orig.prototype.label = 'orig'

  const Copy = createCopyFactory()(Orig)
  Copy.prototype.label = 'copy'

  class NewClass extends Copy {
    a () {
      this.b = 789
    }
  }
  NewClass.prototype.label = 'new'


  const inst = new NewClass()

  t.ok(inst, 'inst exists')
  t.ok(NewClass, 'NewClass exists')
  t.ok(Copy.prototype, 'Copy has proto')
  t.ok(Orig.prototype, 'Orig has proto')
  t.ok(NewClass.prototype, 'NewClass has proto')
  t.equal(NewClass.prototype.label, 'new', 'NewClass proto has label set')
  t.notEqual(Copy.prototype, Orig.prototype, 'Copy prototype does not match Orig prototype')
  t.notEqual(NewClass.prototype, Copy.prototype, 'NewClass prototype does not match Copy prototype')

  const instProto = Reflect.getPrototypeOf(inst)
  t.equal(instProto, NewClass.prototype, 'prototype of inst is NewClass prototype')

  t.equal(inst.b, 123, 'prop is as set in constructor')
  inst.a()
  t.equal(inst.b, 789, 'prop is set again by fn call')

  Orig.prototype.abc = 123
  t.equal(Orig.prototype.abc, 123, 'can modify Orig prototype')
  t.equal(Copy.prototype.abc, 123, 'does modify copy prototype')
  t.equal(NewClass.prototype.abc, 123, 'does modify new class prototype')
  t.equal(inst.abc, 123, 'modifying original proto does affect instance')

  NewClass.prototype.xyz = 456
  t.equal(NewClass.prototype.xyz, 456, 'can modify NewClass prototype')
  t.equal(Orig.prototype.xyz, undefined, 'doesnt modify original prototype')
  t.equal(Copy.prototype.xyz, undefined, 'doesnt modify copy prototype')
  t.equal(inst.xyz, 456, 'modifying new does affect instance')

  t.end()
})

test('kowtow - class - class syntax subclass readme example', (t) => {
  // base class
  class A {
    abc () { return 123 }
    xyz () { return 456 }
  }
  // copy of base class with shadowed prototype
  const B = createCopyFactory()(A)
  B.prototype.abc = function () { return this.xyz() }
  // child class
  class C extends B {
    xyz () { return 789 }
  }

  const a = new A()
  const b = new B()
  const c = new C()

  // t.equal(a.abc(), 123)
  t.equal(b.abc(), 456)
  t.equal(c.abc(), 789)

  t.end()
})

test('Types - typedArray', (t) => {
  const membrane = new Membrane()

  const graphA = membrane.makeObjectGraph({ label: 'a' })
  const graphB = membrane.makeObjectGraph({ label: 'b' })

  const objA = new Uint8Array([1, 2, 3])

  const wrappedA = membrane.bridge(objA, graphA, graphB)

  t.equal(wrappedA.length, objA.length)
  t.end()
})

test('Types - typedArray subclass', (t) => {
  const membrane = new Membrane()

  const graphA = membrane.makeObjectGraph({ label: 'a' })
  const graphB = membrane.makeObjectGraph({ label: 'b' })
  const graphC = membrane.makeObjectGraph({ label: 'c' })


  const objA = new Uint8Array([1, 2, 3])

  const wrappedA = membrane.bridge(objA, graphA, graphB)
  const wrappedB = membrane.bridge(wrappedA, graphB, graphC)

  t.equal(wrappedB.length, objA.length)
  t.end()
})

test('ProxyHandler - set', (t) => {
  const membrane = new Membrane()

  const graphA = membrane.makeObjectGraph({ label: 'a', createHandler: createReadOnlyDistortion })
  const graphB = membrane.makeObjectGraph({ label: 'b' })

  const objA = {a: 'b'}
  const wrappedA = membrane.bridge(objA, graphA, graphB)
  const objB = Object.create(wrappedA)

  let error

  try {
    objB.a = 2
  } catch(_error) {
    error = _error
  }

  t.notOk(error)
  t.end()
})