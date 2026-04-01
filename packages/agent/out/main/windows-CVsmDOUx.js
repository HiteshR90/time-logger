"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const path = require("node:path");
const fs = require("node:fs");
const node_url = require("node:url");
const node_module = require("node:module");
const main$1 = require("./main.js");
const require$$0 = require("url");
const require$$0$1 = require("fs");
const require$$1 = require("path");
const require$$3 = require("mock-aws-s3");
const require$$4 = require("os");
const require$$5$1 = require("aws-sdk");
const require$$6 = require("nock");
const require$$0$2 = require("stream");
const require$$0$4 = require("util");
const require$$0$3 = require("events");
const require$$0$5 = require("buffer");
const require$$0$6 = require("assert");
var nodePreGyp = { exports: {} };
var s3_setup = { exports: {} };
var hasRequiredS3_setup;
function requireS3_setup() {
  if (hasRequiredS3_setup) return s3_setup.exports;
  hasRequiredS3_setup = 1;
  (function(module2, exports$1) {
    module2.exports = exports$1;
    const url = require$$0;
    const fs2 = require$$0$1;
    const path2 = require$$1;
    module2.exports.detect = function(opts, config) {
      const to = opts.hosted_path;
      const uri = url.parse(to);
      config.prefix = !uri.pathname || uri.pathname === "/" ? "" : uri.pathname.replace("/", "");
      if (opts.bucket && opts.region) {
        config.bucket = opts.bucket;
        config.region = opts.region;
        config.endpoint = opts.host;
        config.s3ForcePathStyle = opts.s3ForcePathStyle;
      } else {
        const parts = uri.hostname.split(".s3");
        const bucket = parts[0];
        if (!bucket) {
          return;
        }
        if (!config.bucket) {
          config.bucket = bucket;
        }
        if (!config.region) {
          const region = parts[1].slice(1).split(".")[0];
          if (region === "amazonaws") {
            config.region = "us-east-1";
          } else {
            config.region = region;
          }
        }
      }
    };
    module2.exports.get_s3 = function(config) {
      if (process.env.node_pre_gyp_mock_s3) {
        const AWSMock = require$$3;
        const os = require$$4;
        AWSMock.config.basePath = `${os.tmpdir()}/mock`;
        const s32 = AWSMock.S3();
        const wcb = (fn) => (err, ...args) => {
          if (err && err.code === "ENOENT") {
            err.code = "NotFound";
          }
          return fn(err, ...args);
        };
        return {
          listObjects(params, callback) {
            return s32.listObjects(params, wcb(callback));
          },
          headObject(params, callback) {
            return s32.headObject(params, wcb(callback));
          },
          deleteObject(params, callback) {
            return s32.deleteObject(params, wcb(callback));
          },
          putObject(params, callback) {
            return s32.putObject(params, wcb(callback));
          }
        };
      }
      const AWS = require$$5$1;
      AWS.config.update(config);
      const s3 = new AWS.S3();
      return {
        listObjects(params, callback) {
          return s3.listObjects(params, callback);
        },
        headObject(params, callback) {
          return s3.headObject(params, callback);
        },
        deleteObject(params, callback) {
          return s3.deleteObject(params, callback);
        },
        putObject(params, callback) {
          return s3.putObject(params, callback);
        }
      };
    };
    module2.exports.get_mockS3Http = function() {
      let mock_s3 = false;
      if (!process.env.node_pre_gyp_mock_s3) {
        return () => mock_s3;
      }
      const nock = require$$6;
      const host = "https://mapbox-node-pre-gyp-public-testing-bucket.s3.us-east-1.amazonaws.com";
      const mockDir = process.env.node_pre_gyp_mock_s3 + "/mapbox-node-pre-gyp-public-testing-bucket";
      const mock_http = () => {
        function get(uri, requestBody) {
          const filepath = path2.join(mockDir, uri.replace("%2B", "+"));
          try {
            fs2.accessSync(filepath, fs2.constants.R_OK);
          } catch (e) {
            return [404, "not found\n"];
          }
          return [200, fs2.createReadStream(filepath)];
        }
        return nock(host).persist().get(() => mock_s3).reply(get);
      };
      mock_http();
      const mockS3Http = (action) => {
        const previous = mock_s3;
        if (action === "off") {
          mock_s3 = false;
        } else if (action === "on") {
          mock_s3 = true;
        } else if (action !== "get") {
          throw new Error(`illegal action for setMockHttp ${action}`);
        }
        return previous;
      };
      return mockS3Http;
    };
  })(s3_setup, s3_setup.exports);
  return s3_setup.exports;
}
var nopt = { exports: {} };
var abbrev = { exports: {} };
var hasRequiredAbbrev;
function requireAbbrev() {
  if (hasRequiredAbbrev) return abbrev.exports;
  hasRequiredAbbrev = 1;
  (function(module2, exports$1) {
    module2.exports = abbrev2.abbrev = abbrev2;
    abbrev2.monkeyPatch = monkeyPatch;
    function monkeyPatch() {
      Object.defineProperty(Array.prototype, "abbrev", {
        value: function() {
          return abbrev2(this);
        },
        enumerable: false,
        configurable: true,
        writable: true
      });
      Object.defineProperty(Object.prototype, "abbrev", {
        value: function() {
          return abbrev2(Object.keys(this));
        },
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
    function abbrev2(list) {
      if (arguments.length !== 1 || !Array.isArray(list)) {
        list = Array.prototype.slice.call(arguments, 0);
      }
      for (var i = 0, l = list.length, args = []; i < l; i++) {
        args[i] = typeof list[i] === "string" ? list[i] : String(list[i]);
      }
      args = args.sort(lexSort);
      var abbrevs = {}, prev = "";
      for (var i = 0, l = args.length; i < l; i++) {
        var current = args[i], next = args[i + 1] || "", nextMatches = true, prevMatches = true;
        if (current === next) continue;
        for (var j = 0, cl = current.length; j < cl; j++) {
          var curChar = current.charAt(j);
          nextMatches = nextMatches && curChar === next.charAt(j);
          prevMatches = prevMatches && curChar === prev.charAt(j);
          if (!nextMatches && !prevMatches) {
            j++;
            break;
          }
        }
        prev = current;
        if (j === cl) {
          abbrevs[current] = current;
          continue;
        }
        for (var a = current.substr(0, j); j <= cl; j++) {
          abbrevs[a] = current;
          a += current.charAt(j);
        }
      }
      return abbrevs;
    }
    function lexSort(a, b) {
      return a === b ? 0 : a > b ? 1 : -1;
    }
  })(abbrev);
  return abbrev.exports;
}
var hasRequiredNopt;
function requireNopt() {
  if (hasRequiredNopt) return nopt.exports;
  hasRequiredNopt = 1;
  (function(module2, exports$1) {
    var debug = process.env.DEBUG_NOPT || process.env.NOPT_DEBUG ? function() {
      console.error.apply(console, arguments);
    } : function() {
    };
    var url = require$$0, path2 = require$$1, Stream = require$$0$2.Stream, abbrev2 = requireAbbrev(), os = require$$4;
    module2.exports = exports$1 = nopt2;
    exports$1.clean = clean;
    exports$1.typeDefs = {
      String: { type: String, validate: validateString },
      Boolean: { type: Boolean, validate: validateBoolean },
      url: { type: url, validate: validateUrl },
      Number: { type: Number, validate: validateNumber },
      path: { type: path2, validate: validatePath },
      Stream: { type: Stream, validate: validateStream },
      Date: { type: Date, validate: validateDate }
    };
    function nopt2(types, shorthands, args, slice) {
      args = args || process.argv;
      types = types || {};
      shorthands = shorthands || {};
      if (typeof slice !== "number") slice = 2;
      debug(types, shorthands, args, slice);
      args = args.slice(slice);
      var data = {}, argv = {
        remain: [],
        cooked: args,
        original: args.slice(0)
      };
      parse(args, data, argv.remain, types, shorthands);
      clean(data, types, exports$1.typeDefs);
      data.argv = argv;
      Object.defineProperty(data.argv, "toString", { value: function() {
        return this.original.map(JSON.stringify).join(" ");
      }, enumerable: false });
      return data;
    }
    function clean(data, types, typeDefs) {
      typeDefs = typeDefs || exports$1.typeDefs;
      var remove = {}, typeDefault = [false, true, null, String, Array];
      Object.keys(data).forEach(function(k) {
        if (k === "argv") return;
        var val = data[k], isArray = Array.isArray(val), type = types[k];
        if (!isArray) val = [val];
        if (!type) type = typeDefault;
        if (type === Array) type = typeDefault.concat(Array);
        if (!Array.isArray(type)) type = [type];
        debug("val=%j", val);
        debug("types=", type);
        val = val.map(function(val2) {
          if (typeof val2 === "string") {
            debug("string %j", val2);
            val2 = val2.trim();
            if (val2 === "null" && ~type.indexOf(null) || val2 === "true" && (~type.indexOf(true) || ~type.indexOf(Boolean)) || val2 === "false" && (~type.indexOf(false) || ~type.indexOf(Boolean))) {
              val2 = JSON.parse(val2);
              debug("jsonable %j", val2);
            } else if (~type.indexOf(Number) && !isNaN(val2)) {
              debug("convert to number", val2);
              val2 = +val2;
            } else if (~type.indexOf(Date) && !isNaN(Date.parse(val2))) {
              debug("convert to date", val2);
              val2 = new Date(val2);
            }
          }
          if (!types.hasOwnProperty(k)) {
            return val2;
          }
          if (val2 === false && ~type.indexOf(null) && !(~type.indexOf(false) || ~type.indexOf(Boolean))) {
            val2 = null;
          }
          var d = {};
          d[k] = val2;
          debug("prevalidated val", d, val2, types[k]);
          if (!validate(d, k, val2, types[k], typeDefs)) {
            if (exports$1.invalidHandler) {
              exports$1.invalidHandler(k, val2, types[k], data);
            } else if (exports$1.invalidHandler !== false) {
              debug("invalid: " + k + "=" + val2, types[k]);
            }
            return remove;
          }
          debug("validated val", d, val2, types[k]);
          return d[k];
        }).filter(function(val2) {
          return val2 !== remove;
        });
        if (!val.length && type.indexOf(Array) === -1) {
          debug("VAL HAS NO LENGTH, DELETE IT", val, k, type.indexOf(Array));
          delete data[k];
        } else if (isArray) {
          debug(isArray, data[k], val);
          data[k] = val;
        } else data[k] = val[0];
        debug("k=%s val=%j", k, val, data[k]);
      });
    }
    function validateString(data, k, val) {
      data[k] = String(val);
    }
    function validatePath(data, k, val) {
      if (val === true) return false;
      if (val === null) return true;
      val = String(val);
      var isWin = process.platform === "win32", homePattern = isWin ? /^~(\/|\\)/ : /^~\//, home = os.homedir();
      if (home && val.match(homePattern)) {
        data[k] = path2.resolve(home, val.substr(2));
      } else {
        data[k] = path2.resolve(val);
      }
      return true;
    }
    function validateNumber(data, k, val) {
      debug("validate Number %j %j %j", k, val, isNaN(val));
      if (isNaN(val)) return false;
      data[k] = +val;
    }
    function validateDate(data, k, val) {
      var s = Date.parse(val);
      debug("validate Date %j %j %j", k, val, s);
      if (isNaN(s)) return false;
      data[k] = new Date(val);
    }
    function validateBoolean(data, k, val) {
      if (val instanceof Boolean) val = val.valueOf();
      else if (typeof val === "string") {
        if (!isNaN(val)) val = !!+val;
        else if (val === "null" || val === "false") val = false;
        else val = true;
      } else val = !!val;
      data[k] = val;
    }
    function validateUrl(data, k, val) {
      val = url.parse(String(val));
      if (!val.host) return false;
      data[k] = val.href;
    }
    function validateStream(data, k, val) {
      if (!(val instanceof Stream)) return false;
      data[k] = val;
    }
    function validate(data, k, val, type, typeDefs) {
      if (Array.isArray(type)) {
        for (var i = 0, l = type.length; i < l; i++) {
          if (type[i] === Array) continue;
          if (validate(data, k, val, type[i], typeDefs)) return true;
        }
        delete data[k];
        return false;
      }
      if (type === Array) return true;
      if (type !== type) {
        debug("Poison NaN", k, val, type);
        delete data[k];
        return false;
      }
      if (val === type) {
        debug("Explicitly allowed %j", val);
        data[k] = val;
        return true;
      }
      var ok = false, types = Object.keys(typeDefs);
      for (var i = 0, l = types.length; i < l; i++) {
        debug("test type %j %j %j", k, val, types[i]);
        var t = typeDefs[types[i]];
        if (t && (type && type.name && t.type && t.type.name ? type.name === t.type.name : type === t.type)) {
          var d = {};
          ok = false !== t.validate(d, k, val);
          val = d[k];
          if (ok) {
            data[k] = val;
            break;
          }
        }
      }
      debug("OK? %j (%j %j %j)", ok, k, val, types[i]);
      if (!ok) delete data[k];
      return ok;
    }
    function parse(args, data, remain, types, shorthands) {
      debug("parse", args, data, remain);
      var abbrevs = abbrev2(Object.keys(types)), shortAbbr = abbrev2(Object.keys(shorthands));
      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        debug("arg", arg);
        if (arg.match(/^-{2,}$/)) {
          remain.push.apply(remain, args.slice(i + 1));
          args[i] = "--";
          break;
        }
        var hadEq = false;
        if (arg.charAt(0) === "-" && arg.length > 1) {
          var at = arg.indexOf("=");
          if (at > -1) {
            hadEq = true;
            var v = arg.substr(at + 1);
            arg = arg.substr(0, at);
            args.splice(i, 1, arg, v);
          }
          var shRes = resolveShort(arg, shorthands, shortAbbr, abbrevs);
          debug("arg=%j shRes=%j", arg, shRes);
          if (shRes) {
            debug(arg, shRes);
            args.splice.apply(args, [i, 1].concat(shRes));
            if (arg !== shRes[0]) {
              i--;
              continue;
            }
          }
          arg = arg.replace(/^-+/, "");
          var no = null;
          while (arg.toLowerCase().indexOf("no-") === 0) {
            no = !no;
            arg = arg.substr(3);
          }
          if (abbrevs[arg]) arg = abbrevs[arg];
          var argType = types[arg];
          var isTypeArray = Array.isArray(argType);
          if (isTypeArray && argType.length === 1) {
            isTypeArray = false;
            argType = argType[0];
          }
          var isArray = argType === Array || isTypeArray && argType.indexOf(Array) !== -1;
          if (!types.hasOwnProperty(arg) && data.hasOwnProperty(arg)) {
            if (!Array.isArray(data[arg]))
              data[arg] = [data[arg]];
            isArray = true;
          }
          var val, la = args[i + 1];
          var isBool = typeof no === "boolean" || argType === Boolean || isTypeArray && argType.indexOf(Boolean) !== -1 || typeof argType === "undefined" && !hadEq || la === "false" && (argType === null || isTypeArray && ~argType.indexOf(null));
          if (isBool) {
            val = !no;
            if (la === "true" || la === "false") {
              val = JSON.parse(la);
              la = null;
              if (no) val = !val;
              i++;
            }
            if (isTypeArray && la) {
              if (~argType.indexOf(la)) {
                val = la;
                i++;
              } else if (la === "null" && ~argType.indexOf(null)) {
                val = null;
                i++;
              } else if (!la.match(/^-{2,}[^-]/) && !isNaN(la) && ~argType.indexOf(Number)) {
                val = +la;
                i++;
              } else if (!la.match(/^-[^-]/) && ~argType.indexOf(String)) {
                val = la;
                i++;
              }
            }
            if (isArray) (data[arg] = data[arg] || []).push(val);
            else data[arg] = val;
            continue;
          }
          if (argType === String) {
            if (la === void 0) {
              la = "";
            } else if (la.match(/^-{1,2}[^-]+/)) {
              la = "";
              i--;
            }
          }
          if (la && la.match(/^-{2,}$/)) {
            la = void 0;
            i--;
          }
          val = la === void 0 ? true : la;
          if (isArray) (data[arg] = data[arg] || []).push(val);
          else data[arg] = val;
          i++;
          continue;
        }
        remain.push(arg);
      }
    }
    function resolveShort(arg, shorthands, shortAbbr, abbrevs) {
      arg = arg.replace(/^-+/, "");
      if (abbrevs[arg] === arg)
        return null;
      if (shorthands[arg]) {
        if (shorthands[arg] && !Array.isArray(shorthands[arg]))
          shorthands[arg] = shorthands[arg].split(/\s+/);
        return shorthands[arg];
      }
      var singles = shorthands.___singles;
      if (!singles) {
        singles = Object.keys(shorthands).filter(function(s) {
          return s.length === 1;
        }).reduce(function(l, r) {
          l[r] = true;
          return l;
        }, {});
        shorthands.___singles = singles;
        debug("shorthand singles", singles);
      }
      var chrs = arg.split("").filter(function(c) {
        return singles[c];
      });
      if (chrs.join("") === arg) return chrs.map(function(c) {
        return shorthands[c];
      }).reduce(function(l, r) {
        return l.concat(r);
      }, []);
      if (abbrevs[arg] && !shorthands[arg])
        return null;
      if (shortAbbr[arg])
        arg = shortAbbr[arg];
      if (shorthands[arg] && !Array.isArray(shorthands[arg]))
        shorthands[arg] = shorthands[arg].split(/\s+/);
      return shorthands[arg];
    }
  })(nopt, nopt.exports);
  return nopt.exports;
}
var log = { exports: {} };
var lib = {};
var trackerGroup = { exports: {} };
var trackerBase = { exports: {} };
var hasRequiredTrackerBase;
function requireTrackerBase() {
  if (hasRequiredTrackerBase) return trackerBase.exports;
  hasRequiredTrackerBase = 1;
  var EventEmitter = require$$0$3.EventEmitter;
  var util = require$$0$4;
  var trackerId = 0;
  var TrackerBase = trackerBase.exports = function(name2) {
    EventEmitter.call(this);
    this.id = ++trackerId;
    this.name = name2;
  };
  util.inherits(TrackerBase, EventEmitter);
  return trackerBase.exports;
}
var tracker = { exports: {} };
var hasRequiredTracker;
function requireTracker() {
  if (hasRequiredTracker) return tracker.exports;
  hasRequiredTracker = 1;
  var util = require$$0$4;
  var TrackerBase = requireTrackerBase();
  var Tracker = tracker.exports = function(name2, todo) {
    TrackerBase.call(this, name2);
    this.workDone = 0;
    this.workTodo = todo || 0;
  };
  util.inherits(Tracker, TrackerBase);
  Tracker.prototype.completed = function() {
    return this.workTodo === 0 ? 0 : this.workDone / this.workTodo;
  };
  Tracker.prototype.addWork = function(work) {
    this.workTodo += work;
    this.emit("change", this.name, this.completed(), this);
  };
  Tracker.prototype.completeWork = function(work) {
    this.workDone += work;
    if (this.workDone > this.workTodo) {
      this.workDone = this.workTodo;
    }
    this.emit("change", this.name, this.completed(), this);
  };
  Tracker.prototype.finish = function() {
    this.workTodo = this.workDone = 1;
    this.emit("change", this.name, 1, this);
  };
  return tracker.exports;
}
var trackerStream = { exports: {} };
var readable = { exports: {} };
var stream;
var hasRequiredStream;
function requireStream() {
  if (hasRequiredStream) return stream;
  hasRequiredStream = 1;
  stream = require$$0$2;
  return stream;
}
var buffer_list;
var hasRequiredBuffer_list;
function requireBuffer_list() {
  if (hasRequiredBuffer_list) return buffer_list;
  hasRequiredBuffer_list = 1;
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint);
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(input);
  }
  var _require = require$$0$5, Buffer = _require.Buffer;
  var _require2 = require$$0$4, inspect = _require2.inspect;
  var custom = inspect && inspect.custom || "inspect";
  function copyBuffer(src, target, offset) {
    Buffer.prototype.copy.call(src, target, offset);
  }
  buffer_list = /* @__PURE__ */ (function() {
    function BufferList() {
      _classCallCheck(this, BufferList);
      this.head = null;
      this.tail = null;
      this.length = 0;
    }
    _createClass(BufferList, [{
      key: "push",
      value: function push(v) {
        var entry = {
          data: v,
          next: null
        };
        if (this.length > 0) this.tail.next = entry;
        else this.head = entry;
        this.tail = entry;
        ++this.length;
      }
    }, {
      key: "unshift",
      value: function unshift(v) {
        var entry = {
          data: v,
          next: this.head
        };
        if (this.length === 0) this.tail = entry;
        this.head = entry;
        ++this.length;
      }
    }, {
      key: "shift",
      value: function shift() {
        if (this.length === 0) return;
        var ret = this.head.data;
        if (this.length === 1) this.head = this.tail = null;
        else this.head = this.head.next;
        --this.length;
        return ret;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.head = this.tail = null;
        this.length = 0;
      }
    }, {
      key: "join",
      value: function join(s) {
        if (this.length === 0) return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) ret += s + p.data;
        return ret;
      }
    }, {
      key: "concat",
      value: function concat(n) {
        if (this.length === 0) return Buffer.alloc(0);
        var ret = Buffer.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      }
      // Consumes a specified amount of bytes or characters from the buffered data.
    }, {
      key: "consume",
      value: function consume(n, hasStrings) {
        var ret;
        if (n < this.head.data.length) {
          ret = this.head.data.slice(0, n);
          this.head.data = this.head.data.slice(n);
        } else if (n === this.head.data.length) {
          ret = this.shift();
        } else {
          ret = hasStrings ? this._getString(n) : this._getBuffer(n);
        }
        return ret;
      }
    }, {
      key: "first",
      value: function first() {
        return this.head.data;
      }
      // Consumes a specified amount of characters from the buffered data.
    }, {
      key: "_getString",
      value: function _getString(n) {
        var p = this.head;
        var c = 1;
        var ret = p.data;
        n -= ret.length;
        while (p = p.next) {
          var str = p.data;
          var nb = n > str.length ? str.length : n;
          if (nb === str.length) ret += str;
          else ret += str.slice(0, n);
          n -= nb;
          if (n === 0) {
            if (nb === str.length) {
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = str.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
      // Consumes a specified amount of bytes from the buffered data.
    }, {
      key: "_getBuffer",
      value: function _getBuffer(n) {
        var ret = Buffer.allocUnsafe(n);
        var p = this.head;
        var c = 1;
        p.data.copy(ret);
        n -= p.data.length;
        while (p = p.next) {
          var buf = p.data;
          var nb = n > buf.length ? buf.length : n;
          buf.copy(ret, ret.length - n, 0, nb);
          n -= nb;
          if (n === 0) {
            if (nb === buf.length) {
              ++c;
              if (p.next) this.head = p.next;
              else this.head = this.tail = null;
            } else {
              this.head = p;
              p.data = buf.slice(nb);
            }
            break;
          }
          ++c;
        }
        this.length -= c;
        return ret;
      }
      // Make sure the linked list only shows the minimal necessary information.
    }, {
      key: custom,
      value: function value(_, options) {
        return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
          // Only inspect one level.
          depth: 0,
          // It should not recurse.
          customInspect: false
        }));
      }
    }]);
    return BufferList;
  })();
  return buffer_list;
}
var destroy_1;
var hasRequiredDestroy;
function requireDestroy() {
  if (hasRequiredDestroy) return destroy_1;
  hasRequiredDestroy = 1;
  function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
      if (cb) {
        cb(err);
      } else if (err) {
        if (!this._writableState) {
          process.nextTick(emitErrorNT, this, err);
        } else if (!this._writableState.errorEmitted) {
          this._writableState.errorEmitted = true;
          process.nextTick(emitErrorNT, this, err);
        }
      }
      return this;
    }
    if (this._readableState) {
      this._readableState.destroyed = true;
    }
    if (this._writableState) {
      this._writableState.destroyed = true;
    }
    this._destroy(err || null, function(err2) {
      if (!cb && err2) {
        if (!_this._writableState) {
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else if (!_this._writableState.errorEmitted) {
          _this._writableState.errorEmitted = true;
          process.nextTick(emitErrorAndCloseNT, _this, err2);
        } else {
          process.nextTick(emitCloseNT, _this);
        }
      } else if (cb) {
        process.nextTick(emitCloseNT, _this);
        cb(err2);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    });
    return this;
  }
  function emitErrorAndCloseNT(self2, err) {
    emitErrorNT(self2, err);
    emitCloseNT(self2);
  }
  function emitCloseNT(self2) {
    if (self2._writableState && !self2._writableState.emitClose) return;
    if (self2._readableState && !self2._readableState.emitClose) return;
    self2.emit("close");
  }
  function undestroy() {
    if (this._readableState) {
      this._readableState.destroyed = false;
      this._readableState.reading = false;
      this._readableState.ended = false;
      this._readableState.endEmitted = false;
    }
    if (this._writableState) {
      this._writableState.destroyed = false;
      this._writableState.ended = false;
      this._writableState.ending = false;
      this._writableState.finalCalled = false;
      this._writableState.prefinished = false;
      this._writableState.finished = false;
      this._writableState.errorEmitted = false;
    }
  }
  function emitErrorNT(self2, err) {
    self2.emit("error", err);
  }
  function errorOrDestroy(stream2, err) {
    var rState = stream2._readableState;
    var wState = stream2._writableState;
    if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream2.destroy(err);
    else stream2.emit("error", err);
  }
  destroy_1 = {
    destroy,
    undestroy,
    errorOrDestroy
  };
  return destroy_1;
}
var errors = {};
var hasRequiredErrors;
function requireErrors() {
  if (hasRequiredErrors) return errors;
  hasRequiredErrors = 1;
  const codes = {};
  function createErrorType(code, message, Base) {
    if (!Base) {
      Base = Error;
    }
    function getMessage(arg1, arg2, arg3) {
      if (typeof message === "string") {
        return message;
      } else {
        return message(arg1, arg2, arg3);
      }
    }
    class NodeError extends Base {
      constructor(arg1, arg2, arg3) {
        super(getMessage(arg1, arg2, arg3));
      }
    }
    NodeError.prototype.name = Base.name;
    NodeError.prototype.code = code;
    codes[code] = NodeError;
  }
  function oneOf(expected, thing) {
    if (Array.isArray(expected)) {
      const len = expected.length;
      expected = expected.map((i) => String(i));
      if (len > 2) {
        return `one of ${thing} ${expected.slice(0, len - 1).join(", ")}, or ` + expected[len - 1];
      } else if (len === 2) {
        return `one of ${thing} ${expected[0]} or ${expected[1]}`;
      } else {
        return `of ${thing} ${expected[0]}`;
      }
    } else {
      return `of ${thing} ${String(expected)}`;
    }
  }
  function startsWith(str, search, pos) {
    return str.substr(0, search.length) === search;
  }
  function endsWith(str, search, this_len) {
    if (this_len === void 0 || this_len > str.length) {
      this_len = str.length;
    }
    return str.substring(this_len - search.length, this_len) === search;
  }
  function includes(str, search, start) {
    if (typeof start !== "number") {
      start = 0;
    }
    if (start + search.length > str.length) {
      return false;
    } else {
      return str.indexOf(search, start) !== -1;
    }
  }
  createErrorType("ERR_INVALID_OPT_VALUE", function(name2, value) {
    return 'The value "' + value + '" is invalid for option "' + name2 + '"';
  }, TypeError);
  createErrorType("ERR_INVALID_ARG_TYPE", function(name2, expected, actual) {
    let determiner;
    if (typeof expected === "string" && startsWith(expected, "not ")) {
      determiner = "must not be";
      expected = expected.replace(/^not /, "");
    } else {
      determiner = "must be";
    }
    let msg;
    if (endsWith(name2, " argument")) {
      msg = `The ${name2} ${determiner} ${oneOf(expected, "type")}`;
    } else {
      const type = includes(name2, ".") ? "property" : "argument";
      msg = `The "${name2}" ${type} ${determiner} ${oneOf(expected, "type")}`;
    }
    msg += `. Received type ${typeof actual}`;
    return msg;
  }, TypeError);
  createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
  createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name2) {
    return "The " + name2 + " method is not implemented";
  });
  createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
  createErrorType("ERR_STREAM_DESTROYED", function(name2) {
    return "Cannot call " + name2 + " after a stream was destroyed";
  });
  createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
  createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
  createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
  createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
  createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
    return "Unknown encoding: " + arg;
  }, TypeError);
  createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
  errors.codes = codes;
  return errors;
}
var state;
var hasRequiredState;
function requireState() {
  if (hasRequiredState) return state;
  hasRequiredState = 1;
  var ERR_INVALID_OPT_VALUE = requireErrors().codes.ERR_INVALID_OPT_VALUE;
  function highWaterMarkFrom(options, isDuplex, duplexKey) {
    return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
  }
  function getHighWaterMark(state2, options, duplexKey, isDuplex) {
    var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
    if (hwm != null) {
      if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
        var name2 = isDuplex ? duplexKey : "highWaterMark";
        throw new ERR_INVALID_OPT_VALUE(name2, hwm);
      }
      return Math.floor(hwm);
    }
    return state2.objectMode ? 16 : 16 * 1024;
  }
  state = {
    getHighWaterMark
  };
  return state;
}
var node;
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node;
  hasRequiredNode = 1;
  node = require$$0$4.deprecate;
  return node;
}
var _stream_writable;
var hasRequired_stream_writable;
function require_stream_writable() {
  if (hasRequired_stream_writable) return _stream_writable;
  hasRequired_stream_writable = 1;
  _stream_writable = Writable;
  function CorkedRequest(state2) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
      onCorkedFinish(_this, state2);
    };
  }
  var Duplex;
  Writable.WritableState = WritableState;
  var internalUtil = {
    deprecate: requireNode()
  };
  var Stream = requireStream();
  var Buffer = require$$0$5.Buffer;
  var OurUint8Array = (typeof main$1.commonjsGlobal !== "undefined" ? main$1.commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var destroyImpl = requireDestroy();
  var _require = requireState(), getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = requireErrors().codes, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK, ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE, ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED, ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES, ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END, ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  main$1.requireInherits()(Writable, Stream);
  function nop() {
  }
  function WritableState(options, stream2, isDuplex) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean") isDuplex = stream2 instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream2, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
  }
  WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, "buffer", {
        get: internalUtil.deprecate(function writableStateBufferGetter() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch (_) {
    }
  })();
  var realHasInstance;
  if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
      value: function value(object) {
        if (realHasInstance.call(this, object)) return true;
        if (this !== Writable) return false;
        return object && object._writableState instanceof WritableState;
      }
    });
  } else {
    realHasInstance = function realHasInstance2(object) {
      return object instanceof this;
    };
  }
  function Writable(options) {
    Duplex = Duplex || require_stream_duplex();
    var isDuplex = this instanceof Duplex;
    if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
    this._writableState = new WritableState(options, this, isDuplex);
    this.writable = true;
    if (options) {
      if (typeof options.write === "function") this._write = options.write;
      if (typeof options.writev === "function") this._writev = options.writev;
      if (typeof options.destroy === "function") this._destroy = options.destroy;
      if (typeof options.final === "function") this._final = options.final;
    }
    Stream.call(this);
  }
  Writable.prototype.pipe = function() {
    errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
  };
  function writeAfterEnd(stream2, cb) {
    var er = new ERR_STREAM_WRITE_AFTER_END();
    errorOrDestroy(stream2, er);
    process.nextTick(cb, er);
  }
  function validChunk(stream2, state2, chunk, cb) {
    var er;
    if (chunk === null) {
      er = new ERR_STREAM_NULL_VALUES();
    } else if (typeof chunk !== "string" && !state2.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk);
    }
    if (er) {
      errorOrDestroy(stream2, er);
      process.nextTick(cb, er);
      return false;
    }
    return true;
  }
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state2 = this._writableState;
    var ret = false;
    var isBuf = !state2.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer.isBuffer(chunk)) {
      chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (isBuf) encoding = "buffer";
    else if (!encoding) encoding = state2.defaultEncoding;
    if (typeof cb !== "function") cb = nop;
    if (state2.ending) writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state2, chunk, cb)) {
      state2.pendingcb++;
      ret = writeOrBuffer(this, state2, isBuf, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    this._writableState.corked++;
  };
  Writable.prototype.uncork = function() {
    var state2 = this._writableState;
    if (state2.corked) {
      state2.corked--;
      if (!state2.writing && !state2.corked && !state2.bufferProcessing && state2.bufferedRequest) clearBuffer(this, state2);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string") encoding = encoding.toLowerCase();
    if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  function decodeChunk(state2, chunk, encoding) {
    if (!state2.objectMode && state2.decodeStrings !== false && typeof chunk === "string") {
      chunk = Buffer.from(chunk, encoding);
    }
    return chunk;
  }
  Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  function writeOrBuffer(stream2, state2, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
      var newChunk = decodeChunk(state2, chunk, encoding);
      if (chunk !== newChunk) {
        isBuf = true;
        encoding = "buffer";
        chunk = newChunk;
      }
    }
    var len = state2.objectMode ? 1 : chunk.length;
    state2.length += len;
    var ret = state2.length < state2.highWaterMark;
    if (!ret) state2.needDrain = true;
    if (state2.writing || state2.corked) {
      var last = state2.lastBufferedRequest;
      state2.lastBufferedRequest = {
        chunk,
        encoding,
        isBuf,
        callback: cb,
        next: null
      };
      if (last) {
        last.next = state2.lastBufferedRequest;
      } else {
        state2.bufferedRequest = state2.lastBufferedRequest;
      }
      state2.bufferedRequestCount += 1;
    } else {
      doWrite(stream2, state2, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream2, state2, writev, len, chunk, encoding, cb) {
    state2.writelen = len;
    state2.writecb = cb;
    state2.writing = true;
    state2.sync = true;
    if (state2.destroyed) state2.onwrite(new ERR_STREAM_DESTROYED("write"));
    else if (writev) stream2._writev(chunk, state2.onwrite);
    else stream2._write(chunk, encoding, state2.onwrite);
    state2.sync = false;
  }
  function onwriteError(stream2, state2, sync, er, cb) {
    --state2.pendingcb;
    if (sync) {
      process.nextTick(cb, er);
      process.nextTick(finishMaybe, stream2, state2);
      stream2._writableState.errorEmitted = true;
      errorOrDestroy(stream2, er);
    } else {
      cb(er);
      stream2._writableState.errorEmitted = true;
      errorOrDestroy(stream2, er);
      finishMaybe(stream2, state2);
    }
  }
  function onwriteStateUpdate(state2) {
    state2.writing = false;
    state2.writecb = null;
    state2.length -= state2.writelen;
    state2.writelen = 0;
  }
  function onwrite(stream2, er) {
    var state2 = stream2._writableState;
    var sync = state2.sync;
    var cb = state2.writecb;
    if (typeof cb !== "function") throw new ERR_MULTIPLE_CALLBACK();
    onwriteStateUpdate(state2);
    if (er) onwriteError(stream2, state2, sync, er, cb);
    else {
      var finished = needFinish(state2) || stream2.destroyed;
      if (!finished && !state2.corked && !state2.bufferProcessing && state2.bufferedRequest) {
        clearBuffer(stream2, state2);
      }
      if (sync) {
        process.nextTick(afterWrite, stream2, state2, finished, cb);
      } else {
        afterWrite(stream2, state2, finished, cb);
      }
    }
  }
  function afterWrite(stream2, state2, finished, cb) {
    if (!finished) onwriteDrain(stream2, state2);
    state2.pendingcb--;
    cb();
    finishMaybe(stream2, state2);
  }
  function onwriteDrain(stream2, state2) {
    if (state2.length === 0 && state2.needDrain) {
      state2.needDrain = false;
      stream2.emit("drain");
    }
  }
  function clearBuffer(stream2, state2) {
    state2.bufferProcessing = true;
    var entry = state2.bufferedRequest;
    if (stream2._writev && entry && entry.next) {
      var l = state2.bufferedRequestCount;
      var buffer = new Array(l);
      var holder = state2.corkedRequestsFree;
      holder.entry = entry;
      var count = 0;
      var allBuffers = true;
      while (entry) {
        buffer[count] = entry;
        if (!entry.isBuf) allBuffers = false;
        entry = entry.next;
        count += 1;
      }
      buffer.allBuffers = allBuffers;
      doWrite(stream2, state2, true, state2.length, buffer, "", holder.finish);
      state2.pendingcb++;
      state2.lastBufferedRequest = null;
      if (holder.next) {
        state2.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state2.corkedRequestsFree = new CorkedRequest(state2);
      }
      state2.bufferedRequestCount = 0;
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state2.objectMode ? 1 : chunk.length;
        doWrite(stream2, state2, false, len, chunk, encoding, cb);
        entry = entry.next;
        state2.bufferedRequestCount--;
        if (state2.writing) {
          break;
        }
      }
      if (entry === null) state2.lastBufferedRequest = null;
    }
    state2.bufferedRequest = entry;
    state2.bufferProcessing = false;
  }
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state2 = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
    if (state2.corked) {
      state2.corked = 1;
      this.uncork();
    }
    if (!state2.ending) endWritable(this, state2, cb);
    return this;
  };
  Object.defineProperty(Writable.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  function needFinish(state2) {
    return state2.ending && state2.length === 0 && state2.bufferedRequest === null && !state2.finished && !state2.writing;
  }
  function callFinal(stream2, state2) {
    stream2._final(function(err) {
      state2.pendingcb--;
      if (err) {
        errorOrDestroy(stream2, err);
      }
      state2.prefinished = true;
      stream2.emit("prefinish");
      finishMaybe(stream2, state2);
    });
  }
  function prefinish(stream2, state2) {
    if (!state2.prefinished && !state2.finalCalled) {
      if (typeof stream2._final === "function" && !state2.destroyed) {
        state2.pendingcb++;
        state2.finalCalled = true;
        process.nextTick(callFinal, stream2, state2);
      } else {
        state2.prefinished = true;
        stream2.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream2, state2) {
    var need = needFinish(state2);
    if (need) {
      prefinish(stream2, state2);
      if (state2.pendingcb === 0) {
        state2.finished = true;
        stream2.emit("finish");
        if (state2.autoDestroy) {
          var rState = stream2._readableState;
          if (!rState || rState.autoDestroy && rState.endEmitted) {
            stream2.destroy();
          }
        }
      }
    }
    return need;
  }
  function endWritable(stream2, state2, cb) {
    state2.ending = true;
    finishMaybe(stream2, state2);
    if (cb) {
      if (state2.finished) process.nextTick(cb);
      else stream2.once("finish", cb);
    }
    state2.ended = true;
    stream2.writable = false;
  }
  function onCorkedFinish(corkReq, state2, err) {
    var entry = corkReq.entry;
    corkReq.entry = null;
    while (entry) {
      var cb = entry.callback;
      state2.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    state2.corkedRequestsFree.next = corkReq;
  }
  Object.defineProperty(Writable.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      if (this._writableState === void 0) {
        return false;
      }
      return this._writableState.destroyed;
    },
    set: function set(value) {
      if (!this._writableState) {
        return;
      }
      this._writableState.destroyed = value;
    }
  });
  Writable.prototype.destroy = destroyImpl.destroy;
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    cb(err);
  };
  return _stream_writable;
}
var _stream_duplex;
var hasRequired_stream_duplex;
function require_stream_duplex() {
  if (hasRequired_stream_duplex) return _stream_duplex;
  hasRequired_stream_duplex = 1;
  var objectKeys = Object.keys || function(obj) {
    var keys2 = [];
    for (var key in obj) keys2.push(key);
    return keys2;
  };
  _stream_duplex = Duplex;
  var Readable = require_stream_readable();
  var Writable = require_stream_writable();
  main$1.requireInherits()(Duplex, Readable);
  {
    var keys = objectKeys(Writable.prototype);
    for (var v = 0; v < keys.length; v++) {
      var method = keys[v];
      if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
    }
  }
  function Duplex(options) {
    if (!(this instanceof Duplex)) return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    this.allowHalfOpen = true;
    if (options) {
      if (options.readable === false) this.readable = false;
      if (options.writable === false) this.writable = false;
      if (options.allowHalfOpen === false) {
        this.allowHalfOpen = false;
        this.once("end", onend);
      }
    }
  }
  Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState.highWaterMark;
    }
  });
  Object.defineProperty(Duplex.prototype, "writableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState && this._writableState.getBuffer();
    }
  });
  Object.defineProperty(Duplex.prototype, "writableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._writableState.length;
    }
  });
  function onend() {
    if (this._writableState.ended) return;
    process.nextTick(onEndNT, this);
  }
  function onEndNT(self2) {
    self2.end();
  }
  Object.defineProperty(Duplex.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function set(value) {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return;
      }
      this._readableState.destroyed = value;
      this._writableState.destroyed = value;
    }
  });
  return _stream_duplex;
}
var string_decoder = {};
var safeBuffer = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var hasRequiredSafeBuffer;
function requireSafeBuffer() {
  if (hasRequiredSafeBuffer) return safeBuffer.exports;
  hasRequiredSafeBuffer = 1;
  (function(module2, exports$1) {
    var buffer = require$$0$5;
    var Buffer = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports$1);
      exports$1.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer.prototype);
    copyProps(Buffer, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  })(safeBuffer, safeBuffer.exports);
  return safeBuffer.exports;
}
var hasRequiredString_decoder;
function requireString_decoder() {
  if (hasRequiredString_decoder) return string_decoder;
  hasRequiredString_decoder = 1;
  var Buffer = requireSafeBuffer().Buffer;
  var isEncoding = Buffer.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch (encoding && encoding.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };
  function _normalizeEncoding(enc) {
    if (!enc) return "utf8";
    var retried;
    while (true) {
      switch (enc) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return enc;
        default:
          if (retried) return;
          enc = ("" + enc).toLowerCase();
          retried = true;
      }
    }
  }
  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
  }
  string_decoder.StringDecoder = StringDecoder;
  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;
      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer.allocUnsafe(nb);
  }
  StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0) return "";
    var r;
    var i;
    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === void 0) return "";
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }
    if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || "";
  };
  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;
  StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };
  function utf8CheckByte(byte) {
    if (byte <= 127) return 0;
    else if (byte >> 5 === 6) return 2;
    else if (byte >> 4 === 14) return 3;
    else if (byte >> 3 === 30) return 4;
    return byte >> 6 === 2 ? -1 : -2;
  }
  function utf8CheckIncomplete(self2, buf, i) {
    var j = buf.length - 1;
    if (j < i) return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) self2.lastNeed = nb - 1;
      return nb;
    }
    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) self2.lastNeed = nb - 2;
      return nb;
    }
    if (--j < i || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2) nb = 0;
        else self2.lastNeed = nb - 3;
      }
      return nb;
    }
    return 0;
  }
  function utf8CheckExtraBytes(self2, buf, p) {
    if ((buf[0] & 192) !== 128) {
      self2.lastNeed = 0;
      return "�";
    }
    if (self2.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 192) !== 128) {
        self2.lastNeed = 1;
        return "�";
      }
      if (self2.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 192) !== 128) {
          self2.lastNeed = 2;
          return "�";
        }
      }
    }
  }
  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf);
    if (r !== void 0) return r;
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }
  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed) return buf.toString("utf8", i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString("utf8", i, end);
  }
  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + "�";
    return r;
  }
  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString("utf16le", i);
      if (r) {
        var c = r.charCodeAt(r.length - 1);
        if (c >= 55296 && c <= 56319) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }
      return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i, buf.length - 1);
  }
  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString("utf16le", 0, end);
    }
    return r;
  }
  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0) return buf.toString("base64", i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i, buf.length - n);
  }
  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
  }
  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }
  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
  }
  return string_decoder;
}
var endOfStream;
var hasRequiredEndOfStream;
function requireEndOfStream() {
  if (hasRequiredEndOfStream) return endOfStream;
  hasRequiredEndOfStream = 1;
  var ERR_STREAM_PREMATURE_CLOSE = requireErrors().codes.ERR_STREAM_PREMATURE_CLOSE;
  function once(callback) {
    var called = false;
    return function() {
      if (called) return;
      called = true;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      callback.apply(this, args);
    };
  }
  function noop() {
  }
  function isRequest(stream2) {
    return stream2.setHeader && typeof stream2.abort === "function";
  }
  function eos(stream2, opts, callback) {
    if (typeof opts === "function") return eos(stream2, null, opts);
    if (!opts) opts = {};
    callback = once(callback || noop);
    var readable2 = opts.readable || opts.readable !== false && stream2.readable;
    var writable = opts.writable || opts.writable !== false && stream2.writable;
    var onlegacyfinish = function onlegacyfinish2() {
      if (!stream2.writable) onfinish();
    };
    var writableEnded = stream2._writableState && stream2._writableState.finished;
    var onfinish = function onfinish2() {
      writable = false;
      writableEnded = true;
      if (!readable2) callback.call(stream2);
    };
    var readableEnded = stream2._readableState && stream2._readableState.endEmitted;
    var onend = function onend2() {
      readable2 = false;
      readableEnded = true;
      if (!writable) callback.call(stream2);
    };
    var onerror = function onerror2(err) {
      callback.call(stream2, err);
    };
    var onclose = function onclose2() {
      var err;
      if (readable2 && !readableEnded) {
        if (!stream2._readableState || !stream2._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
        return callback.call(stream2, err);
      }
      if (writable && !writableEnded) {
        if (!stream2._writableState || !stream2._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
        return callback.call(stream2, err);
      }
    };
    var onrequest = function onrequest2() {
      stream2.req.on("finish", onfinish);
    };
    if (isRequest(stream2)) {
      stream2.on("complete", onfinish);
      stream2.on("abort", onclose);
      if (stream2.req) onrequest();
      else stream2.on("request", onrequest);
    } else if (writable && !stream2._writableState) {
      stream2.on("end", onlegacyfinish);
      stream2.on("close", onlegacyfinish);
    }
    stream2.on("end", onend);
    stream2.on("finish", onfinish);
    if (opts.error !== false) stream2.on("error", onerror);
    stream2.on("close", onclose);
    return function() {
      stream2.removeListener("complete", onfinish);
      stream2.removeListener("abort", onclose);
      stream2.removeListener("request", onrequest);
      if (stream2.req) stream2.req.removeListener("finish", onfinish);
      stream2.removeListener("end", onlegacyfinish);
      stream2.removeListener("close", onlegacyfinish);
      stream2.removeListener("finish", onfinish);
      stream2.removeListener("end", onend);
      stream2.removeListener("error", onerror);
      stream2.removeListener("close", onclose);
    };
  }
  endOfStream = eos;
  return endOfStream;
}
var async_iterator;
var hasRequiredAsync_iterator;
function requireAsync_iterator() {
  if (hasRequiredAsync_iterator) return async_iterator;
  hasRequiredAsync_iterator = 1;
  var _Object$setPrototypeO;
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint);
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var finished = requireEndOfStream();
  var kLastResolve = Symbol("lastResolve");
  var kLastReject = Symbol("lastReject");
  var kError = Symbol("error");
  var kEnded = Symbol("ended");
  var kLastPromise = Symbol("lastPromise");
  var kHandlePromise = Symbol("handlePromise");
  var kStream = Symbol("stream");
  function createIterResult(value, done) {
    return {
      value,
      done
    };
  }
  function readAndResolve(iter) {
    var resolve = iter[kLastResolve];
    if (resolve !== null) {
      var data = iter[kStream].read();
      if (data !== null) {
        iter[kLastPromise] = null;
        iter[kLastResolve] = null;
        iter[kLastReject] = null;
        resolve(createIterResult(data, false));
      }
    }
  }
  function onReadable(iter) {
    process.nextTick(readAndResolve, iter);
  }
  function wrapForNext(lastPromise, iter) {
    return function(resolve, reject) {
      lastPromise.then(function() {
        if (iter[kEnded]) {
          resolve(createIterResult(void 0, true));
          return;
        }
        iter[kHandlePromise](resolve, reject);
      }, reject);
    };
  }
  var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
  });
  var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
    get stream() {
      return this[kStream];
    },
    next: function next() {
      var _this = this;
      var error2 = this[kError];
      if (error2 !== null) {
        return Promise.reject(error2);
      }
      if (this[kEnded]) {
        return Promise.resolve(createIterResult(void 0, true));
      }
      if (this[kStream].destroyed) {
        return new Promise(function(resolve, reject) {
          process.nextTick(function() {
            if (_this[kError]) {
              reject(_this[kError]);
            } else {
              resolve(createIterResult(void 0, true));
            }
          });
        });
      }
      var lastPromise = this[kLastPromise];
      var promise;
      if (lastPromise) {
        promise = new Promise(wrapForNext(lastPromise, this));
      } else {
        var data = this[kStream].read();
        if (data !== null) {
          return Promise.resolve(createIterResult(data, false));
        }
        promise = new Promise(this[kHandlePromise]);
      }
      this[kLastPromise] = promise;
      return promise;
    }
  }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
    return this;
  }), _defineProperty(_Object$setPrototypeO, "return", function _return() {
    var _this2 = this;
    return new Promise(function(resolve, reject) {
      _this2[kStream].destroy(null, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(createIterResult(void 0, true));
      });
    });
  }), _Object$setPrototypeO), AsyncIteratorPrototype);
  var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator2(stream2) {
    var _Object$create;
    var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
      value: stream2,
      writable: true
    }), _defineProperty(_Object$create, kLastResolve, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kLastReject, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kError, {
      value: null,
      writable: true
    }), _defineProperty(_Object$create, kEnded, {
      value: stream2._readableState.endEmitted,
      writable: true
    }), _defineProperty(_Object$create, kHandlePromise, {
      value: function value(resolve, reject) {
        var data = iterator[kStream].read();
        if (data) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          resolve(createIterResult(data, false));
        } else {
          iterator[kLastResolve] = resolve;
          iterator[kLastReject] = reject;
        }
      },
      writable: true
    }), _Object$create));
    iterator[kLastPromise] = null;
    finished(stream2, function(err) {
      if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
        var reject = iterator[kLastReject];
        if (reject !== null) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          reject(err);
        }
        iterator[kError] = err;
        return;
      }
      var resolve = iterator[kLastResolve];
      if (resolve !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(void 0, true));
      }
      iterator[kEnded] = true;
    });
    stream2.on("readable", onReadable.bind(null, iterator));
    return iterator;
  };
  async_iterator = createReadableStreamAsyncIterator;
  return async_iterator;
}
var from_1;
var hasRequiredFrom;
function requireFrom() {
  if (hasRequiredFrom) return from_1;
  hasRequiredFrom = 1;
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error2) {
      reject(error2);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function() {
      var self2 = this, args = arguments;
      return new Promise(function(resolve, reject) {
        var gen = fn.apply(self2, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(void 0);
      });
    };
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint);
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  var ERR_INVALID_ARG_TYPE = requireErrors().codes.ERR_INVALID_ARG_TYPE;
  function from(Readable, iterable, opts) {
    var iterator;
    if (iterable && typeof iterable.next === "function") {
      iterator = iterable;
    } else if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator]();
    else if (iterable && iterable[Symbol.iterator]) iterator = iterable[Symbol.iterator]();
    else throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
    var readable2 = new Readable(_objectSpread({
      objectMode: true
    }, opts));
    var reading = false;
    readable2._read = function() {
      if (!reading) {
        reading = true;
        next();
      }
    };
    function next() {
      return _next2.apply(this, arguments);
    }
    function _next2() {
      _next2 = _asyncToGenerator(function* () {
        try {
          var _yield$iterator$next = yield iterator.next(), value = _yield$iterator$next.value, done = _yield$iterator$next.done;
          if (done) {
            readable2.push(null);
          } else if (readable2.push(yield value)) {
            next();
          } else {
            reading = false;
          }
        } catch (err) {
          readable2.destroy(err);
        }
      });
      return _next2.apply(this, arguments);
    }
    return readable2;
  }
  from_1 = from;
  return from_1;
}
var _stream_readable;
var hasRequired_stream_readable;
function require_stream_readable() {
  if (hasRequired_stream_readable) return _stream_readable;
  hasRequired_stream_readable = 1;
  _stream_readable = Readable;
  var Duplex;
  Readable.ReadableState = ReadableState;
  require$$0$3.EventEmitter;
  var EElistenerCount = function EElistenerCount2(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream = requireStream();
  var Buffer = require$$0$5.Buffer;
  var OurUint8Array = (typeof main$1.commonjsGlobal !== "undefined" ? main$1.commonjsGlobal : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var debugUtil = require$$0$4;
  var debug;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
  } else {
    debug = function debug2() {
    };
  }
  var BufferList = requireBuffer_list();
  var destroyImpl = requireDestroy();
  var _require = requireState(), getHighWaterMark = _require.getHighWaterMark;
  var _require$codes = requireErrors().codes, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
  var StringDecoder;
  var createReadableStreamAsyncIterator;
  var from;
  main$1.requireInherits()(Readable, Stream);
  var errorOrDestroy = destroyImpl.errorOrDestroy;
  var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
    else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);
    else emitter._events[event] = [fn, emitter._events[event]];
  }
  function ReadableState(options, stream2, isDuplex) {
    Duplex = Duplex || require_stream_duplex();
    options = options || {};
    if (typeof isDuplex !== "boolean") isDuplex = stream2 instanceof Duplex;
    this.objectMode = !!options.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
    this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex);
    this.buffer = new BufferList();
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.paused = true;
    this.emitClose = options.emitClose !== false;
    this.autoDestroy = !!options.autoDestroy;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    Duplex = Duplex || require_stream_duplex();
    if (!(this instanceof Readable)) return new Readable(options);
    var isDuplex = this instanceof Duplex;
    this._readableState = new ReadableState(options, this, isDuplex);
    this.readable = true;
    if (options) {
      if (typeof options.read === "function") this._read = options.read;
      if (typeof options.destroy === "function") this._destroy = options.destroy;
    }
    Stream.call(this);
  }
  Object.defineProperty(Readable.prototype, "destroyed", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      if (this._readableState === void 0) {
        return false;
      }
      return this._readableState.destroyed;
    },
    set: function set(value) {
      if (!this._readableState) {
        return;
      }
      this._readableState.destroyed = value;
    }
  });
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    cb(err);
  };
  Readable.prototype.push = function(chunk, encoding) {
    var state2 = this._readableState;
    var skipChunkCheck;
    if (!state2.objectMode) {
      if (typeof chunk === "string") {
        encoding = encoding || state2.defaultEncoding;
        if (encoding !== state2.encoding) {
          chunk = Buffer.from(chunk, encoding);
          encoding = "";
        }
        skipChunkCheck = true;
      }
    } else {
      skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
  };
  Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
  };
  function readableAddChunk(stream2, chunk, encoding, addToFront, skipChunkCheck) {
    debug("readableAddChunk", chunk);
    var state2 = stream2._readableState;
    if (chunk === null) {
      state2.reading = false;
      onEofChunk(stream2, state2);
    } else {
      var er;
      if (!skipChunkCheck) er = chunkInvalid(state2, chunk);
      if (er) {
        errorOrDestroy(stream2, er);
      } else if (state2.objectMode || chunk && chunk.length > 0) {
        if (typeof chunk !== "string" && !state2.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (addToFront) {
          if (state2.endEmitted) errorOrDestroy(stream2, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
          else addChunk(stream2, state2, chunk, true);
        } else if (state2.ended) {
          errorOrDestroy(stream2, new ERR_STREAM_PUSH_AFTER_EOF());
        } else if (state2.destroyed) {
          return false;
        } else {
          state2.reading = false;
          if (state2.decoder && !encoding) {
            chunk = state2.decoder.write(chunk);
            if (state2.objectMode || chunk.length !== 0) addChunk(stream2, state2, chunk, false);
            else maybeReadMore(stream2, state2);
          } else {
            addChunk(stream2, state2, chunk, false);
          }
        }
      } else if (!addToFront) {
        state2.reading = false;
        maybeReadMore(stream2, state2);
      }
    }
    return !state2.ended && (state2.length < state2.highWaterMark || state2.length === 0);
  }
  function addChunk(stream2, state2, chunk, addToFront) {
    if (state2.flowing && state2.length === 0 && !state2.sync) {
      state2.awaitDrain = 0;
      stream2.emit("data", chunk);
    } else {
      state2.length += state2.objectMode ? 1 : chunk.length;
      if (addToFront) state2.buffer.unshift(chunk);
      else state2.buffer.push(chunk);
      if (state2.needReadable) emitReadable(stream2);
    }
    maybeReadMore(stream2, state2);
  }
  function chunkInvalid(state2, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state2.objectMode) {
      er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
    }
    return er;
  }
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
    var decoder = new StringDecoder(enc);
    this._readableState.decoder = decoder;
    this._readableState.encoding = this._readableState.decoder.encoding;
    var p = this._readableState.buffer.head;
    var content = "";
    while (p !== null) {
      content += decoder.write(p.data);
      p = p.next;
    }
    this._readableState.buffer.clear();
    if (content !== "") this._readableState.buffer.push(content);
    this._readableState.length = content.length;
    return this;
  };
  var MAX_HWM = 1073741824;
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state2) {
    if (n <= 0 || state2.length === 0 && state2.ended) return 0;
    if (state2.objectMode) return 1;
    if (n !== n) {
      if (state2.flowing && state2.length) return state2.buffer.head.data.length;
      else return state2.length;
    }
    if (n > state2.highWaterMark) state2.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state2.length) return n;
    if (!state2.ended) {
      state2.needReadable = true;
      return 0;
    }
    return state2.length;
  }
  Readable.prototype.read = function(n) {
    debug("read", n);
    n = parseInt(n, 10);
    var state2 = this._readableState;
    var nOrig = n;
    if (n !== 0) state2.emittedReadable = false;
    if (n === 0 && state2.needReadable && ((state2.highWaterMark !== 0 ? state2.length >= state2.highWaterMark : state2.length > 0) || state2.ended)) {
      debug("read: emitReadable", state2.length, state2.ended);
      if (state2.length === 0 && state2.ended) endReadable(this);
      else emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state2);
    if (n === 0 && state2.ended) {
      if (state2.length === 0) endReadable(this);
      return null;
    }
    var doRead = state2.needReadable;
    debug("need readable", doRead);
    if (state2.length === 0 || state2.length - n < state2.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state2.ended || state2.reading) {
      doRead = false;
      debug("reading or ended", doRead);
    } else if (doRead) {
      debug("do read");
      state2.reading = true;
      state2.sync = true;
      if (state2.length === 0) state2.needReadable = true;
      this._read(state2.highWaterMark);
      state2.sync = false;
      if (!state2.reading) n = howMuchToRead(nOrig, state2);
    }
    var ret;
    if (n > 0) ret = fromList(n, state2);
    else ret = null;
    if (ret === null) {
      state2.needReadable = state2.length <= state2.highWaterMark;
      n = 0;
    } else {
      state2.length -= n;
      state2.awaitDrain = 0;
    }
    if (state2.length === 0) {
      if (!state2.ended) state2.needReadable = true;
      if (nOrig !== n && state2.ended) endReadable(this);
    }
    if (ret !== null) this.emit("data", ret);
    return ret;
  };
  function onEofChunk(stream2, state2) {
    debug("onEofChunk");
    if (state2.ended) return;
    if (state2.decoder) {
      var chunk = state2.decoder.end();
      if (chunk && chunk.length) {
        state2.buffer.push(chunk);
        state2.length += state2.objectMode ? 1 : chunk.length;
      }
    }
    state2.ended = true;
    if (state2.sync) {
      emitReadable(stream2);
    } else {
      state2.needReadable = false;
      if (!state2.emittedReadable) {
        state2.emittedReadable = true;
        emitReadable_(stream2);
      }
    }
  }
  function emitReadable(stream2) {
    var state2 = stream2._readableState;
    debug("emitReadable", state2.needReadable, state2.emittedReadable);
    state2.needReadable = false;
    if (!state2.emittedReadable) {
      debug("emitReadable", state2.flowing);
      state2.emittedReadable = true;
      process.nextTick(emitReadable_, stream2);
    }
  }
  function emitReadable_(stream2) {
    var state2 = stream2._readableState;
    debug("emitReadable_", state2.destroyed, state2.length, state2.ended);
    if (!state2.destroyed && (state2.length || state2.ended)) {
      stream2.emit("readable");
      state2.emittedReadable = false;
    }
    state2.needReadable = !state2.flowing && !state2.ended && state2.length <= state2.highWaterMark;
    flow(stream2);
  }
  function maybeReadMore(stream2, state2) {
    if (!state2.readingMore) {
      state2.readingMore = true;
      process.nextTick(maybeReadMore_, stream2, state2);
    }
  }
  function maybeReadMore_(stream2, state2) {
    while (!state2.reading && !state2.ended && (state2.length < state2.highWaterMark || state2.flowing && state2.length === 0)) {
      var len = state2.length;
      debug("maybeReadMore read 0");
      stream2.read(0);
      if (len === state2.length)
        break;
    }
    state2.readingMore = false;
  }
  Readable.prototype._read = function(n) {
    errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state2 = this._readableState;
    switch (state2.pipesCount) {
      case 0:
        state2.pipes = dest;
        break;
      case 1:
        state2.pipes = [state2.pipes, dest];
        break;
      default:
        state2.pipes.push(dest);
        break;
    }
    state2.pipesCount += 1;
    debug("pipe count=%d opts=%j", state2.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : unpipe;
    if (state2.endEmitted) process.nextTick(endFn);
    else src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable2, unpipeInfo) {
      debug("onunpipe");
      if (readable2 === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      dest.removeListener("drain", ondrain);
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (state2.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
    }
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      var ret = dest.write(chunk);
      debug("dest.write", ret);
      if (ret === false) {
        if ((state2.pipesCount === 1 && state2.pipes === dest || state2.pipesCount > 1 && indexOf(state2.pipes, dest) !== -1) && !cleanedUp) {
          debug("false write response, pause", state2.awaitDrain);
          state2.awaitDrain++;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (EElistenerCount(dest, "error") === 0) errorOrDestroy(dest, er);
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state2.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src) {
    return function pipeOnDrainFunctionResult() {
      var state2 = src._readableState;
      debug("pipeOnDrain", state2.awaitDrain);
      if (state2.awaitDrain) state2.awaitDrain--;
      if (state2.awaitDrain === 0 && EElistenerCount(src, "data")) {
        state2.flowing = true;
        flow(src);
      }
    };
  }
  Readable.prototype.unpipe = function(dest) {
    var state2 = this._readableState;
    var unpipeInfo = {
      hasUnpiped: false
    };
    if (state2.pipesCount === 0) return this;
    if (state2.pipesCount === 1) {
      if (dest && dest !== state2.pipes) return this;
      if (!dest) dest = state2.pipes;
      state2.pipes = null;
      state2.pipesCount = 0;
      state2.flowing = false;
      if (dest) dest.emit("unpipe", this, unpipeInfo);
      return this;
    }
    if (!dest) {
      var dests = state2.pipes;
      var len = state2.pipesCount;
      state2.pipes = null;
      state2.pipesCount = 0;
      state2.flowing = false;
      for (var i = 0; i < len; i++) dests[i].emit("unpipe", this, {
        hasUnpiped: false
      });
      return this;
    }
    var index = indexOf(state2.pipes, dest);
    if (index === -1) return this;
    state2.pipes.splice(index, 1);
    state2.pipesCount -= 1;
    if (state2.pipesCount === 1) state2.pipes = state2.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    var state2 = this._readableState;
    if (ev === "data") {
      state2.readableListening = this.listenerCount("readable") > 0;
      if (state2.flowing !== false) this.resume();
    } else if (ev === "readable") {
      if (!state2.endEmitted && !state2.readableListening) {
        state2.readableListening = state2.needReadable = true;
        state2.flowing = false;
        state2.emittedReadable = false;
        debug("on readable", state2.length, state2.reading);
        if (state2.length) {
          emitReadable(this);
        } else if (!state2.reading) {
          process.nextTick(nReadingNextTick, this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  Readable.prototype.removeListener = function(ev, fn) {
    var res = Stream.prototype.removeListener.call(this, ev, fn);
    if (ev === "readable") {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  Readable.prototype.removeAllListeners = function(ev) {
    var res = Stream.prototype.removeAllListeners.apply(this, arguments);
    if (ev === "readable" || ev === void 0) {
      process.nextTick(updateReadableListening, this);
    }
    return res;
  };
  function updateReadableListening(self2) {
    var state2 = self2._readableState;
    state2.readableListening = self2.listenerCount("readable") > 0;
    if (state2.resumeScheduled && !state2.paused) {
      state2.flowing = true;
    } else if (self2.listenerCount("data") > 0) {
      self2.resume();
    }
  }
  function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
  }
  Readable.prototype.resume = function() {
    var state2 = this._readableState;
    if (!state2.flowing) {
      debug("resume");
      state2.flowing = !state2.readableListening;
      resume(this, state2);
    }
    state2.paused = false;
    return this;
  };
  function resume(stream2, state2) {
    if (!state2.resumeScheduled) {
      state2.resumeScheduled = true;
      process.nextTick(resume_, stream2, state2);
    }
  }
  function resume_(stream2, state2) {
    debug("resume", state2.reading);
    if (!state2.reading) {
      stream2.read(0);
    }
    state2.resumeScheduled = false;
    stream2.emit("resume");
    flow(stream2);
    if (state2.flowing && !state2.reading) stream2.read(0);
  }
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (this._readableState.flowing !== false) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    this._readableState.paused = true;
    return this;
  };
  function flow(stream2) {
    var state2 = stream2._readableState;
    debug("flow", state2.flowing);
    while (state2.flowing && stream2.read() !== null) ;
  }
  Readable.prototype.wrap = function(stream2) {
    var _this = this;
    var state2 = this._readableState;
    var paused = false;
    stream2.on("end", function() {
      debug("wrapped end");
      if (state2.decoder && !state2.ended) {
        var chunk = state2.decoder.end();
        if (chunk && chunk.length) _this.push(chunk);
      }
      _this.push(null);
    });
    stream2.on("data", function(chunk) {
      debug("wrapped data");
      if (state2.decoder) chunk = state2.decoder.write(chunk);
      if (state2.objectMode && (chunk === null || chunk === void 0)) return;
      else if (!state2.objectMode && (!chunk || !chunk.length)) return;
      var ret = _this.push(chunk);
      if (!ret) {
        paused = true;
        stream2.pause();
      }
    });
    for (var i in stream2) {
      if (this[i] === void 0 && typeof stream2[i] === "function") {
        this[i] = /* @__PURE__ */ (function methodWrap(method) {
          return function methodWrapReturnFunction() {
            return stream2[method].apply(stream2, arguments);
          };
        })(i);
      }
    }
    for (var n = 0; n < kProxyEvents.length; n++) {
      stream2.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function(n2) {
      debug("wrapped _read", n2);
      if (paused) {
        paused = false;
        stream2.resume();
      }
    };
    return this;
  };
  if (typeof Symbol === "function") {
    Readable.prototype[Symbol.asyncIterator] = function() {
      if (createReadableStreamAsyncIterator === void 0) {
        createReadableStreamAsyncIterator = requireAsync_iterator();
      }
      return createReadableStreamAsyncIterator(this);
    };
  }
  Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._readableState.highWaterMark;
    }
  });
  Object.defineProperty(Readable.prototype, "readableBuffer", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._readableState && this._readableState.buffer;
    }
  });
  Object.defineProperty(Readable.prototype, "readableFlowing", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._readableState.flowing;
    },
    set: function set(state2) {
      if (this._readableState) {
        this._readableState.flowing = state2;
      }
    }
  });
  Readable._fromList = fromList;
  Object.defineProperty(Readable.prototype, "readableLength", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function get() {
      return this._readableState.length;
    }
  });
  function fromList(n, state2) {
    if (state2.length === 0) return null;
    var ret;
    if (state2.objectMode) ret = state2.buffer.shift();
    else if (!n || n >= state2.length) {
      if (state2.decoder) ret = state2.buffer.join("");
      else if (state2.buffer.length === 1) ret = state2.buffer.first();
      else ret = state2.buffer.concat(state2.length);
      state2.buffer.clear();
    } else {
      ret = state2.buffer.consume(n, state2.decoder);
    }
    return ret;
  }
  function endReadable(stream2) {
    var state2 = stream2._readableState;
    debug("endReadable", state2.endEmitted);
    if (!state2.endEmitted) {
      state2.ended = true;
      process.nextTick(endReadableNT, state2, stream2);
    }
  }
  function endReadableNT(state2, stream2) {
    debug("endReadableNT", state2.endEmitted, state2.length);
    if (!state2.endEmitted && state2.length === 0) {
      state2.endEmitted = true;
      stream2.readable = false;
      stream2.emit("end");
      if (state2.autoDestroy) {
        var wState = stream2._writableState;
        if (!wState || wState.autoDestroy && wState.finished) {
          stream2.destroy();
        }
      }
    }
  }
  if (typeof Symbol === "function") {
    Readable.from = function(iterable, opts) {
      if (from === void 0) {
        from = requireFrom();
      }
      return from(Readable, iterable, opts);
    };
  }
  function indexOf(xs, x) {
    for (var i = 0, l = xs.length; i < l; i++) {
      if (xs[i] === x) return i;
    }
    return -1;
  }
  return _stream_readable;
}
var _stream_transform;
var hasRequired_stream_transform;
function require_stream_transform() {
  if (hasRequired_stream_transform) return _stream_transform;
  hasRequired_stream_transform = 1;
  _stream_transform = Transform;
  var _require$codes = requireErrors().codes, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK, ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING, ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
  var Duplex = require_stream_duplex();
  main$1.requireInherits()(Transform, Duplex);
  function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (cb === null) {
      return this.emit("error", new ERR_MULTIPLE_CALLBACK());
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null)
      this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      this._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform)) return new Transform(options);
    Duplex.call(this, options);
    this._transformState = {
      afterTransform: afterTransform.bind(this),
      needTransform: false,
      transforming: false,
      writecb: null,
      writechunk: null,
      writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
      if (typeof options.transform === "function") this._transform = options.transform;
      if (typeof options.flush === "function") this._flush = options.flush;
    }
    this.on("prefinish", prefinish);
  }
  function prefinish() {
    var _this = this;
    if (typeof this._flush === "function" && !this._readableState.destroyed) {
      this._flush(function(er, data) {
        done(_this, er, data);
      });
    } else {
      done(this, null, null);
    }
  }
  Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };
  Transform.prototype._transform = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
  };
  Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
    }
  };
  Transform.prototype._read = function(n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      ts.needTransform = true;
    }
  };
  Transform.prototype._destroy = function(err, cb) {
    Duplex.prototype._destroy.call(this, err, function(err2) {
      cb(err2);
    });
  };
  function done(stream2, er, data) {
    if (er) return stream2.emit("error", er);
    if (data != null)
      stream2.push(data);
    if (stream2._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
    if (stream2._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
    return stream2.push(null);
  }
  return _stream_transform;
}
var _stream_passthrough;
var hasRequired_stream_passthrough;
function require_stream_passthrough() {
  if (hasRequired_stream_passthrough) return _stream_passthrough;
  hasRequired_stream_passthrough = 1;
  _stream_passthrough = PassThrough;
  var Transform = require_stream_transform();
  main$1.requireInherits()(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough)) return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
  return _stream_passthrough;
}
var pipeline_1;
var hasRequiredPipeline;
function requirePipeline() {
  if (hasRequiredPipeline) return pipeline_1;
  hasRequiredPipeline = 1;
  var eos;
  function once(callback) {
    var called = false;
    return function() {
      if (called) return;
      called = true;
      callback.apply(void 0, arguments);
    };
  }
  var _require$codes = requireErrors().codes, ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS, ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
  function noop(err) {
    if (err) throw err;
  }
  function isRequest(stream2) {
    return stream2.setHeader && typeof stream2.abort === "function";
  }
  function destroyer(stream2, reading, writing, callback) {
    callback = once(callback);
    var closed = false;
    stream2.on("close", function() {
      closed = true;
    });
    if (eos === void 0) eos = requireEndOfStream();
    eos(stream2, {
      readable: reading,
      writable: writing
    }, function(err) {
      if (err) return callback(err);
      closed = true;
      callback();
    });
    var destroyed = false;
    return function(err) {
      if (closed) return;
      if (destroyed) return;
      destroyed = true;
      if (isRequest(stream2)) return stream2.abort();
      if (typeof stream2.destroy === "function") return stream2.destroy();
      callback(err || new ERR_STREAM_DESTROYED("pipe"));
    };
  }
  function call(fn) {
    fn();
  }
  function pipe(from, to) {
    return from.pipe(to);
  }
  function popCallback(streams) {
    if (!streams.length) return noop;
    if (typeof streams[streams.length - 1] !== "function") return noop;
    return streams.pop();
  }
  function pipeline() {
    for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
      streams[_key] = arguments[_key];
    }
    var callback = popCallback(streams);
    if (Array.isArray(streams[0])) streams = streams[0];
    if (streams.length < 2) {
      throw new ERR_MISSING_ARGS("streams");
    }
    var error2;
    var destroys = streams.map(function(stream2, i) {
      var reading = i < streams.length - 1;
      var writing = i > 0;
      return destroyer(stream2, reading, writing, function(err) {
        if (!error2) error2 = err;
        if (err) destroys.forEach(call);
        if (reading) return;
        destroys.forEach(call);
        callback(error2);
      });
    });
    return streams.reduce(pipe);
  }
  pipeline_1 = pipeline;
  return pipeline_1;
}
var hasRequiredReadable;
function requireReadable() {
  if (hasRequiredReadable) return readable.exports;
  hasRequiredReadable = 1;
  (function(module2, exports$1) {
    var Stream = require$$0$2;
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module2.exports = Stream.Readable;
      Object.assign(module2.exports, Stream);
      module2.exports.Stream = Stream;
    } else {
      exports$1 = module2.exports = require_stream_readable();
      exports$1.Stream = Stream || exports$1;
      exports$1.Readable = exports$1;
      exports$1.Writable = require_stream_writable();
      exports$1.Duplex = require_stream_duplex();
      exports$1.Transform = require_stream_transform();
      exports$1.PassThrough = require_stream_passthrough();
      exports$1.finished = requireEndOfStream();
      exports$1.pipeline = requirePipeline();
    }
  })(readable, readable.exports);
  return readable.exports;
}
var delegates;
var hasRequiredDelegates;
function requireDelegates() {
  if (hasRequiredDelegates) return delegates;
  hasRequiredDelegates = 1;
  delegates = Delegator;
  function Delegator(proto, target) {
    if (!(this instanceof Delegator)) return new Delegator(proto, target);
    this.proto = proto;
    this.target = target;
    this.methods = [];
    this.getters = [];
    this.setters = [];
    this.fluents = [];
  }
  Delegator.prototype.method = function(name2) {
    var proto = this.proto;
    var target = this.target;
    this.methods.push(name2);
    proto[name2] = function() {
      return this[target][name2].apply(this[target], arguments);
    };
    return this;
  };
  Delegator.prototype.access = function(name2) {
    return this.getter(name2).setter(name2);
  };
  Delegator.prototype.getter = function(name2) {
    var proto = this.proto;
    var target = this.target;
    this.getters.push(name2);
    proto.__defineGetter__(name2, function() {
      return this[target][name2];
    });
    return this;
  };
  Delegator.prototype.setter = function(name2) {
    var proto = this.proto;
    var target = this.target;
    this.setters.push(name2);
    proto.__defineSetter__(name2, function(val) {
      return this[target][name2] = val;
    });
    return this;
  };
  Delegator.prototype.fluent = function(name2) {
    var proto = this.proto;
    var target = this.target;
    this.fluents.push(name2);
    proto[name2] = function(val) {
      if ("undefined" != typeof val) {
        this[target][name2] = val;
        return this;
      } else {
        return this[target][name2];
      }
    };
    return this;
  };
  return delegates;
}
var hasRequiredTrackerStream;
function requireTrackerStream() {
  if (hasRequiredTrackerStream) return trackerStream.exports;
  hasRequiredTrackerStream = 1;
  var util = require$$0$4;
  var stream2 = requireReadable();
  var delegate = requireDelegates();
  var Tracker = requireTracker();
  var TrackerStream = trackerStream.exports = function(name2, size, options) {
    stream2.Transform.call(this, options);
    this.tracker = new Tracker(name2, size);
    this.name = name2;
    this.id = this.tracker.id;
    this.tracker.on("change", delegateChange(this));
  };
  util.inherits(TrackerStream, stream2.Transform);
  function delegateChange(trackerStream2) {
    return function(name2, completion, tracker2) {
      trackerStream2.emit("change", name2, completion, trackerStream2);
    };
  }
  TrackerStream.prototype._transform = function(data, encoding, cb) {
    this.tracker.completeWork(data.length ? data.length : 1);
    this.push(data);
    cb();
  };
  TrackerStream.prototype._flush = function(cb) {
    this.tracker.finish();
    cb();
  };
  delegate(TrackerStream.prototype, "tracker").method("completed").method("addWork").method("finish");
  return trackerStream.exports;
}
var hasRequiredTrackerGroup;
function requireTrackerGroup() {
  if (hasRequiredTrackerGroup) return trackerGroup.exports;
  hasRequiredTrackerGroup = 1;
  var util = require$$0$4;
  var TrackerBase = requireTrackerBase();
  var Tracker = requireTracker();
  var TrackerStream = requireTrackerStream();
  var TrackerGroup = trackerGroup.exports = function(name2) {
    TrackerBase.call(this, name2);
    this.parentGroup = null;
    this.trackers = [];
    this.completion = {};
    this.weight = {};
    this.totalWeight = 0;
    this.finished = false;
    this.bubbleChange = bubbleChange(this);
  };
  util.inherits(TrackerGroup, TrackerBase);
  function bubbleChange(trackerGroup2) {
    return function(name2, completed, tracker2) {
      trackerGroup2.completion[tracker2.id] = completed;
      if (trackerGroup2.finished) {
        return;
      }
      trackerGroup2.emit("change", name2 || trackerGroup2.name, trackerGroup2.completed(), trackerGroup2);
    };
  }
  TrackerGroup.prototype.nameInTree = function() {
    var names = [];
    var from = this;
    while (from) {
      names.unshift(from.name);
      from = from.parentGroup;
    }
    return names.join("/");
  };
  TrackerGroup.prototype.addUnit = function(unit, weight) {
    if (unit.addUnit) {
      var toTest = this;
      while (toTest) {
        if (unit === toTest) {
          throw new Error(
            "Attempted to add tracker group " + unit.name + " to tree that already includes it " + this.nameInTree(this)
          );
        }
        toTest = toTest.parentGroup;
      }
      unit.parentGroup = this;
    }
    this.weight[unit.id] = weight || 1;
    this.totalWeight += this.weight[unit.id];
    this.trackers.push(unit);
    this.completion[unit.id] = unit.completed();
    unit.on("change", this.bubbleChange);
    if (!this.finished) {
      this.emit("change", unit.name, this.completion[unit.id], unit);
    }
    return unit;
  };
  TrackerGroup.prototype.completed = function() {
    if (this.trackers.length === 0) {
      return 0;
    }
    var valPerWeight = 1 / this.totalWeight;
    var completed = 0;
    for (var ii = 0; ii < this.trackers.length; ii++) {
      var trackerId = this.trackers[ii].id;
      completed += valPerWeight * this.weight[trackerId] * this.completion[trackerId];
    }
    return completed;
  };
  TrackerGroup.prototype.newGroup = function(name2, weight) {
    return this.addUnit(new TrackerGroup(name2), weight);
  };
  TrackerGroup.prototype.newItem = function(name2, todo, weight) {
    return this.addUnit(new Tracker(name2, todo), weight);
  };
  TrackerGroup.prototype.newStream = function(name2, todo, weight) {
    return this.addUnit(new TrackerStream(name2, todo), weight);
  };
  TrackerGroup.prototype.finish = function() {
    this.finished = true;
    if (!this.trackers.length) {
      this.addUnit(new Tracker(), 1, true);
    }
    for (var ii = 0; ii < this.trackers.length; ii++) {
      var tracker2 = this.trackers[ii];
      tracker2.finish();
      tracker2.removeListener("change", this.bubbleChange);
    }
    this.emit("change", this.name, 1, this);
  };
  var buffer = "                                  ";
  TrackerGroup.prototype.debug = function(depth) {
    depth = depth || 0;
    var indent = depth ? buffer.substr(0, depth) : "";
    var output = indent + (this.name || "top") + ": " + this.completed() + "\n";
    this.trackers.forEach(function(tracker2) {
      if (tracker2 instanceof TrackerGroup) {
        output += tracker2.debug(depth + 1);
      } else {
        output += indent + " " + tracker2.name + ": " + tracker2.completed() + "\n";
      }
    });
    return output;
  };
  return trackerGroup.exports;
}
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib) return lib;
  hasRequiredLib = 1;
  lib.TrackerGroup = requireTrackerGroup();
  lib.Tracker = requireTracker();
  lib.TrackerStream = requireTrackerStream();
  return lib;
}
var plumbing = { exports: {} };
var consoleControlStrings = {};
var hasRequiredConsoleControlStrings;
function requireConsoleControlStrings() {
  if (hasRequiredConsoleControlStrings) return consoleControlStrings;
  hasRequiredConsoleControlStrings = 1;
  var prefix = "\x1B[";
  consoleControlStrings.up = function up(num) {
    return prefix + (num || "") + "A";
  };
  consoleControlStrings.down = function down(num) {
    return prefix + (num || "") + "B";
  };
  consoleControlStrings.forward = function forward(num) {
    return prefix + (num || "") + "C";
  };
  consoleControlStrings.back = function back(num) {
    return prefix + (num || "") + "D";
  };
  consoleControlStrings.nextLine = function nextLine(num) {
    return prefix + (num || "") + "E";
  };
  consoleControlStrings.previousLine = function previousLine(num) {
    return prefix + (num || "") + "F";
  };
  consoleControlStrings.horizontalAbsolute = function horizontalAbsolute(num) {
    if (num == null) throw new Error("horizontalAboslute requires a column to position to");
    return prefix + num + "G";
  };
  consoleControlStrings.eraseData = function eraseData() {
    return prefix + "J";
  };
  consoleControlStrings.eraseLine = function eraseLine() {
    return prefix + "K";
  };
  consoleControlStrings.goto = function(x, y) {
    return prefix + y + ";" + x + "H";
  };
  consoleControlStrings.gotoSOL = function() {
    return "\r";
  };
  consoleControlStrings.beep = function() {
    return "\x07";
  };
  consoleControlStrings.hideCursor = function hideCursor() {
    return prefix + "?25l";
  };
  consoleControlStrings.showCursor = function showCursor() {
    return prefix + "?25h";
  };
  var colors = {
    reset: 0,
    // styles
    bold: 1,
    italic: 3,
    underline: 4,
    inverse: 7,
    // resets
    stopBold: 22,
    stopItalic: 23,
    stopUnderline: 24,
    stopInverse: 27,
    // colors
    white: 37,
    black: 30,
    blue: 34,
    cyan: 36,
    green: 32,
    magenta: 35,
    red: 31,
    yellow: 33,
    bgWhite: 47,
    bgBlack: 40,
    bgBlue: 44,
    bgCyan: 46,
    bgGreen: 42,
    bgMagenta: 45,
    bgRed: 41,
    bgYellow: 43,
    grey: 90,
    brightBlack: 90,
    brightRed: 91,
    brightGreen: 92,
    brightYellow: 93,
    brightBlue: 94,
    brightMagenta: 95,
    brightCyan: 96,
    brightWhite: 97,
    bgGrey: 100,
    bgBrightBlack: 100,
    bgBrightRed: 101,
    bgBrightGreen: 102,
    bgBrightYellow: 103,
    bgBrightBlue: 104,
    bgBrightMagenta: 105,
    bgBrightCyan: 106,
    bgBrightWhite: 107
  };
  consoleControlStrings.color = function color(colorWith) {
    if (arguments.length !== 1 || !Array.isArray(colorWith)) {
      colorWith = Array.prototype.slice.call(arguments);
    }
    return prefix + colorWith.map(colorNameToCode).join(";") + "m";
  };
  function colorNameToCode(color) {
    if (colors[color] != null) return colors[color];
    throw new Error("Unknown color or style name: " + color);
  }
  return consoleControlStrings;
}
var renderTemplate = { exports: {} };
var align = {};
var stringWidth = { exports: {} };
var ansiRegex;
var hasRequiredAnsiRegex;
function requireAnsiRegex() {
  if (hasRequiredAnsiRegex) return ansiRegex;
  hasRequiredAnsiRegex = 1;
  ansiRegex = ({ onlyFirst = false } = {}) => {
    const pattern = [
      "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
      "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
    ].join("|");
    return new RegExp(pattern, onlyFirst ? void 0 : "g");
  };
  return ansiRegex;
}
var stripAnsi;
var hasRequiredStripAnsi;
function requireStripAnsi() {
  if (hasRequiredStripAnsi) return stripAnsi;
  hasRequiredStripAnsi = 1;
  const ansiRegex2 = requireAnsiRegex();
  stripAnsi = (string) => typeof string === "string" ? string.replace(ansiRegex2(), "") : string;
  return stripAnsi;
}
var isFullwidthCodePoint = { exports: {} };
var hasRequiredIsFullwidthCodePoint;
function requireIsFullwidthCodePoint() {
  if (hasRequiredIsFullwidthCodePoint) return isFullwidthCodePoint.exports;
  hasRequiredIsFullwidthCodePoint = 1;
  const isFullwidthCodePoint$1 = (codePoint) => {
    if (Number.isNaN(codePoint)) {
      return false;
    }
    if (codePoint >= 4352 && (codePoint <= 4447 || // Hangul Jamo
    codePoint === 9001 || // LEFT-POINTING ANGLE BRACKET
    codePoint === 9002 || // RIGHT-POINTING ANGLE BRACKET
    // CJK Radicals Supplement .. Enclosed CJK Letters and Months
    11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
    12880 <= codePoint && codePoint <= 19903 || // CJK Unified Ideographs .. Yi Radicals
    19968 <= codePoint && codePoint <= 42182 || // Hangul Jamo Extended-A
    43360 <= codePoint && codePoint <= 43388 || // Hangul Syllables
    44032 <= codePoint && codePoint <= 55203 || // CJK Compatibility Ideographs
    63744 <= codePoint && codePoint <= 64255 || // Vertical Forms
    65040 <= codePoint && codePoint <= 65049 || // CJK Compatibility Forms .. Small Form Variants
    65072 <= codePoint && codePoint <= 65131 || // Halfwidth and Fullwidth Forms
    65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || // Kana Supplement
    110592 <= codePoint && codePoint <= 110593 || // Enclosed Ideographic Supplement
    127488 <= codePoint && codePoint <= 127569 || // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
    131072 <= codePoint && codePoint <= 262141)) {
      return true;
    }
    return false;
  };
  isFullwidthCodePoint.exports = isFullwidthCodePoint$1;
  isFullwidthCodePoint.exports.default = isFullwidthCodePoint$1;
  return isFullwidthCodePoint.exports;
}
var emojiRegex;
var hasRequiredEmojiRegex;
function requireEmojiRegex() {
  if (hasRequiredEmojiRegex) return emojiRegex;
  hasRequiredEmojiRegex = 1;
  emojiRegex = function() {
    return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
  };
  return emojiRegex;
}
var hasRequiredStringWidth;
function requireStringWidth() {
  if (hasRequiredStringWidth) return stringWidth.exports;
  hasRequiredStringWidth = 1;
  const stripAnsi2 = requireStripAnsi();
  const isFullwidthCodePoint2 = requireIsFullwidthCodePoint();
  const emojiRegex2 = requireEmojiRegex();
  const stringWidth$1 = (string) => {
    if (typeof string !== "string" || string.length === 0) {
      return 0;
    }
    string = stripAnsi2(string);
    if (string.length === 0) {
      return 0;
    }
    string = string.replace(emojiRegex2(), "  ");
    let width = 0;
    for (let i = 0; i < string.length; i++) {
      const code = string.codePointAt(i);
      if (code <= 31 || code >= 127 && code <= 159) {
        continue;
      }
      if (code >= 768 && code <= 879) {
        continue;
      }
      if (code > 65535) {
        i++;
      }
      width += isFullwidthCodePoint2(code) ? 2 : 1;
    }
    return width;
  };
  stringWidth.exports = stringWidth$1;
  stringWidth.exports.default = stringWidth$1;
  return stringWidth.exports;
}
var hasRequiredAlign;
function requireAlign() {
  if (hasRequiredAlign) return align;
  hasRequiredAlign = 1;
  var stringWidth2 = requireStringWidth();
  align.center = alignCenter;
  align.left = alignLeft;
  align.right = alignRight;
  function createPadding(width) {
    var result = "";
    var string = " ";
    var n = width;
    do {
      if (n % 2) {
        result += string;
      }
      n = Math.floor(n / 2);
      string += string;
    } while (n);
    return result;
  }
  function alignLeft(str, width) {
    var trimmed = str.trimRight();
    if (trimmed.length === 0 && str.length >= width) return str;
    var padding = "";
    var strWidth = stringWidth2(trimmed);
    if (strWidth < width) {
      padding = createPadding(width - strWidth);
    }
    return trimmed + padding;
  }
  function alignRight(str, width) {
    var trimmed = str.trimLeft();
    if (trimmed.length === 0 && str.length >= width) return str;
    var padding = "";
    var strWidth = stringWidth2(trimmed);
    if (strWidth < width) {
      padding = createPadding(width - strWidth);
    }
    return padding + trimmed;
  }
  function alignCenter(str, width) {
    var trimmed = str.trim();
    if (trimmed.length === 0 && str.length >= width) return str;
    var padLeft = "";
    var padRight = "";
    var strWidth = stringWidth2(trimmed);
    if (strWidth < width) {
      var padLeftBy = parseInt((width - strWidth) / 2, 10);
      padLeft = createPadding(padLeftBy);
      padRight = createPadding(width - (strWidth + padLeftBy));
    }
    return padLeft + trimmed + padRight;
  }
  return align;
}
var aproba;
var hasRequiredAproba;
function requireAproba() {
  if (hasRequiredAproba) return aproba;
  hasRequiredAproba = 1;
  aproba = validate;
  function isArguments(thingy) {
    return thingy != null && typeof thingy === "object" && thingy.hasOwnProperty("callee");
  }
  const types = {
    "*": { label: "any", check: () => true },
    A: { label: "array", check: (_) => Array.isArray(_) || isArguments(_) },
    S: { label: "string", check: (_) => typeof _ === "string" },
    N: { label: "number", check: (_) => typeof _ === "number" },
    F: { label: "function", check: (_) => typeof _ === "function" },
    O: { label: "object", check: (_) => typeof _ === "object" && _ != null && !types.A.check(_) && !types.E.check(_) },
    B: { label: "boolean", check: (_) => typeof _ === "boolean" },
    E: { label: "error", check: (_) => _ instanceof Error },
    Z: { label: "null", check: (_) => _ == null }
  };
  function addSchema(schema, arity) {
    const group = arity[schema.length] = arity[schema.length] || [];
    if (group.indexOf(schema) === -1) group.push(schema);
  }
  function validate(rawSchemas, args) {
    if (arguments.length !== 2) throw wrongNumberOfArgs(["SA"], arguments.length);
    if (!rawSchemas) throw missingRequiredArg(0);
    if (!args) throw missingRequiredArg(1);
    if (!types.S.check(rawSchemas)) throw invalidType(0, ["string"], rawSchemas);
    if (!types.A.check(args)) throw invalidType(1, ["array"], args);
    const schemas = rawSchemas.split("|");
    const arity = {};
    schemas.forEach((schema) => {
      for (let ii = 0; ii < schema.length; ++ii) {
        const type = schema[ii];
        if (!types[type]) throw unknownType(ii, type);
      }
      if (/E.*E/.test(schema)) throw moreThanOneError(schema);
      addSchema(schema, arity);
      if (/E/.test(schema)) {
        addSchema(schema.replace(/E.*$/, "E"), arity);
        addSchema(schema.replace(/E/, "Z"), arity);
        if (schema.length === 1) addSchema("", arity);
      }
    });
    let matching = arity[args.length];
    if (!matching) {
      throw wrongNumberOfArgs(Object.keys(arity), args.length);
    }
    for (let ii = 0; ii < args.length; ++ii) {
      let newMatching = matching.filter((schema) => {
        const type = schema[ii];
        const typeCheck = types[type].check;
        return typeCheck(args[ii]);
      });
      if (!newMatching.length) {
        const labels = matching.map((_) => types[_[ii]].label).filter((_) => _ != null);
        throw invalidType(ii, labels, args[ii]);
      }
      matching = newMatching;
    }
  }
  function missingRequiredArg(num) {
    return newException("EMISSINGARG", "Missing required argument #" + (num + 1));
  }
  function unknownType(num, type) {
    return newException("EUNKNOWNTYPE", "Unknown type " + type + " in argument #" + (num + 1));
  }
  function invalidType(num, expectedTypes, value) {
    let valueType;
    Object.keys(types).forEach((typeCode) => {
      if (types[typeCode].check(value)) valueType = types[typeCode].label;
    });
    return newException("EINVALIDTYPE", "Argument #" + (num + 1) + ": Expected " + englishList(expectedTypes) + " but got " + valueType);
  }
  function englishList(list) {
    return list.join(", ").replace(/, ([^,]+)$/, " or $1");
  }
  function wrongNumberOfArgs(expected, got) {
    const english = englishList(expected);
    const args = expected.every((ex) => ex.length === 1) ? "argument" : "arguments";
    return newException("EWRONGARGCOUNT", "Expected " + english + " " + args + " but got " + got);
  }
  function moreThanOneError(schema) {
    return newException(
      "ETOOMANYERRORTYPES",
      'Only one error type per argument signature is allowed, more than one found in "' + schema + '"'
    );
  }
  function newException(code, msg) {
    const err = new TypeError(msg);
    err.code = code;
    if (Error.captureStackTrace) Error.captureStackTrace(err, validate);
    return err;
  }
  return aproba;
}
var wideTruncate_1;
var hasRequiredWideTruncate;
function requireWideTruncate() {
  if (hasRequiredWideTruncate) return wideTruncate_1;
  hasRequiredWideTruncate = 1;
  var stringWidth2 = requireStringWidth();
  var stripAnsi2 = requireStripAnsi();
  wideTruncate_1 = wideTruncate;
  function wideTruncate(str, target) {
    if (stringWidth2(str) === 0) return str;
    if (target <= 0) return "";
    if (stringWidth2(str) <= target) return str;
    var noAnsi = stripAnsi2(str);
    var ansiSize = str.length + noAnsi.length;
    var truncated = str.slice(0, target + ansiSize);
    while (stringWidth2(truncated) > target) {
      truncated = truncated.slice(0, -1);
    }
    return truncated;
  }
  return wideTruncate_1;
}
var error = {};
var hasRequiredError;
function requireError() {
  if (hasRequiredError) return error;
  hasRequiredError = 1;
  var util = require$$0$4;
  var User = error.User = function User2(msg) {
    var err = new Error(msg);
    Error.captureStackTrace(err, User2);
    err.code = "EGAUGE";
    return err;
  };
  error.MissingTemplateValue = function MissingTemplateValue(item, values) {
    var err = new User(util.format('Missing template value "%s"', item.type));
    Error.captureStackTrace(err, MissingTemplateValue);
    err.template = item;
    err.values = values;
    return err;
  };
  error.Internal = function Internal(msg) {
    var err = new Error(msg);
    Error.captureStackTrace(err, Internal);
    err.code = "EGAUGEINTERNAL";
    return err;
  };
  return error;
}
var templateItem;
var hasRequiredTemplateItem;
function requireTemplateItem() {
  if (hasRequiredTemplateItem) return templateItem;
  hasRequiredTemplateItem = 1;
  var stringWidth2 = requireStringWidth();
  templateItem = TemplateItem;
  function isPercent(num) {
    if (typeof num !== "string") return false;
    return num.slice(-1) === "%";
  }
  function percent(num) {
    return Number(num.slice(0, -1)) / 100;
  }
  function TemplateItem(values, outputLength) {
    this.overallOutputLength = outputLength;
    this.finished = false;
    this.type = null;
    this.value = null;
    this.length = null;
    this.maxLength = null;
    this.minLength = null;
    this.kerning = null;
    this.align = "left";
    this.padLeft = 0;
    this.padRight = 0;
    this.index = null;
    this.first = null;
    this.last = null;
    if (typeof values === "string") {
      this.value = values;
    } else {
      for (var prop in values) this[prop] = values[prop];
    }
    if (isPercent(this.length)) {
      this.length = Math.round(this.overallOutputLength * percent(this.length));
    }
    if (isPercent(this.minLength)) {
      this.minLength = Math.round(this.overallOutputLength * percent(this.minLength));
    }
    if (isPercent(this.maxLength)) {
      this.maxLength = Math.round(this.overallOutputLength * percent(this.maxLength));
    }
    return this;
  }
  TemplateItem.prototype = {};
  TemplateItem.prototype.getBaseLength = function() {
    var length = this.length;
    if (length == null && typeof this.value === "string" && this.maxLength == null && this.minLength == null) {
      length = stringWidth2(this.value);
    }
    return length;
  };
  TemplateItem.prototype.getLength = function() {
    var length = this.getBaseLength();
    if (length == null) return null;
    return length + this.padLeft + this.padRight;
  };
  TemplateItem.prototype.getMaxLength = function() {
    if (this.maxLength == null) return null;
    return this.maxLength + this.padLeft + this.padRight;
  };
  TemplateItem.prototype.getMinLength = function() {
    if (this.minLength == null) return null;
    return this.minLength + this.padLeft + this.padRight;
  };
  return templateItem;
}
var hasRequiredRenderTemplate;
function requireRenderTemplate() {
  if (hasRequiredRenderTemplate) return renderTemplate.exports;
  hasRequiredRenderTemplate = 1;
  var align2 = requireAlign();
  var validate = requireAproba();
  var wideTruncate = requireWideTruncate();
  var error2 = requireError();
  var TemplateItem = requireTemplateItem();
  function renderValueWithValues(values) {
    return function(item) {
      return renderValue(item, values);
    };
  }
  var renderTemplate$1 = renderTemplate.exports = function(width, template, values) {
    var items = prepareItems(width, template, values);
    var rendered = items.map(renderValueWithValues(values)).join("");
    return align2.left(wideTruncate(rendered, width), width);
  };
  function preType(item) {
    var cappedTypeName = item.type[0].toUpperCase() + item.type.slice(1);
    return "pre" + cappedTypeName;
  }
  function postType(item) {
    var cappedTypeName = item.type[0].toUpperCase() + item.type.slice(1);
    return "post" + cappedTypeName;
  }
  function hasPreOrPost(item, values) {
    if (!item.type) return;
    return values[preType(item)] || values[postType(item)];
  }
  function generatePreAndPost(baseItem, parentValues) {
    var item = Object.assign({}, baseItem);
    var values = Object.create(parentValues);
    var template = [];
    var pre = preType(item);
    var post = postType(item);
    if (values[pre]) {
      template.push({ value: values[pre] });
      values[pre] = null;
    }
    item.minLength = null;
    item.length = null;
    item.maxLength = null;
    template.push(item);
    values[item.type] = values[item.type];
    if (values[post]) {
      template.push({ value: values[post] });
      values[post] = null;
    }
    return function($1, $2, length) {
      return renderTemplate$1(length, template, values);
    };
  }
  function prepareItems(width, template, values) {
    function cloneAndObjectify(item, index, arr) {
      var cloned = new TemplateItem(item, width);
      var type = cloned.type;
      if (cloned.value == null) {
        if (!(type in values)) {
          if (cloned.default == null) {
            throw new error2.MissingTemplateValue(cloned, values);
          } else {
            cloned.value = cloned.default;
          }
        } else {
          cloned.value = values[type];
        }
      }
      if (cloned.value == null || cloned.value === "") return null;
      cloned.index = index;
      cloned.first = index === 0;
      cloned.last = index === arr.length - 1;
      if (hasPreOrPost(cloned, values)) cloned.value = generatePreAndPost(cloned, values);
      return cloned;
    }
    var output = template.map(cloneAndObjectify).filter(function(item) {
      return item != null;
    });
    var remainingSpace = width;
    var variableCount = output.length;
    function consumeSpace(length) {
      if (length > remainingSpace) length = remainingSpace;
      remainingSpace -= length;
    }
    function finishSizing(item, length) {
      if (item.finished) throw new error2.Internal("Tried to finish template item that was already finished");
      if (length === Infinity) throw new error2.Internal("Length of template item cannot be infinity");
      if (length != null) item.length = length;
      item.minLength = null;
      item.maxLength = null;
      --variableCount;
      item.finished = true;
      if (item.length == null) item.length = item.getBaseLength();
      if (item.length == null) throw new error2.Internal("Finished template items must have a length");
      consumeSpace(item.getLength());
    }
    output.forEach(function(item) {
      if (!item.kerning) return;
      var prevPadRight = item.first ? 0 : output[item.index - 1].padRight;
      if (!item.first && prevPadRight < item.kerning) item.padLeft = item.kerning - prevPadRight;
      if (!item.last) item.padRight = item.kerning;
    });
    output.forEach(function(item) {
      if (item.getBaseLength() == null) return;
      finishSizing(item);
    });
    var resized = 0;
    var resizing;
    var hunkSize;
    do {
      resizing = false;
      hunkSize = Math.round(remainingSpace / variableCount);
      output.forEach(function(item) {
        if (item.finished) return;
        if (!item.maxLength) return;
        if (item.getMaxLength() < hunkSize) {
          finishSizing(item, item.maxLength);
          resizing = true;
        }
      });
    } while (resizing && resized++ < output.length);
    if (resizing) throw new error2.Internal("Resize loop iterated too many times while determining maxLength");
    resized = 0;
    do {
      resizing = false;
      hunkSize = Math.round(remainingSpace / variableCount);
      output.forEach(function(item) {
        if (item.finished) return;
        if (!item.minLength) return;
        if (item.getMinLength() >= hunkSize) {
          finishSizing(item, item.minLength);
          resizing = true;
        }
      });
    } while (resizing && resized++ < output.length);
    if (resizing) throw new error2.Internal("Resize loop iterated too many times while determining minLength");
    hunkSize = Math.round(remainingSpace / variableCount);
    output.forEach(function(item) {
      if (item.finished) return;
      finishSizing(item, hunkSize);
    });
    return output;
  }
  function renderFunction(item, values, length) {
    validate("OON", arguments);
    if (item.type) {
      return item.value(values, values[item.type + "Theme"] || {}, length);
    } else {
      return item.value(values, {}, length);
    }
  }
  function renderValue(item, values) {
    var length = item.getBaseLength();
    var value = typeof item.value === "function" ? renderFunction(item, values, length) : item.value;
    if (value == null || value === "") return "";
    var alignWith = align2[item.align] || align2.left;
    var leftPadding = item.padLeft ? align2.left("", item.padLeft) : "";
    var rightPadding = item.padRight ? align2.right("", item.padRight) : "";
    var truncated = wideTruncate(String(value), length);
    var aligned = alignWith(truncated, length);
    return leftPadding + aligned + rightPadding;
  }
  return renderTemplate.exports;
}
var hasRequiredPlumbing;
function requirePlumbing() {
  if (hasRequiredPlumbing) return plumbing.exports;
  hasRequiredPlumbing = 1;
  var consoleControl = requireConsoleControlStrings();
  var renderTemplate2 = requireRenderTemplate();
  var validate = requireAproba();
  var Plumbing = plumbing.exports = function(theme, template, width) {
    if (!width) width = 80;
    validate("OAN", [theme, template, width]);
    this.showing = false;
    this.theme = theme;
    this.width = width;
    this.template = template;
  };
  Plumbing.prototype = {};
  Plumbing.prototype.setTheme = function(theme) {
    validate("O", [theme]);
    this.theme = theme;
  };
  Plumbing.prototype.setTemplate = function(template) {
    validate("A", [template]);
    this.template = template;
  };
  Plumbing.prototype.setWidth = function(width) {
    validate("N", [width]);
    this.width = width;
  };
  Plumbing.prototype.hide = function() {
    return consoleControl.gotoSOL() + consoleControl.eraseLine();
  };
  Plumbing.prototype.hideCursor = consoleControl.hideCursor;
  Plumbing.prototype.showCursor = consoleControl.showCursor;
  Plumbing.prototype.show = function(status) {
    var values = Object.create(this.theme);
    for (var key in status) {
      values[key] = status[key];
    }
    return renderTemplate2(this.width, this.template, values).trim() + consoleControl.color("reset") + consoleControl.eraseLine() + consoleControl.gotoSOL();
  };
  return plumbing.exports;
}
var hasUnicode = { exports: {} };
var hasRequiredHasUnicode;
function requireHasUnicode() {
  if (hasRequiredHasUnicode) return hasUnicode.exports;
  hasRequiredHasUnicode = 1;
  var os = require$$4;
  hasUnicode.exports = function() {
    if (os.type() == "Windows_NT") {
      return false;
    }
    var isUTF8 = /UTF-?8$/i;
    var ctype = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG;
    return isUTF8.test(ctype);
  };
  return hasUnicode.exports;
}
var colorSupport_1;
var hasRequiredColorSupport;
function requireColorSupport() {
  if (hasRequiredColorSupport) return colorSupport_1;
  hasRequiredColorSupport = 1;
  colorSupport_1 = colorSupport({ alwaysReturn: true }, colorSupport);
  function hasNone(obj, options) {
    obj.level = 0;
    obj.hasBasic = false;
    obj.has256 = false;
    obj.has16m = false;
    if (!options.alwaysReturn) {
      return false;
    }
    return obj;
  }
  function hasBasic(obj) {
    obj.hasBasic = true;
    obj.has256 = false;
    obj.has16m = false;
    obj.level = 1;
    return obj;
  }
  function has256(obj) {
    obj.hasBasic = true;
    obj.has256 = true;
    obj.has16m = false;
    obj.level = 2;
    return obj;
  }
  function has16m(obj) {
    obj.hasBasic = true;
    obj.has256 = true;
    obj.has16m = true;
    obj.level = 3;
    return obj;
  }
  function colorSupport(options, obj) {
    options = options || {};
    obj = obj || {};
    if (typeof options.level === "number") {
      switch (options.level) {
        case 0:
          return hasNone(obj, options);
        case 1:
          return hasBasic(obj);
        case 2:
          return has256(obj);
        case 3:
          return has16m(obj);
      }
    }
    obj.level = 0;
    obj.hasBasic = false;
    obj.has256 = false;
    obj.has16m = false;
    if (typeof process === "undefined" || !process || !process.stdout || !process.env || !process.platform) {
      return hasNone(obj, options);
    }
    var env = options.env || process.env;
    var stream2 = options.stream || process.stdout;
    var term = options.term || env.TERM || "";
    var platform = options.platform || process.platform;
    if (!options.ignoreTTY && !stream2.isTTY) {
      return hasNone(obj, options);
    }
    if (!options.ignoreDumb && term === "dumb" && !env.COLORTERM) {
      return hasNone(obj, options);
    }
    if (platform === "win32") {
      return hasBasic(obj);
    }
    if (env.TMUX) {
      return has256(obj);
    }
    if (!options.ignoreCI && (env.CI || env.TEAMCITY_VERSION)) {
      if (env.TRAVIS) {
        return has256(obj);
      } else {
        return hasNone(obj, options);
      }
    }
    switch (env.TERM_PROGRAM) {
      case "iTerm.app":
        var ver = env.TERM_PROGRAM_VERSION || "0.";
        if (/^[0-2]\./.test(ver)) {
          return has256(obj);
        } else {
          return has16m(obj);
        }
      case "HyperTerm":
      case "Hyper":
        return has16m(obj);
      case "MacTerm":
        return has16m(obj);
      case "Apple_Terminal":
        return has256(obj);
    }
    if (/^xterm-256/.test(term)) {
      return has256(obj);
    }
    if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(term)) {
      return hasBasic(obj);
    }
    if (env.COLORTERM) {
      return hasBasic(obj);
    }
    return hasNone(obj, options);
  }
  return colorSupport_1;
}
var hasColor;
var hasRequiredHasColor;
function requireHasColor() {
  if (hasRequiredHasColor) return hasColor;
  hasRequiredHasColor = 1;
  var colorSupport = requireColorSupport();
  hasColor = colorSupport().hasBasic;
  return hasColor;
}
var signalExit = { exports: {} };
var signals = { exports: {} };
var hasRequiredSignals;
function requireSignals() {
  if (hasRequiredSignals) return signals.exports;
  hasRequiredSignals = 1;
  (function(module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module2.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  })(signals);
  return signals.exports;
}
var hasRequiredSignalExit;
function requireSignalExit() {
  if (hasRequiredSignalExit) return signalExit.exports;
  hasRequiredSignalExit = 1;
  var process2 = main$1.commonjsGlobal.process;
  const processOk = function(process3) {
    return process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
  };
  if (!processOk(process2)) {
    signalExit.exports = function() {
      return function() {
      };
    };
  } else {
    var assert = require$$0$6;
    var signals2 = requireSignals();
    var isWin = /^win/i.test(process2.platform);
    var EE = require$$0$3;
    if (typeof EE !== "function") {
      EE = EE.EventEmitter;
    }
    var emitter;
    if (process2.__signal_exit_emitter__) {
      emitter = process2.__signal_exit_emitter__;
    } else {
      emitter = process2.__signal_exit_emitter__ = new EE();
      emitter.count = 0;
      emitter.emitted = {};
    }
    if (!emitter.infinite) {
      emitter.setMaxListeners(Infinity);
      emitter.infinite = true;
    }
    signalExit.exports = function(cb, opts) {
      if (!processOk(main$1.commonjsGlobal.process)) {
        return function() {
        };
      }
      assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
      if (loaded === false) {
        load();
      }
      var ev = "exit";
      if (opts && opts.alwaysLast) {
        ev = "afterexit";
      }
      var remove = function() {
        emitter.removeListener(ev, cb);
        if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
          unload();
        }
      };
      emitter.on(ev, cb);
      return remove;
    };
    var unload = function unload2() {
      if (!loaded || !processOk(main$1.commonjsGlobal.process)) {
        return;
      }
      loaded = false;
      signals2.forEach(function(sig) {
        try {
          process2.removeListener(sig, sigListeners[sig]);
        } catch (er) {
        }
      });
      process2.emit = originalProcessEmit;
      process2.reallyExit = originalProcessReallyExit;
      emitter.count -= 1;
    };
    signalExit.exports.unload = unload;
    var emit = function emit2(event, code, signal) {
      if (emitter.emitted[event]) {
        return;
      }
      emitter.emitted[event] = true;
      emitter.emit(event, code, signal);
    };
    var sigListeners = {};
    signals2.forEach(function(sig) {
      sigListeners[sig] = function listener() {
        if (!processOk(main$1.commonjsGlobal.process)) {
          return;
        }
        var listeners = process2.listeners(sig);
        if (listeners.length === emitter.count) {
          unload();
          emit("exit", null, sig);
          emit("afterexit", null, sig);
          if (isWin && sig === "SIGHUP") {
            sig = "SIGINT";
          }
          process2.kill(process2.pid, sig);
        }
      };
    });
    signalExit.exports.signals = function() {
      return signals2;
    };
    var loaded = false;
    var load = function load2() {
      if (loaded || !processOk(main$1.commonjsGlobal.process)) {
        return;
      }
      loaded = true;
      emitter.count += 1;
      signals2 = signals2.filter(function(sig) {
        try {
          process2.on(sig, sigListeners[sig]);
          return true;
        } catch (er) {
          return false;
        }
      });
      process2.emit = processEmit;
      process2.reallyExit = processReallyExit;
    };
    signalExit.exports.load = load;
    var originalProcessReallyExit = process2.reallyExit;
    var processReallyExit = function processReallyExit2(code) {
      if (!processOk(main$1.commonjsGlobal.process)) {
        return;
      }
      process2.exitCode = code || /* istanbul ignore next */
      0;
      emit("exit", process2.exitCode, null);
      emit("afterexit", process2.exitCode, null);
      originalProcessReallyExit.call(process2, process2.exitCode);
    };
    var originalProcessEmit = process2.emit;
    var processEmit = function processEmit2(ev, arg) {
      if (ev === "exit" && processOk(main$1.commonjsGlobal.process)) {
        if (arg !== void 0) {
          process2.exitCode = arg;
        }
        var ret = originalProcessEmit.apply(this, arguments);
        emit("exit", process2.exitCode, null);
        emit("afterexit", process2.exitCode, null);
        return ret;
      } else {
        return originalProcessEmit.apply(this, arguments);
      }
    };
  }
  return signalExit.exports;
}
var themes = { exports: {} };
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var objectAssign;
var hasRequiredObjectAssign;
function requireObjectAssign() {
  if (hasRequiredObjectAssign) return objectAssign;
  hasRequiredObjectAssign = 1;
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;
  function toObject(val) {
    if (val === null || val === void 0) {
      throw new TypeError("Object.assign cannot be called with null or undefined");
    }
    return Object(val);
  }
  function shouldUseNative() {
    try {
      if (!Object.assign) {
        return false;
      }
      var test1 = new String("abc");
      test1[5] = "de";
      if (Object.getOwnPropertyNames(test1)[0] === "5") {
        return false;
      }
      var test2 = {};
      for (var i = 0; i < 10; i++) {
        test2["_" + String.fromCharCode(i)] = i;
      }
      var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
        return test2[n];
      });
      if (order2.join("") !== "0123456789") {
        return false;
      }
      var test3 = {};
      "abcdefghijklmnopqrst".split("").forEach(function(letter) {
        test3[letter] = letter;
      });
      if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  objectAssign = shouldUseNative() ? Object.assign : function(target, source) {
    var from;
    var to = toObject(target);
    var symbols;
    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s]);
      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from);
        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]];
          }
        }
      }
    }
    return to;
  };
  return objectAssign;
}
var spin;
var hasRequiredSpin;
function requireSpin() {
  if (hasRequiredSpin) return spin;
  hasRequiredSpin = 1;
  spin = function spin2(spinstr, spun) {
    return spinstr[spun % spinstr.length];
  };
  return spin;
}
var progressBar;
var hasRequiredProgressBar;
function requireProgressBar() {
  if (hasRequiredProgressBar) return progressBar;
  hasRequiredProgressBar = 1;
  var validate = requireAproba();
  var renderTemplate2 = requireRenderTemplate();
  var wideTruncate = requireWideTruncate();
  var stringWidth2 = requireStringWidth();
  progressBar = function(theme, width, completed) {
    validate("ONN", [theme, width, completed]);
    if (completed < 0) completed = 0;
    if (completed > 1) completed = 1;
    if (width <= 0) return "";
    var sofar = Math.round(width * completed);
    var rest = width - sofar;
    var template = [
      { type: "complete", value: repeat(theme.complete, sofar), length: sofar },
      { type: "remaining", value: repeat(theme.remaining, rest), length: rest }
    ];
    return renderTemplate2(width, template, theme);
  };
  function repeat(string, width) {
    var result = "";
    var n = width;
    do {
      if (n % 2) {
        result += string;
      }
      n = Math.floor(n / 2);
      string += string;
    } while (n && stringWidth2(result) < width);
    return wideTruncate(result, width);
  }
  return progressBar;
}
var baseTheme;
var hasRequiredBaseTheme;
function requireBaseTheme() {
  if (hasRequiredBaseTheme) return baseTheme;
  hasRequiredBaseTheme = 1;
  var spin2 = requireSpin();
  var progressBar2 = requireProgressBar();
  baseTheme = {
    activityIndicator: function(values, theme, width) {
      if (values.spun == null) return;
      return spin2(theme, values.spun);
    },
    progressbar: function(values, theme, width) {
      if (values.completed == null) return;
      return progressBar2(theme, width, values.completed);
    }
  };
  return baseTheme;
}
var themeSet;
var hasRequiredThemeSet;
function requireThemeSet() {
  if (hasRequiredThemeSet) return themeSet;
  hasRequiredThemeSet = 1;
  var objectAssign2 = requireObjectAssign();
  themeSet = function() {
    return ThemeSetProto.newThemeSet();
  };
  var ThemeSetProto = {};
  ThemeSetProto.baseTheme = requireBaseTheme();
  ThemeSetProto.newTheme = function(parent, theme) {
    if (!theme) {
      theme = parent;
      parent = this.baseTheme;
    }
    return objectAssign2({}, parent, theme);
  };
  ThemeSetProto.getThemeNames = function() {
    return Object.keys(this.themes);
  };
  ThemeSetProto.addTheme = function(name2, parent, theme) {
    this.themes[name2] = this.newTheme(parent, theme);
  };
  ThemeSetProto.addToAllThemes = function(theme) {
    var themes2 = this.themes;
    Object.keys(themes2).forEach(function(name2) {
      objectAssign2(themes2[name2], theme);
    });
    objectAssign2(this.baseTheme, theme);
  };
  ThemeSetProto.getTheme = function(name2) {
    if (!this.themes[name2]) throw this.newMissingThemeError(name2);
    return this.themes[name2];
  };
  ThemeSetProto.setDefault = function(opts, name2) {
    if (name2 == null) {
      name2 = opts;
      opts = {};
    }
    var platform = opts.platform == null ? "fallback" : opts.platform;
    var hasUnicode2 = !!opts.hasUnicode;
    var hasColor2 = !!opts.hasColor;
    if (!this.defaults[platform]) this.defaults[platform] = { true: {}, false: {} };
    this.defaults[platform][hasUnicode2][hasColor2] = name2;
  };
  ThemeSetProto.getDefault = function(opts) {
    if (!opts) opts = {};
    var platformName = opts.platform || process.platform;
    var platform = this.defaults[platformName] || this.defaults.fallback;
    var hasUnicode2 = !!opts.hasUnicode;
    var hasColor2 = !!opts.hasColor;
    if (!platform) throw this.newMissingDefaultThemeError(platformName, hasUnicode2, hasColor2);
    if (!platform[hasUnicode2][hasColor2]) {
      if (hasUnicode2 && hasColor2 && platform[!hasUnicode2][hasColor2]) {
        hasUnicode2 = false;
      } else if (hasUnicode2 && hasColor2 && platform[hasUnicode2][!hasColor2]) {
        hasColor2 = false;
      } else if (hasUnicode2 && hasColor2 && platform[!hasUnicode2][!hasColor2]) {
        hasUnicode2 = false;
        hasColor2 = false;
      } else if (hasUnicode2 && !hasColor2 && platform[!hasUnicode2][hasColor2]) {
        hasUnicode2 = false;
      } else if (!hasUnicode2 && hasColor2 && platform[hasUnicode2][!hasColor2]) {
        hasColor2 = false;
      } else if (platform === this.defaults.fallback) {
        throw this.newMissingDefaultThemeError(platformName, hasUnicode2, hasColor2);
      }
    }
    if (platform[hasUnicode2][hasColor2]) {
      return this.getTheme(platform[hasUnicode2][hasColor2]);
    } else {
      return this.getDefault(objectAssign2({}, opts, { platform: "fallback" }));
    }
  };
  ThemeSetProto.newMissingThemeError = function newMissingThemeError(name2) {
    var err = new Error('Could not find a gauge theme named "' + name2 + '"');
    Error.captureStackTrace.call(err, newMissingThemeError);
    err.theme = name2;
    err.code = "EMISSINGTHEME";
    return err;
  };
  ThemeSetProto.newMissingDefaultThemeError = function newMissingDefaultThemeError(platformName, hasUnicode2, hasColor2) {
    var err = new Error(
      "Could not find a gauge theme for your platform/unicode/color use combo:\n    platform = " + platformName + "\n    hasUnicode = " + hasUnicode2 + "\n    hasColor = " + hasColor2
    );
    Error.captureStackTrace.call(err, newMissingDefaultThemeError);
    err.platform = platformName;
    err.hasUnicode = hasUnicode2;
    err.hasColor = hasColor2;
    err.code = "EMISSINGTHEME";
    return err;
  };
  ThemeSetProto.newThemeSet = function() {
    var themeset = function(opts) {
      return themeset.getDefault(opts);
    };
    return objectAssign2(themeset, ThemeSetProto, {
      themes: objectAssign2({}, this.themes),
      baseTheme: objectAssign2({}, this.baseTheme),
      defaults: JSON.parse(JSON.stringify(this.defaults || {}))
    });
  };
  return themeSet;
}
var hasRequiredThemes;
function requireThemes() {
  if (hasRequiredThemes) return themes.exports;
  hasRequiredThemes = 1;
  var color = requireConsoleControlStrings().color;
  var ThemeSet = requireThemeSet();
  var themes$1 = themes.exports = new ThemeSet();
  themes$1.addTheme("ASCII", {
    preProgressbar: "[",
    postProgressbar: "]",
    progressbarTheme: {
      complete: "#",
      remaining: "."
    },
    activityIndicatorTheme: "-\\|/",
    preSubsection: ">"
  });
  themes$1.addTheme("colorASCII", themes$1.getTheme("ASCII"), {
    progressbarTheme: {
      preComplete: color("bgBrightWhite", "brightWhite"),
      complete: "#",
      postComplete: color("reset"),
      preRemaining: color("bgBrightBlack", "brightBlack"),
      remaining: ".",
      postRemaining: color("reset")
    }
  });
  themes$1.addTheme("brailleSpinner", {
    preProgressbar: "⸨",
    postProgressbar: "⸩",
    progressbarTheme: {
      complete: "#",
      remaining: "⠂"
    },
    activityIndicatorTheme: "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏",
    preSubsection: ">"
  });
  themes$1.addTheme("colorBrailleSpinner", themes$1.getTheme("brailleSpinner"), {
    progressbarTheme: {
      preComplete: color("bgBrightWhite", "brightWhite"),
      complete: "#",
      postComplete: color("reset"),
      preRemaining: color("bgBrightBlack", "brightBlack"),
      remaining: "⠂",
      postRemaining: color("reset")
    }
  });
  themes$1.setDefault({}, "ASCII");
  themes$1.setDefault({ hasColor: true }, "colorASCII");
  themes$1.setDefault({ platform: "darwin", hasUnicode: true }, "brailleSpinner");
  themes$1.setDefault({ platform: "darwin", hasUnicode: true, hasColor: true }, "colorBrailleSpinner");
  themes$1.setDefault({ platform: "linux", hasUnicode: true }, "brailleSpinner");
  themes$1.setDefault({ platform: "linux", hasUnicode: true, hasColor: true }, "colorBrailleSpinner");
  return themes.exports;
}
var setInterval_1;
var hasRequiredSetInterval;
function requireSetInterval() {
  if (hasRequiredSetInterval) return setInterval_1;
  hasRequiredSetInterval = 1;
  setInterval_1 = setInterval;
  return setInterval_1;
}
var process_1;
var hasRequiredProcess;
function requireProcess() {
  if (hasRequiredProcess) return process_1;
  hasRequiredProcess = 1;
  process_1 = process;
  return process_1;
}
var setImmediate$1 = { exports: {} };
var hasRequiredSetImmediate;
function requireSetImmediate() {
  if (hasRequiredSetImmediate) return setImmediate$1.exports;
  hasRequiredSetImmediate = 1;
  var process2 = requireProcess();
  try {
    setImmediate$1.exports = setImmediate;
  } catch (ex) {
    setImmediate$1.exports = process2.nextTick;
  }
  return setImmediate$1.exports;
}
var gauge;
var hasRequiredGauge;
function requireGauge() {
  if (hasRequiredGauge) return gauge;
  hasRequiredGauge = 1;
  var Plumbing = requirePlumbing();
  var hasUnicode2 = requireHasUnicode();
  var hasColor2 = requireHasColor();
  var onExit = requireSignalExit();
  var defaultThemes = requireThemes();
  var setInterval2 = requireSetInterval();
  var process2 = requireProcess();
  var setImmediate2 = requireSetImmediate();
  gauge = Gauge;
  function callWith(obj, method) {
    return function() {
      return method.call(obj);
    };
  }
  function Gauge(arg1, arg2) {
    var options, writeTo;
    if (arg1 && arg1.write) {
      writeTo = arg1;
      options = arg2 || {};
    } else if (arg2 && arg2.write) {
      writeTo = arg2;
      options = arg1 || {};
    } else {
      writeTo = process2.stderr;
      options = arg1 || arg2 || {};
    }
    this._status = {
      spun: 0,
      section: "",
      subsection: ""
    };
    this._paused = false;
    this._disabled = true;
    this._showing = false;
    this._onScreen = false;
    this._needsRedraw = false;
    this._hideCursor = options.hideCursor == null ? true : options.hideCursor;
    this._fixedFramerate = options.fixedFramerate == null ? !/^v0\.8\./.test(process2.version) : options.fixedFramerate;
    this._lastUpdateAt = null;
    this._updateInterval = options.updateInterval == null ? 50 : options.updateInterval;
    this._themes = options.themes || defaultThemes;
    this._theme = options.theme;
    var theme = this._computeTheme(options.theme);
    var template = options.template || [
      { type: "progressbar", length: 20 },
      { type: "activityIndicator", kerning: 1, length: 1 },
      { type: "section", kerning: 1, default: "" },
      { type: "subsection", kerning: 1, default: "" }
    ];
    this.setWriteTo(writeTo, options.tty);
    var PlumbingClass = options.Plumbing || Plumbing;
    this._gauge = new PlumbingClass(theme, template, this.getWidth());
    this._$$doRedraw = callWith(this, this._doRedraw);
    this._$$handleSizeChange = callWith(this, this._handleSizeChange);
    this._cleanupOnExit = options.cleanupOnExit == null || options.cleanupOnExit;
    this._removeOnExit = null;
    if (options.enabled || options.enabled == null && this._tty && this._tty.isTTY) {
      this.enable();
    } else {
      this.disable();
    }
  }
  Gauge.prototype = {};
  Gauge.prototype.isEnabled = function() {
    return !this._disabled;
  };
  Gauge.prototype.setTemplate = function(template) {
    this._gauge.setTemplate(template);
    if (this._showing) this._requestRedraw();
  };
  Gauge.prototype._computeTheme = function(theme) {
    if (!theme) theme = {};
    if (typeof theme === "string") {
      theme = this._themes.getTheme(theme);
    } else if (theme && (Object.keys(theme).length === 0 || theme.hasUnicode != null || theme.hasColor != null)) {
      var useUnicode = theme.hasUnicode == null ? hasUnicode2() : theme.hasUnicode;
      var useColor = theme.hasColor == null ? hasColor2 : theme.hasColor;
      theme = this._themes.getDefault({ hasUnicode: useUnicode, hasColor: useColor, platform: theme.platform });
    }
    return theme;
  };
  Gauge.prototype.setThemeset = function(themes2) {
    this._themes = themes2;
    this.setTheme(this._theme);
  };
  Gauge.prototype.setTheme = function(theme) {
    this._gauge.setTheme(this._computeTheme(theme));
    if (this._showing) this._requestRedraw();
    this._theme = theme;
  };
  Gauge.prototype._requestRedraw = function() {
    this._needsRedraw = true;
    if (!this._fixedFramerate) this._doRedraw();
  };
  Gauge.prototype.getWidth = function() {
    return (this._tty && this._tty.columns || 80) - 1;
  };
  Gauge.prototype.setWriteTo = function(writeTo, tty) {
    var enabled = !this._disabled;
    if (enabled) this.disable();
    this._writeTo = writeTo;
    this._tty = tty || writeTo === process2.stderr && process2.stdout.isTTY && process2.stdout || writeTo.isTTY && writeTo || this._tty;
    if (this._gauge) this._gauge.setWidth(this.getWidth());
    if (enabled) this.enable();
  };
  Gauge.prototype.enable = function() {
    if (!this._disabled) return;
    this._disabled = false;
    if (this._tty) this._enableEvents();
    if (this._showing) this.show();
  };
  Gauge.prototype.disable = function() {
    if (this._disabled) return;
    if (this._showing) {
      this._lastUpdateAt = null;
      this._showing = false;
      this._doRedraw();
      this._showing = true;
    }
    this._disabled = true;
    if (this._tty) this._disableEvents();
  };
  Gauge.prototype._enableEvents = function() {
    if (this._cleanupOnExit) {
      this._removeOnExit = onExit(callWith(this, this.disable));
    }
    this._tty.on("resize", this._$$handleSizeChange);
    if (this._fixedFramerate) {
      this.redrawTracker = setInterval2(this._$$doRedraw, this._updateInterval);
      if (this.redrawTracker.unref) this.redrawTracker.unref();
    }
  };
  Gauge.prototype._disableEvents = function() {
    this._tty.removeListener("resize", this._$$handleSizeChange);
    if (this._fixedFramerate) clearInterval(this.redrawTracker);
    if (this._removeOnExit) this._removeOnExit();
  };
  Gauge.prototype.hide = function(cb) {
    if (this._disabled) return cb && process2.nextTick(cb);
    if (!this._showing) return cb && process2.nextTick(cb);
    this._showing = false;
    this._doRedraw();
    cb && setImmediate2(cb);
  };
  Gauge.prototype.show = function(section, completed) {
    this._showing = true;
    if (typeof section === "string") {
      this._status.section = section;
    } else if (typeof section === "object") {
      var sectionKeys = Object.keys(section);
      for (var ii = 0; ii < sectionKeys.length; ++ii) {
        var key = sectionKeys[ii];
        this._status[key] = section[key];
      }
    }
    if (completed != null) this._status.completed = completed;
    if (this._disabled) return;
    this._requestRedraw();
  };
  Gauge.prototype.pulse = function(subsection) {
    this._status.subsection = subsection || "";
    this._status.spun++;
    if (this._disabled) return;
    if (!this._showing) return;
    this._requestRedraw();
  };
  Gauge.prototype._handleSizeChange = function() {
    this._gauge.setWidth(this._tty.columns - 1);
    this._requestRedraw();
  };
  Gauge.prototype._doRedraw = function() {
    if (this._disabled || this._paused) return;
    if (!this._fixedFramerate) {
      var now = Date.now();
      if (this._lastUpdateAt && now - this._lastUpdateAt < this._updateInterval) return;
      this._lastUpdateAt = now;
    }
    if (!this._showing && this._onScreen) {
      this._onScreen = false;
      var result = this._gauge.hide();
      if (this._hideCursor) {
        result += this._gauge.showCursor();
      }
      return this._writeTo.write(result);
    }
    if (!this._showing && !this._onScreen) return;
    if (this._showing && !this._onScreen) {
      this._onScreen = true;
      this._needsRedraw = true;
      if (this._hideCursor) {
        this._writeTo.write(this._gauge.hideCursor());
      }
    }
    if (!this._needsRedraw) return;
    if (!this._writeTo.write(this._gauge.show(this._status))) {
      this._paused = true;
      this._writeTo.on("drain", callWith(this, function() {
        this._paused = false;
        this._doRedraw();
      }));
    }
  };
  return gauge;
}
var setBlocking;
var hasRequiredSetBlocking;
function requireSetBlocking() {
  if (hasRequiredSetBlocking) return setBlocking;
  hasRequiredSetBlocking = 1;
  setBlocking = function(blocking) {
    [process.stdout, process.stderr].forEach(function(stream2) {
      if (stream2._handle && stream2.isTTY && typeof stream2._handle.setBlocking === "function") {
        stream2._handle.setBlocking(blocking);
      }
    });
  };
  return setBlocking;
}
var hasRequiredLog;
function requireLog() {
  if (hasRequiredLog) return log.exports;
  hasRequiredLog = 1;
  (function(module2, exports$1) {
    var Progress = requireLib();
    var Gauge = requireGauge();
    var EE = require$$0$3.EventEmitter;
    var log2 = module2.exports = new EE();
    var util = require$$0$4;
    var setBlocking2 = requireSetBlocking();
    var consoleControl = requireConsoleControlStrings();
    setBlocking2(true);
    var stream2 = process.stderr;
    Object.defineProperty(log2, "stream", {
      set: function(newStream) {
        stream2 = newStream;
        if (this.gauge) {
          this.gauge.setWriteTo(stream2, stream2);
        }
      },
      get: function() {
        return stream2;
      }
    });
    var colorEnabled;
    log2.useColor = function() {
      return colorEnabled != null ? colorEnabled : stream2.isTTY;
    };
    log2.enableColor = function() {
      colorEnabled = true;
      this.gauge.setTheme({ hasColor: colorEnabled, hasUnicode: unicodeEnabled });
    };
    log2.disableColor = function() {
      colorEnabled = false;
      this.gauge.setTheme({ hasColor: colorEnabled, hasUnicode: unicodeEnabled });
    };
    log2.level = "info";
    log2.gauge = new Gauge(stream2, {
      enabled: false,
      // no progress bars unless asked
      theme: { hasColor: log2.useColor() },
      template: [
        { type: "progressbar", length: 20 },
        { type: "activityIndicator", kerning: 1, length: 1 },
        { type: "section", default: "" },
        ":",
        { type: "logline", kerning: 1, default: "" }
      ]
    });
    log2.tracker = new Progress.TrackerGroup();
    log2.progressEnabled = log2.gauge.isEnabled();
    var unicodeEnabled;
    log2.enableUnicode = function() {
      unicodeEnabled = true;
      this.gauge.setTheme({ hasColor: this.useColor(), hasUnicode: unicodeEnabled });
    };
    log2.disableUnicode = function() {
      unicodeEnabled = false;
      this.gauge.setTheme({ hasColor: this.useColor(), hasUnicode: unicodeEnabled });
    };
    log2.setGaugeThemeset = function(themes2) {
      this.gauge.setThemeset(themes2);
    };
    log2.setGaugeTemplate = function(template) {
      this.gauge.setTemplate(template);
    };
    log2.enableProgress = function() {
      if (this.progressEnabled) {
        return;
      }
      this.progressEnabled = true;
      this.tracker.on("change", this.showProgress);
      if (this._paused) {
        return;
      }
      this.gauge.enable();
    };
    log2.disableProgress = function() {
      if (!this.progressEnabled) {
        return;
      }
      this.progressEnabled = false;
      this.tracker.removeListener("change", this.showProgress);
      this.gauge.disable();
    };
    var trackerConstructors = ["newGroup", "newItem", "newStream"];
    var mixinLog = function(tracker2) {
      Object.keys(log2).forEach(function(P) {
        if (P[0] === "_") {
          return;
        }
        if (trackerConstructors.filter(function(C) {
          return C === P;
        }).length) {
          return;
        }
        if (tracker2[P]) {
          return;
        }
        if (typeof log2[P] !== "function") {
          return;
        }
        var func = log2[P];
        tracker2[P] = function() {
          return func.apply(log2, arguments);
        };
      });
      if (tracker2 instanceof Progress.TrackerGroup) {
        trackerConstructors.forEach(function(C) {
          var func = tracker2[C];
          tracker2[C] = function() {
            return mixinLog(func.apply(tracker2, arguments));
          };
        });
      }
      return tracker2;
    };
    trackerConstructors.forEach(function(C) {
      log2[C] = function() {
        return mixinLog(this.tracker[C].apply(this.tracker, arguments));
      };
    });
    log2.clearProgress = function(cb) {
      if (!this.progressEnabled) {
        return cb && process.nextTick(cb);
      }
      this.gauge.hide(cb);
    };
    log2.showProgress = function(name2, completed) {
      if (!this.progressEnabled) {
        return;
      }
      var values = {};
      if (name2) {
        values.section = name2;
      }
      var last = log2.record[log2.record.length - 1];
      if (last) {
        values.subsection = last.prefix;
        var disp = log2.disp[last.level] || last.level;
        var logline = this._format(disp, log2.style[last.level]);
        if (last.prefix) {
          logline += " " + this._format(last.prefix, this.prefixStyle);
        }
        logline += " " + last.message.split(/\r?\n/)[0];
        values.logline = logline;
      }
      values.completed = completed || this.tracker.completed();
      this.gauge.show(values);
    }.bind(log2);
    log2.pause = function() {
      this._paused = true;
      if (this.progressEnabled) {
        this.gauge.disable();
      }
    };
    log2.resume = function() {
      if (!this._paused) {
        return;
      }
      this._paused = false;
      var b = this._buffer;
      this._buffer = [];
      b.forEach(function(m) {
        this.emitLog(m);
      }, this);
      if (this.progressEnabled) {
        this.gauge.enable();
      }
    };
    log2._buffer = [];
    var id = 0;
    log2.record = [];
    log2.maxRecordSize = 1e4;
    log2.log = function(lvl, prefix, message) {
      var l = this.levels[lvl];
      if (l === void 0) {
        return this.emit("error", new Error(util.format(
          "Undefined log level: %j",
          lvl
        )));
      }
      var a = new Array(arguments.length - 2);
      var stack = null;
      for (var i = 2; i < arguments.length; i++) {
        var arg = a[i - 2] = arguments[i];
        if (typeof arg === "object" && arg instanceof Error && arg.stack) {
          Object.defineProperty(arg, "stack", {
            value: stack = arg.stack + "",
            enumerable: true,
            writable: true
          });
        }
      }
      if (stack) {
        a.unshift(stack + "\n");
      }
      message = util.format.apply(util, a);
      var m = {
        id: id++,
        level: lvl,
        prefix: String(prefix || ""),
        message,
        messageRaw: a
      };
      this.emit("log", m);
      this.emit("log." + lvl, m);
      if (m.prefix) {
        this.emit(m.prefix, m);
      }
      this.record.push(m);
      var mrs = this.maxRecordSize;
      var n = this.record.length - mrs;
      if (n > mrs / 10) {
        var newSize = Math.floor(mrs * 0.9);
        this.record = this.record.slice(-1 * newSize);
      }
      this.emitLog(m);
    }.bind(log2);
    log2.emitLog = function(m) {
      if (this._paused) {
        this._buffer.push(m);
        return;
      }
      if (this.progressEnabled) {
        this.gauge.pulse(m.prefix);
      }
      var l = this.levels[m.level];
      if (l === void 0) {
        return;
      }
      if (l < this.levels[this.level]) {
        return;
      }
      if (l > 0 && !isFinite(l)) {
        return;
      }
      var disp = log2.disp[m.level] != null ? log2.disp[m.level] : m.level;
      this.clearProgress();
      m.message.split(/\r?\n/).forEach(function(line) {
        if (this.heading) {
          this.write(this.heading, this.headingStyle);
          this.write(" ");
        }
        this.write(disp, log2.style[m.level]);
        var p = m.prefix || "";
        if (p) {
          this.write(" ");
        }
        this.write(p, this.prefixStyle);
        this.write(" " + line + "\n");
      }, this);
      this.showProgress();
    };
    log2._format = function(msg, style) {
      if (!stream2) {
        return;
      }
      var output = "";
      if (this.useColor()) {
        style = style || {};
        var settings = [];
        if (style.fg) {
          settings.push(style.fg);
        }
        if (style.bg) {
          settings.push("bg" + style.bg[0].toUpperCase() + style.bg.slice(1));
        }
        if (style.bold) {
          settings.push("bold");
        }
        if (style.underline) {
          settings.push("underline");
        }
        if (style.inverse) {
          settings.push("inverse");
        }
        if (settings.length) {
          output += consoleControl.color(settings);
        }
        if (style.beep) {
          output += consoleControl.beep();
        }
      }
      output += msg;
      if (this.useColor()) {
        output += consoleControl.color("reset");
      }
      return output;
    };
    log2.write = function(msg, style) {
      if (!stream2) {
        return;
      }
      stream2.write(this._format(msg, style));
    };
    log2.addLevel = function(lvl, n, style, disp) {
      if (disp == null) {
        disp = lvl;
      }
      this.levels[lvl] = n;
      this.style[lvl] = style;
      if (!this[lvl]) {
        this[lvl] = function() {
          var a = new Array(arguments.length + 1);
          a[0] = lvl;
          for (var i = 0; i < arguments.length; i++) {
            a[i + 1] = arguments[i];
          }
          return this.log.apply(this, a);
        }.bind(this);
      }
      this.disp[lvl] = disp;
    };
    log2.prefixStyle = { fg: "magenta" };
    log2.headingStyle = { fg: "white", bg: "black" };
    log2.style = {};
    log2.levels = {};
    log2.disp = {};
    log2.addLevel("silly", -Infinity, { inverse: true }, "sill");
    log2.addLevel("verbose", 1e3, { fg: "blue", bg: "black" }, "verb");
    log2.addLevel("info", 2e3, { fg: "green" });
    log2.addLevel("timing", 2500, { fg: "green", bg: "black" });
    log2.addLevel("http", 3e3, { fg: "green", bg: "black" });
    log2.addLevel("notice", 3500, { fg: "blue", bg: "black" });
    log2.addLevel("warn", 4e3, { fg: "black", bg: "yellow" }, "WARN");
    log2.addLevel("error", 5e3, { fg: "red", bg: "black" }, "ERR!");
    log2.addLevel("silent", Infinity);
    log2.on("error", function() {
    });
  })(log);
  return log.exports;
}
var napi = { exports: {} };
var rimraf_1;
var hasRequiredRimraf;
function requireRimraf() {
  if (hasRequiredRimraf) return rimraf_1;
  hasRequiredRimraf = 1;
  const assert = require$$0$6;
  const path2 = require$$1;
  const fs2 = require$$0$1;
  let glob = void 0;
  try {
    glob = main$1.requireGlob();
  } catch (_err) {
  }
  const defaultGlobOpts = {
    nosort: true,
    silent: true
  };
  let timeout = 0;
  const isWindows = process.platform === "win32";
  const defaults = (options) => {
    const methods = [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ];
    methods.forEach((m) => {
      options[m] = options[m] || fs2[m];
      m = m + "Sync";
      options[m] = options[m] || fs2[m];
    });
    options.maxBusyTries = options.maxBusyTries || 3;
    options.emfileWait = options.emfileWait || 1e3;
    if (options.glob === false) {
      options.disableGlob = true;
    }
    if (options.disableGlob !== true && glob === void 0) {
      throw Error("glob dependency not found, set `options.disableGlob = true` if intentional");
    }
    options.disableGlob = options.disableGlob || false;
    options.glob = options.glob || defaultGlobOpts;
  };
  const rimraf = (p, options, cb) => {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    assert(p, "rimraf: missing path");
    assert.equal(typeof p, "string", "rimraf: path should be a string");
    assert.equal(typeof cb, "function", "rimraf: callback function required");
    assert(options, "rimraf: invalid options argument provided");
    assert.equal(typeof options, "object", "rimraf: options should be object");
    defaults(options);
    let busyTries = 0;
    let errState = null;
    let n = 0;
    const next = (er) => {
      errState = errState || er;
      if (--n === 0)
        cb(errState);
    };
    const afterGlob = (er, results) => {
      if (er)
        return cb(er);
      n = results.length;
      if (n === 0)
        return cb();
      results.forEach((p2) => {
        const CB = (er2) => {
          if (er2) {
            if ((er2.code === "EBUSY" || er2.code === "ENOTEMPTY" || er2.code === "EPERM") && busyTries < options.maxBusyTries) {
              busyTries++;
              return setTimeout(() => rimraf_(p2, options, CB), busyTries * 100);
            }
            if (er2.code === "EMFILE" && timeout < options.emfileWait) {
              return setTimeout(() => rimraf_(p2, options, CB), timeout++);
            }
            if (er2.code === "ENOENT") er2 = null;
          }
          timeout = 0;
          next(er2);
        };
        rimraf_(p2, options, CB);
      });
    };
    if (options.disableGlob || !glob.hasMagic(p))
      return afterGlob(null, [p]);
    options.lstat(p, (er, stat) => {
      if (!er)
        return afterGlob(null, [p]);
      glob(p, options.glob, afterGlob);
    });
  };
  const rimraf_ = (p, options, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.lstat(p, (er, st) => {
      if (er && er.code === "ENOENT")
        return cb(null);
      if (er && er.code === "EPERM" && isWindows)
        fixWinEPERM(p, options, er, cb);
      if (st && st.isDirectory())
        return rmdir(p, options, er, cb);
      options.unlink(p, (er2) => {
        if (er2) {
          if (er2.code === "ENOENT")
            return cb(null);
          if (er2.code === "EPERM")
            return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
          if (er2.code === "EISDIR")
            return rmdir(p, options, er2, cb);
        }
        return cb(er2);
      });
    });
  };
  const fixWinEPERM = (p, options, er, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.chmod(p, 438, (er2) => {
      if (er2)
        cb(er2.code === "ENOENT" ? null : er);
      else
        options.stat(p, (er3, stats) => {
          if (er3)
            cb(er3.code === "ENOENT" ? null : er);
          else if (stats.isDirectory())
            rmdir(p, options, er, cb);
          else
            options.unlink(p, cb);
        });
    });
  };
  const fixWinEPERMSync = (p, options, er) => {
    assert(p);
    assert(options);
    try {
      options.chmodSync(p, 438);
    } catch (er2) {
      if (er2.code === "ENOENT")
        return;
      else
        throw er;
    }
    let stats;
    try {
      stats = options.statSync(p);
    } catch (er3) {
      if (er3.code === "ENOENT")
        return;
      else
        throw er;
    }
    if (stats.isDirectory())
      rmdirSync(p, options, er);
    else
      options.unlinkSync(p);
  };
  const rmdir = (p, options, originalEr, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.rmdir(p, (er) => {
      if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
        rmkids(p, options, cb);
      else if (er && er.code === "ENOTDIR")
        cb(originalEr);
      else
        cb(er);
    });
  };
  const rmkids = (p, options, cb) => {
    assert(p);
    assert(options);
    assert(typeof cb === "function");
    options.readdir(p, (er, files) => {
      if (er)
        return cb(er);
      let n = files.length;
      if (n === 0)
        return options.rmdir(p, cb);
      let errState;
      files.forEach((f) => {
        rimraf(path2.join(p, f), options, (er2) => {
          if (errState)
            return;
          if (er2)
            return cb(errState = er2);
          if (--n === 0)
            options.rmdir(p, cb);
        });
      });
    });
  };
  const rimrafSync = (p, options) => {
    options = options || {};
    defaults(options);
    assert(p, "rimraf: missing path");
    assert.equal(typeof p, "string", "rimraf: path should be a string");
    assert(options, "rimraf: missing options");
    assert.equal(typeof options, "object", "rimraf: options should be object");
    let results;
    if (options.disableGlob || !glob.hasMagic(p)) {
      results = [p];
    } else {
      try {
        options.lstatSync(p);
        results = [p];
      } catch (er) {
        results = glob.sync(p, options.glob);
      }
    }
    if (!results.length)
      return;
    for (let i = 0; i < results.length; i++) {
      const p2 = results[i];
      let st;
      try {
        st = options.lstatSync(p2);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM" && isWindows)
          fixWinEPERMSync(p2, options, er);
      }
      try {
        if (st && st.isDirectory())
          rmdirSync(p2, options, null);
        else
          options.unlinkSync(p2);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "EPERM")
          return isWindows ? fixWinEPERMSync(p2, options, er) : rmdirSync(p2, options, er);
        if (er.code !== "EISDIR")
          throw er;
        rmdirSync(p2, options, er);
      }
    }
  };
  const rmdirSync = (p, options, originalEr) => {
    assert(p);
    assert(options);
    try {
      options.rmdirSync(p);
    } catch (er) {
      if (er.code === "ENOENT")
        return;
      if (er.code === "ENOTDIR")
        throw originalEr;
      if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
        rmkidsSync(p, options);
    }
  };
  const rmkidsSync = (p, options) => {
    assert(p);
    assert(options);
    options.readdirSync(p).forEach((f) => rimrafSync(path2.join(p, f), options));
    const retries = isWindows ? 100 : 1;
    let i = 0;
    do {
      let threw = true;
      try {
        const ret = options.rmdirSync(p, options);
        threw = false;
        return ret;
      } finally {
        if (++i < retries && threw)
          continue;
      }
    } while (true);
  };
  rimraf_1 = rimraf;
  rimraf.sync = rimrafSync;
  return rimraf_1;
}
napi.exports;
var hasRequiredNapi;
function requireNapi() {
  if (hasRequiredNapi) return napi.exports;
  hasRequiredNapi = 1;
  (function(module2, exports$1) {
    const fs2 = require$$0$1;
    module2.exports = exports$1;
    const versionArray = process.version.substr(1).replace(/-.*$/, "").split(".").map((item) => {
      return +item;
    });
    const napi_multiple_commands = [
      "build",
      "clean",
      "configure",
      "package",
      "publish",
      "reveal",
      "testbinary",
      "testpackage",
      "unpublish"
    ];
    const napi_build_version_tag = "napi_build_version=";
    module2.exports.get_napi_version = function() {
      let version2 = process.versions.napi;
      if (!version2) {
        if (versionArray[0] === 9 && versionArray[1] >= 3) version2 = 2;
        else if (versionArray[0] === 8) version2 = 1;
      }
      return version2;
    };
    module2.exports.get_napi_version_as_string = function(target) {
      const version2 = module2.exports.get_napi_version(target);
      return version2 ? "" + version2 : "";
    };
    module2.exports.validate_package_json = function(package_json, opts) {
      const binary = package_json.binary;
      const module_path_ok = pathOK(binary.module_path);
      const remote_path_ok = pathOK(binary.remote_path);
      const package_name_ok = pathOK(binary.package_name);
      const napi_build_versions = module2.exports.get_napi_build_versions(package_json, opts, true);
      const napi_build_versions_raw = module2.exports.get_napi_build_versions_raw(package_json);
      if (napi_build_versions) {
        napi_build_versions.forEach((napi_build_version) => {
          if (!(parseInt(napi_build_version, 10) === napi_build_version && napi_build_version > 0)) {
            throw new Error("All values specified in napi_versions must be positive integers.");
          }
        });
      }
      if (napi_build_versions && (!module_path_ok || !remote_path_ok && !package_name_ok)) {
        throw new Error("When napi_versions is specified; module_path and either remote_path or package_name must contain the substitution string '{napi_build_version}`.");
      }
      if ((module_path_ok || remote_path_ok || package_name_ok) && !napi_build_versions_raw) {
        throw new Error("When the substitution string '{napi_build_version}` is specified in module_path, remote_path, or package_name; napi_versions must also be specified.");
      }
      if (napi_build_versions && !module2.exports.get_best_napi_build_version(package_json, opts) && module2.exports.build_napi_only(package_json)) {
        throw new Error(
          "The Node-API version of this Node instance is " + module2.exports.get_napi_version(opts ? opts.target : void 0) + ". This module supports Node-API version(s) " + module2.exports.get_napi_build_versions_raw(package_json) + ". This Node instance cannot run this module."
        );
      }
      if (napi_build_versions_raw && !napi_build_versions && module2.exports.build_napi_only(package_json)) {
        throw new Error(
          "The Node-API version of this Node instance is " + module2.exports.get_napi_version(opts ? opts.target : void 0) + ". This module supports Node-API version(s) " + module2.exports.get_napi_build_versions_raw(package_json) + ". This Node instance cannot run this module."
        );
      }
    };
    function pathOK(path2) {
      return path2 && (path2.indexOf("{napi_build_version}") !== -1 || path2.indexOf("{node_napi_label}") !== -1);
    }
    module2.exports.expand_commands = function(package_json, opts, commands) {
      const expanded_commands = [];
      const napi_build_versions = module2.exports.get_napi_build_versions(package_json, opts);
      commands.forEach((command) => {
        if (napi_build_versions && command.name === "install") {
          const napi_build_version = module2.exports.get_best_napi_build_version(package_json, opts);
          const args = napi_build_version ? [napi_build_version_tag + napi_build_version] : [];
          expanded_commands.push({ name: command.name, args });
        } else if (napi_build_versions && napi_multiple_commands.indexOf(command.name) !== -1) {
          napi_build_versions.forEach((napi_build_version) => {
            const args = command.args.slice();
            args.push(napi_build_version_tag + napi_build_version);
            expanded_commands.push({ name: command.name, args });
          });
        } else {
          expanded_commands.push(command);
        }
      });
      return expanded_commands;
    };
    module2.exports.get_napi_build_versions = function(package_json, opts, warnings) {
      const log2 = requireLog();
      let napi_build_versions = [];
      const supported_napi_version = module2.exports.get_napi_version(opts ? opts.target : void 0);
      if (package_json.binary && package_json.binary.napi_versions) {
        package_json.binary.napi_versions.forEach((napi_version) => {
          const duplicated = napi_build_versions.indexOf(napi_version) !== -1;
          if (!duplicated && supported_napi_version && napi_version <= supported_napi_version) {
            napi_build_versions.push(napi_version);
          } else if (warnings && !duplicated && supported_napi_version) {
            log2.info("This Node instance does not support builds for Node-API version", napi_version);
          }
        });
      }
      if (opts && opts["build-latest-napi-version-only"]) {
        let latest_version = 0;
        napi_build_versions.forEach((napi_version) => {
          if (napi_version > latest_version) latest_version = napi_version;
        });
        napi_build_versions = latest_version ? [latest_version] : [];
      }
      return napi_build_versions.length ? napi_build_versions : void 0;
    };
    module2.exports.get_napi_build_versions_raw = function(package_json) {
      const napi_build_versions = [];
      if (package_json.binary && package_json.binary.napi_versions) {
        package_json.binary.napi_versions.forEach((napi_version) => {
          if (napi_build_versions.indexOf(napi_version) === -1) {
            napi_build_versions.push(napi_version);
          }
        });
      }
      return napi_build_versions.length ? napi_build_versions : void 0;
    };
    module2.exports.get_command_arg = function(napi_build_version) {
      return napi_build_version_tag + napi_build_version;
    };
    module2.exports.get_napi_build_version_from_command_args = function(command_args) {
      for (let i = 0; i < command_args.length; i++) {
        const arg = command_args[i];
        if (arg.indexOf(napi_build_version_tag) === 0) {
          return parseInt(arg.substr(napi_build_version_tag.length), 10);
        }
      }
      return void 0;
    };
    module2.exports.swap_build_dir_out = function(napi_build_version) {
      if (napi_build_version) {
        const rm = requireRimraf();
        rm.sync(module2.exports.get_build_dir(napi_build_version));
        fs2.renameSync("build", module2.exports.get_build_dir(napi_build_version));
      }
    };
    module2.exports.swap_build_dir_in = function(napi_build_version) {
      if (napi_build_version) {
        const rm = requireRimraf();
        rm.sync("build");
        fs2.renameSync(module2.exports.get_build_dir(napi_build_version), "build");
      }
    };
    module2.exports.get_build_dir = function(napi_build_version) {
      return "build-tmp-napi-v" + napi_build_version;
    };
    module2.exports.get_best_napi_build_version = function(package_json, opts) {
      let best_napi_build_version = 0;
      const napi_build_versions = module2.exports.get_napi_build_versions(package_json, opts);
      if (napi_build_versions) {
        const our_napi_version = module2.exports.get_napi_version(opts ? opts.target : void 0);
        napi_build_versions.forEach((napi_build_version) => {
          if (napi_build_version > best_napi_build_version && napi_build_version <= our_napi_version) {
            best_napi_build_version = napi_build_version;
          }
        });
      }
      return best_napi_build_version === 0 ? void 0 : best_napi_build_version;
    };
    module2.exports.build_napi_only = function(package_json) {
      return package_json.binary && package_json.binary.package_name && package_json.binary.package_name.indexOf("{node_napi_label}") === -1;
    };
  })(napi, napi.exports);
  return napi.exports;
}
var preBinding = { exports: {} };
var versioning = { exports: {} };
const require$$5 = {
  "0.1.14": { "node_abi": null, "v8": "1.3" },
  "0.1.15": { "node_abi": null, "v8": "1.3" },
  "0.1.16": { "node_abi": null, "v8": "1.3" },
  "0.1.17": { "node_abi": null, "v8": "1.3" },
  "0.1.18": { "node_abi": null, "v8": "1.3" },
  "0.1.19": { "node_abi": null, "v8": "2.0" },
  "0.1.20": { "node_abi": null, "v8": "2.0" },
  "0.1.21": { "node_abi": null, "v8": "2.0" },
  "0.1.22": { "node_abi": null, "v8": "2.0" },
  "0.1.23": { "node_abi": null, "v8": "2.0" },
  "0.1.24": { "node_abi": null, "v8": "2.0" },
  "0.1.25": { "node_abi": null, "v8": "2.0" },
  "0.1.26": { "node_abi": null, "v8": "2.0" },
  "0.1.27": { "node_abi": null, "v8": "2.1" },
  "0.1.28": { "node_abi": null, "v8": "2.1" },
  "0.1.29": { "node_abi": null, "v8": "2.1" },
  "0.1.30": { "node_abi": null, "v8": "2.1" },
  "0.1.31": { "node_abi": null, "v8": "2.1" },
  "0.1.32": { "node_abi": null, "v8": "2.1" },
  "0.1.33": { "node_abi": null, "v8": "2.1" },
  "0.1.90": { "node_abi": null, "v8": "2.2" },
  "0.1.91": { "node_abi": null, "v8": "2.2" },
  "0.1.92": { "node_abi": null, "v8": "2.2" },
  "0.1.93": { "node_abi": null, "v8": "2.2" },
  "0.1.94": { "node_abi": null, "v8": "2.2" },
  "0.1.95": { "node_abi": null, "v8": "2.2" },
  "0.1.96": { "node_abi": null, "v8": "2.2" },
  "0.1.97": { "node_abi": null, "v8": "2.2" },
  "0.1.98": { "node_abi": null, "v8": "2.2" },
  "0.1.99": { "node_abi": null, "v8": "2.2" },
  "0.1.100": { "node_abi": null, "v8": "2.2" },
  "0.1.101": { "node_abi": null, "v8": "2.3" },
  "0.1.102": { "node_abi": null, "v8": "2.3" },
  "0.1.103": { "node_abi": null, "v8": "2.3" },
  "0.1.104": { "node_abi": null, "v8": "2.3" },
  "0.2.0": { "node_abi": 1, "v8": "2.3" },
  "0.2.1": { "node_abi": 1, "v8": "2.3" },
  "0.2.2": { "node_abi": 1, "v8": "2.3" },
  "0.2.3": { "node_abi": 1, "v8": "2.3" },
  "0.2.4": { "node_abi": 1, "v8": "2.3" },
  "0.2.5": { "node_abi": 1, "v8": "2.3" },
  "0.2.6": { "node_abi": 1, "v8": "2.3" },
  "0.3.0": { "node_abi": 1, "v8": "2.5" },
  "0.3.1": { "node_abi": 1, "v8": "2.5" },
  "0.3.2": { "node_abi": 1, "v8": "3.0" },
  "0.3.3": { "node_abi": 1, "v8": "3.0" },
  "0.3.4": { "node_abi": 1, "v8": "3.0" },
  "0.3.5": { "node_abi": 1, "v8": "3.0" },
  "0.3.6": { "node_abi": 1, "v8": "3.0" },
  "0.3.7": { "node_abi": 1, "v8": "3.0" },
  "0.3.8": { "node_abi": 1, "v8": "3.1" },
  "0.4.0": { "node_abi": 1, "v8": "3.1" },
  "0.4.1": { "node_abi": 1, "v8": "3.1" },
  "0.4.2": { "node_abi": 1, "v8": "3.1" },
  "0.4.3": { "node_abi": 1, "v8": "3.1" },
  "0.4.4": { "node_abi": 1, "v8": "3.1" },
  "0.4.5": { "node_abi": 1, "v8": "3.1" },
  "0.4.6": { "node_abi": 1, "v8": "3.1" },
  "0.4.7": { "node_abi": 1, "v8": "3.1" },
  "0.4.8": { "node_abi": 1, "v8": "3.1" },
  "0.4.9": { "node_abi": 1, "v8": "3.1" },
  "0.4.10": { "node_abi": 1, "v8": "3.1" },
  "0.4.11": { "node_abi": 1, "v8": "3.1" },
  "0.4.12": { "node_abi": 1, "v8": "3.1" },
  "0.5.0": { "node_abi": 1, "v8": "3.1" },
  "0.5.1": { "node_abi": 1, "v8": "3.4" },
  "0.5.2": { "node_abi": 1, "v8": "3.4" },
  "0.5.3": { "node_abi": 1, "v8": "3.4" },
  "0.5.4": { "node_abi": 1, "v8": "3.5" },
  "0.5.5": { "node_abi": 1, "v8": "3.5" },
  "0.5.6": { "node_abi": 1, "v8": "3.6" },
  "0.5.7": { "node_abi": 1, "v8": "3.6" },
  "0.5.8": { "node_abi": 1, "v8": "3.6" },
  "0.5.9": { "node_abi": 1, "v8": "3.6" },
  "0.5.10": { "node_abi": 1, "v8": "3.7" },
  "0.6.0": { "node_abi": 1, "v8": "3.6" },
  "0.6.1": { "node_abi": 1, "v8": "3.6" },
  "0.6.2": { "node_abi": 1, "v8": "3.6" },
  "0.6.3": { "node_abi": 1, "v8": "3.6" },
  "0.6.4": { "node_abi": 1, "v8": "3.6" },
  "0.6.5": { "node_abi": 1, "v8": "3.6" },
  "0.6.6": { "node_abi": 1, "v8": "3.6" },
  "0.6.7": { "node_abi": 1, "v8": "3.6" },
  "0.6.8": { "node_abi": 1, "v8": "3.6" },
  "0.6.9": { "node_abi": 1, "v8": "3.6" },
  "0.6.10": { "node_abi": 1, "v8": "3.6" },
  "0.6.11": { "node_abi": 1, "v8": "3.6" },
  "0.6.12": { "node_abi": 1, "v8": "3.6" },
  "0.6.13": { "node_abi": 1, "v8": "3.6" },
  "0.6.14": { "node_abi": 1, "v8": "3.6" },
  "0.6.15": { "node_abi": 1, "v8": "3.6" },
  "0.6.16": { "node_abi": 1, "v8": "3.6" },
  "0.6.17": { "node_abi": 1, "v8": "3.6" },
  "0.6.18": { "node_abi": 1, "v8": "3.6" },
  "0.6.19": { "node_abi": 1, "v8": "3.6" },
  "0.6.20": { "node_abi": 1, "v8": "3.6" },
  "0.6.21": { "node_abi": 1, "v8": "3.6" },
  "0.7.0": { "node_abi": 1, "v8": "3.8" },
  "0.7.1": { "node_abi": 1, "v8": "3.8" },
  "0.7.2": { "node_abi": 1, "v8": "3.8" },
  "0.7.3": { "node_abi": 1, "v8": "3.9" },
  "0.7.4": { "node_abi": 1, "v8": "3.9" },
  "0.7.5": { "node_abi": 1, "v8": "3.9" },
  "0.7.6": { "node_abi": 1, "v8": "3.9" },
  "0.7.7": { "node_abi": 1, "v8": "3.9" },
  "0.7.8": { "node_abi": 1, "v8": "3.9" },
  "0.7.9": { "node_abi": 1, "v8": "3.11" },
  "0.7.10": { "node_abi": 1, "v8": "3.9" },
  "0.7.11": { "node_abi": 1, "v8": "3.11" },
  "0.7.12": { "node_abi": 1, "v8": "3.11" },
  "0.8.0": { "node_abi": 1, "v8": "3.11" },
  "0.8.1": { "node_abi": 1, "v8": "3.11" },
  "0.8.2": { "node_abi": 1, "v8": "3.11" },
  "0.8.3": { "node_abi": 1, "v8": "3.11" },
  "0.8.4": { "node_abi": 1, "v8": "3.11" },
  "0.8.5": { "node_abi": 1, "v8": "3.11" },
  "0.8.6": { "node_abi": 1, "v8": "3.11" },
  "0.8.7": { "node_abi": 1, "v8": "3.11" },
  "0.8.8": { "node_abi": 1, "v8": "3.11" },
  "0.8.9": { "node_abi": 1, "v8": "3.11" },
  "0.8.10": { "node_abi": 1, "v8": "3.11" },
  "0.8.11": { "node_abi": 1, "v8": "3.11" },
  "0.8.12": { "node_abi": 1, "v8": "3.11" },
  "0.8.13": { "node_abi": 1, "v8": "3.11" },
  "0.8.14": { "node_abi": 1, "v8": "3.11" },
  "0.8.15": { "node_abi": 1, "v8": "3.11" },
  "0.8.16": { "node_abi": 1, "v8": "3.11" },
  "0.8.17": { "node_abi": 1, "v8": "3.11" },
  "0.8.18": { "node_abi": 1, "v8": "3.11" },
  "0.8.19": { "node_abi": 1, "v8": "3.11" },
  "0.8.20": { "node_abi": 1, "v8": "3.11" },
  "0.8.21": { "node_abi": 1, "v8": "3.11" },
  "0.8.22": { "node_abi": 1, "v8": "3.11" },
  "0.8.23": { "node_abi": 1, "v8": "3.11" },
  "0.8.24": { "node_abi": 1, "v8": "3.11" },
  "0.8.25": { "node_abi": 1, "v8": "3.11" },
  "0.8.26": { "node_abi": 1, "v8": "3.11" },
  "0.8.27": { "node_abi": 1, "v8": "3.11" },
  "0.8.28": { "node_abi": 1, "v8": "3.11" },
  "0.9.0": { "node_abi": 1, "v8": "3.11" },
  "0.9.1": { "node_abi": 10, "v8": "3.11" },
  "0.9.2": { "node_abi": 10, "v8": "3.11" },
  "0.9.3": { "node_abi": 10, "v8": "3.13" },
  "0.9.4": { "node_abi": 10, "v8": "3.13" },
  "0.9.5": { "node_abi": 10, "v8": "3.13" },
  "0.9.6": { "node_abi": 10, "v8": "3.15" },
  "0.9.7": { "node_abi": 10, "v8": "3.15" },
  "0.9.8": { "node_abi": 10, "v8": "3.15" },
  "0.9.9": { "node_abi": 11, "v8": "3.15" },
  "0.9.10": { "node_abi": 11, "v8": "3.15" },
  "0.9.11": { "node_abi": 11, "v8": "3.14" },
  "0.9.12": { "node_abi": 11, "v8": "3.14" },
  "0.10.0": { "node_abi": 11, "v8": "3.14" },
  "0.10.1": { "node_abi": 11, "v8": "3.14" },
  "0.10.2": { "node_abi": 11, "v8": "3.14" },
  "0.10.3": { "node_abi": 11, "v8": "3.14" },
  "0.10.4": { "node_abi": 11, "v8": "3.14" },
  "0.10.5": { "node_abi": 11, "v8": "3.14" },
  "0.10.6": { "node_abi": 11, "v8": "3.14" },
  "0.10.7": { "node_abi": 11, "v8": "3.14" },
  "0.10.8": { "node_abi": 11, "v8": "3.14" },
  "0.10.9": { "node_abi": 11, "v8": "3.14" },
  "0.10.10": { "node_abi": 11, "v8": "3.14" },
  "0.10.11": { "node_abi": 11, "v8": "3.14" },
  "0.10.12": { "node_abi": 11, "v8": "3.14" },
  "0.10.13": { "node_abi": 11, "v8": "3.14" },
  "0.10.14": { "node_abi": 11, "v8": "3.14" },
  "0.10.15": { "node_abi": 11, "v8": "3.14" },
  "0.10.16": { "node_abi": 11, "v8": "3.14" },
  "0.10.17": { "node_abi": 11, "v8": "3.14" },
  "0.10.18": { "node_abi": 11, "v8": "3.14" },
  "0.10.19": { "node_abi": 11, "v8": "3.14" },
  "0.10.20": { "node_abi": 11, "v8": "3.14" },
  "0.10.21": { "node_abi": 11, "v8": "3.14" },
  "0.10.22": { "node_abi": 11, "v8": "3.14" },
  "0.10.23": { "node_abi": 11, "v8": "3.14" },
  "0.10.24": { "node_abi": 11, "v8": "3.14" },
  "0.10.25": { "node_abi": 11, "v8": "3.14" },
  "0.10.26": { "node_abi": 11, "v8": "3.14" },
  "0.10.27": { "node_abi": 11, "v8": "3.14" },
  "0.10.28": { "node_abi": 11, "v8": "3.14" },
  "0.10.29": { "node_abi": 11, "v8": "3.14" },
  "0.10.30": { "node_abi": 11, "v8": "3.14" },
  "0.10.31": { "node_abi": 11, "v8": "3.14" },
  "0.10.32": { "node_abi": 11, "v8": "3.14" },
  "0.10.33": { "node_abi": 11, "v8": "3.14" },
  "0.10.34": { "node_abi": 11, "v8": "3.14" },
  "0.10.35": { "node_abi": 11, "v8": "3.14" },
  "0.10.36": { "node_abi": 11, "v8": "3.14" },
  "0.10.37": { "node_abi": 11, "v8": "3.14" },
  "0.10.38": { "node_abi": 11, "v8": "3.14" },
  "0.10.39": { "node_abi": 11, "v8": "3.14" },
  "0.10.40": { "node_abi": 11, "v8": "3.14" },
  "0.10.41": { "node_abi": 11, "v8": "3.14" },
  "0.10.42": { "node_abi": 11, "v8": "3.14" },
  "0.10.43": { "node_abi": 11, "v8": "3.14" },
  "0.10.44": { "node_abi": 11, "v8": "3.14" },
  "0.10.45": { "node_abi": 11, "v8": "3.14" },
  "0.10.46": { "node_abi": 11, "v8": "3.14" },
  "0.10.47": { "node_abi": 11, "v8": "3.14" },
  "0.10.48": { "node_abi": 11, "v8": "3.14" },
  "0.11.0": { "node_abi": 12, "v8": "3.17" },
  "0.11.1": { "node_abi": 12, "v8": "3.18" },
  "0.11.2": { "node_abi": 12, "v8": "3.19" },
  "0.11.3": { "node_abi": 12, "v8": "3.19" },
  "0.11.4": { "node_abi": 12, "v8": "3.20" },
  "0.11.5": { "node_abi": 12, "v8": "3.20" },
  "0.11.6": { "node_abi": 12, "v8": "3.20" },
  "0.11.7": { "node_abi": 12, "v8": "3.20" },
  "0.11.8": { "node_abi": 13, "v8": "3.21" },
  "0.11.9": { "node_abi": 13, "v8": "3.22" },
  "0.11.10": { "node_abi": 13, "v8": "3.22" },
  "0.11.11": { "node_abi": 14, "v8": "3.22" },
  "0.11.12": { "node_abi": 14, "v8": "3.22" },
  "0.11.13": { "node_abi": 14, "v8": "3.25" },
  "0.11.14": { "node_abi": 14, "v8": "3.26" },
  "0.11.15": { "node_abi": 14, "v8": "3.28" },
  "0.11.16": { "node_abi": 14, "v8": "3.28" },
  "0.12.0": { "node_abi": 14, "v8": "3.28" },
  "0.12.1": { "node_abi": 14, "v8": "3.28" },
  "0.12.2": { "node_abi": 14, "v8": "3.28" },
  "0.12.3": { "node_abi": 14, "v8": "3.28" },
  "0.12.4": { "node_abi": 14, "v8": "3.28" },
  "0.12.5": { "node_abi": 14, "v8": "3.28" },
  "0.12.6": { "node_abi": 14, "v8": "3.28" },
  "0.12.7": { "node_abi": 14, "v8": "3.28" },
  "0.12.8": { "node_abi": 14, "v8": "3.28" },
  "0.12.9": { "node_abi": 14, "v8": "3.28" },
  "0.12.10": { "node_abi": 14, "v8": "3.28" },
  "0.12.11": { "node_abi": 14, "v8": "3.28" },
  "0.12.12": { "node_abi": 14, "v8": "3.28" },
  "0.12.13": { "node_abi": 14, "v8": "3.28" },
  "0.12.14": { "node_abi": 14, "v8": "3.28" },
  "0.12.15": { "node_abi": 14, "v8": "3.28" },
  "0.12.16": { "node_abi": 14, "v8": "3.28" },
  "0.12.17": { "node_abi": 14, "v8": "3.28" },
  "0.12.18": { "node_abi": 14, "v8": "3.28" },
  "1.0.0": { "node_abi": 42, "v8": "3.31" },
  "1.0.1": { "node_abi": 42, "v8": "3.31" },
  "1.0.2": { "node_abi": 42, "v8": "3.31" },
  "1.0.3": { "node_abi": 42, "v8": "4.1" },
  "1.0.4": { "node_abi": 42, "v8": "4.1" },
  "1.1.0": { "node_abi": 43, "v8": "4.1" },
  "1.2.0": { "node_abi": 43, "v8": "4.1" },
  "1.3.0": { "node_abi": 43, "v8": "4.1" },
  "1.4.1": { "node_abi": 43, "v8": "4.1" },
  "1.4.2": { "node_abi": 43, "v8": "4.1" },
  "1.4.3": { "node_abi": 43, "v8": "4.1" },
  "1.5.0": { "node_abi": 43, "v8": "4.1" },
  "1.5.1": { "node_abi": 43, "v8": "4.1" },
  "1.6.0": { "node_abi": 43, "v8": "4.1" },
  "1.6.1": { "node_abi": 43, "v8": "4.1" },
  "1.6.2": { "node_abi": 43, "v8": "4.1" },
  "1.6.3": { "node_abi": 43, "v8": "4.1" },
  "1.6.4": { "node_abi": 43, "v8": "4.1" },
  "1.7.1": { "node_abi": 43, "v8": "4.1" },
  "1.8.1": { "node_abi": 43, "v8": "4.1" },
  "1.8.2": { "node_abi": 43, "v8": "4.1" },
  "1.8.3": { "node_abi": 43, "v8": "4.1" },
  "1.8.4": { "node_abi": 43, "v8": "4.1" },
  "2.0.0": { "node_abi": 44, "v8": "4.2" },
  "2.0.1": { "node_abi": 44, "v8": "4.2" },
  "2.0.2": { "node_abi": 44, "v8": "4.2" },
  "2.1.0": { "node_abi": 44, "v8": "4.2" },
  "2.2.0": { "node_abi": 44, "v8": "4.2" },
  "2.2.1": { "node_abi": 44, "v8": "4.2" },
  "2.3.0": { "node_abi": 44, "v8": "4.2" },
  "2.3.1": { "node_abi": 44, "v8": "4.2" },
  "2.3.2": { "node_abi": 44, "v8": "4.2" },
  "2.3.3": { "node_abi": 44, "v8": "4.2" },
  "2.3.4": { "node_abi": 44, "v8": "4.2" },
  "2.4.0": { "node_abi": 44, "v8": "4.2" },
  "2.5.0": { "node_abi": 44, "v8": "4.2" },
  "3.0.0": { "node_abi": 45, "v8": "4.4" },
  "3.1.0": { "node_abi": 45, "v8": "4.4" },
  "3.2.0": { "node_abi": 45, "v8": "4.4" },
  "3.3.0": { "node_abi": 45, "v8": "4.4" },
  "3.3.1": { "node_abi": 45, "v8": "4.4" },
  "4.0.0": { "node_abi": 46, "v8": "4.5" },
  "4.1.0": { "node_abi": 46, "v8": "4.5" },
  "4.1.1": { "node_abi": 46, "v8": "4.5" },
  "4.1.2": { "node_abi": 46, "v8": "4.5" },
  "4.2.0": { "node_abi": 46, "v8": "4.5" },
  "4.2.1": { "node_abi": 46, "v8": "4.5" },
  "4.2.2": { "node_abi": 46, "v8": "4.5" },
  "4.2.3": { "node_abi": 46, "v8": "4.5" },
  "4.2.4": { "node_abi": 46, "v8": "4.5" },
  "4.2.5": { "node_abi": 46, "v8": "4.5" },
  "4.2.6": { "node_abi": 46, "v8": "4.5" },
  "4.3.0": { "node_abi": 46, "v8": "4.5" },
  "4.3.1": { "node_abi": 46, "v8": "4.5" },
  "4.3.2": { "node_abi": 46, "v8": "4.5" },
  "4.4.0": { "node_abi": 46, "v8": "4.5" },
  "4.4.1": { "node_abi": 46, "v8": "4.5" },
  "4.4.2": { "node_abi": 46, "v8": "4.5" },
  "4.4.3": { "node_abi": 46, "v8": "4.5" },
  "4.4.4": { "node_abi": 46, "v8": "4.5" },
  "4.4.5": { "node_abi": 46, "v8": "4.5" },
  "4.4.6": { "node_abi": 46, "v8": "4.5" },
  "4.4.7": { "node_abi": 46, "v8": "4.5" },
  "4.5.0": { "node_abi": 46, "v8": "4.5" },
  "4.6.0": { "node_abi": 46, "v8": "4.5" },
  "4.6.1": { "node_abi": 46, "v8": "4.5" },
  "4.6.2": { "node_abi": 46, "v8": "4.5" },
  "4.7.0": { "node_abi": 46, "v8": "4.5" },
  "4.7.1": { "node_abi": 46, "v8": "4.5" },
  "4.7.2": { "node_abi": 46, "v8": "4.5" },
  "4.7.3": { "node_abi": 46, "v8": "4.5" },
  "4.8.0": { "node_abi": 46, "v8": "4.5" },
  "4.8.1": { "node_abi": 46, "v8": "4.5" },
  "4.8.2": { "node_abi": 46, "v8": "4.5" },
  "4.8.3": { "node_abi": 46, "v8": "4.5" },
  "4.8.4": { "node_abi": 46, "v8": "4.5" },
  "4.8.5": { "node_abi": 46, "v8": "4.5" },
  "4.8.6": { "node_abi": 46, "v8": "4.5" },
  "4.8.7": { "node_abi": 46, "v8": "4.5" },
  "4.9.0": { "node_abi": 46, "v8": "4.5" },
  "4.9.1": { "node_abi": 46, "v8": "4.5" },
  "5.0.0": { "node_abi": 47, "v8": "4.6" },
  "5.1.0": { "node_abi": 47, "v8": "4.6" },
  "5.1.1": { "node_abi": 47, "v8": "4.6" },
  "5.2.0": { "node_abi": 47, "v8": "4.6" },
  "5.3.0": { "node_abi": 47, "v8": "4.6" },
  "5.4.0": { "node_abi": 47, "v8": "4.6" },
  "5.4.1": { "node_abi": 47, "v8": "4.6" },
  "5.5.0": { "node_abi": 47, "v8": "4.6" },
  "5.6.0": { "node_abi": 47, "v8": "4.6" },
  "5.7.0": { "node_abi": 47, "v8": "4.6" },
  "5.7.1": { "node_abi": 47, "v8": "4.6" },
  "5.8.0": { "node_abi": 47, "v8": "4.6" },
  "5.9.0": { "node_abi": 47, "v8": "4.6" },
  "5.9.1": { "node_abi": 47, "v8": "4.6" },
  "5.10.0": { "node_abi": 47, "v8": "4.6" },
  "5.10.1": { "node_abi": 47, "v8": "4.6" },
  "5.11.0": { "node_abi": 47, "v8": "4.6" },
  "5.11.1": { "node_abi": 47, "v8": "4.6" },
  "5.12.0": { "node_abi": 47, "v8": "4.6" },
  "6.0.0": { "node_abi": 48, "v8": "5.0" },
  "6.1.0": { "node_abi": 48, "v8": "5.0" },
  "6.2.0": { "node_abi": 48, "v8": "5.0" },
  "6.2.1": { "node_abi": 48, "v8": "5.0" },
  "6.2.2": { "node_abi": 48, "v8": "5.0" },
  "6.3.0": { "node_abi": 48, "v8": "5.0" },
  "6.3.1": { "node_abi": 48, "v8": "5.0" },
  "6.4.0": { "node_abi": 48, "v8": "5.0" },
  "6.5.0": { "node_abi": 48, "v8": "5.1" },
  "6.6.0": { "node_abi": 48, "v8": "5.1" },
  "6.7.0": { "node_abi": 48, "v8": "5.1" },
  "6.8.0": { "node_abi": 48, "v8": "5.1" },
  "6.8.1": { "node_abi": 48, "v8": "5.1" },
  "6.9.0": { "node_abi": 48, "v8": "5.1" },
  "6.9.1": { "node_abi": 48, "v8": "5.1" },
  "6.9.2": { "node_abi": 48, "v8": "5.1" },
  "6.9.3": { "node_abi": 48, "v8": "5.1" },
  "6.9.4": { "node_abi": 48, "v8": "5.1" },
  "6.9.5": { "node_abi": 48, "v8": "5.1" },
  "6.10.0": { "node_abi": 48, "v8": "5.1" },
  "6.10.1": { "node_abi": 48, "v8": "5.1" },
  "6.10.2": { "node_abi": 48, "v8": "5.1" },
  "6.10.3": { "node_abi": 48, "v8": "5.1" },
  "6.11.0": { "node_abi": 48, "v8": "5.1" },
  "6.11.1": { "node_abi": 48, "v8": "5.1" },
  "6.11.2": { "node_abi": 48, "v8": "5.1" },
  "6.11.3": { "node_abi": 48, "v8": "5.1" },
  "6.11.4": { "node_abi": 48, "v8": "5.1" },
  "6.11.5": { "node_abi": 48, "v8": "5.1" },
  "6.12.0": { "node_abi": 48, "v8": "5.1" },
  "6.12.1": { "node_abi": 48, "v8": "5.1" },
  "6.12.2": { "node_abi": 48, "v8": "5.1" },
  "6.12.3": { "node_abi": 48, "v8": "5.1" },
  "6.13.0": { "node_abi": 48, "v8": "5.1" },
  "6.13.1": { "node_abi": 48, "v8": "5.1" },
  "6.14.0": { "node_abi": 48, "v8": "5.1" },
  "6.14.1": { "node_abi": 48, "v8": "5.1" },
  "6.14.2": { "node_abi": 48, "v8": "5.1" },
  "6.14.3": { "node_abi": 48, "v8": "5.1" },
  "6.14.4": { "node_abi": 48, "v8": "5.1" },
  "6.15.0": { "node_abi": 48, "v8": "5.1" },
  "6.15.1": { "node_abi": 48, "v8": "5.1" },
  "6.16.0": { "node_abi": 48, "v8": "5.1" },
  "6.17.0": { "node_abi": 48, "v8": "5.1" },
  "6.17.1": { "node_abi": 48, "v8": "5.1" },
  "7.0.0": { "node_abi": 51, "v8": "5.4" },
  "7.1.0": { "node_abi": 51, "v8": "5.4" },
  "7.2.0": { "node_abi": 51, "v8": "5.4" },
  "7.2.1": { "node_abi": 51, "v8": "5.4" },
  "7.3.0": { "node_abi": 51, "v8": "5.4" },
  "7.4.0": { "node_abi": 51, "v8": "5.4" },
  "7.5.0": { "node_abi": 51, "v8": "5.4" },
  "7.6.0": { "node_abi": 51, "v8": "5.5" },
  "7.7.0": { "node_abi": 51, "v8": "5.5" },
  "7.7.1": { "node_abi": 51, "v8": "5.5" },
  "7.7.2": { "node_abi": 51, "v8": "5.5" },
  "7.7.3": { "node_abi": 51, "v8": "5.5" },
  "7.7.4": { "node_abi": 51, "v8": "5.5" },
  "7.8.0": { "node_abi": 51, "v8": "5.5" },
  "7.9.0": { "node_abi": 51, "v8": "5.5" },
  "7.10.0": { "node_abi": 51, "v8": "5.5" },
  "7.10.1": { "node_abi": 51, "v8": "5.5" },
  "8.0.0": { "node_abi": 57, "v8": "5.8" },
  "8.1.0": { "node_abi": 57, "v8": "5.8" },
  "8.1.1": { "node_abi": 57, "v8": "5.8" },
  "8.1.2": { "node_abi": 57, "v8": "5.8" },
  "8.1.3": { "node_abi": 57, "v8": "5.8" },
  "8.1.4": { "node_abi": 57, "v8": "5.8" },
  "8.2.0": { "node_abi": 57, "v8": "5.8" },
  "8.2.1": { "node_abi": 57, "v8": "5.8" },
  "8.3.0": { "node_abi": 57, "v8": "6.0" },
  "8.4.0": { "node_abi": 57, "v8": "6.0" },
  "8.5.0": { "node_abi": 57, "v8": "6.0" },
  "8.6.0": { "node_abi": 57, "v8": "6.0" },
  "8.7.0": { "node_abi": 57, "v8": "6.1" },
  "8.8.0": { "node_abi": 57, "v8": "6.1" },
  "8.8.1": { "node_abi": 57, "v8": "6.1" },
  "8.9.0": { "node_abi": 57, "v8": "6.1" },
  "8.9.1": { "node_abi": 57, "v8": "6.1" },
  "8.9.2": { "node_abi": 57, "v8": "6.1" },
  "8.9.3": { "node_abi": 57, "v8": "6.1" },
  "8.9.4": { "node_abi": 57, "v8": "6.1" },
  "8.10.0": { "node_abi": 57, "v8": "6.2" },
  "8.11.0": { "node_abi": 57, "v8": "6.2" },
  "8.11.1": { "node_abi": 57, "v8": "6.2" },
  "8.11.2": { "node_abi": 57, "v8": "6.2" },
  "8.11.3": { "node_abi": 57, "v8": "6.2" },
  "8.11.4": { "node_abi": 57, "v8": "6.2" },
  "8.12.0": { "node_abi": 57, "v8": "6.2" },
  "8.13.0": { "node_abi": 57, "v8": "6.2" },
  "8.14.0": { "node_abi": 57, "v8": "6.2" },
  "8.14.1": { "node_abi": 57, "v8": "6.2" },
  "8.15.0": { "node_abi": 57, "v8": "6.2" },
  "8.15.1": { "node_abi": 57, "v8": "6.2" },
  "8.16.0": { "node_abi": 57, "v8": "6.2" },
  "8.16.1": { "node_abi": 57, "v8": "6.2" },
  "8.16.2": { "node_abi": 57, "v8": "6.2" },
  "8.17.0": { "node_abi": 57, "v8": "6.2" },
  "9.0.0": { "node_abi": 59, "v8": "6.2" },
  "9.1.0": { "node_abi": 59, "v8": "6.2" },
  "9.2.0": { "node_abi": 59, "v8": "6.2" },
  "9.2.1": { "node_abi": 59, "v8": "6.2" },
  "9.3.0": { "node_abi": 59, "v8": "6.2" },
  "9.4.0": { "node_abi": 59, "v8": "6.2" },
  "9.5.0": { "node_abi": 59, "v8": "6.2" },
  "9.6.0": { "node_abi": 59, "v8": "6.2" },
  "9.6.1": { "node_abi": 59, "v8": "6.2" },
  "9.7.0": { "node_abi": 59, "v8": "6.2" },
  "9.7.1": { "node_abi": 59, "v8": "6.2" },
  "9.8.0": { "node_abi": 59, "v8": "6.2" },
  "9.9.0": { "node_abi": 59, "v8": "6.2" },
  "9.10.0": { "node_abi": 59, "v8": "6.2" },
  "9.10.1": { "node_abi": 59, "v8": "6.2" },
  "9.11.0": { "node_abi": 59, "v8": "6.2" },
  "9.11.1": { "node_abi": 59, "v8": "6.2" },
  "9.11.2": { "node_abi": 59, "v8": "6.2" },
  "10.0.0": { "node_abi": 64, "v8": "6.6" },
  "10.1.0": { "node_abi": 64, "v8": "6.6" },
  "10.2.0": { "node_abi": 64, "v8": "6.6" },
  "10.2.1": { "node_abi": 64, "v8": "6.6" },
  "10.3.0": { "node_abi": 64, "v8": "6.6" },
  "10.4.0": { "node_abi": 64, "v8": "6.7" },
  "10.4.1": { "node_abi": 64, "v8": "6.7" },
  "10.5.0": { "node_abi": 64, "v8": "6.7" },
  "10.6.0": { "node_abi": 64, "v8": "6.7" },
  "10.7.0": { "node_abi": 64, "v8": "6.7" },
  "10.8.0": { "node_abi": 64, "v8": "6.7" },
  "10.9.0": { "node_abi": 64, "v8": "6.8" },
  "10.10.0": { "node_abi": 64, "v8": "6.8" },
  "10.11.0": { "node_abi": 64, "v8": "6.8" },
  "10.12.0": { "node_abi": 64, "v8": "6.8" },
  "10.13.0": { "node_abi": 64, "v8": "6.8" },
  "10.14.0": { "node_abi": 64, "v8": "6.8" },
  "10.14.1": { "node_abi": 64, "v8": "6.8" },
  "10.14.2": { "node_abi": 64, "v8": "6.8" },
  "10.15.0": { "node_abi": 64, "v8": "6.8" },
  "10.15.1": { "node_abi": 64, "v8": "6.8" },
  "10.15.2": { "node_abi": 64, "v8": "6.8" },
  "10.15.3": { "node_abi": 64, "v8": "6.8" },
  "10.16.0": { "node_abi": 64, "v8": "6.8" },
  "10.16.1": { "node_abi": 64, "v8": "6.8" },
  "10.16.2": { "node_abi": 64, "v8": "6.8" },
  "10.16.3": { "node_abi": 64, "v8": "6.8" },
  "10.17.0": { "node_abi": 64, "v8": "6.8" },
  "10.18.0": { "node_abi": 64, "v8": "6.8" },
  "10.18.1": { "node_abi": 64, "v8": "6.8" },
  "10.19.0": { "node_abi": 64, "v8": "6.8" },
  "10.20.0": { "node_abi": 64, "v8": "6.8" },
  "10.20.1": { "node_abi": 64, "v8": "6.8" },
  "10.21.0": { "node_abi": 64, "v8": "6.8" },
  "10.22.0": { "node_abi": 64, "v8": "6.8" },
  "10.22.1": { "node_abi": 64, "v8": "6.8" },
  "10.23.0": { "node_abi": 64, "v8": "6.8" },
  "10.23.1": { "node_abi": 64, "v8": "6.8" },
  "10.23.2": { "node_abi": 64, "v8": "6.8" },
  "10.23.3": { "node_abi": 64, "v8": "6.8" },
  "10.24.0": { "node_abi": 64, "v8": "6.8" },
  "10.24.1": { "node_abi": 64, "v8": "6.8" },
  "11.0.0": { "node_abi": 67, "v8": "7.0" },
  "11.1.0": { "node_abi": 67, "v8": "7.0" },
  "11.2.0": { "node_abi": 67, "v8": "7.0" },
  "11.3.0": { "node_abi": 67, "v8": "7.0" },
  "11.4.0": { "node_abi": 67, "v8": "7.0" },
  "11.5.0": { "node_abi": 67, "v8": "7.0" },
  "11.6.0": { "node_abi": 67, "v8": "7.0" },
  "11.7.0": { "node_abi": 67, "v8": "7.0" },
  "11.8.0": { "node_abi": 67, "v8": "7.0" },
  "11.9.0": { "node_abi": 67, "v8": "7.0" },
  "11.10.0": { "node_abi": 67, "v8": "7.0" },
  "11.10.1": { "node_abi": 67, "v8": "7.0" },
  "11.11.0": { "node_abi": 67, "v8": "7.0" },
  "11.12.0": { "node_abi": 67, "v8": "7.0" },
  "11.13.0": { "node_abi": 67, "v8": "7.0" },
  "11.14.0": { "node_abi": 67, "v8": "7.0" },
  "11.15.0": { "node_abi": 67, "v8": "7.0" },
  "12.0.0": { "node_abi": 72, "v8": "7.4" },
  "12.1.0": { "node_abi": 72, "v8": "7.4" },
  "12.2.0": { "node_abi": 72, "v8": "7.4" },
  "12.3.0": { "node_abi": 72, "v8": "7.4" },
  "12.3.1": { "node_abi": 72, "v8": "7.4" },
  "12.4.0": { "node_abi": 72, "v8": "7.4" },
  "12.5.0": { "node_abi": 72, "v8": "7.5" },
  "12.6.0": { "node_abi": 72, "v8": "7.5" },
  "12.7.0": { "node_abi": 72, "v8": "7.5" },
  "12.8.0": { "node_abi": 72, "v8": "7.5" },
  "12.8.1": { "node_abi": 72, "v8": "7.5" },
  "12.9.0": { "node_abi": 72, "v8": "7.6" },
  "12.9.1": { "node_abi": 72, "v8": "7.6" },
  "12.10.0": { "node_abi": 72, "v8": "7.6" },
  "12.11.0": { "node_abi": 72, "v8": "7.7" },
  "12.11.1": { "node_abi": 72, "v8": "7.7" },
  "12.12.0": { "node_abi": 72, "v8": "7.7" },
  "12.13.0": { "node_abi": 72, "v8": "7.7" },
  "12.13.1": { "node_abi": 72, "v8": "7.7" },
  "12.14.0": { "node_abi": 72, "v8": "7.7" },
  "12.14.1": { "node_abi": 72, "v8": "7.7" },
  "12.15.0": { "node_abi": 72, "v8": "7.7" },
  "12.16.0": { "node_abi": 72, "v8": "7.8" },
  "12.16.1": { "node_abi": 72, "v8": "7.8" },
  "12.16.2": { "node_abi": 72, "v8": "7.8" },
  "12.16.3": { "node_abi": 72, "v8": "7.8" },
  "12.17.0": { "node_abi": 72, "v8": "7.8" },
  "12.18.0": { "node_abi": 72, "v8": "7.8" },
  "12.18.1": { "node_abi": 72, "v8": "7.8" },
  "12.18.2": { "node_abi": 72, "v8": "7.8" },
  "12.18.3": { "node_abi": 72, "v8": "7.8" },
  "12.18.4": { "node_abi": 72, "v8": "7.8" },
  "12.19.0": { "node_abi": 72, "v8": "7.8" },
  "12.19.1": { "node_abi": 72, "v8": "7.8" },
  "12.20.0": { "node_abi": 72, "v8": "7.8" },
  "12.20.1": { "node_abi": 72, "v8": "7.8" },
  "12.20.2": { "node_abi": 72, "v8": "7.8" },
  "12.21.0": { "node_abi": 72, "v8": "7.8" },
  "12.22.0": { "node_abi": 72, "v8": "7.8" },
  "12.22.1": { "node_abi": 72, "v8": "7.8" },
  "12.22.2": { "node_abi": 72, "v8": "7.8" },
  "12.22.3": { "node_abi": 72, "v8": "7.8" },
  "12.22.4": { "node_abi": 72, "v8": "7.8" },
  "12.22.5": { "node_abi": 72, "v8": "7.8" },
  "12.22.6": { "node_abi": 72, "v8": "7.8" },
  "12.22.7": { "node_abi": 72, "v8": "7.8" },
  "13.0.0": { "node_abi": 79, "v8": "7.8" },
  "13.0.1": { "node_abi": 79, "v8": "7.8" },
  "13.1.0": { "node_abi": 79, "v8": "7.8" },
  "13.2.0": { "node_abi": 79, "v8": "7.9" },
  "13.3.0": { "node_abi": 79, "v8": "7.9" },
  "13.4.0": { "node_abi": 79, "v8": "7.9" },
  "13.5.0": { "node_abi": 79, "v8": "7.9" },
  "13.6.0": { "node_abi": 79, "v8": "7.9" },
  "13.7.0": { "node_abi": 79, "v8": "7.9" },
  "13.8.0": { "node_abi": 79, "v8": "7.9" },
  "13.9.0": { "node_abi": 79, "v8": "7.9" },
  "13.10.0": { "node_abi": 79, "v8": "7.9" },
  "13.10.1": { "node_abi": 79, "v8": "7.9" },
  "13.11.0": { "node_abi": 79, "v8": "7.9" },
  "13.12.0": { "node_abi": 79, "v8": "7.9" },
  "13.13.0": { "node_abi": 79, "v8": "7.9" },
  "13.14.0": { "node_abi": 79, "v8": "7.9" },
  "14.0.0": { "node_abi": 83, "v8": "8.1" },
  "14.1.0": { "node_abi": 83, "v8": "8.1" },
  "14.2.0": { "node_abi": 83, "v8": "8.1" },
  "14.3.0": { "node_abi": 83, "v8": "8.1" },
  "14.4.0": { "node_abi": 83, "v8": "8.1" },
  "14.5.0": { "node_abi": 83, "v8": "8.3" },
  "14.6.0": { "node_abi": 83, "v8": "8.4" },
  "14.7.0": { "node_abi": 83, "v8": "8.4" },
  "14.8.0": { "node_abi": 83, "v8": "8.4" },
  "14.9.0": { "node_abi": 83, "v8": "8.4" },
  "14.10.0": { "node_abi": 83, "v8": "8.4" },
  "14.10.1": { "node_abi": 83, "v8": "8.4" },
  "14.11.0": { "node_abi": 83, "v8": "8.4" },
  "14.12.0": { "node_abi": 83, "v8": "8.4" },
  "14.13.0": { "node_abi": 83, "v8": "8.4" },
  "14.13.1": { "node_abi": 83, "v8": "8.4" },
  "14.14.0": { "node_abi": 83, "v8": "8.4" },
  "14.15.0": { "node_abi": 83, "v8": "8.4" },
  "14.15.1": { "node_abi": 83, "v8": "8.4" },
  "14.15.2": { "node_abi": 83, "v8": "8.4" },
  "14.15.3": { "node_abi": 83, "v8": "8.4" },
  "14.15.4": { "node_abi": 83, "v8": "8.4" },
  "14.15.5": { "node_abi": 83, "v8": "8.4" },
  "14.16.0": { "node_abi": 83, "v8": "8.4" },
  "14.16.1": { "node_abi": 83, "v8": "8.4" },
  "14.17.0": { "node_abi": 83, "v8": "8.4" },
  "14.17.1": { "node_abi": 83, "v8": "8.4" },
  "14.17.2": { "node_abi": 83, "v8": "8.4" },
  "14.17.3": { "node_abi": 83, "v8": "8.4" },
  "14.17.4": { "node_abi": 83, "v8": "8.4" },
  "14.17.5": { "node_abi": 83, "v8": "8.4" },
  "14.17.6": { "node_abi": 83, "v8": "8.4" },
  "14.18.0": { "node_abi": 83, "v8": "8.4" },
  "14.18.1": { "node_abi": 83, "v8": "8.4" },
  "15.0.0": { "node_abi": 88, "v8": "8.6" },
  "15.0.1": { "node_abi": 88, "v8": "8.6" },
  "15.1.0": { "node_abi": 88, "v8": "8.6" },
  "15.2.0": { "node_abi": 88, "v8": "8.6" },
  "15.2.1": { "node_abi": 88, "v8": "8.6" },
  "15.3.0": { "node_abi": 88, "v8": "8.6" },
  "15.4.0": { "node_abi": 88, "v8": "8.6" },
  "15.5.0": { "node_abi": 88, "v8": "8.6" },
  "15.5.1": { "node_abi": 88, "v8": "8.6" },
  "15.6.0": { "node_abi": 88, "v8": "8.6" },
  "15.7.0": { "node_abi": 88, "v8": "8.6" },
  "15.8.0": { "node_abi": 88, "v8": "8.6" },
  "15.9.0": { "node_abi": 88, "v8": "8.6" },
  "15.10.0": { "node_abi": 88, "v8": "8.6" },
  "15.11.0": { "node_abi": 88, "v8": "8.6" },
  "15.12.0": { "node_abi": 88, "v8": "8.6" },
  "15.13.0": { "node_abi": 88, "v8": "8.6" },
  "15.14.0": { "node_abi": 88, "v8": "8.6" },
  "16.0.0": { "node_abi": 93, "v8": "9.0" },
  "16.1.0": { "node_abi": 93, "v8": "9.0" },
  "16.2.0": { "node_abi": 93, "v8": "9.0" },
  "16.3.0": { "node_abi": 93, "v8": "9.0" },
  "16.4.0": { "node_abi": 93, "v8": "9.1" },
  "16.4.1": { "node_abi": 93, "v8": "9.1" },
  "16.4.2": { "node_abi": 93, "v8": "9.1" },
  "16.5.0": { "node_abi": 93, "v8": "9.1" },
  "16.6.0": { "node_abi": 93, "v8": "9.2" },
  "16.6.1": { "node_abi": 93, "v8": "9.2" },
  "16.6.2": { "node_abi": 93, "v8": "9.2" },
  "16.7.0": { "node_abi": 93, "v8": "9.2" },
  "16.8.0": { "node_abi": 93, "v8": "9.2" },
  "16.9.0": { "node_abi": 93, "v8": "9.3" },
  "16.9.1": { "node_abi": 93, "v8": "9.3" },
  "16.10.0": { "node_abi": 93, "v8": "9.3" },
  "16.11.0": { "node_abi": 93, "v8": "9.4" },
  "16.11.1": { "node_abi": 93, "v8": "9.4" },
  "16.12.0": { "node_abi": 93, "v8": "9.4" },
  "16.13.0": { "node_abi": 93, "v8": "9.4" },
  "17.0.0": { "node_abi": 102, "v8": "9.5" },
  "17.0.1": { "node_abi": 102, "v8": "9.5" },
  "17.1.0": { "node_abi": 102, "v8": "9.5" }
};
var hasRequiredVersioning;
function requireVersioning() {
  if (hasRequiredVersioning) return versioning.exports;
  hasRequiredVersioning = 1;
  (function(module2, exports$1) {
    module2.exports = exports$1;
    const path2 = require$$1;
    const semver = main$1.requireSemver();
    const url = require$$0;
    const detect_libc = main$1.requireDetectLibc();
    const napi2 = requireNapi();
    let abi_crosswalk;
    if (process.env.NODE_PRE_GYP_ABI_CROSSWALK) {
      abi_crosswalk = main$1.commonjsRequire(process.env.NODE_PRE_GYP_ABI_CROSSWALK);
    } else {
      abi_crosswalk = require$$5;
    }
    const major_versions = {};
    Object.keys(abi_crosswalk).forEach((v) => {
      const major = v.split(".")[0];
      if (!major_versions[major]) {
        major_versions[major] = v;
      }
    });
    function get_electron_abi(runtime, target_version) {
      if (!runtime) {
        throw new Error("get_electron_abi requires valid runtime arg");
      }
      if (typeof target_version === "undefined") {
        throw new Error("Empty target version is not supported if electron is the target.");
      }
      const sem_ver = semver.parse(target_version);
      return runtime + "-v" + sem_ver.major + "." + sem_ver.minor;
    }
    module2.exports.get_electron_abi = get_electron_abi;
    function get_node_webkit_abi(runtime, target_version) {
      if (!runtime) {
        throw new Error("get_node_webkit_abi requires valid runtime arg");
      }
      if (typeof target_version === "undefined") {
        throw new Error("Empty target version is not supported if node-webkit is the target.");
      }
      return runtime + "-v" + target_version;
    }
    module2.exports.get_node_webkit_abi = get_node_webkit_abi;
    function get_node_abi(runtime, versions) {
      if (!runtime) {
        throw new Error("get_node_abi requires valid runtime arg");
      }
      if (!versions) {
        throw new Error("get_node_abi requires valid process.versions object");
      }
      const sem_ver = semver.parse(versions.node);
      if (sem_ver.major === 0 && sem_ver.minor % 2) {
        return runtime + "-v" + versions.node;
      } else {
        return versions.modules ? runtime + "-v" + +versions.modules : "v8-" + versions.v8.split(".").slice(0, 2).join(".");
      }
    }
    module2.exports.get_node_abi = get_node_abi;
    function get_runtime_abi(runtime, target_version) {
      if (!runtime) {
        throw new Error("get_runtime_abi requires valid runtime arg");
      }
      if (runtime === "node-webkit") {
        return get_node_webkit_abi(runtime, target_version || process.versions["node-webkit"]);
      } else if (runtime === "electron") {
        return get_electron_abi(runtime, target_version || process.versions.electron);
      } else {
        if (runtime !== "node") {
          throw new Error("Unknown Runtime: '" + runtime + "'");
        }
        if (!target_version) {
          return get_node_abi(runtime, process.versions);
        } else {
          let cross_obj;
          if (abi_crosswalk[target_version]) {
            cross_obj = abi_crosswalk[target_version];
          } else {
            const target_parts = target_version.split(".").map((i) => {
              return +i;
            });
            if (target_parts.length !== 3) {
              throw new Error("Unknown target version: " + target_version);
            }
            const major = target_parts[0];
            let minor = target_parts[1];
            let patch = target_parts[2];
            if (major === 1) {
              while (true) {
                if (minor > 0) --minor;
                if (patch > 0) --patch;
                const new_iojs_target = "" + major + "." + minor + "." + patch;
                if (abi_crosswalk[new_iojs_target]) {
                  cross_obj = abi_crosswalk[new_iojs_target];
                  console.log("Warning: node-pre-gyp could not find exact match for " + target_version);
                  console.log("Warning: but node-pre-gyp successfully choose " + new_iojs_target + " as ABI compatible target");
                  break;
                }
                if (minor === 0 && patch === 0) {
                  break;
                }
              }
            } else if (major >= 2) {
              if (major_versions[major]) {
                cross_obj = abi_crosswalk[major_versions[major]];
                console.log("Warning: node-pre-gyp could not find exact match for " + target_version);
                console.log("Warning: but node-pre-gyp successfully choose " + major_versions[major] + " as ABI compatible target");
              }
            } else if (major === 0) {
              if (target_parts[1] % 2 === 0) {
                while (--patch > 0) {
                  const new_node_target = "" + major + "." + minor + "." + patch;
                  if (abi_crosswalk[new_node_target]) {
                    cross_obj = abi_crosswalk[new_node_target];
                    console.log("Warning: node-pre-gyp could not find exact match for " + target_version);
                    console.log("Warning: but node-pre-gyp successfully choose " + new_node_target + " as ABI compatible target");
                    break;
                  }
                }
              }
            }
          }
          if (!cross_obj) {
            throw new Error("Unsupported target version: " + target_version);
          }
          const versions_obj = {
            node: target_version,
            v8: cross_obj.v8 + ".0",
            // abi_crosswalk uses 1 for node versions lacking process.versions.modules
            // process.versions.modules added in >= v0.10.4 and v0.11.7
            modules: cross_obj.node_abi > 1 ? cross_obj.node_abi : void 0
          };
          return get_node_abi(runtime, versions_obj);
        }
      }
    }
    module2.exports.get_runtime_abi = get_runtime_abi;
    const required_parameters = [
      "module_name",
      "module_path",
      "host"
    ];
    function validate_config(package_json, opts) {
      const msg = package_json.name + " package.json is not node-pre-gyp ready:\n";
      const missing = [];
      if (!package_json.main) {
        missing.push("main");
      }
      if (!package_json.version) {
        missing.push("version");
      }
      if (!package_json.name) {
        missing.push("name");
      }
      if (!package_json.binary) {
        missing.push("binary");
      }
      const o = package_json.binary;
      if (o) {
        required_parameters.forEach((p) => {
          if (!o[p] || typeof o[p] !== "string") {
            missing.push("binary." + p);
          }
        });
      }
      if (missing.length >= 1) {
        throw new Error(msg + "package.json must declare these properties: \n" + missing.join("\n"));
      }
      if (o) {
        const protocol = url.parse(o.host).protocol;
        if (protocol === "http:") {
          throw new Error("'host' protocol (" + protocol + ") is invalid - only 'https:' is accepted");
        }
      }
      napi2.validate_package_json(package_json, opts);
    }
    module2.exports.validate_config = validate_config;
    function eval_template(template, opts) {
      Object.keys(opts).forEach((key) => {
        const pattern = "{" + key + "}";
        while (template.indexOf(pattern) > -1) {
          template = template.replace(pattern, opts[key]);
        }
      });
      return template;
    }
    function fix_slashes(pathname) {
      if (pathname.slice(-1) !== "/") {
        return pathname + "/";
      }
      return pathname;
    }
    function drop_double_slashes(pathname) {
      return pathname.replace(/\/\//g, "/");
    }
    function get_process_runtime(versions) {
      let runtime = "node";
      if (versions["node-webkit"]) {
        runtime = "node-webkit";
      } else if (versions.electron) {
        runtime = "electron";
      }
      return runtime;
    }
    module2.exports.get_process_runtime = get_process_runtime;
    const default_package_name = "{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz";
    const default_remote_path = "";
    module2.exports.evaluate = function(package_json, options, napi_build_version) {
      options = options || {};
      validate_config(package_json, options);
      const v = package_json.version;
      const module_version = semver.parse(v);
      const runtime = options.runtime || get_process_runtime(process.versions);
      const opts = {
        name: package_json.name,
        configuration: options.debug ? "Debug" : "Release",
        debug: options.debug,
        module_name: package_json.binary.module_name,
        version: module_version.version,
        prerelease: module_version.prerelease.length ? module_version.prerelease.join(".") : "",
        build: module_version.build.length ? module_version.build.join(".") : "",
        major: module_version.major,
        minor: module_version.minor,
        patch: module_version.patch,
        runtime,
        node_abi: get_runtime_abi(runtime, options.target),
        node_abi_napi: napi2.get_napi_version(options.target) ? "napi" : get_runtime_abi(runtime, options.target),
        napi_version: napi2.get_napi_version(options.target),
        // non-zero numeric, undefined if unsupported
        napi_build_version: napi_build_version || "",
        node_napi_label: napi_build_version ? "napi-v" + napi_build_version : get_runtime_abi(runtime, options.target),
        target: options.target || "",
        platform: options.target_platform || process.platform,
        target_platform: options.target_platform || process.platform,
        arch: options.target_arch || process.arch,
        target_arch: options.target_arch || process.arch,
        libc: options.target_libc || detect_libc.familySync() || "unknown",
        module_main: package_json.main,
        toolset: options.toolset || "",
        // address https://github.com/mapbox/node-pre-gyp/issues/119
        bucket: package_json.binary.bucket,
        region: package_json.binary.region,
        s3ForcePathStyle: package_json.binary.s3ForcePathStyle || false
      };
      const validModuleName = opts.module_name.replace("-", "_");
      const host = process.env["npm_config_" + validModuleName + "_binary_host_mirror"] || package_json.binary.host;
      opts.host = fix_slashes(eval_template(host, opts));
      opts.module_path = eval_template(package_json.binary.module_path, opts);
      if (options.module_root) {
        opts.module_path = path2.join(options.module_root, opts.module_path);
      } else {
        opts.module_path = path2.resolve(opts.module_path);
      }
      opts.module = path2.join(opts.module_path, opts.module_name + ".node");
      opts.remote_path = package_json.binary.remote_path ? drop_double_slashes(fix_slashes(eval_template(package_json.binary.remote_path, opts))) : default_remote_path;
      const package_name = package_json.binary.package_name ? package_json.binary.package_name : default_package_name;
      opts.package_name = eval_template(package_name, opts);
      opts.staged_tarball = path2.join("build/stage", opts.remote_path, opts.package_name);
      opts.hosted_path = url.resolve(opts.host, opts.remote_path);
      opts.hosted_tarball = url.resolve(opts.hosted_path, opts.package_name);
      return opts;
    };
  })(versioning, versioning.exports);
  return versioning.exports;
}
var hasRequiredPreBinding;
function requirePreBinding() {
  if (hasRequiredPreBinding) return preBinding.exports;
  hasRequiredPreBinding = 1;
  (function(module2, exports$1) {
    const npg = requireNodePreGyp();
    const versioning2 = requireVersioning();
    const napi2 = requireNapi();
    const existsSync = require$$0$1.existsSync || require$$1.existsSync;
    const path2 = require$$1;
    module2.exports = exports$1;
    exports$1.usage = "Finds the require path for the node-pre-gyp installed module";
    exports$1.validate = function(package_json, opts) {
      versioning2.validate_config(package_json, opts);
    };
    exports$1.find = function(package_json_path, opts) {
      if (!existsSync(package_json_path)) {
        throw new Error(package_json_path + "does not exist");
      }
      const prog = new npg.Run({ package_json_path, argv: process.argv });
      prog.setBinaryHostProperty();
      const package_json = prog.package_json;
      versioning2.validate_config(package_json, opts);
      let napi_build_version;
      if (napi2.get_napi_build_versions(package_json, opts)) {
        napi_build_version = napi2.get_best_napi_build_version(package_json, opts);
      }
      opts = opts || {};
      if (!opts.module_root) opts.module_root = path2.dirname(package_json_path);
      const meta = versioning2.evaluate(package_json, opts, napi_build_version);
      return meta.module;
    };
  })(preBinding, preBinding.exports);
  return preBinding.exports;
}
const name = "@mapbox/node-pre-gyp";
const description = "Node.js native addon binary install tool";
const version = "1.0.11";
const keywords = ["native", "addon", "module", "c", "c++", "bindings", "binary"];
const license = "BSD-3-Clause";
const author = "Dane Springmeyer <dane@mapbox.com>";
const repository = { "type": "git", "url": "git://github.com/mapbox/node-pre-gyp.git" };
const bin = "./bin/node-pre-gyp";
const main = "./lib/node-pre-gyp.js";
const dependencies = { "detect-libc": "^2.0.0", "https-proxy-agent": "^5.0.0", "make-dir": "^3.1.0", "node-fetch": "^2.6.7", "nopt": "^5.0.0", "npmlog": "^5.0.1", "rimraf": "^3.0.2", "semver": "^7.3.5", "tar": "^6.1.11" };
const devDependencies = { "@mapbox/cloudfriend": "^5.1.0", "@mapbox/eslint-config-mapbox": "^3.0.0", "aws-sdk": "^2.1087.0", "codecov": "^3.8.3", "eslint": "^7.32.0", "eslint-plugin-node": "^11.1.0", "mock-aws-s3": "^4.0.2", "nock": "^12.0.3", "node-addon-api": "^4.3.0", "nyc": "^15.1.0", "tape": "^5.5.2", "tar-fs": "^2.1.1" };
const nyc = { "all": true, "skip-full": false, "exclude": ["test/**"] };
const scripts = { "coverage": "nyc --all --include index.js --include lib/ npm test", "upload-coverage": "nyc report --reporter json && codecov --clear --flags=unit --file=./coverage/coverage-final.json", "lint": "eslint bin/node-pre-gyp lib/*js lib/util/*js test/*js scripts/*js", "fix": "npm run lint -- --fix", "update-crosswalk": "node scripts/abi_crosswalk.js", "test": "tape test/*test.js" };
const require$$9 = {
  name,
  description,
  version,
  keywords,
  license,
  author,
  repository,
  bin,
  main,
  dependencies,
  devDependencies,
  nyc,
  scripts
};
var hasRequiredNodePreGyp;
function requireNodePreGyp() {
  if (hasRequiredNodePreGyp) return nodePreGyp.exports;
  hasRequiredNodePreGyp = 1;
  (function(module2, exports$1) {
    module2.exports = exports$1;
    exports$1.mockS3Http = requireS3_setup().get_mockS3Http();
    exports$1.mockS3Http("on");
    const mocking = exports$1.mockS3Http("get");
    const fs2 = require$$0$1;
    const path2 = require$$1;
    const nopt2 = requireNopt();
    const log2 = requireLog();
    log2.disableProgress();
    const napi2 = requireNapi();
    const EE = require$$0$3.EventEmitter;
    const inherits = require$$0$4.inherits;
    const cli_commands = [
      "clean",
      "install",
      "reinstall",
      "build",
      "rebuild",
      "package",
      "testpackage",
      "publish",
      "unpublish",
      "info",
      "testbinary",
      "reveal",
      "configure"
    ];
    const aliases = {};
    log2.heading = "node-pre-gyp";
    if (mocking) {
      log2.warn(`mocking s3 to ${process.env.node_pre_gyp_mock_s3}`);
    }
    Object.defineProperty(exports$1, "find", {
      get: function() {
        return requirePreBinding().find;
      },
      enumerable: true
    });
    function Run({ package_json_path = "./package.json", argv }) {
      this.package_json_path = package_json_path;
      this.commands = {};
      const self2 = this;
      cli_commands.forEach((command) => {
        self2.commands[command] = function(argvx, callback) {
          log2.verbose("command", command, argvx);
          return main$1.commonjsRequire("./" + command)(self2, argvx, callback);
        };
      });
      this.parseArgv(argv);
      this.binaryHostSet = false;
    }
    inherits(Run, EE);
    exports$1.Run = Run;
    const proto = Run.prototype;
    proto.package = require$$9;
    proto.configDefs = {
      help: Boolean,
      // everywhere
      arch: String,
      // 'configure'
      debug: Boolean,
      // 'build'
      directory: String,
      // bin
      proxy: String,
      // 'install'
      loglevel: String
      // everywhere
    };
    proto.shorthands = {
      release: "--no-debug",
      C: "--directory",
      debug: "--debug",
      j: "--jobs",
      silent: "--loglevel=silent",
      silly: "--loglevel=silly",
      verbose: "--loglevel=verbose"
    };
    proto.aliases = aliases;
    proto.parseArgv = function parseOpts(argv) {
      this.opts = nopt2(this.configDefs, this.shorthands, argv);
      this.argv = this.opts.argv.remain.slice();
      const commands = this.todo = [];
      argv = this.argv.map((arg) => {
        if (arg in this.aliases) {
          arg = this.aliases[arg];
        }
        return arg;
      });
      argv.slice().forEach((arg) => {
        if (arg in this.commands) {
          const args = argv.splice(0, argv.indexOf(arg));
          argv.shift();
          if (commands.length > 0) {
            commands[commands.length - 1].args = args;
          }
          commands.push({ name: arg, args: [] });
        }
      });
      if (commands.length > 0) {
        commands[commands.length - 1].args = argv.splice(0);
      }
      let package_json_path = this.package_json_path;
      if (this.opts.directory) {
        package_json_path = path2.join(this.opts.directory, package_json_path);
      }
      this.package_json = JSON.parse(fs2.readFileSync(package_json_path));
      this.todo = napi2.expand_commands(this.package_json, this.opts, commands);
      const npm_config_prefix = "npm_config_";
      Object.keys(process.env).forEach((name2) => {
        if (name2.indexOf(npm_config_prefix) !== 0) return;
        const val = process.env[name2];
        if (name2 === npm_config_prefix + "loglevel") {
          log2.level = val;
        } else {
          name2 = name2.substring(npm_config_prefix.length);
          if (name2 === "argv") {
            if (this.opts.argv && this.opts.argv.remain && this.opts.argv.remain.length) ;
            else {
              this.opts[name2] = val;
            }
          } else {
            this.opts[name2] = val;
          }
        }
      });
      if (this.opts.loglevel) {
        log2.level = this.opts.loglevel;
      }
      log2.resume();
    };
    proto.setBinaryHostProperty = function(command) {
      if (this.binaryHostSet) {
        return this.package_json.binary.host;
      }
      const p = this.package_json;
      if (!p || !p.binary || p.binary.host) {
        return "";
      }
      if (!p.binary.staging_host || !p.binary.production_host) {
        return "";
      }
      let target = "production_host";
      if (command === "publish" || command === "unpublish") {
        target = "staging_host";
      }
      const npg_s3_host = process.env.node_pre_gyp_s3_host;
      if (npg_s3_host === "staging" || npg_s3_host === "production") {
        target = `${npg_s3_host}_host`;
      } else if (this.opts["s3_host"] === "staging" || this.opts["s3_host"] === "production") {
        target = `${this.opts["s3_host"]}_host`;
      } else if (this.opts["s3_host"] || npg_s3_host) {
        throw new Error(`invalid s3_host ${this.opts["s3_host"] || npg_s3_host}`);
      }
      p.binary.host = p.binary[target];
      this.binaryHostSet = true;
      return p.binary.host;
    };
    proto.usage = function usage() {
      const str = [
        "",
        "  Usage: node-pre-gyp <command> [options]",
        "",
        "  where <command> is one of:",
        cli_commands.map((c) => {
          return "    - " + c + " - " + main$1.commonjsRequire("./" + c).usage;
        }).join("\n"),
        "",
        "node-pre-gyp@" + this.version + "  " + path2.resolve(__dirname, ".."),
        "node@" + process.versions.node
      ].join("\n");
      return str;
    };
    Object.defineProperty(proto, "version", {
      get: function() {
        return this.package.version;
      },
      enumerable: true
    });
  })(nodePreGyp, nodePreGyp.exports);
  return nodePreGyp.exports;
}
var nodePreGypExports = requireNodePreGyp();
const preGyp = /* @__PURE__ */ main$1.getDefaultExportFromCjs(nodePreGypExports);
const __dirname$1 = path.dirname(node_url.fileURLToPath(require("url").pathToFileURL(__filename).href));
const require$1 = node_module.createRequire(require("url").pathToFileURL(__filename).href);
const bindingPath = preGyp.find(path.resolve(path.join(__dirname$1, "../package.json")));
const addon = fs.existsSync(bindingPath) ? require$1(bindingPath) : {
  getActiveWindow() {
  },
  getOpenWindows() {
  }
};
async function activeWindow() {
  return addon.getActiveWindow();
}
exports.activeWindow = activeWindow;
