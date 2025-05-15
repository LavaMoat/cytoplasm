"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  Membrane: () => Membrane,
  MembraneSpace: () => MembraneSpace
});
module.exports = __toCommonJS(index_exports);

// src/getIntrinsics.js
var import_intrinsics = require("../lib/intrinsics.cjs");
var getIntrinsics = () => {
  try {
    return (0, import_intrinsics.getIntrinsics)();
  } catch (err) {
    const subErrMsg = err.stack || err.message || err;
    throw new Error(`Cytoplasm failed to gather intrinsics. Please specify a "primordials" option to the Membrane constructor, apply core-js polyfills, or use node v12 or higher.
${subErrMsg}`);
  }
};

// src/index.js
var { isArray } = Array;
var MembraneSpace = class {
  constructor({ label, createHandler, dangerouslyAlwaysUnwrap, passthroughFilter }) {
    this.alwaysUnwrap = Boolean(dangerouslyAlwaysUnwrap);
    this.rawToBridged = /* @__PURE__ */ new WeakMap();
    this.handlerForRef = /* @__PURE__ */ new WeakMap();
    this.label = label;
    this.createHandler = createHandler || (() => Reflect);
    this.passthroughFilter = passthroughFilter || (() => false);
  }
  getHandlerForRef(rawRef) {
    if (this.handlerForRef.has(rawRef)) {
      return this.handlerForRef.get(rawRef);
    }
    const handler = this.createHandler({
      setHandlerForRef: (ref, newHandler) => this.handlerForRef.set(ref, newHandler)
    });
    this.handlerForRef.set(rawRef, handler);
    return handler;
  }
};
var Membrane = class {
  constructor({ debugMode, primordials } = {}) {
    this.debugMode = debugMode;
    this.primordials = primordials || Object.values(getIntrinsics());
    this.bridgedToRaw = /* @__PURE__ */ new WeakMap();
    this.rawToOrigin = /* @__PURE__ */ new WeakMap();
  }
  makeMembraneSpace(opts) {
    return new MembraneSpace(opts);
  }
  // if rawObj is not part of inGraph, should we explode?
  bridge(inRef, inGraph, outGraph) {
    if (inGraph === outGraph) {
      return inRef;
    }
    if (this.shouldSkipBridge(inRef)) {
      return inRef;
    }
    let rawRef;
    let originGraph;
    if (this.bridgedToRaw.has(inRef)) {
      rawRef = this.bridgedToRaw.get(inRef);
      originGraph = this.rawToOrigin.get(rawRef);
    } else {
      rawRef = inRef;
      originGraph = inGraph;
      this.rawToOrigin.set(inRef, inGraph);
    }
    if (outGraph.passthroughFilter(rawRef)) {
      return rawRef;
    }
    if (outGraph.alwaysUnwrap) {
      const isRawArgumentsArray = inRef === rawRef && Array.isArray(rawRef);
      if (isRawArgumentsArray) {
        rawRef = rawRef.map((childRef) => this.bridge(childRef, inGraph, outGraph));
      }
      return rawRef;
    }
    if (originGraph === outGraph) {
      return rawRef;
    }
    if (outGraph.rawToBridged.has(rawRef)) {
      return outGraph.rawToBridged.get(rawRef);
    }
    const distortionHandler = originGraph.getHandlerForRef(rawRef);
    const membraneProxyHandler = this.createMembraneProxyHandler(
      distortionHandler,
      rawRef,
      originGraph,
      outGraph
    );
    const outRef = createFlexibleProxy(rawRef, membraneProxyHandler);
    outGraph.rawToBridged.set(rawRef, outRef);
    this.bridgedToRaw.set(outRef, rawRef);
    return outRef;
  }
  // handler stack
  // ProxyInvariantHandler calls next() <-- needs to have final say
  //   MembraneHandler calls next() <-- needs to see distortion result
  //     LocalWritesHandler sets behavior
  // currently creating handler per-object
  // perf: create only once?
  //   better to create one each time with rawRef bound?
  //   or find a way to map target to rawRef
  createMembraneProxyHandler(prevProxyHandler, rawRef, originGraph, outGraph) {
    const proxyHandler = {
      getPrototypeOf: this.createHandlerFn("getPrototypeOf", prevProxyHandler.getPrototypeOf, rawRef, originGraph, outGraph),
      setPrototypeOf: this.createHandlerFn("setPrototypeOf", prevProxyHandler.setPrototypeOf, rawRef, originGraph, outGraph),
      isExtensible: this.createHandlerFn("isExtensible", prevProxyHandler.isExtensible, rawRef, originGraph, outGraph),
      preventExtensions: this.createHandlerFn("preventExtensions", prevProxyHandler.preventExtensions, rawRef, originGraph, outGraph),
      getOwnPropertyDescriptor: this.createHandlerFn("getOwnPropertyDescriptor", prevProxyHandler.getOwnPropertyDescriptor, rawRef, originGraph, outGraph),
      defineProperty: this.createHandlerFn("defineProperty", prevProxyHandler.defineProperty, rawRef, originGraph, outGraph),
      has: this.createHandlerFn("has", prevProxyHandler.has, rawRef, originGraph, outGraph),
      get: this.createHandlerFn("get", prevProxyHandler.get, rawRef, originGraph, outGraph),
      set: this.createHandlerFn("set", prevProxyHandler.set, rawRef, originGraph, outGraph),
      deleteProperty: this.createHandlerFn("deleteProperty", prevProxyHandler.deleteProperty, rawRef, originGraph, outGraph),
      ownKeys: this.createHandlerFn("ownKeys", prevProxyHandler.ownKeys, rawRef, originGraph, outGraph),
      apply: this.createHandlerFn("apply", prevProxyHandler.apply, rawRef, originGraph, outGraph),
      construct: this.createHandlerFn("construct", prevProxyHandler.construct, rawRef, originGraph, outGraph)
    };
    return proxyHandler;
  }
  createHandlerFn(action, reflectFn, rawRef, originGraph, outGraph) {
    const bridge = this.bridge.bind(this);
    if (this.debugMode) {
      return (_, ...outArgs) => {
        const originArgs = outArgs.map((arg) => bridge(arg, outGraph, originGraph));
        let value = reflectFn(rawRef, ...originArgs);
        return bridge(value, originGraph, outGraph);
      };
    }
    return (_, ...outArgs) => {
      const originArgs = outArgs.map((arg) => bridge(arg, outGraph, originGraph));
      let value, originErr;
      try {
        value = reflectFn(rawRef, ...originArgs);
      } catch (err) {
        originErr = err;
      }
      if (originErr !== void 0) {
        const outErr = bridge(originErr, originGraph, outGraph);
        throw outErr;
      } else {
        return bridge(value, originGraph, outGraph);
      }
    };
  }
  // some values can/should not be membrane wrapped
  shouldSkipBridge(value) {
    if (value === null) {
      return true;
    }
    if (value === void 0) {
      return true;
    }
    if (isArray(value) && value !== Array.prototype) {
      return false;
    }
    const valueType = typeof value;
    if (valueType !== "object" && valueType !== "function") {
      return true;
    }
    if (this.primordials.includes(value)) {
      return true;
    }
    return false;
  }
  getOriginSpace(ref) {
    const rawRef = this.bridgedToRaw.get(ref) || ref;
    const originSpace = this.rawToOrigin.get(rawRef);
    return originSpace;
  }
  isWrapped(ref) {
    return this.bridgedToRaw.has(ref);
  }
  // this returns a string representing the passed in value
  // it is used for debugging
  debugLabelForValue(inRef) {
    let rawRef, originLabel;
    if (this.bridgedToRaw.has(inRef)) {
      rawRef = this.bridgedToRaw.get(inRef);
      originLabel = this.rawToOrigin.get(rawRef).label;
    } else {
      rawRef = inRef;
      originLabel = "raw";
    }
    let valueLabel;
    const type = typeof rawRef;
    if (type === "string") return `"${rawRef}"`;
    if (type === "object" && Array.isArray(rawRef)) {
      valueLabel = `[${rawRef.map((value) => {
        if (Array.isArray(value)) return `<array>(${originLabel})`;
        return this.debugLabelForValue(value);
      }).join(", ")}]`;
    } else if (type === "function") {
      valueLabel = `<function: ${rawRef.name}>`;
    } else {
      valueLabel = `<${type}>`;
    }
    return `${valueLabel}(${originLabel})`;
  }
};
function createFlexibleProxy(realTarget, realHandler) {
  const flexibleTarget = getProxyTargetForValue(realTarget);
  const flexibleHandler = respectProxyInvariants(realHandler);
  return new Proxy(flexibleTarget, flexibleHandler);
}
function getProxyTargetForValue(value) {
  if (typeof value === "function") {
    if (value.prototype) {
      return function() {
      };
    } else {
      return () => {
      };
    }
  } else {
    if (Array.isArray(value)) {
      return [];
    } else {
      return {};
    }
  }
}
function respectProxyInvariants(rawProxyHandler) {
  const handlerWithDefaults = Object.assign({}, Reflect, rawProxyHandler);
  const respectfulProxyHandler = Object.assign({}, handlerWithDefaults);
  respectfulProxyHandler.getOwnPropertyDescriptor = (fakeTarget, key) => {
    const propDesc = handlerWithDefaults.getOwnPropertyDescriptor(fakeTarget, key);
    if (propDesc && !propDesc.configurable) {
      Reflect.defineProperty(fakeTarget, key, propDesc);
    }
    return propDesc;
  };
  respectfulProxyHandler.preventExtensions = (fakeTarget) => {
    const didAllow = handlerWithDefaults.preventExtensions(fakeTarget);
    if (didAllow === true) {
      const propDescs = handlerWithDefaults.ownKeys(fakeTarget).map((prop) => {
        const propDesc = handlerWithDefaults.getOwnPropertyDescriptor(fakeTarget, prop);
        Reflect.defineProperty(fakeTarget, prop, propDesc);
      });
      Reflect.setPrototypeOf(fakeTarget, handlerWithDefaults.getPrototypeOf(fakeTarget));
      Reflect.preventExtensions(fakeTarget);
    }
    return didAllow;
  };
  respectfulProxyHandler.defineProperty = (fakeTarget, prop, propDesc) => {
    const didAllow = handlerWithDefaults.defineProperty(fakeTarget, prop, propDesc);
    if (didAllow && !propDesc.configurable) {
      Reflect.defineProperty(fakeTarget, prop, propDesc);
    }
    return didAllow;
  };
  return respectfulProxyHandler;
}
