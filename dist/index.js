(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Membrane = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assert = assert;

function assert(condition, errorMessage) {
  if (!condition) {
    throw new TypeError(errorMessage);
  }
}
},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkAnonIntrinsics = checkAnonIntrinsics;

var _assert = require("./assert.js");

const {
  getPrototypeOf: _getPrototypeOf
} = Object;

function getPrototypeOf (obj) {
  return obj && _getPrototypeOf(obj)
}
/**
 * checkAnonIntrinsics()
 * Ensure that the rootAnonIntrinsics are consistent with specs. These
 * tests are necesary to ensure that sampling was correctly done.
 */

function checkAnonIntrinsics(intrinsics) {
  const {
    FunctionPrototypeConstructor,
    ArrayIteratorPrototype,
    AsyncFunction,
    AsyncGenerator,
    AsyncGeneratorFunction,
    AsyncGeneratorPrototype,
    AsyncIteratorPrototype,
    Generator,
    GeneratorFunction,
    IteratorPrototype,
    MapIteratorPrototype,
    RegExpStringIteratorPrototype,
    SetIteratorPrototype,
    StringIteratorPrototype,
    ThrowTypeError,
    TypedArray
  } = intrinsics; // 9.2.4.1 %ThrowTypeError%

  (0, _assert.assert)(getPrototypeOf(ThrowTypeError) === Function.prototype, 'ThrowTypeError.__proto__ should be Function.prototype'); // 21.1.5.2 The %StringIteratorPrototype% Object

  (0, _assert.assert)(getPrototypeOf(StringIteratorPrototype) === IteratorPrototype, 'StringIteratorPrototype.__proto__ should be IteratorPrototype'); // 21.2.7.1 The %RegExpStringIteratorPrototype% Object

  // (0, _assert.assert)(getPrototypeOf(RegExpStringIteratorPrototype) === IteratorPrototype, 'RegExpStringIteratorPrototype.__proto__ should be IteratorPrototype'); // 22.2.1 The %TypedArray% Intrinsic Object
  // http://bespin.cz/~ondras/html/classv8_1_1ArrayBufferView.html
  // has me worried that someone might make such an intermediate
  // object visible.

  (0, _assert.assert)(getPrototypeOf(TypedArray) === Function.prototype, 'TypedArray.__proto__ should be Function.prototype'); // 23.1.5.2 The %MapIteratorPrototype% Object

  (0, _assert.assert)(getPrototypeOf(MapIteratorPrototype) === IteratorPrototype, 'MapIteratorPrototype.__proto__ should be IteratorPrototype'); // 23.2.5.2 The %SetIteratorPrototype% Object

  (0, _assert.assert)(getPrototypeOf(SetIteratorPrototype) === IteratorPrototype, 'SetIteratorPrototype.__proto__ should be IteratorPrototype'); // 25.1.2 The %IteratorPrototype% Object

  (0, _assert.assert)(getPrototypeOf(IteratorPrototype) === Object.prototype, 'IteratorPrototype.__proto__ should be Object.prototype'); // 25.1.3 The %AsyncIteratorPrototype% Object

  (0, _assert.assert)(getPrototypeOf(AsyncIteratorPrototype) === Object.prototype, 'AsyncIteratorPrototype.__proto__ should be Object.prototype'); // 22.1.5.2 The %ArrayIteratorPrototype% Object

  (0, _assert.assert)(getPrototypeOf(ArrayIteratorPrototype) === IteratorPrototype, 'AsyncIteratorPrototype.__proto__ should be IteratorPrototype'); // 25.2.2 Properties of the GeneratorFunction Constructor
  // Use Function.prototype.constructor in case Function has been tamed

  (0, _assert.assert)(getPrototypeOf(GeneratorFunction) === FunctionPrototypeConstructor, 'GeneratorFunction.__proto__ should be Function');
  (0, _assert.assert)(GeneratorFunction.name === 'GeneratorFunction', 'GeneratorFunction.name should be "GeneratorFunction"'); // 25.2.3 Properties of the GeneratorFunction Prototype Object

  (0, _assert.assert)(getPrototypeOf(Generator) === Function.prototype, 'Generator.__proto__ should be Function.prototype'); // 25.3.1 The AsyncGeneratorFunction Constructor
  // Use Function.prototype.constructor in case Function has been tamed

  (0, _assert.assert)(getPrototypeOf(AsyncGeneratorFunction) === FunctionPrototypeConstructor, 'AsyncGeneratorFunction.__proto__ should be Function');
  (0, _assert.assert)(AsyncGeneratorFunction.name === 'AsyncGeneratorFunction', 'AsyncGeneratorFunction.name should be "AsyncGeneratorFunction"'); // 25.3.3 Properties of the AsyncGeneratorFunction Prototype Object

  (0, _assert.assert)(getPrototypeOf(AsyncGenerator) === Function.prototype, 'AsyncGenerator.__proto__ should be Function.prototype'); // 25.5.1 Properties of the AsyncGenerator Prototype Object

  (0, _assert.assert)(getPrototypeOf(AsyncGeneratorPrototype) === AsyncIteratorPrototype, 'AsyncGeneratorPrototype.__proto__ should be AsyncIteratorPrototype'); // 25.7.1 The AsyncFunction Constructor
  // Use Function.prototype.constructor in case Function has been tamed

  (0, _assert.assert)(getPrototypeOf(AsyncFunction) === FunctionPrototypeConstructor, 'AsyncFunction.__proto__ should be Function');
  (0, _assert.assert)(AsyncFunction.name === 'AsyncFunction', 'AsyncFunction.name should be "AsyncFunction"');
}
},{"./assert.js":1}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkIntrinsics = checkIntrinsics;

