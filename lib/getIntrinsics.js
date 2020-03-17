(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.getIntrinsics = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  getPrototypeOf
} = Object;
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

  (0, _assert.assert)(getPrototypeOf(RegExpStringIteratorPrototype) === IteratorPrototype, 'RegExpStringIteratorPrototype.__proto__ should be IteratorPrototype'); // 22.2.1 The %TypedArray% Intrinsic Object
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

  const RegExpStringIterator = new RegExp()[SymbolMatchAll]();
  const RegExpStringIteratorPrototype = getPrototypeOf(RegExpStringIterator); // 22.1.5.2 The %ArrayIteratorPrototype% Object
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

  (0, _checkIntrinsics.checkIntrinsics)(intrinsics);
  return intrinsics;
}

},{"./check-anon-intrinsics.js":2,"./check-intrinsics.js":3,"./get-anonymous-intrinsics.js":4,"./get-named-intrinsic.js":5,"./intrinsic-names.js":6}]},{},[7])(7)
});
