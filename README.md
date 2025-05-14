# 🦠 cytoplasm 🔬

**warning: largely an educational exercise. too slow to be practical, has not been audited, here be dragons, etc**

a javascript [membrane](https://tvcutsem.github.io/membranes) implementation.
This implementation is intended to provide *secure* isolation between any number of membrane spaces.
This implementation intends to support all types of objects including functions, classes, etc.
By default, all membrane spaces have a "transparent distortion", meaning all operations are forwarded to the original graph.
In order for this membrane to be useful you will need to provide a distortion implementation.

### features

##### intent of secure isolation
(note: this module has not been audited for security)
membrane-wrapped objects should always invoke the relevant distortion

##### multiple membrane spaces
the membrane will wrap/unwrap objects when passed across membrane space boundaries.
If an object is created in space A, passed to space B, then to space C, and returned to space A, it will be given to space A unwrapped as a raw object.

##### support for any object type
the membrane is intended to support any type of javascript object (TypedArray instances, objects with prototype chains, Proxy instances). empty values (`null`, `undefined`) and non-object values (number, string) are passed through un-wrapped. Primordials (`Object`, `Object.prototype`, etc) are also passed through unwrapped.

##### set distortions per-object
distortions are hooks into interactions with objects across MembraneSpace boundaries. The distortions are set at the object's origin MebraneSpace. The distortions are applied when the object is referenced in another MembraneSpace. The distortions are not applied in the origin MembraneSpace, as the object is a raw (unwrapped) reference there. The distortions will not be applied in MembraneSpaces that specify the option `{ dangerouslyAlwaysUnwrap: true }`.

distortions can be set in two ways:
- via the default handler for the MembraneSpace via the `createHandler` option.
- overridden for a specific reference via the `membraneSpace.handlerForRef` WeakMap.

Using these two approaches allows you to have a different distortion for a subset of the MembraneSpace's objects.


### example

```js
import { Membrane } from 'cytoplasm'
import createReadOnlyDistortion from 'cytoplasm/src/distortions/readOnly.js'

const membrane = new Membrane()
const graphA = membrane.makeMembraneSpace({ label: 'a', createHandler: createReadOnlyDistortion })
const graphB = membrane.makeMembraneSpace({ label: 'b' })

const objA = {
  value: 123,
  set: function (newVal) { this.value = newVal },
}
const objAWrappedForB = membrane.bridge(objA, graphA, graphB)

// original object is still mutable
objA.value = 456
// the specified readOnlyDistortion allows the wrapped object to internally mutate itself
// so the value is updated
objAWrappedForB.set(13)
// this assignment fails and throws an error under strict mode
objAWrappedForB.value = 42
```

### class instance origin space

The origin space of an instance of a class with cross-space protoype chain is somewhat complicated, due to differences in class constructors vs function constructors, as well as the Builtins.
The instance ends up being claimed by the first constructor it is exposed to. Since class constructors cant access `this` until they've called `super(...)`, ownership is pushed further down the chain. The function constructors can access `this` immediately and will claim the instance. Builtins skip membrane wrapping and so do not trigger a claim on `this`.

examples:

```
inst
class A
class B
class C <-- origin space
Object
```

```
inst
class A
function B <-- origin space
function C
Object
```


### comparison to other implementations

"n-sides" means it supports at least 3 spaces.
"security focused" means that user code can't unwrap the membrane (usually implies a WeakMap)

repo  | n-sides  | security focused | audit
---|---|---
cytoplasm  | ✓ | ✓ | x
[es-membrane][es-membrane]  | ✓ | ? | x
[@caridy/sjs][@caridy/sjs]  | x | ? | x
[observable-membrane][observable-membrane]  | x | ? | x
[fast-membrane][fast-membrane]  | x | x | x
[membrane-traits][membrane-traits]  | x | ? | x


[es-membrane]: https://github.com/ajvincent/es-membrane "es-membrane"
[@caridy/sjs]: https://github.com/caridy/secure-javascript-environment/ "secure-javascript-environment"
[observable-membrane]: https://github.com/salesforce/observable-membrane "observable-membrane"
[fast-membrane]: https://github.com/pmdartus/fast-membrane "fast-membrane"
[membrane-traits]: https://github.com/Gozala/membrane-traits "membrane-traits"

### performance

`yarn run performance`

Performance comparison between `cytoplasm`, other memebranes, and non-membranes:

```
== get ==
┌─────────┬───────────────────────────────┬──────────┬────────────────────┬───────────┬─────────┐
│ (index) │ Task Name                     │ ops/sec  │ Average Time (ns)  │ Margin    │ Samples │
├─────────┼───────────────────────────────┼──────────┼────────────────────┼───────────┼─────────┤
│ 0       │ 'non-membrane:bare'           │ '69,042' │ 14483.895427487018 │ '±1.10%'  │ 69043   │
│ 1       │ 'non-membrane:emptyProxy'     │ '52,733' │ 18963.189706830468 │ '±0.98%'  │ 52734   │
│ 2       │ 'non-membrane:reflectProxy'   │ '50,644' │ 19745.541218282604 │ '±0.86%'  │ 50645   │
│ 3       │ 'non-membrane:recursiveProxy' │ '48,026' │ 20821.753305430753 │ '±0.84%'  │ 48027   │
│ 4       │ 'test:simpleMembrane'         │ '9,999'  │ 100004.36599999656 │ '±14.31%' │ 10000   │
│ 5       │ 'fast-membrane:symbol'        │ '44,261' │ 22592.991030682217 │ '±1.51%'  │ 44262   │
│ 6       │ 'fast-membrane:weakmap'       │ '9,843'  │ 101584.88359573772 │ '±18.00%' │ 9845    │
│ 7       │ 'observable-membrane'         │ '5,309'  │ 188347.32468508944 │ '±31.92%' │ 5319    │
│ 8       │ 'cytoplasm:transparent'       │ '3,536'  │ 282733.8702290232  │ '±14.56%' │ 3537    │
└─────────┴───────────────────────────────┴──────────┴────────────────────┴───────────┴─────────┘

== deep-get ==
┌─────────┬───────────────────────────────┬──────────┬────────────────────┬───────────┬─────────┐
│ (index) │ Task Name                     │ ops/sec  │ Average Time (ns)  │ Margin    │ Samples │
├─────────┼───────────────────────────────┼──────────┼────────────────────┼───────────┼─────────┤
│ 0       │ 'non-membrane:bare'           │ '21,523' │ 46461.18435234929  │ '±0.52%'  │ 21524   │
│ 1       │ 'non-membrane:emptyProxy'     │ '20,844' │ 47975.06073399173  │ '±0.39%'  │ 20845   │
│ 2       │ 'non-membrane:reflectProxy'   │ '19,711' │ 50731.510247559185 │ '±0.34%'  │ 19712   │
│ 3       │ 'non-membrane:recursiveProxy' │ '17,592' │ 56842.6166657203   │ '±0.37%'  │ 17593   │
│ 4       │ 'test:simpleMembrane'         │ '2,571'  │ 388828.5587091901  │ '±18.39%' │ 2572    │
│ 5       │ 'fast-membrane:symbol'        │ '15,552' │ 64297.852761521186 │ '±1.44%'  │ 15553   │
│ 6       │ 'fast-membrane:weakmap'       │ '2,117'  │ 472252.7911362593  │ '±29.58%' │ 2121    │
│ 7       │ 'observable-membrane'         │ '1,131'  │ 883512.9063604702  │ '±39.99%' │ 1132    │
│ 8       │ 'cytoplasm:transparent'       │ '906'    │ 1102684.466372709  │ '±15.19%' │ 907     │
└─────────┴───────────────────────────────┴──────────┴────────────────────┴───────────┴─────────┘

== set ==
┌─────────┬───────────────────────────────┬─────────┬────────────────────┬───────────┬─────────┐
│ (index) │ Task Name                     │ ops/sec │ Average Time (ns)  │ Margin    │ Samples │
├─────────┼───────────────────────────────┼─────────┼────────────────────┼───────────┼─────────┤
│ 0       │ 'non-membrane:bare'           │ '8,022' │ 124654.76866508757 │ '±1.80%'  │ 8023    │
│ 1       │ 'non-membrane:emptyProxy'     │ '8,074' │ 123842.44569660444 │ '±1.71%'  │ 8075    │
│ 2       │ 'non-membrane:reflectProxy'   │ '7,961' │ 125601.75750345267 │ '±1.77%'  │ 7963    │
│ 3       │ 'non-membrane:recursiveProxy' │ '7,944' │ 125872.69981119517 │ '±1.73%'  │ 7945    │
│ 4       │ 'test:simpleMembrane'         │ '4,639' │ 215544.04393714003 │ '±5.96%'  │ 4643    │
│ 5       │ 'fast-membrane:symbol'        │ '7,367' │ 135728.36522803718 │ '±1.88%'  │ 7368    │
│ 6       │ 'fast-membrane:weakmap'       │ '4,731' │ 211352.3102282494  │ '±5.71%'  │ 4732    │
│ 7       │ 'observable-membrane'         │ '3,080' │ 324585.5469003455  │ '±3.95%'  │ 3081    │
│ 8       │ 'cytoplasm:transparent'       │ '1,943' │ 514414.0787037698  │ '±45.58%' │ 1944    │
└─────────┴───────────────────────────────┴─────────┴────────────────────┴───────────┴─────────┘

== Summary ==
┌─────────────────────────────┬───────┬──────────┬──────┐
│ (index)                     │ get   │ deep-get │ set  │
├─────────────────────────────┼───────┼──────────┼──────┤
│ non-membrane:bare           │ 69042 │ 21523    │ 8022 │
│ non-membrane:emptyProxy     │ 52734 │ 20844    │ 8075 │
│ non-membrane:reflectProxy   │ 50644 │ 19712    │ 7962 │
│ non-membrane:recursiveProxy │ 48027 │ 17592    │ 7945 │
│ test:simpleMembrane         │ 10000 │ 2572     │ 4639 │
│ fast-membrane:symbol        │ 44262 │ 15553    │ 7368 │
│ fast-membrane:weakmap       │ 9844  │ 2118     │ 4731 │
│ observable-membrane         │ 5309  │ 1132     │ 3081 │
│ cytoplasm:transparent       │ 3537  │ 907      │ 1944 │
└─────────────────────────────┴───────┴──────────┴──────┘
```