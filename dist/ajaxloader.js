'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function () {
  "use strict";

  function lib$es6$promise$utils$$objectOrFunction(x) {
    return typeof x === 'function' || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null;
  }

  function lib$es6$promise$utils$$isFunction(x) {
    return typeof x === 'function';
  }

  function lib$es6$promise$utils$$isMaybeThenable(x) {
    return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null;
  }

  var lib$es6$promise$utils$$_isArray;
  if (!Array.isArray) {
    lib$es6$promise$utils$$_isArray = function lib$es6$promise$utils$$_isArray(x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  } else {
    lib$es6$promise$utils$$_isArray = Array.isArray;
  }

  var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
  var lib$es6$promise$asap$$len = 0;
  var lib$es6$promise$asap$$vertxNext;
  var lib$es6$promise$asap$$customSchedulerFn;

  var lib$es6$promise$asap$$asap = function asap(callback, arg) {
    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
    lib$es6$promise$asap$$len += 2;
    if (lib$es6$promise$asap$$len === 2) {
      if (lib$es6$promise$asap$$customSchedulerFn) {
        lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
      } else {
        lib$es6$promise$asap$$scheduleFlush();
      }
    }
  };

  function lib$es6$promise$asap$$setScheduler(scheduleFn) {
    lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
  }

  function lib$es6$promise$asap$$setAsap(asapFn) {
    lib$es6$promise$asap$$asap = asapFn;
  }

  var lib$es6$promise$asap$$browserWindow = typeof window !== 'undefined' ? window : undefined;
  var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
  var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
  var lib$es6$promise$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

  function lib$es6$promise$asap$$useNextTick() {
    return function () {
      process.nextTick(lib$es6$promise$asap$$flush);
    };
  }

  function lib$es6$promise$asap$$useVertxTimer() {
    return function () {
      lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
    };
  }

  function lib$es6$promise$asap$$useMutationObserver() {
    var iterations = 0;
    var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
    var node = document.createTextNode('');
    observer.observe(node, { characterData: true });

    return function () {
      node.data = iterations = ++iterations % 2;
    };
  }

  function lib$es6$promise$asap$$useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = lib$es6$promise$asap$$flush;
    return function () {
      channel.port2.postMessage(0);
    };
  }

  function lib$es6$promise$asap$$useSetTimeout() {
    return function () {
      setTimeout(lib$es6$promise$asap$$flush, 1);
    };
  }

  var lib$es6$promise$asap$$queue = new Array(1000);
  function lib$es6$promise$asap$$flush() {
    for (var i = 0; i < lib$es6$promise$asap$$len; i += 2) {
      var callback = lib$es6$promise$asap$$queue[i];
      var arg = lib$es6$promise$asap$$queue[i + 1];

      callback(arg);

      lib$es6$promise$asap$$queue[i] = undefined;
      lib$es6$promise$asap$$queue[i + 1] = undefined;
    }

    lib$es6$promise$asap$$len = 0;
  }

  function lib$es6$promise$asap$$attemptVertx() {
    try {
      var r = require;
      var vertx = r('vertx');
      lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return lib$es6$promise$asap$$useVertxTimer();
    } catch (e) {
      return lib$es6$promise$asap$$useSetTimeout();
    }
  }

  var lib$es6$promise$asap$$scheduleFlush;
  if (lib$es6$promise$asap$$isNode) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
  } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
  } else if (lib$es6$promise$asap$$isWorker) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
  } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
  } else {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
  }
  function lib$es6$promise$then$$then(onFulfillment, onRejection) {
    var parent = this;

    var child = new this.constructor(lib$es6$promise$$internal$$noop);

    if (child[lib$es6$promise$$internal$$PROMISE_ID] === undefined) {
      lib$es6$promise$$internal$$makePromise(child);
    }

    var state = parent._state;

    if (state) {
      var callback = arguments[state - 1];
      lib$es6$promise$asap$$asap(function () {
        lib$es6$promise$$internal$$invokeCallback(state, child, callback, parent._result);
      });
    } else {
      lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
    }

    return child;
  }
  var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
  function lib$es6$promise$promise$resolve$$resolve(object) {
    var Constructor = this;

    if (object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object.constructor === Constructor) {
      return object;
    }

    var promise = new Constructor(lib$es6$promise$$internal$$noop);
    lib$es6$promise$$internal$$resolve(promise, object);
    return promise;
  }
  var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
  var lib$es6$promise$$internal$$PROMISE_ID = Math.random().toString(36).substring(16);

  function lib$es6$promise$$internal$$noop() {}

  var lib$es6$promise$$internal$$PENDING = void 0;
  var lib$es6$promise$$internal$$FULFILLED = 1;
  var lib$es6$promise$$internal$$REJECTED = 2;

  var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

  function lib$es6$promise$$internal$$selfFulfillment() {
    return new TypeError("You cannot resolve a promise with itself");
  }

  function lib$es6$promise$$internal$$cannotReturnOwn() {
    return new TypeError('A promises callback cannot return that same promise.');
  }

  function lib$es6$promise$$internal$$getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
      return lib$es6$promise$$internal$$GET_THEN_ERROR;
    }
  }

  function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
    try {
      then.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }

  function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
    lib$es6$promise$asap$$asap(function (promise) {
      var sealed = false;
      var error = lib$es6$promise$$internal$$tryThen(then, thenable, function (value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, value);
        }
      }, function (reason) {
        if (sealed) {
          return;
        }
        sealed = true;

        lib$es6$promise$$internal$$reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));

      if (!sealed && error) {
        sealed = true;
        lib$es6$promise$$internal$$reject(promise, error);
      }
    }, promise);
  }

  function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
    if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
      lib$es6$promise$$internal$$fulfill(promise, thenable._result);
    } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
      lib$es6$promise$$internal$$reject(promise, thenable._result);
    } else {
      lib$es6$promise$$internal$$subscribe(thenable, undefined, function (value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }, function (reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      });
    }
  }

  function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
    if (maybeThenable.constructor === promise.constructor && then === lib$es6$promise$then$$default && constructor.resolve === lib$es6$promise$promise$resolve$$default) {
      lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
    } else {
      if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
      } else if (then === undefined) {
        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
      } else if (lib$es6$promise$utils$$isFunction(then)) {
        lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
      }
    }
  }

  function lib$es6$promise$$internal$$resolve(promise, value) {
    if (promise === value) {
      lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
    } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
      lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
    } else {
      lib$es6$promise$$internal$$fulfill(promise, value);
    }
  }

  function lib$es6$promise$$internal$$publishRejection(promise) {
    if (promise._onerror) {
      promise._onerror(promise._result);
    }

    lib$es6$promise$$internal$$publish(promise);
  }

  function lib$es6$promise$$internal$$fulfill(promise, value) {
    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
      return;
    }

    promise._result = value;
    promise._state = lib$es6$promise$$internal$$FULFILLED;

    if (promise._subscribers.length !== 0) {
      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
    }
  }

  function lib$es6$promise$$internal$$reject(promise, reason) {
    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
      return;
    }
    promise._state = lib$es6$promise$$internal$$REJECTED;
    promise._result = reason;

    lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
  }

  function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
    var subscribers = parent._subscribers;
    var length = subscribers.length;

    parent._onerror = null;

    subscribers[length] = child;
    subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
    subscribers[length + lib$es6$promise$$internal$$REJECTED] = onRejection;

    if (length === 0 && parent._state) {
      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
    }
  }

  function lib$es6$promise$$internal$$publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;

    if (subscribers.length === 0) {
      return;
    }

    var child,
        callback,
        detail = promise._result;

    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];

      if (child) {
        lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }

    promise._subscribers.length = 0;
  }

  function lib$es6$promise$$internal$$ErrorObject() {
    this.error = null;
  }

  var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

  function lib$es6$promise$$internal$$tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
      return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
    }
  }

  function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
    var hasCallback = lib$es6$promise$utils$$isFunction(callback),
        value,
        error,
        succeeded,
        failed;

    if (hasCallback) {
      value = lib$es6$promise$$internal$$tryCatch(callback, detail);

      if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value = null;
      } else {
        succeeded = true;
      }

      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }

    if (promise._state !== lib$es6$promise$$internal$$PENDING) {} else if (hasCallback && succeeded) {
      lib$es6$promise$$internal$$resolve(promise, value);
    } else if (failed) {
      lib$es6$promise$$internal$$reject(promise, error);
    } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
      lib$es6$promise$$internal$$fulfill(promise, value);
    } else if (settled === lib$es6$promise$$internal$$REJECTED) {
      lib$es6$promise$$internal$$reject(promise, value);
    }
  }

  function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
    try {
      resolver(function resolvePromise(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }, function rejectPromise(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      });
    } catch (e) {
      lib$es6$promise$$internal$$reject(promise, e);
    }
  }

  var lib$es6$promise$$internal$$id = 0;
  function lib$es6$promise$$internal$$nextId() {
    return lib$es6$promise$$internal$$id++;
  }

  function lib$es6$promise$$internal$$makePromise(promise) {
    promise[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$id++;
    promise._state = undefined;
    promise._result = undefined;
    promise._subscribers = [];
  }

  function lib$es6$promise$promise$all$$all(entries) {
    return new lib$es6$promise$enumerator$$default(this, entries).promise;
  }
  var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
  function lib$es6$promise$promise$race$$race(entries) {
    var Constructor = this;

    if (!lib$es6$promise$utils$$isArray(entries)) {
      return new Constructor(function (resolve, reject) {
        reject(new TypeError('You must pass an array to race.'));
      });
    } else {
      return new Constructor(function (resolve, reject) {
        var length = entries.length;
        for (var i = 0; i < length; i++) {
          Constructor.resolve(entries[i]).then(resolve, reject);
        }
      });
    }
  }
  var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
  function lib$es6$promise$promise$reject$$reject(reason) {
    var Constructor = this;
    var promise = new Constructor(lib$es6$promise$$internal$$noop);
    lib$es6$promise$$internal$$reject(promise, reason);
    return promise;
  }
  var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

  function lib$es6$promise$promise$$needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  function lib$es6$promise$promise$$needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
  function lib$es6$promise$promise$$Promise(resolver) {
    this[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (lib$es6$promise$$internal$$noop !== resolver) {
      typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
      this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
    }
  }

  lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
  lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
  lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
  lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
  lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
  lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
  lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

  lib$es6$promise$promise$$Promise.prototype = {
    constructor: lib$es6$promise$promise$$Promise,

    then: lib$es6$promise$then$$default,

    'catch': function _catch(onRejection) {
      return this.then(null, onRejection);
    }
  };
  var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
  function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(lib$es6$promise$$internal$$noop);

    if (!this.promise[lib$es6$promise$$internal$$PROMISE_ID]) {
      lib$es6$promise$$internal$$makePromise(this.promise);
    }

    if (lib$es6$promise$utils$$isArray(input)) {
      this._input = input;
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        lib$es6$promise$$internal$$fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate();
        if (this._remaining === 0) {
          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
        }
      }
    } else {
      lib$es6$promise$$internal$$reject(this.promise, lib$es6$promise$enumerator$$validationError());
    }
  }

  function lib$es6$promise$enumerator$$validationError() {
    return new Error('Array Methods must be provided an Array');
  }

  lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function () {
    var length = this.length;
    var input = this._input;

    for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function (entry, i) {
    var c = this._instanceConstructor;
    var resolve = c.resolve;

    if (resolve === lib$es6$promise$promise$resolve$$default) {
      var then = lib$es6$promise$$internal$$getThen(entry);

      if (then === lib$es6$promise$then$$default && entry._state !== lib$es6$promise$$internal$$PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === lib$es6$promise$promise$$default) {
        var promise = new c(lib$es6$promise$$internal$$noop);
        lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve) {
          resolve(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve(entry), i);
    }
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function (state, i, value) {
    var promise = this.promise;

    if (promise._state === lib$es6$promise$$internal$$PENDING) {
      this._remaining--;

      if (state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      lib$es6$promise$$internal$$fulfill(promise, this._result);
    }
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function (promise, i) {
    var enumerator = this;

    lib$es6$promise$$internal$$subscribe(promise, undefined, function (value) {
      enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
    }, function (reason) {
      enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
    });
  };
  function lib$es6$promise$polyfill$$polyfill() {
    var local;

    if (typeof global !== 'undefined') {
      local = global;
    } else if (typeof self !== 'undefined') {
      local = self;
    } else {
      try {
        local = Function('return this')();
      } catch (e) {
        throw new Error('polyfill failed because global object is unavailable in this environment');
      }
    }

    var P = local.Promise;

    if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
      return;
    }

    local.Promise = lib$es6$promise$promise$$default;
  }
  var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

  var lib$es6$promise$umd$$ES6Promise = {
    'Promise': lib$es6$promise$promise$$default,
    'polyfill': lib$es6$promise$polyfill$$default
  };

  if (typeof define === 'function' && define['amd']) {
    define(function () {
      return lib$es6$promise$umd$$ES6Promise;
    });
  } else if (typeof module !== 'undefined' && module['exports']) {
    module['exports'] = lib$es6$promise$umd$$ES6Promise;
  } else if (typeof this !== 'undefined') {
    this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
  }

  lib$es6$promise$polyfill$$default();
}).call(undefined);

(function (self) {
  'use strict';

  if (self.fetch) {
    return;
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name');
    }
    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value;
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function (value, name) {
        this.append(name, value);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function (name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function (name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var list = this.map[name];
    if (!list) {
      list = [];
      this.map[name] = list;
    }
    list.push(value);
  };

  Headers.prototype['delete'] = function (name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function (name) {
    var values = this.map[normalizeName(name)];
    return values ? values[0] : null;
  };

  Headers.prototype.getAll = function (name) {
    return this.map[normalizeName(name)] || [];
  };

  Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)];
  };

  Headers.prototype.forEach = function (callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function (name) {
      this.map[name].forEach(function (value) {
        callback.call(thisArg, value, name, this);
      }, this);
    }, this);
  };

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    return fileReaderReady(reader);
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    reader.readAsText(blob);
    return fileReaderReady(reader);
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    }(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function Body() {
    this.bodyUsed = false;

    this._initBody = function (body) {
      this._bodyInit = body;
      if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (!body) {
        this._bodyText = '';
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {} else {
        throw new Error('unsupported BodyInit type');
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        }
      }
    };

    if (support.blob) {
      this.blob = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob');
        } else {
          return Promise.resolve(new Blob([this._bodyText]));
        }
      };

      this.arrayBuffer = function () {
        return this.blob().then(readBlobAsArrayBuffer);
      };

      this.text = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text');
        } else {
          return Promise.resolve(this._bodyText);
        }
      };
    } else {
      this.text = function () {
        var rejected = consumed(this);
        return rejected ? rejected : Promise.resolve(this._bodyText);
      };
    }

    if (support.formData) {
      this.formData = function () {
        return this.text().then(decode);
      };
    }

    this.json = function () {
      return this.text().then(JSON.parse);
    };

    return this;
  }

  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      if (!body) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = input;
    }

    this.credentials = options.credentials || this.credentials || 'omit';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    this._initBody(body);
  }

  Request.prototype.clone = function () {
    return new Request(this);
  };

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function headers(xhr) {
    var head = new Headers();
    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n');
    pairs.forEach(function (header) {
      var split = header.trim().split(':');
      var key = split.shift().trim();
      var value = split.join(':').trim();
      head.append(key, value);
    });
    return head;
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText;
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function () {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  Response.error = function () {
    var response = new Response(null, { status: 0, statusText: '' });
    response.type = 'error';
    return response;
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function (url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code');
    }

    return new Response(null, { status: status, headers: { location: url } });
  };

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function (input, init) {
    return new Promise(function (resolve, reject) {
      var request;
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input;
      } else {
        request = new Request(input, init);
      }

      var xhr = new XMLHttpRequest();

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL;
        }

        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL');
        }

        return;
      }

      xhr.onload = function () {
        var status = xhr.status === 1223 ? 204 : xhr.status;
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'));
          return;
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        };
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function () {
        reject(new TypeError('Network request failed'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function (value, name) {
        xhr.setRequestHeader(name, value);
      });

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
  };
  self.fetch.polyfill = true;
})(typeof self !== 'undefined' ? self : undefined);

