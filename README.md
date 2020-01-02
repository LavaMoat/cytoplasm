# 🦠 cytoplasm 🔬

a javascript [membrane](https://tvcutsem.github.io/membranes) implementation.
This implementation is intended to provide *secure* isolation between any number of membrane spaces.
This implementation intends to support all types of objects including functions, classes, etc.
By default, all membrane spaces have a "transparent distortion", meaning all operations are forwarded to the original graph.
In order for this membrane to be useful you will need to provide a distortion implementation.

**status: has not been audited, here be dragons, etc**


### example

```js
const { Membrane } = require('cytoplasm')
const createReadOnlyDistortion = require('cytoplasm/src/distortions/readOnly')

const membrane = new Membrane()
const graphA = membrane.makeObjectGraph({ label: 'a', createHandler: createReadOnlyDistortion })
const graphB = membrane.makeObjectGraph({ label: 'b' })

const objA = {
  value: 123,
  set: function (newVal) { this.value = newVal },
}
const objAWrappedForB = membrane.bridge(objA, graphA, graphB)

// original object is still mutable
objA.value = 456
// the specified readOnlyDistortion allows this, and the value is updated
objAWrappedForB.set(13)
// this assignment fails and throws an error under strict mode
objAWrappedForB.value = 42
```

### comparison to other implementations

repo  | n-sides  | audit
---|---|---
cytoplasm  | ✓ | x
[es-membrane][es-membrane]  | ✓ | x
[@caridy/sjs][@caridy/sjs]  | x | x
[observable-membrane][observable-membrane]  | x | x
[fast-membrane][fast-membrane]  | x | x
[membrane-traits][membrane-traits]  | x | x


[es-membrane]: https://github.com/ajvincent/es-membrane "es-membrane"
[@caridy/sjs]: https://github.com/caridy/secure-javascript-environment/ "secure-javascript-environment"
[observable-membrane]: https://github.com/salesforce/observable-membrane "observable-membrane"
[fast-membrane]: https://github.com/pmdartus/fast-membrane "fast-membrane"
[membrane-traits]: https://github.com/Gozala/membrane-traits "membrane-traits"
