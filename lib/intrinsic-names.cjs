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