/**
 * checkIntrinsics()
 * Ensure that the intrinsics are consistent with defined.
 */
function checkIntrinsics(intrinsics) {
  Object.keys(intrinsics).forEach(name => {
    if (intrinsics[name] === undefined) {
      throw new TypeError(`Malformed intrinsic: ${name}`);
    }
  });
}
},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAnonymousIntrinsics = getAnonymousIntrinsics;
const {
  getOwnPropertyDescriptor,
  getPrototypeOf
} = Object;
/**
 * Object.getConstructorOf()
 * Helper function to improve readability, similar to Object.getPrototypeOf().
 */

function getConstructorOf(obj) {
  return getPrototypeOf(obj).constructor;
}
/**
 * getAnonymousIntrinsics()
 * Get the intrinsics not otherwise reachable by named own property
 * traversal from the global object.
 */


function getAnonymousIntrinsics() {
  const FunctionPrototypeConstructor = Function.prototype.constructor;
  const SymbolIterator = typeof Symbol && Symbol.iterator || '@@iterator';
  const SymbolMatchAll = typeof Symbol && Symbol.matchAll || '@@matchAll'; // 9.2.4.1 %ThrowTypeError%
  // eslint-disable-next-line prefer-rest-params

  const ThrowTypeError = getOwnPropertyDescriptor(arguments, 'callee').get; // 21.1.5.2 The %StringIteratorPrototype% Object
  // eslint-disable-next-line no-new-wrappers

  const StringIteratorObject = new String()[SymbolIterator]();
  const StringIteratorPrototype = getPrototypeOf(StringIteratorObject); // 21.2.7.1 The %RegExpStringIteratorPrototype% Object

  let RegExpStringIterator, RegExpStringIteratorPrototype
  try {
    RegExpStringIterator = new RegExp()[SymbolMatchAll]();
    RegExpStringIteratorPrototype = getPrototypeOf(RegExpStringIterator); // 22.1.5.2 The %ArrayIteratorPrototype% Object
  } catch (_) {}
  // eslint-disable-next-line no-array-constructor

  const ArrayIteratorObject = new Array()[SymbolIterator]();
  const ArrayIteratorPrototype = getPrototypeOf(ArrayIteratorObject); // 22.2.1 The %TypedArray% Intrinsic Object

  const TypedArray = getPrototypeOf(Float32Array); // 23.1.5.2 The %MapIteratorPrototype% Object

  const MapIteratorObject = new Map()[SymbolIterator]();
  const MapIteratorPrototype = getPrototypeOf(MapIteratorObject); // 23.2.5.2 The %SetIteratorPrototype% Object

  const SetIteratorObject = new Set()[SymbolIterator]();
  const SetIteratorPrototype = getPrototypeOf(SetIteratorObject); // 25.1.2 The %IteratorPrototype% Object

  const IteratorPrototype = getPrototypeOf(ArrayIteratorPrototype); // 25.2.1 The GeneratorFunction Constructor

  function* GeneratorFunctionInstance() {} // eslint-disable-line no-empty-function


  const GeneratorFunction = getConstructorOf(GeneratorFunctionInstance); // 25.2.3 Properties of the GeneratorFunction Prototype Object

  const Generator = GeneratorFunction.prototype; // 25.3.1 The AsyncGeneratorFunction Constructor

  async function* AsyncGeneratorFunctionInstance() {} // eslint-disable-line no-empty-function


  const AsyncGeneratorFunction = getConstructorOf(AsyncGeneratorFunctionInstance); // 25.3.2.2 AsyncGeneratorFunction.prototype

  const AsyncGenerator = AsyncGeneratorFunction.prototype; // 25.5.1 Properties of the AsyncGenerator Prototype Object

  const AsyncGeneratorPrototype = AsyncGenerator.prototype;
  const AsyncIteratorPrototype = getPrototypeOf(AsyncGeneratorPrototype); // 25.7.1 The AsyncFunction Constructor

  async function AsyncFunctionInstance() {} // eslint-disable-line no-empty-function


  const AsyncFunction = getConstructorOf(AsyncFunctionInstance); // VALIDATION

  const intrinsics = {
    FunctionPrototypeConstructor,
    ArrayIteratorPrototype,
    AsyncFunction,
    AsyncGenerator,
    AsyncGeneratorFunction,
    AsyncGeneratorPrototype,
    AsyncIteratorPrototype,
    Generator,
    GeneratorFunction,
    IteratorPrototype,
    MapIteratorPrototype,
    RegExpStringIteratorPrototype,
    SetIteratorPrototype,
    StringIteratorPrototype,
    ThrowTypeError,
    TypedArray
  };
  return intrinsics;
}
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNamedIntrinsic = getNamedIntrinsic;

