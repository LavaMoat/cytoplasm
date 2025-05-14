"use strict";

const globalThis = typeof global !== undefined ? global : self

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIntrinsics = getIntrinsics;

var _checkAnonIntrinsics = require("./check-anon-intrinsics.cjs");

var _getAnonymousIntrinsics = require("./get-anonymous-intrinsics.cjs");

var _intrinsicNames = require("./intrinsic-names.cjs");

var _getNamedIntrinsic = require("./get-named-intrinsic.cjs");

var _checkIntrinsics = require("./check-intrinsics.cjs");

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