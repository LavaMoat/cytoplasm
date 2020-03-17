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