var _assert = require("./assert.js");

const {
  getOwnPropertyDescriptor
} = Object;
/**
 * getNamedIntrinsic()
 * Get the intrinsic from the global object.
 */

function getNamedIntrinsic(root, name) {
  // Assumption: the intrinsic name matches a global object with the same name.
  const desc = getOwnPropertyDescriptor(root, name); // Abort if an accessor is found on the object instead of a data property.
  // We should never get into this non standard situation.

  (0, _assert.assert)(!('get' in desc || 'set' in desc), `unexpected accessor on global property: ${name}`);
  return desc.value;
}
},{"./assert.js":1}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intrinsicNames = void 0;

/**
 * intrinsicNames
 * The following list contains all intrisics names as defined in the specs, except
 * that the leading an trailing '%' characters have been removed. We want to design
 * from the specs so we can better track changes to the specs.
 */
const intrinsicNames = [// 6.1.7.4 Well-Known Intrinsic Objects
// Table 8: Well-Known Intrinsic Objects
'Array', 'ArrayBuffer', 'ArrayBufferPrototype', 'ArrayIteratorPrototype', 'ArrayPrototype', // TODO ArrayProto_*
// 'ArrayProto_entries',
// 'ArrayProto_forEach',
// 'ArrayProto_keys',
// 'ArrayProto_values',
// 25.1.4.2 The %AsyncFromSyncIteratorPrototype% Object
// TODO Beleived to not be directly accessible to ECMAScript code.
// 'AsyncFromSyncIteratorPrototype',
'AsyncFunction', 'AsyncFunctionPrototype', 'AsyncGenerator', 'AsyncGeneratorFunction', 'AsyncGeneratorPrototype', 'AsyncIteratorPrototype', 'Atomics', 'BigInt', // TOTO: Missing in the specs.
'BigIntPrototype', 'BigInt64Array', // TOTO: Missing in the specs.
'BigInt64ArrayPrototype', 'BigUint64Array', // TOTO: Missing in the specs.
'BigUint64ArrayPrototype', 'Boolean', 'BooleanPrototype', 'DataView', 'DataViewPrototype', 'Date', 'DatePrototype', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'Error', 'ErrorPrototype', 'eval', 'EvalError', 'EvalErrorPrototype', 'Float32Array', 'Float32ArrayPrototype', 'Float64Array', 'Float64ArrayPrototype', // 13.7.5.16.2 The %ForInIteratorPrototype% Object
// Documneted as "never directly accessible to ECMAScript code."
// 'ForInIteratorPrototype',
'Function', 'FunctionPrototype', 'Generator', 'GeneratorFunction', 'GeneratorPrototype', 'Int8Array', 'Int8ArrayPrototype', 'Int16Array', 'Int16ArrayPrototype', 'Int32Array', 'Int32ArrayPrototype', 'isFinite', 'isNaN', 'IteratorPrototype', 'JSON', // TODO
// 'JSONParse',
// 'JSONStringify',
'Map', 'MapIteratorPrototype', 'MapPrototype', 'Math', 'Number', 'NumberPrototype', 'Object', 'ObjectPrototype', // TODO
// 'ObjProto_toString',
// 'ObjProto_valueOf',
'parseFloat', 'parseInt', 'Promise', 'PromisePrototype', // TODO
// 'PromiseProto_then',
// 'Promise_all',
// 'Promise_reject',
// 'Promise_resolve',
'Proxy', 'RangeError', 'RangeErrorPrototype', 'ReferenceError', 'ReferenceErrorPrototype', 'Reflect', 'RegExp', 'RegExpPrototype', 'RegExpStringIteratorPrototype', 'Set', 'SetIteratorPrototype', 'SetPrototype', 'SharedArrayBuffer', 'SharedArrayBufferPrototype', 'String', 'StringIteratorPrototype', 'StringPrototype', 'Symbol', 'SymbolPrototype', 'SyntaxError', 'SyntaxErrorPrototype', 'ThrowTypeError', 'TypedArray', 'TypedArrayPrototype', 'TypeError', 'TypeErrorPrototype', 'Uint8Array', 'Uint8ArrayPrototype', 'Uint8ClampedArray', 'Uint8ClampedArrayPrototype', 'Uint16Array', 'Uint16ArrayPrototype', 'Uint32Array', 'Uint32ArrayPrototype', 'URIError', 'URIErrorPrototype', 'WeakMap', 'WeakMapPrototype', 'WeakSet', 'WeakSetPrototype', // B.2.1 Additional Properties of the Global Object
// Table 87: Additional Well-known Intrinsic Objects
'escape', 'unescape', // ESNext
'FunctionPrototypeConstructor', 'Compartment', 'CompartmentPrototype', 'harden'];
exports.intrinsicNames = intrinsicNames;
},{}],7:[function(require,module,exports){
"use strict";

const globalThis = typeof global !== undefined ? global : self

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIntrinsics = getIntrinsics;

var _checkAnonIntrinsics = require("./check-anon-intrinsics.js");

var _getAnonymousIntrinsics = require("./get-anonymous-intrinsics.js");

var _intrinsicNames = require("./intrinsic-names.js");

var _getNamedIntrinsic = require("./get-named-intrinsic.js");

var _checkIntrinsics = require("./check-intrinsics.js");

// The intrinsics are the defiend in the global specifications.
//
// API
//
//   getIntrinsics(): Object
//
// Operation similar to abstract operation `CreateInrinsics` in section 8.2.2
// of the ES specifications.
//
// Return a record-like object similar to the [[intrinsics]] slot of the
// realmRec excepts for the following simpifications:
//
//  - we omit the intrinsics not reachable by JavaScript code.
//
//  - we omit intrinsics that are direct properties of the global object
//    (except for the "prototype" property), and properties that are direct
//    properties of the prototypes (except for "constructor").
//
//  - we use the name of the associated global object property instead of the
//    intrinsic name (usually, `<intrinsic name> === '%' + <global property
//    name>+ '%'`).
//
// Assumptions
//
// The intrinsic names correspond to the object names with "%" added as prefix and suffix, i.e. the intrinsic "%Object%" is equal to the global object property "Object".
const {
  apply
} = Reflect;

const uncurryThis = fn => (thisArg, ...args) => apply(fn, thisArg, args);

const hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
const suffix = 'Prototype';
/**
 * getIntrinsics()
 * Return a record-like object similar to the [[intrinsics]] slot of the realmRec
 * excepts for the following simpifications:
 * - we omit the intrinsics not reachable by JavaScript code.
 * - we omit intrinsics that are direct properties of the global object (except for the
 *   "prototype" property), and properties that are direct properties of the prototypes
 *   (except for "constructor").
 * - we use the name of the associated global object property instead of the intrinsic
 *   name (usually, <intrinsic name> === '%' + <global property name>+ '%').
 */

function getIntrinsics() {
  const intrinsics = {
    __proto__: null
  };
  const anonIntrinsics = (0, _getAnonymousIntrinsics.getAnonymousIntrinsics)();
  (0, _checkAnonIntrinsics.checkAnonIntrinsics)(anonIntrinsics);

  for (const name of _intrinsicNames.intrinsicNames) {
    if (hasOwnProperty(anonIntrinsics, name)) {
      intrinsics[name] = anonIntrinsics[name]; // eslint-disable-next-line no-continue

      continue;
    }

    if (hasOwnProperty(globalThis, name)) {
      intrinsics[name] = (0, _getNamedIntrinsic.getNamedIntrinsic)(globalThis, name); // eslint-disable-next-line no-continue

      continue;
    }

    const hasSuffix = name.endsWith(suffix);

    if (hasSuffix) {
      const prefix = name.slice(0, -suffix.length);

      if (hasOwnProperty(anonIntrinsics, prefix)) {
        const intrinsic = anonIntrinsics[prefix];
        intrinsics[name] = intrinsic.prototype; // eslint-disable-next-line no-continue

        continue;
      }

      if (hasOwnProperty(globalThis, prefix)) {
        const intrinsic = (0, _getNamedIntrinsic.getNamedIntrinsic)(globalThis, prefix);
        intrinsics[name] = intrinsic.prototype; // eslint-disable-next-line no-continue

        continue;
      }
    }
  }

  // (0, _checkIntrinsics.checkIntrinsics)(intrinsics);
  return intrinsics;
}
},{"./check-anon-intrinsics.js":2,"./check-intrinsics.js":3,"./get-anonymous-intrinsics.js":4,"./get-named-intrinsic.js":5,"./intrinsic-names.js":6}],8:[function(require,module,exports){
const { getIntrinsics } = require('../lib/intrinsics.js')
module.exports = {
  getIntrinsics: () => {
    try {
      return getIntrinsics()
    } catch (err) {
      const subErrMsg = err.stack || err.message || err
      throw new Error(`Cytoplasm failed to gather intrinsics. Please specify a "primordials" option to the Membrane constructor, apply core-js polyfills, or use node v12 or higher.\n${subErrMsg}`)
    }
  }
}
},{"../lib/intrinsics.js":7}],9:[function(require,module,exports){
// theres some things we may need to enforce differently when in and out of strict mode
// e.g. fn.arguments
'use strict'

const { getIntrinsics } = require('./getIntrinsics')

const { isArray } = Array

class MembraneSpace {
  constructor ({ label, createHandler, dangerouslyAlwaysUnwrap, passthroughFilter }) {
    this.alwaysUnwrap = Boolean(dangerouslyAlwaysUnwrap)
    this.rawToBridged = new WeakMap()
    this.handlerForRef = new WeakMap()
    this.label = label
    this.createHandler = createHandler || (() => Reflect)
    this.passthroughFilter = passthroughFilter || (() => false)
  }

  getHandlerForRef (rawRef) {
    if (this.handlerForRef.has(rawRef)) {
      return this.handlerForRef.get(rawRef)
    }
    const handler = this.createHandler({
      setHandlerForRef: (ref, newHandler) => this.handlerForRef.set(ref, newHandler)
    })
    this.handlerForRef.set(rawRef, handler)
    return handler
  }
}

class Membrane {
  constructor ({ debugMode, primordials } = {}) {
    this.debugMode = debugMode
    this.primordials = primordials || Object.values(getIntrinsics())
    this.bridgedToRaw = new WeakMap()
    this.rawToOrigin = new WeakMap()
  }

  makeMembraneSpace (opts) {
    return new MembraneSpace(opts)
  }

  // if rawObj is not part of inGraph, should we explode?
  bridge (inRef, inGraph, outGraph) {

    //
    // skip if should be passed directly (danger)
    //

    if (this.shouldSkipBridge(inRef)) {
      // console.log(`membrane.bridge should skip in:${inGraph.label} -> out:${outGraph.label}`)
      return inRef
    }

    //
    // unwrap ref and detect "origin" graph
    //

    let rawRef
    let originGraph

    if (this.bridgedToRaw.has(inRef)) {
      // we know this ref
      rawRef = this.bridgedToRaw.get(inRef)
      originGraph = this.rawToOrigin.get(rawRef)
    } else {
      // we've never seen this ref before - must be raw and from inGraph
      rawRef = inRef
      originGraph = inGraph
      // record origin
      this.rawToOrigin.set(inRef, inGraph)
    }

    // allow graphs to pass through some values unwrapped
    if (outGraph.passthroughFilter(rawRef)) {
      return rawRef
    }

    //
    // wrap for ref for "out" graph
    //

    // if "out" graph is set to "alwaysUnwrap", deliver unwrapped
    if (outGraph.alwaysUnwrap) {
      // workaround for the arguments array which is an unwrapped array
      // with wrapped elements
      const isRawArgumentsArray = (inRef === rawRef && Array.isArray(rawRef))
      if (isRawArgumentsArray) {
        rawRef = rawRef.map(childRef => this.bridge(childRef, inGraph, outGraph))
      }
      return rawRef
    }

    // if this ref originates in the "out" graph, deliver unwrapped
    if (originGraph === outGraph) {
      return rawRef
    }

    // if outGraph already has bridged wrapping for rawRef, use it
    if (outGraph.rawToBridged.has(rawRef)) {
      return outGraph.rawToBridged.get(rawRef)
    }

    // create new wrapping for rawRef
    const distortionHandler = originGraph.getHandlerForRef(rawRef)
    const membraneProxyHandler = this.createMembraneProxyHandler(
      distortionHandler,
      rawRef,
      originGraph,
      outGraph,
    )
    const outRef = createFlexibleProxy(rawRef, membraneProxyHandler)
    // cache both ways
    outGraph.rawToBridged.set(rawRef, outRef)
    this.bridgedToRaw.set(outRef, rawRef)

    // all done
    return outRef
  }

  // handler stack

  // ProxyInvariantHandler calls next() <-- needs to have final say
  //   MembraneHandler calls next() <-- needs to see distortion result
  //     LocalWritesHandler sets behavior

  // currently creating handler per-object
  // perf: create only once?
  //   better to create one each time with rawRef bound?
  //   or find a way to map target to rawRef
  createMembraneProxyHandler (prevProxyHandler, rawRef, originGraph, outGraph) {
    const proxyHandler = {
      getPrototypeOf: this.createHandlerFn('getPrototypeOf', prevProxyHandler.getPrototypeOf, rawRef, originGraph, outGraph),
      setPrototypeOf: this.createHandlerFn('setPrototypeOf', prevProxyHandler.setPrototypeOf, rawRef, originGraph, outGraph),
      isExtensible: this.createHandlerFn('isExtensible', prevProxyHandler.isExtensible, rawRef, originGraph, outGraph),
      preventExtensions: this.createHandlerFn('preventExtensions', prevProxyHandler.preventExtensions, rawRef, originGraph, outGraph),
      getOwnPropertyDescriptor: this.createHandlerFn('getOwnPropertyDescriptor', prevProxyHandler.getOwnPropertyDescriptor, rawRef, originGraph, outGraph),
      defineProperty: this.createHandlerFn('defineProperty', prevProxyHandler.defineProperty, rawRef, originGraph, outGraph),
      has: this.createHandlerFn('has', prevProxyHandler.has, rawRef, originGraph, outGraph),
      get: this.createHandlerFn('get', prevProxyHandler.get, rawRef, originGraph, outGraph),
      set: this.createHandlerFn('set', prevProxyHandler.set, rawRef, originGraph, outGraph),
      deleteProperty: this.createHandlerFn('deleteProperty', prevProxyHandler.deleteProperty, rawRef, originGraph, outGraph),
      ownKeys: this.createHandlerFn('ownKeys', prevProxyHandler.ownKeys, rawRef, originGraph, outGraph),
      apply: this.createHandlerFn('apply', prevProxyHandler.apply, rawRef, originGraph, outGraph),
      construct: this.createHandlerFn('construct', prevProxyHandler.construct, rawRef, originGraph, outGraph)
    }
    return proxyHandler
  }

  createHandlerFn (action, reflectFn, rawRef, originGraph, outGraph) {
    const bridge = this.bridge.bind(this)
    if (this.debugMode) {
      // in debugMode, we dont safely catch and wrap errors
      // while this is insecure, it makes debugging much easier
      return (_, ...outArgs) => {
        const originArgs = outArgs.map(arg => bridge(arg, outGraph, originGraph))
        let value = reflectFn(rawRef, ...originArgs)
        return bridge(value, originGraph, outGraph)
      }
    }
    // this works for all proxy handlers
    // - arguments are from outside, bridge to origin
    // - call reflect fn with bridged arguments
    // - bridge return value or error back to outside
    return (_, ...outArgs) => {
      const originArgs = outArgs.map(arg => bridge(arg, outGraph, originGraph))
      let value, originErr
      try {
        value = reflectFn(rawRef, ...originArgs)
      } catch (err) {
        originErr = err
      }
      if (originErr !== undefined) {
        const outErr = bridge(originErr, originGraph, outGraph)
        throw outErr
      } else {
        return bridge(value, originGraph, outGraph)
      }
    }
  }

  // some values can/should not be membrane wrapped
  shouldSkipBridge (value) {
    // Check for null and undefined
    if (value === null) {
      return true
    }
    if (value === undefined) {
      return true
    }

    // early exit if the object is an Array instance (common)
    if (isArray(value) && value !== Array.prototype) {
      // cant skip bridge
      return false
    }

    // check for non-objects
    const valueType = typeof value
    if (valueType !== 'object' && valueType !== 'function') {
      return true
    }

    // primordials should not be wrapped
    if (this.primordials.includes(value)) {
      return true
    }

    // otherwise needs to be wrapped
    return false
  }

  getOriginSpace (ref) {
    const rawRef = this.bridgedToRaw.get(ref) || ref
    const originSpace = this.rawToOrigin.get(rawRef)
    return originSpace
  }

  isWrapped (ref) {
    return this.bridgedToRaw.has(ref)
  }

  // this returns a string representing the passed in value
  // it is used for debugging
  debugLabelForValue (inRef) {
    let rawRef, originLabel
    if (this.bridgedToRaw.has(inRef)) {
      // we know this ref
      rawRef = this.bridgedToRaw.get(inRef)
      originLabel = this.rawToOrigin.get(rawRef).label
    } else {
      // we dont know it
      rawRef = inRef
      originLabel = 'raw'
    }
    let valueLabel
    const type = typeof rawRef
    if (type === 'string') return `"${rawRef}"`
    if (type === 'object' && Array.isArray(rawRef)) {
      // && rawRef !== Array.prototype
      valueLabel = `[${rawRef.map(value => {
        if (Array.isArray(value)) return `<array>(${originLabel})`
        return this.debug(value)
      }).join(', ')}]`
      // return '<array>'
    } else if (type === 'function') {
      valueLabel= `<function: ${rawRef.name}>`
    } else {
      valueLabel = `<${type}>`
    }
    return `${valueLabel}(${originLabel})`
  }

}

module.exports = { Membrane, MembraneSpace }

//
// FlexibleProxy
//

function createFlexibleProxy (realTarget, realHandler) {
  const flexibleTarget = getProxyTargetForValue(realTarget)
  const flexibleHandler = respectProxyInvariants(realHandler)
  return new Proxy(flexibleTarget, flexibleHandler)
}

// use replacement proxyTarget for flexible distortions less restrained by "Proxy invariant"
// e.g. hide otherwise non-configurable properties
function getProxyTargetForValue (value) {
  if (typeof value === 'function') {
    if (value.prototype) {
      return function () {}
    } else {
      return () => {}
    }
  } else {
    if (Array.isArray(value)) {
      return []
    } else {
      return {}
    }
  }
}

// TODO ensure we're enforcing all proxy invariants
function respectProxyInvariants (rawProxyHandler) {
  // the defaults arent needed for the membraneProxyHandler,
  // but might be for an imcomplete proxy handler
  const handlerWithDefaults = Object.assign({}, Reflect, rawProxyHandler)
  const respectfulProxyHandler = Object.assign({}, handlerWithDefaults)
  // enforce configurable false props
  respectfulProxyHandler.getOwnPropertyDescriptor = (fakeTarget, key) => {
    // ensure propDesc matches proxy target's non-configurable property
    const propDesc = handlerWithDefaults.getOwnPropertyDescriptor(fakeTarget, key)
    if (propDesc && !propDesc.configurable) {
      const proxyTargetPropDesc = Reflect.getOwnPropertyDescriptor(fakeTarget, key)
      const proxyTargetPropIsConfigurable = (!proxyTargetPropDesc || proxyTargetPropDesc.configurable)
      // console.warn('@@ getOwnPropertyDescriptor - non configurable', String(key), !!proxyTargetPropIsConfigurable)
      // if proxy target is configurable (and real target is not) update the proxy target to ensure the invariant holds
      if (proxyTargetPropIsConfigurable) {
        Reflect.defineProperty(fakeTarget, key, propDesc)
      }
    }
    return propDesc
  }
  // enforce preventing extensions
  respectfulProxyHandler.preventExtensions = (fakeTarget) => {
    // check if provided handler allowed the preventExtensions call
    const didAllow = handlerWithDefaults.preventExtensions(fakeTarget)
    // if it did allow, we need to enforce this on the fakeTarget
    if (didAllow === true) {
      // transfer all keys onto fakeTarget
      const propDescs = handlerWithDefaults.ownKeys(fakeTarget).map(prop => {
        const propDesc = handlerWithDefaults.getOwnPropertyDescriptor(fakeTarget, prop)
        Reflect.defineProperty(fakeTarget, prop, propDesc)
      })
      // transfer prototype
      Reflect.setPrototypeOf(fakeTarget, handlerWithDefaults.getPrototypeOf(fakeTarget))
      // prevent extensions on fakeTarget
      Reflect.preventExtensions(fakeTarget)
    }
    // return the result
    return didAllow
  }
  // enforce defineProperty configurable: false
  respectfulProxyHandler.defineProperty = (fakeTarget, prop, propDesc) => {
    const didAllow = handlerWithDefaults.defineProperty(fakeTarget, prop, propDesc)
    // need to also define on the fakeTarget
    if (didAllow && !propDesc.configurable) {
      Reflect.defineProperty(fakeTarget, prop, propDesc)
    }
    return didAllow
  }
  // return modified handler
  return respectfulProxyHandler
}
},{"./getIntrinsics":8}]},{},[9])(9)
});
