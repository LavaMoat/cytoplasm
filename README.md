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
│ 0       │ 'non-membrane:bare'           │ '70,240' │ 14236.754730143311 │ '±1.08%'  │ 70241   │
│ 1       │ 'non-membrane:emptyProxy'     │ '52,547' │ 19030.25576128991  │ '±0.98%'  │ 52549   │
│ 2       │ 'non-membrane:reflectProxy'   │ '46,907' │ 21318.618764388408 │ '±0.91%'  │ 46908   │
│ 3       │ 'non-membrane:recursiveProxy' │ '46,288' │ 21603.610015339804 │ '±0.89%'  │ 46289   │
│ 4       │ 'test:simpleMembrane'         │ '9,234'  │ 108286.6388738518  │ '±16.19%' │ 9235    │
│ 5       │ 'fast-membrane:symbol'        │ '42,923' │ 23297.265562389282 │ '±1.63%'  │ 42924   │
│ 6       │ 'fast-membrane:weakmap'       │ '11,104' │ 90051.4219720839   │ '±17.68%' │ 11105   │
│ 7       │ 'observable-membrane'         │ '8,949'  │ 111734.47307262794 │ '±29.63%' │ 8950    │
│ 8       │ 'cytoplasm:transparent'       │ '3,238'  │ 308739.26767521736 │ '±9.08%'  │ 3239    │
└─────────┴───────────────────────────────┴──────────┴────────────────────┴───────────┴─────────┘

== deep-get ==
┌─────────┬───────────────────────────────┬──────────┬────────────────────┬───────────┬─────────┐
│ (index) │ Task Name                     │ ops/sec  │ Average Time (ns)  │ Margin    │ Samples │
├─────────┼───────────────────────────────┼──────────┼────────────────────┼───────────┼─────────┤
│ 0       │ 'non-membrane:bare'           │ '19,647' │ 50897.023564734365 │ '±1.79%'  │ 19648   │
│ 1       │ 'non-membrane:emptyProxy'     │ '18,341' │ 54521.45867409297  │ '±1.72%'  │ 18342   │
│ 2       │ 'non-membrane:reflectProxy'   │ '17,773' │ 56263.538989528686 │ '±1.66%'  │ 17774   │
│ 3       │ 'non-membrane:recursiveProxy' │ '15,711' │ 63649.45665732523  │ '±1.51%'  │ 15712   │
│ 4       │ 'test:simpleMembrane'         │ '1,780'  │ 561685.1529667906  │ '±38.84%' │ 1837    │
│ 5       │ 'fast-membrane:symbol'        │ '15,352' │ 65134.08675829828  │ '±1.78%'  │ 15353   │
│ 6       │ 'fast-membrane:weakmap'       │ '2,565'  │ 389717.32891658717 │ '±19.47%' │ 2566    │
│ 7       │ 'observable-membrane'         │ '2,424'  │ 412420.0032894011  │ '±15.71%' │ 2432    │
│ 8       │ 'cytoplasm:transparent'       │ '570'    │ 1751798.3782837114 │ '±65.23%' │ 571     │
└─────────┴───────────────────────────────┴──────────┴────────────────────┴───────────┴─────────┘

== set ==
┌─────────┬───────────────────────────────┬─────────┬────────────────────┬───────────┬─────────┐
│ (index) │ Task Name                     │ ops/sec │ Average Time (ns)  │ Margin    │ Samples │
├─────────┼───────────────────────────────┼─────────┼────────────────────┼───────────┼─────────┤
│ 0       │ 'non-membrane:bare'           │ '8,134' │ 122933.7822987108  │ '±1.80%'  │ 8135    │
│ 1       │ 'non-membrane:emptyProxy'     │ '8,135' │ 122916.59353495642 │ '±1.67%'  │ 8136    │
│ 2       │ 'non-membrane:reflectProxy'   │ '8,037' │ 124412.73525754362 │ '±1.65%'  │ 8038    │
│ 3       │ 'non-membrane:recursiveProxy' │ '8,194' │ 122036.85918242823 │ '±1.62%'  │ 8195    │
│ 4       │ 'test:simpleMembrane'         │ '5,121' │ 195260.11772744943 │ '±5.00%'  │ 5122    │
│ 5       │ 'fast-membrane:symbol'        │ '7,554' │ 132366.23273351032 │ '±1.94%'  │ 7558    │
│ 6       │ 'fast-membrane:weakmap'       │ '5,228' │ 191255.6351118871  │ '±5.61%'  │ 5229    │
│ 7       │ 'observable-membrane'         │ '4,771' │ 209563.90758593244 │ '±4.75%'  │ 4772    │
│ 8       │ 'cytoplasm:transparent'       │ '2,113' │ 473096.4664143572  │ '±42.42%' │ 2114    │
└─────────┴───────────────────────────────┴─────────┴────────────────────┴───────────┴─────────┘

== Summary ==
┌─────────────────────────────┬───────┬──────────┬──────┐
│ (index)                     │ get   │ deep-get │ set  │
├─────────────────────────────┼───────┼──────────┼──────┤
│ non-membrane:bare           │ 70241 │ 19648    │ 8134 │
│ non-membrane:emptyProxy     │ 52548 │ 18341    │ 8136 │
│ non-membrane:reflectProxy   │ 46907 │ 17773    │ 8038 │
│ non-membrane:recursiveProxy │ 46289 │ 15711    │ 8194 │
│ test:simpleMembrane         │ 9235  │ 1780     │ 5121 │
│ fast-membrane:symbol        │ 42923 │ 15353    │ 7555 │
│ fast-membrane:weakmap       │ 11105 │ 2566     │ 5229 │
│ observable-membrane         │ 8950  │ 2425     │ 4772 │
│ cytoplasm:transparent       │ 3239  │ 571      │ 2114 │
└─────────────────────────────┴───────┴──────────┴──────┘
```