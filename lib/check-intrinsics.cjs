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