(function (document) {
  'use strict';

  var createSettings = function createSettings(options) {
    var settings = {
      wrapper: 'html',
      ajaxUrl: null,
      ajaxData: null,
      container: 'html',
      anchors: 'a:not([target="_blank"]):not([href="#"])',
      replaceContent: true,
      waitBeforeLoading: 0,
      beforeLoading: null,
      afterLoading: null,
      onError: null,
      options: null
    };

    for (var option in options) {
      settings[option] = options[option];
    }return settings;
  };

  var serialize = function serialize(url, data) {
    var stringify = function stringify(data) {
      return '?' + Object.keys(data).map(function (value) {
        return encodeURIComponent(value) + '=' + encodeURIComponent(data[value]);
      }).join('&');
    };

    return data ? url + stringify(data) : url;
  };

  var blockPopstateEvent = document.readyState !== 'complete';

  function callback(fn, parameters, after) {
    var prom = null;

    if (fn === null && after) after();

    if (fn === null) return;

    try {
      prom = fn(parameters);
    } catch (error) {
      console.error(error);
    } finally {
      if (prom && typeof prom.then === 'function') {
        prom.then(function () {
          return after();
        }).catch(function (error) {
          return console.error(error);
        });
      } else if (after) {
        after();
      }
    }
  }

  function load(url, settings) {
    var serialized = serialize(url, settings.ajaxData);
    var container = document.querySelector(settings.container);
    var request = new Request(serialized, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'BAWXMLHttpRequest'
      }
    });

    callback(settings.beforeLoading, container, function () {
      setTimeout(function () {
        fetch(request).then(function (response) {
          return response.text();
        }).then(function (content) {

          if (settings.replaceContent) {
            container.innerHTML = content;
            setListeners(settings);
          } else {
            container.innerHTML += content;
            setListeners(createSettings(settings.options));
          }

          callback(settings.afterLoading, container);
        }).catch(function (error) {
          return callback(settings.onError, {
            container: container,
            error: error
          });
        });
      }, settings.waitBeforeLoading);
    });
  }

  function setListeners(settings) {
    var wrapper = document.querySelector(settings.wrapper);
    var anchors = [].slice.call(wrapper.querySelectorAll(settings.anchors));

    anchors.map(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var url = anchor.getAttribute('href');

        if (e.which === 2 || e.metaKey) {
          return true;
        } else if (url !== window.location.href) {
          window.history.pushState(null, settings.siteName, url);

          load(url, settings);
        }
        e.preventDefault();
      });
    });

    window.onload = function () {
      setTimeout(function () {
        blockPopstateEvent = false;
      }, 0);
    };

    window.onpopstate = function (e) {
      var onLoad = blockPopstateEvent && document.readyState === 'complete';

      if (!onLoad && url.search('#') === -1) {
        load(window.location.href, settings);
      }
    };
  }

  document.ajaxLoader = function (options) {
    var settings = createSettings(options);

    if (settings.ajaxUrl) {
      load(settings.ajaxUrl, settings);
      return;
    }

    if (window.history && window.history.pushState) {
      setListeners(settings);
    } else {
      console.error('AjaxLoader: History is not supported by this browser.');
    }
  };
})(document);