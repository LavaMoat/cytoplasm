"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNamedIntrinsic = getNamedIntrinsic;

var _assert = require("./assert.cjs");

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