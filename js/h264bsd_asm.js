// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 268435456;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(9235);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([17,1,0,0,0,0,0,0,34,18,1,1,0,0,0,0,50,34,18,2,0,0,0,0,67,51,34,34,18,18,2,2,83,67,51,35,18,18,2,2,19,35,67,51,99,83,2,2,0,0,101,85,68,68,52,52,35,35,35,35,19,19,19,19,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,249,233,217,200,200,184,184,167,167,167,167,151,151,151,151,134,134,134,134,134,134,134,134,118,118,118,118,118,118,118,118,230,214,198,182,165,165,149,149,132,132,132,132,116,116,116,116,100,100,100,100,84,84,84,84,67,67,67,67,67,67,67,67,51,51,51,51,51,51,51,51,35,35,35,35,35,35,35,35,19,19,19,19,19,19,19,19,3,3,3,3,3,3,3,3,214,182,197,197,165,165,149,149,132,132,132,132,84,84,84,84,68,68,68,68,4,4,4,4,115,115,115,115,115,115,115,115,99,99,99,99,99,99,99,99,51,51,51,51,51,51,51,51,35,35,35,35,35,35,35,35,19,19,19,19,19,19,19,19,197,181,165,5,148,148,116,116,52,52,36,36,131,131,131,131,99,99,99,99,83,83,83,83,67,67,67,67,19,19,19,19,181,149,164,164,132,132,36,36,20,20,4,4,115,115,115,115,99,99,99,99,83,83,83,83,67,67,67,67,51,51,51,51,166,6,21,21,132,132,132,132,147,147,147,147,147,147,147,147,115,115,115,115,115,115,115,115,99,99,99,99,99,99,99,99,83,83,83,83,83,83,83,83,67,67,67,67,67,67,67,67,51,51,51,51,51,51,51,51,35,35,35,35,35,35,35,35,150,6,21,21,116,116,116,116,131,131,131,131,131,131,131,131,99,99,99,99,99,99,99,99,67,67,67,67,67,67,67,67,51,51,51,51,51,51,51,51,35,35,35,35,35,35,35,35,82,82,82,82,82,82,82,82,82,82,82,82,82,82,82,82,134,6,37,37,20,20,20,20,115,115,115,115,115,115,115,115,99,99,99,99,99,99,99,99,51,51,51,51,51,51,51,51,82,82,82,82,82,82,82,82,82,82,82,82,82,82,82,82,66,66,66,66,66,66,66,66,66,66,66,66,66,66,66,66,22,6,117,117,36,36,36,36,83,83,83,83,83,83,83,83,98,98,98,98,98,98,98,98,98,98,98,98,98,98,98,98,66,66,66,66,66,66,66,66,66,66,66,66,66,66,66,66,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,21,5,100,100,35,35,35,35,82,82,82,82,82,82,82,82,66,66,66,66,66,66,66,66,50,50,50,50,50,50,50,50,4,20,35,35,51,51,83,83,65,65,65,65,65,65,65,65,4,20,67,67,34,34,34,34,49,49,49,49,49,49,49,49,3,19,50,50,33,33,33,33,2,18,33,33,0,0,0,0,0,0,0,0,0,0,102,32,38,16,6,8,101,24,101,24,67,16,67,16,67,16,67,16,67,16,67,16,67,16,67,16,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,34,8,0,0,0,0,0,0,0,0,106,64,74,48,42,40,10,32,105,56,105,56,73,40,73,40,41,32,41,32,9,24,9,24,104,48,104,48,104,48,104,48,72,32,72,32,72,32,72,32,40,24,40,24,40,24,40,24,8,16,8,16,8,16,8,16,103,40,103,40,103,40,103,40,103,40,103,40,103,40,103,40,71,24,71,24,71,24,71,24,71,24,71,24,71,24,71,24,110,96,78,88,46,80,14,80,110,88,78,80,46,72,14,72,13,64,13,64,77,72,77,72,45,64,45,64,13,56,13,56,109,80,109,80,77,64,77,64,45,56,45,56,13,48,13,48,107,72,107,72,107,72,107,72,107,72,107,72,107,72,107,72,75,56,75,56,75,56,75,56,75,56,75,56,75,56,75,56,43,48,43,48,43,48,43,48,43,48,43,48,43,48,43,48,11,40,11,40,11,40,11,40,11,40,11,40,11,40,11,40,0,0,0,0,47,104,47,104,16,128,80,128,48,128,16,120,112,128,80,120,48,120,16,112,112,120,80,112,48,112,16,104,111,112,111,112,79,104,79,104,47,96,47,96,15,96,15,96,111,104,111,104,79,96,79,96,47,88,47,88,15,88,15,88,0,0,0,0,0,0,0,0,102,56,70,32,38,32,6,16,102,48,70,24,38,24,6,8,101,40,101,40,37,16,37,16,100,32,100,32,100,32,100,32,100,24,100,24,100,24,100,24,67,16,67,16,67,16,67,16,67,16,67,16,67,16,67,16,0,0,0,0,0,0,0,0,105,72,73,56,41,56,9,48,8,40,8,40,72,48,72,48,40,48,40,48,8,32,8,32,103,64,103,64,103,64,103,64,71,40,71,40,71,40,71,40,39,40,39,40,39,40,39,40,7,24,7,24,7,24,7,24,0,0,0,0,109,120,109,120,110,128,78,128,46,128,14,128,46,120,14,120,78,120,46,112,77,112,77,112,13,112,13,112,109,112,109,112,77,104,77,104,45,104,45,104,13,104,13,104,109,104,109,104,77,96,77,96,45,96,45,96,13,96,13,96,12,88,12,88,12,88,12,88,76,88,76,88,76,88,76,88,44,88,44,88,44,88,44,88,12,80,12,80,12,80,12,80,108,96,108,96,108,96,108,96,76,80,76,80,76,80,76,80,44,80,44,80,44,80,44,80,12,72,12,72,12,72,12,72,107,88,107,88,107,88,107,88,107,88,107,88,107,88,107,88,75,72,75,72,75,72,75,72,75,72,75,72,75,72,75,72,43,72,43,72,43,72,43,72,43,72,43,72,43,72,43,72,11,64,11,64,11,64,11,64,11,64,11,64,11,64,11,64,107,80,107,80,107,80,107,80,107,80,107,80,107,80,107,80,75,64,75,64,75,64,75,64,75,64,75,64,75,64,75,64,43,64,43,64,43,64,43,64,43,64,43,64,43,64,43,64,11,56,11,56,11,56,11,56,11,56,11,56,11,56,11,56,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,24,70,56,38,56,6,16,102,72,70,48,38,48,6,8,37,40,37,40,69,40,69,40,37,32,37,32,69,32,69,32,37,24,37,24,101,64,101,64,69,24,69,24,37,16,37,16,100,56,100,56,100,56,100,56,100,48,100,48,100,48,100,48,100,40,100,40,100,40,100,40,100,32,100,32,100,32,100,32,100,24,100,24,100,24,100,24,68,16,68,16,68,16,68,16,36,8,36,8,36,8,36,8,4,0,4,0,4,0,4,0,0,0,10,128,106,128,74,128,42,128,10,120,106,120,74,120,42,120,10,112,106,112,74,112,42,112,10,104,41,104,41,104,9,96,9,96,73,104,73,104,41,96,41,96,9,88,9,88,105,104,105,104,73,96,73,96,41,88,41,88,9,80,9,80,104,96,104,96,104,96,104,96,72,88,72,88,72,88,72,88,40,80,40,80,40,80,40,80,8,72,8,72,8,72,8,72,104,88,104,88,104,88,104,88,72,80,72,80,72,80,72,80,40,72,40,72,40,72,40,72,8,64,8,64,8,64,8,64,7,56,7,56,7,56,7,56,7,56,7,56,7,56,7,56,7,48,7,48,7,48,7,48,7,48,7,48,7,48,7,48,71,72,71,72,71,72,71,72,71,72,71,72,71,72,71,72,7,40,7,40,7,40,7,40,7,40,7,40,7,40,7,40,103,80,103,80,103,80,103,80,103,80,103,80,103,80,103,80,71,64,71,64,71,64,71,64,71,64,71,64,71,64,71,64,39,64,39,64,39,64,39,64,39,64,39,64,39,64,39,64,7,32,7,32,7,32,7,32,7,32,7,32,7,32,7,32,6,8,38,8,0,0,6,0,6,16,38,16,70,16,0,0,6,24,38,24,70,24,102,24,6,32,38,32,70,32,102,32,6,40,38,40,70,40,102,40,6,48,38,48,70,48,102,48,6,56,38,56,70,56,102,56,6,64,38,64,70,64,102,64,6,72,38,72,70,72,102,72,6,80,38,80,70,80,102,80,6,88,38,88,70,88,102,88,6,96,38,96,70,96,102,96,6,104,38,104,70,104,102,104,6,112,38,112,70,112,102,112,6,120,38,120,70,120,102,120,6,128,38,128,70,128,102,128,0,0,67,16,2,0,2,0,33,8,33,8,33,8,33,8,103,32,103,32,72,32,40,32,71,24,71,24,39,24,39,24,6,32,6,32,6,32,6,32,6,24,6,24,6,24,6,24,6,16,6,16,6,16,6,16,102,24,102,24,102,24,102,24,38,16,38,16,38,16,38,16,6,8,6,8,6,8,6,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,5,6,7,8,9,10,12,13,15,17,20,22,25,28,32,36,40,45,50,56,63,71,80,90,101,113,127,144,162,182,203,226,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,3,3,3,3,4,4,4,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,2,1,2,3,1,2,3,2,2,3,2,2,4,2,3,4,2,3,4,3,3,5,3,4,6,3,4,6,4,5,7,4,5,8,4,6,9,5,7,10,6,8,11,6,8,13,7,10,14,8,11,16,9,12,18,10,13,20,11,15,23,13,17,25,0,0,0,0,69,82,82,79,82,58,32,37,115,10,0,0,0,0,0,0,66,89,84,69,95,83,84,82,69,65,77,0,0,0,0,0,78,65,76,95,85,78,73,84,0,0,0,0,0,0,0,0,65,67,67,69,83,83,32,85,78,73,84,32,66,79,85,78,68,65,82,89,32,67,72,69,67,75,0,0,0,0,0,0,80,101,110,100,105,110,103,32,97,99,116,105,118,97,116,105,111,110,32,110,111,116,32,99,111,109,112,108,101,116,101,100,0,0,0,0,0,0,0,0,83,69,81,95,80,65,82,65,77,95,83,69,84,0,0,0,80,73,67,95,80,65,82,65,77,95,83,69,84,0,0,0,80,97,114,97,109,32,115,101,116,32,97,99,116,105,118,97,116,105,111,110,0,0,0,0,83,76,73,67,69,95,72,69,65,68,69,82,0,0,0,0,71,97,112,115,32,105,110,32,102,114,97,109,101,32,110,117,109,0,0,0,0,0,0,0,82,101,111,114,100,101,114,105,110,103,0,0,0,0,0,0,83,76,73,67,69,95,68,65,84,65,0,0,0,0,0,0,69,82,82,79,82,58,32,37,115,10,0,0,0,0,0,0,84,82,89,73,78,71,32,84,79,32,77,65,82,75,32,78,79,78,45,65,76,76,79,67,65,84,69,68,32,73,77,65,71,69,0,0,0,0,0,0,3,0,0,0,15,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,3,0,0,0,15,0,0,0,0,0,0,0,5,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,3,0,0,0,15,0,0,0,1,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,3,0,0,0,15,0,0,0,1,0,0,0,10,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,4,0,0,0,1,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,7,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,13,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,3,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,9,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0,1,0,0,0,14,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,255,0,0,0,4,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,1,0,0,0,255,0,0,0,4,0,0,0,2,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,2,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,15,0,0,0,2,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,15,0,0,0,2,0,0,0,10,0,0,0,4,0,0,0,5,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,12,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,9,0,0,0,255,0,0,0,12,0,0,0,255,0,0,0,2,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,2,0,0,0,255,0,0,0,8,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,7,0,0,0,255,0,0,0,2,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,7,0,0,0,255,0,0,0,2,0,0,0,4,0,0,0,13,0,0,0,255,0,0,0,8,0,0,0,1,0,0,0,10,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,10,0,0,0,4,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,10,0,0,0,1,0,0,0,11,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,10,0,0,0,1,0,0,0,11,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,14,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,4,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,1,0,0,0,15,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,1,0,0,0,14,0,0,0,1,0,0,0,15,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,2,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,3,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,6,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,12,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,7,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,7,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,13,0,0,0,0,0,0,0,5,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,7,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,1,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,3,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,13,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,15,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,15,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,9,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,11,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0,255,0,0,0,0,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,11,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0,12,0,0,0,8,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,8,0,0,0,8,0,0,0,12,0,0,0,12,0,0,0,8,0,0,0,8,0,0,0,12,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,4,0,0,0,5,0,0,0,2,0,0,0,3,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,12,0,0,0,13,0,0,0,10,0,0,0,11,0,0,0,14,0,0,0,15,0,0,0,3,0,0,0,15,0,0,0,1,0,0,0,10,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0,3,0,0,0,19,0,0,0,1,0,0,0,18,0,0,0,0,0,0,0,17,0,0,0,4,0,0,0,16,0,0,0,3,0,0,0,23,0,0,0,1,0,0,0,22,0,0,0,0,0,0,0,21,0,0,0,4,0,0,0,20,0,0,0,1,0,0,0,11,0,0,0,1,0,0,0,14,0,0,0,4,0,0,0,1,0,0,0,255,0,0,0,4,0,0,0,1,0,0,0,15,0,0,0,2,0,0,0,10,0,0,0,4,0,0,0,5,0,0,0,255,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,9,0,0,0,255,0,0,0,12,0,0,0,4,0,0,0,7,0,0,0,255,0,0,0,2,0,0,0,4,0,0,0,13,0,0,0,255,0,0,0,8,0,0,0,1,0,0,0,19,0,0,0,2,0,0,0,18,0,0,0,4,0,0,0,17,0,0,0,255,0,0,0,16,0,0,0,1,0,0,0,23,0,0,0,2,0,0,0,22,0,0,0,4,0,0,0,21,0,0,0,255,0,0,0,20,0,0,0,1,0,0,0,10,0,0,0,1,0,0,0,11,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,14,0,0,0,1,0,0,0,15,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,8,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,7,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,13,0,0,0,1,0,0,0,18,0,0,0,1,0,0,0,19,0,0,0,4,0,0,0,16,0,0,0,4,0,0,0,17,0,0,0,1,0,0,0,22,0,0,0,1,0,0,0,23,0,0,0,4,0,0,0,20,0,0,0,4,0,0,0,21,0,0,0,0,0,0,0,5,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,4,0,0,0,2,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,8,0,0,0,0,0,0,0,15,0,0,0,4,0,0,0,10,0,0,0,4,0,0,0,9,0,0,0,4,0,0,0,12,0,0,0,4,0,0,0,11,0,0,0,4,0,0,0,14,0,0,0,0,0,0,0,17,0,0,0,4,0,0,0,16,0,0,0,0,0,0,0,19,0,0,0,4,0,0,0,18,0,0,0,0,0,0,0,21,0,0,0,4,0,0,0,20,0,0,0,0,0,0,0,23,0,0,0,4,0,0,0,22,0,0,0,69,82,82,79,82,58,32,37,115,10,0,0,0,0,0,0,112,105,99,95,112,97,114,97,109,101,116,101,114,95,115,101,116,95,105,100,0,0,0,0,115,101,113,95,112,97,114,97,109,95,115,101,116,95,105,100,0,0,0,0,0,0,0,0,101,110,116,114,111,112,121,95,99,111,100,105,110,103,95,109,111,100,101,95,102,108,97,103,0,0,0,0,0,0,0,0,110,117,109,95,115,108,105,99,101,95,103,114,111,117,112,115,95,109,105,110,117,115,49,0,115,108,105,99,101,95,103,114,111,117,112,95,109,97,112,95,116,121,112,101,0,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,115,108,105,99,101,95,103,114,111,117,112,95,105,100,0,0,110,117,109,95,114,101,102,95,105,100,120,95,108,48,95,97,99,116,105,118,101,95,109,105,110,117,115,49,0,0,0,0,110,117,109,95,114,101,102,95,105,100,120,95,108,49,95,97,99,116,105,118,101,95,109,105,110,117,115,49,0,0,0,0,119,101,105,103,104,116,101,100,95,112,114,101,100,95,102,108,97,103,0,0,0,0,0,0,119,101,105,103,104,116,101,100,95,98,105,112,114,101,100,95,105,100,99,0,0,0,0,0,112,105,99,95,105,110,105,116,95,113,112,95,109,105,110,117,115,50,54,0,0,0,0,0,112,105,99,95,105,110,105,116,95,113,115,95,109,105,110,117,115,50,54,0,0,0,0,0,99,104,114,111,109,97,95,113,112,95,105,110,100,101,120,95,111,102,102,115,101,116,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,69,82,82,79,82,58,32,37,115,10,0,0,0,0,0,0,115,101,113,95,112,97,114,97,109,95,115,101,116,95,105,100,0,0,0,0,0,0,0,0,108,111,103,50,95,109,97,120,95,102,114,97,109,101,95,110,117,109,95,109,105,110,117,115,52,0,0,0,0,0,0,0,112,105,99,95,111,114,100,101,114,95,99,110,116,95,116,121,112,101,0,0,0,0,0,0,108,111,103,50,95,109,97,120,95,112,105,99,95,111,114,100,101,114,95,99,110,116,95,108,115,98,95,109,105,110,117,115,52,0,0,0,0,0,0,0,110,117,109,95,114,101,102,95,102,114,97,109,101,115,95,105,110,95,112,105,99,95,111,114,100,101,114,95,99,110,116,95,99,121,99,108,101,0,0,0,110,117,109,95,114,101,102,95,102,114,97,109,101,115,0,0,102,114,97,109,101,95,109,98,115,95,111,110,108,121,95,102,108,97,103,0,0,0,0,0,102,114,97,109,101,95,99,114,111,112,112,105,110,103,0,0,69,82,82,79,82,58,32,37,115,10,0,0,0,0,0,0,80,114,105,109,97,114,121,32,97,110,100,32,97,108,114,101,97,100,121,32,100,101,99,111,100,101,100,0,0,0,0,0,115,107,105,112,95,114,117,110,0,0,0,0,0,0,0,0,109,97,99,114,111,98,108,111,99,107,95,108,97,121,101,114,0,0,0,0,0,0,0,0,77,65,67,82,79,95,66,76,79,67,75,0,0,0,0,0,78,101,120,116,32,109,98,32,97,100,100,114,101,115,115,0,78,117,109,32,100,101,99,111,100,101,100,32,109,98,115,0,69,82,82,79,82,58,32,37,115,10,0,0,0,0,0,0,102,105,114,115,116,95,109,98,95,105,110,95,115,108,105,99,101,0,0,0,0,0,0,0,115,108,105,99,101,95,116,121,112,101,0,0,0,0,0,0,112,105,99,95,112,97,114,97,109,101,116,101,114,95,115,101,116,95,105,100,0,0,0,0,102,114,97,109,101,95,110,117,109,0,0,0,0,0,0,0,105,100,114,95,112,105,99,95,105,100,0,0,0,0,0,0,114,101,100,117,110,100,97,110,116,95,112,105,99,95,99,110,116,0,0,0,0,0,0,0,110,117,109,95,114,101,102,95,105,100,120,95,108,48,95,97,99,116,105,118,101,95,109,105,110,117,115,49,0,0,0,0,110,117,109,95,114,101,102,95,105,100,120,95,97,99,116,105,118,101,95,111,118,101,114,114,105,100,101,95,102,108,97,103,0,0,0,0,0,0,0,0,115,108,105,99,101,95,113,112,95,100,101,108,116,97,0,0,100,105,115,97,98,108,101,95,100,101,98,108,111,99,107,105,110,103,95,102,105,108,116,101,114,95,105,100,99,0,0,0,115,108,105,99,101,95,97,108,112,104,97,95,99,48,95,111,102,102,115,101,116,95,100,105,118,50,0,0,0,0,0,0,115,108,105,99,101,95,98,101,116,97,95,111,102,102,115,101,116,95,100,105,118,50,0,0,115,108,105,99,101,95,103,114,111,117,112,95,99,104,97,110,103,101,95,99,121,99,108,101,0,0,0,0,0,0,0,0,108,111,110,103,95,116,101,114,109,95,114,101,102,101,114,101,110,99,101,95,102,108,97,103,0,0,0,0,0,0,0,0,84,111,111,32,109,97,110,121,32,109,97,110,97,103,101,109,101,110,116,32,111,112,101,114,97,116,105,111,110,115,0,0,109,101,109,111,114,121,95,109,97,110,97,103,101,109,101,110,116,95,99,111,110,116,114,111,108,95,111,112,101,114,97,116,105,111,110,0,0,0,0,0,109,97,120,95,108,111,110,103,95,116,101,114,109,95,102,114,97,109,101,95,105,100,120,95,112,108,117,115,49,0,0,0,84,111,111,32,109,97,110,121,32,114,101,111,114,100,101,114,105,110,103,32,99,111,109,109,97,110,100,115,0,0,0,0,114,101,111,114,100,101,114,105,110,103,95,111,102,95,112,105,99,95,110,117,109,115,95,105,100,99,0,0,0,0,0,0,97,98,115,95,100,105,102,102,95,112,105,99,95,110,117,109,95,109,105,110,117,115,49,0,114,101,102,95,112,105,99,95,108,105,115,116,95,114,101,111,114,100,101,114,105,110,103,0,0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,7,7,8,8,8,8,0,0,0,0,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,4,5,0,1,2,3,0,0,0,0,10,0,0,0,13,0,0,0,16,0,0,0,11,0,0,0,14,0,0,0,18,0,0,0,13,0,0,0,16,0,0,0,20,0,0,0,14,0,0,0,18,0,0,0,23,0,0,0,16,0,0,0,20,0,0,0,25,0,0,0,18,0,0,0,23,0,0,0,29,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,16,0,0,0,17,0,0,0,18,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,28,0,0,0,29,0,0,0,29,0,0,0,30,0,0,0,31,0,0,0,32,0,0,0,32,0,0,0,33,0,0,0,34,0,0,0,34,0,0,0,35,0,0,0,35,0,0,0,36,0,0,0,36,0,0,0,37,0,0,0,37,0,0,0,37,0,0,0,38,0,0,0,38,0,0,0,38,0,0,0,39,0,0,0,39,0,0,0,39,0,0,0,39,0,0,0,1,0,0,0,2,0,0,0,4,0,0,0,8,0,0,0,16,0,0,0,32,0,0,0,64,0,0,0,128,0,0,0,47,31,15,0,23,27,29,30,7,11,13,14,39,43,45,46,16,3,5,10,12,19,21,26,28,35,37,42,44,1,2,4,8,17,18,20,24,6,9,22,25,32,33,34,36,40,38,41,0,16,1,2,4,8,32,3,5,10,12,15,47,7,11,13,14,6,9,31,35,37,42,44,33,34,36,40,39,43,45,46,17,18,20,24,19,21,26,28,23,27,29,30,22,25,38,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function _llvm_lifetime_end() {}

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

   
  Module["_memset"] = _memset;

  var _llvm_memset_p0i8_i32=_memset;

  function _abort() {
      Module['abort']();
    }

  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }


  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function ___errno_location() {
      return ___errno_state;
    }

  function _llvm_lifetime_start() {}

  var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        var canvasContainer = canvas.parentNode;
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            var canvasContainer = canvas.parentNode;
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stderr|0;var n=0;var o=0;var p=0;var q=0;var r=+env.NaN,s=+env.Infinity;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=env.abort;var aa=env.assert;var ba=env.asmPrintInt;var ca=env.asmPrintFloat;var da=env.min;var ea=env._llvm_lifetime_start;var fa=env._fflush;var ga=env.__formatString;var ha=env._time;var ia=env._send;var ja=env._pwrite;var ka=env._abort;var la=env.__reallyNegative;var ma=env._fwrite;var na=env._sbrk;var oa=env._mkport;var pa=env._fprintf;var qa=env.___setErrNo;var ra=env._llvm_lifetime_end;var sa=env._fileno;var ta=env._write;var ua=env._emscripten_memcpy_big;var va=env._sysconf;var wa=env.___errno_location;var xa=0.0;
// EMSCRIPTEN_START_FUNCS
function Eb(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;g=i;h=c[e>>2]|0;if((h|0)==16777215){i=g;return}j=f>>>0<16;k=j?16:8;l=j?f:f&3;l=(_(c[4648+(l<<2)>>2]|0,k)|0)+(c[4584+(l<<2)>>2]|0)|0;n=b+l|0;j=c[e+4>>2]|0;m=b+(l+1)|0;f=d[m]|0;a[n]=a[4712+(h+512+(d[n]|0))|0]|0;n=c[e+8>>2]|0;h=b+(l+2)|0;o=d[h]|0;a[m]=a[4712+(j+512+f)|0]|0;m=b+(l+3)|0;f=a[4712+((c[e+12>>2]|0)+512+(d[m]|0))|0]|0;a[h]=a[4712+(n+512+o)|0]|0;a[m]=f;l=l+k|0;m=b+l|0;f=c[e+20>>2]|0;h=b+(l+1)|0;o=d[h]|0;a[m]=a[4712+((c[e+16>>2]|0)+512+(d[m]|0))|0]|0;m=c[e+24>>2]|0;n=b+(l+2)|0;j=d[n]|0;a[h]=a[4712+(f+512+o)|0]|0;h=b+(l+3)|0;o=a[4712+((c[e+28>>2]|0)+512+(d[h]|0))|0]|0;a[n]=a[4712+(m+512+j)|0]|0;a[h]=o;l=l+k|0;h=b+l|0;o=c[e+36>>2]|0;n=b+(l+1)|0;j=d[n]|0;a[h]=a[4712+((c[e+32>>2]|0)+512+(d[h]|0))|0]|0;h=c[e+40>>2]|0;m=b+(l+2)|0;f=d[m]|0;a[n]=a[4712+(o+512+j)|0]|0;n=b+(l+3)|0;j=a[4712+((c[e+44>>2]|0)+512+(d[n]|0))|0]|0;a[m]=a[4712+(h+512+f)|0]|0;a[n]=j;k=l+k|0;l=b+k|0;n=c[e+52>>2]|0;j=b+(k+1)|0;m=d[j]|0;a[l]=a[4712+((c[e+48>>2]|0)+512+(d[l]|0))|0]|0;l=c[e+56>>2]|0;f=b+(k+2)|0;h=d[f]|0;a[j]=a[4712+(n+512+m)|0]|0;k=b+(k+3)|0;j=a[4712+((c[e+60>>2]|0)+512+(d[k]|0))|0]|0;a[f]=a[4712+(l+512+h)|0]|0;a[k]=j;i=g;return}function Fb(a,d,e,f,g){a=a|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;h=i;i=i+48|0;s=h;r=h+8|0;w=h+16|0;x=h+24|0;m=h+32|0;n=h+40|0;_c(d|0,0,2088)|0;q=Rc(a,m)|0;A=c[m>>2]|0;do{if((f|0)==2|(f|0)==7){f=A+6|0;if(f>>>0<32&(q|0)==0){c[d>>2]=f;break}else{A=1;i=h;return A|0}}else{f=A+1|0;if(f>>>0<32&(q|0)==0){c[d>>2]=f;break}else{A=1;i=h;return A|0}}}while(0);q=d;a:do{if((f|0)==31){while(1){if((Ic(a)|0)!=0){break}if((Fc(a,1)|0)!=0){z=1;t=99;break}}if((t|0)==99){i=h;return z|0}e=0;d=d+328|0;while(1){j=Fc(a,8)|0;c[m>>2]=j;if((j|0)==-1){z=1;break}c[d>>2]=j;e=e+1|0;if(e>>>0<384){d=d+4|0}else{break a}}i=h;return z|0}else{b:do{if(f>>>0<6){if((f|0)==0|(f|0)==1){u=r;v=s}else if((f|0)==3|(f|0)==2){u=r;v=s}else{A=0;while(1){if((Rc(a,w)|0)!=0){z=1;t=99;break}t=c[w>>2]|0;if(t>>>0>3){z=1;t=99;break}c[d+(A<<2)+176>>2]=t;A=A+1|0;if(!(A>>>0<4)){t=18;break}}if((t|0)==18){c:do{if(g>>>0<2|(f|0)==5){y=0}else{t=g>>>0>2|0;z=0;while(1){if((Uc(a,w,t)|0)!=0){z=1;t=99;break}A=c[w>>2]|0;if(!(A>>>0<g>>>0)){z=1;t=99;break}c[d+(z<<2)+192>>2]=A;z=z+1|0;if(!(z>>>0<4)){y=0;break c}}if((t|0)==99){i=h;return z|0}}}while(0);d:while(1){t=c[d+(y<<2)+176>>2]|0;if((t|0)==0){t=0}else if((t|0)==2|(t|0)==1){t=1}else{t=3}c[w>>2]=t;t=0;while(1){z=Sc(a,x)|0;if((z|0)!=0){t=99;break d}b[d+(y<<4)+(t<<2)+208>>1]=c[x>>2];z=Sc(a,x)|0;if((z|0)!=0){t=99;break d}b[d+(y<<4)+(t<<2)+210>>1]=c[x>>2];A=c[w>>2]|0;c[w>>2]=A+ -1;if((A|0)==0){break}else{t=t+1|0}}y=y+1|0;if(!(y>>>0<4)){p=2;t=72;break b}}if((t|0)==99){i=h;return z|0}}else if((t|0)==99){i=h;return z|0}}if(g>>>0>1){if((f|0)==3|(f|0)==2){w=1}else if((f|0)==0|(f|0)==1){w=0}else{w=3}t=g>>>0>2|0;x=0;while(1){if((Uc(a,s,t)|0)!=0){o=1;t=70;break b}y=c[s>>2]|0;if(!(y>>>0<g>>>0)){o=1;t=70;break b}c[d+(x<<2)+144>>2]=y;if((w|0)==0){break}else{w=w+ -1|0;x=x+1|0}}}if((f|0)==0|(f|0)==1){t=0;s=0}else if((f|0)==3|(f|0)==2){t=1;s=0}else{t=3;s=0}while(1){g=Sc(a,r)|0;if((g|0)!=0){o=g;t=70;break b}b[d+(s<<2)+160>>1]=c[r>>2];g=Sc(a,r)|0;if((g|0)!=0){o=g;t=70;break b}b[d+(s<<2)+162>>1]=c[r>>2];if((t|0)==0){p=2;t=72;break}else{t=t+ -1|0;s=s+1|0}}}else{v=(f|0)!=6;u=v&1;f=s;g=r;if((u|0)==0){c[r>>2]=0;t=0;while(1){w=Gc(a)|0;c[s>>2]=w;A=w>>>31;c[d+(t<<2)+12>>2]=A;if((A|0)==0){c[d+(t<<2)+76>>2]=w>>>28&7;w=w<<4;y=1}else{w=w<<1;y=0}x=t|1;A=w>>>31;c[d+(x<<2)+12>>2]=A;if((A|0)==0){c[d+(x<<2)+76>>2]=w>>>28&7;w=w<<4;y=y+1|0}else{w=w<<1}x=x+1|0;A=w>>>31;c[d+(x<<2)+12>>2]=A;if((A|0)==0){c[d+(x<<2)+76>>2]=w>>>28&7;x=w<<4;y=y+1|0}else{x=w<<1}w=t|3;A=x>>>31;c[d+(w<<2)+12>>2]=A;if((A|0)==0){c[d+(w<<2)+76>>2]=x>>>28&7;x=x<<4;y=y+1|0}else{x=x<<1}z=w+1|0;A=x>>>31;c[d+(z<<2)+12>>2]=A;if((A|0)==0){c[d+(z<<2)+76>>2]=x>>>28&7;x=x<<4;y=y+1|0}else{x=x<<1}z=w+2|0;A=x>>>31;c[d+(z<<2)+12>>2]=A;if((A|0)==0){c[d+(z<<2)+76>>2]=x>>>28&7;x=x<<4;y=y+1|0}else{x=x<<1}w=w+3|0;A=x>>>31;c[d+(w<<2)+12>>2]=A;if((A|0)==0){c[d+(w<<2)+76>>2]=x>>>28&7;w=x<<4;y=y+1|0}else{w=x<<1}x=t|7;A=w>>>31;c[d+(x<<2)+12>>2]=A;if((A|0)==0){c[d+(x<<2)+76>>2]=w>>>28&7;w=w<<4;y=y+1|0}else{w=w<<1}c[s>>2]=w;if((Hc(a,(y*3|0)+8|0)|0)==-1){o=1;t=70;break b}A=(c[r>>2]|0)+1|0;c[r>>2]=A;if((A|0)<2){t=t+8|0}else{t=53;break}}}else if((u|0)==1){t=53}if((t|0)==53){if((Rc(a,s)|0)!=0){o=1;t=70;break}r=c[s>>2]|0;if(r>>>0>3){o=1;t=70;break}c[d+140>>2]=r}if(!v){p=u;t=72;break}r=c[q>>2]|0;A=r+ -7|0;s=A>>>2;c[d+4>>2]=(A>>>0>11?s+268435453|0:s)<<4|(r>>>0>18?15:0)}}while(0);if((t|0)==70){A=o;i=h;return A|0}do{if((t|0)==72){o=Tc(a,m,(p|0)==0|0)|0;if((o|0)==0){A=c[m>>2]|0;c[d+4>>2]=A;if((A|0)==0){break a}else{break}}else{A=o;i=h;return A|0}}}while(0);if((Sc(a,n)|0)!=0){A=1;i=h;return A|0}m=c[n>>2]|0;if((m+26|0)>>>0>51){A=1;i=h;return A|0}c[d+8>>2]=m;p=c[d+4>>2]|0;m=d+272|0;e:do{if((c[q>>2]|0)>>>0<7){o=3;r=0;while(1){n=p>>>1;if((p&1|0)==0){r=r+4|0}else{p=3;while(1){q=Pa(a,d+(r<<6)+328|0,Mb(e,r,m)|0,16)|0;c[d+(r<<2)+1992>>2]=q>>>16;if((q&15|0)!=0){l=q;break e}b[d+(r<<1)+272>>1]=q>>>4&255;r=r+1|0;if((p|0)==0){break}else{p=p+ -1|0}}}if((o|0)==0){k=n;j=r;t=90;break}else{o=o+ -1|0;p=n}}}else{n=Pa(a,d+1864|0,Mb(e,0,m)|0,16)|0;if((n&15|0)!=0){l=n;break}b[d+320>>1]=n>>>4&255;n=3;q=0;while(1){o=p>>>1;if((p&1|0)==0){q=q+4|0}else{p=3;r=q;while(1){q=Pa(a,d+(r<<6)+332|0,Mb(e,r,m)|0,15)|0;c[d+(r<<2)+1992>>2]=q>>>15;if((q&15|0)!=0){l=q;break e}b[d+(r<<1)+272>>1]=q>>>4&255;q=r+1|0;if((p|0)==0){break}else{p=p+ -1|0;r=q}}}if((n|0)==0){k=o;j=q;t=90;break}else{n=n+ -1|0;p=o}}}}while(0);f:do{if((t|0)==90){if((k&3|0)!=0){l=Pa(a,d+1928|0,-1,4)|0;if((l&15|0)!=0){break}b[d+322>>1]=l>>>4&255;l=Pa(a,d+1944|0,-1,4)|0;if((l&15|0)!=0){break}b[d+324>>1]=l>>>4&255}if((k&2|0)==0){l=0;break}else{k=7}while(1){l=Pa(a,d+(j<<6)+332|0,Mb(e,j,m)|0,15)|0;if((l&15|0)!=0){break f}b[d+(j<<1)+272>>1]=l>>>4&255;c[d+(j<<2)+1992>>2]=l>>>15;if((k|0)==0){l=0;break}else{k=k+ -1|0;j=j+1|0}}}}while(0);c[a+16>>2]=((c[a+4>>2]|0)-(c[a>>2]|0)<<3)+(c[a+8>>2]|0);if((l|0)==0){break}else{z=l}i=h;return z|0}}while(0);A=0;i=h;return A|0}function Gb(a){a=a|0;if(a>>>0<6){a=2}else{a=(a|0)!=6|0}i=i;return a|0}function Hb(a){a=a|0;var b=0;b=i;if((a|0)==3|(a|0)==2){a=2}else if((a|0)==0|(a|0)==1){a=1}else{a=4}i=b;return a|0}function Ib(a){a=a|0;var b=0;b=i;if((a|0)==2|(a|0)==1){a=2}else if((a|0)==0){a=1}else{a=4}i=b;return a|0}function Jb(a){a=a|0;i=i;return a+1&3|0}function Kb(d,e,f,g,h,j,k,l){d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;m=i;o=c[e>>2]|0;p=d;c[p>>2]=o;q=d+196|0;c[q>>2]=(c[q>>2]|0)+1;Qc(f,j);if((o|0)==31){n=d+28|0;c[d+20>>2]=0;if((c[q>>2]|0)>>>0>1){b[n>>1]=16;b[d+30>>1]=16;b[d+32>>1]=16;b[d+34>>1]=16;b[d+36>>1]=16;b[d+38>>1]=16;b[d+40>>1]=16;b[d+42>>1]=16;b[d+44>>1]=16;b[d+46>>1]=16;b[d+48>>1]=16;b[d+50>>1]=16;b[d+52>>1]=16;b[d+54>>1]=16;b[d+56>>1]=16;b[d+58>>1]=16;b[d+60>>1]=16;b[d+62>>1]=16;b[d+64>>1]=16;b[d+66>>1]=16;b[d+68>>1]=16;b[d+70>>1]=16;b[d+72>>1]=16;b[d+74>>1]=16;u=0;i=m;return u|0}d=23;o=e+328|0;e=l;while(1){b[n>>1]=16;a[e]=c[o>>2];a[e+1|0]=c[o+4>>2];a[e+2|0]=c[o+8>>2];a[e+3|0]=c[o+12>>2];a[e+4|0]=c[o+16>>2];a[e+5|0]=c[o+20>>2];a[e+6|0]=c[o+24>>2];a[e+7|0]=c[o+28>>2];a[e+8|0]=c[o+32>>2];a[e+9|0]=c[o+36>>2];a[e+10|0]=c[o+40>>2];a[e+11|0]=c[o+44>>2];a[e+12|0]=c[o+48>>2];a[e+13|0]=c[o+52>>2];a[e+14|0]=c[o+56>>2];a[e+15|0]=c[o+60>>2];if((d|0)==0){break}else{n=n+2|0;e=e+16|0;o=o+64|0;d=d+ -1|0}}wb(f,l);u=0;i=m;return u|0}q=d+28|0;do{if((o|0)==0){s=q+0|0;q=s+54|0;do{b[s>>1]=0;s=s+2|0}while((s|0)<(q|0));c[d+20>>2]=c[h>>2];n=39}else{s=q+0|0;r=e+272|0;q=s+54|0;do{b[s>>1]=b[r>>1]|0;s=s+2|0;r=r+2|0}while((s|0)<(q|0));q=c[e+8>>2]|0;s=c[h>>2]|0;do{if((q|0)!=0){s=s+q|0;c[h>>2]=s;if((s|0)<0){s=s+52|0;c[h>>2]=s;break}if((s|0)<=51){break}s=s+ -52|0;c[h>>2]=s}}while(0);h=d+20|0;c[h>>2]=s;t=e+328|0;r=e+1992|0;q=d+28|0;a:do{if((c[p>>2]|0)>>>0<7){p=15;while(1){s=t;if((b[q>>1]|0)==0){c[s>>2]=16777215}else{if((Jc(s,c[h>>2]|0,0,c[r>>2]|0)|0)!=0){f=1;break}}t=t+64|0;q=q+2|0;r=r+4|0;if((p|0)==0){p=t;break a}else{p=p+ -1|0}}i=m;return f|0}else{if((b[d+76>>1]|0)==0){p=15;u=5992}else{Kc(e+1864|0,s);p=15;u=5992}while(1){s=u+4|0;v=c[e+(c[u>>2]<<2)+1864>>2]|0;u=t;c[u>>2]=v;do{if((v|0)==0){if((b[q>>1]|0)!=0){n=18;break}c[u>>2]=16777215}else{n=18}}while(0);if((n|0)==18){n=0;if((Jc(u,c[h>>2]|0,1,c[r>>2]|0)|0)!=0){f=1;break}}t=t+64|0;q=q+2|0;r=r+4|0;if((p|0)==0){p=t;break a}else{p=p+ -1|0;u=s}}i=m;return f|0}}while(0);h=(c[d+24>>2]|0)+(c[h>>2]|0)|0;if((h|0)<0){h=0}else{h=(h|0)>51?51:h}h=c[8408+(h<<2)>>2]|0;do{if((b[d+78>>1]|0)==0){if((b[d+80>>1]|0)!=0){n=30;break}s=7;u=e+1928|0}else{n=30}}while(0);if((n|0)==30){u=e+1928|0;Lc(u,h);s=7}while(1){t=u+4|0;v=c[u>>2]|0;u=p;c[u>>2]=v;do{if((v|0)==0){if((b[q>>1]|0)!=0){n=33;break}c[u>>2]=16777215}else{n=33}}while(0);if((n|0)==33){n=0;if((Jc(u,h,1,c[r>>2]|0)|0)!=0){f=1;n=41;break}}if((s|0)==0){break}else{r=r+4|0;s=s+ -1|0;p=p+64|0;q=q+2|0;u=t}}if((n|0)==41){i=m;return f|0}if(o>>>0<6){n=39;break}f=zb(d,e,f,j,k,l)|0;if((f|0)==0){break}i=m;return f|0}}while(0);do{if((n|0)==39){f=yb(d,e,g,j,f,l)|0;if((f|0)==0){break}i=m;return f|0}}while(0);v=0;i=m;return v|0}function Lb(a){a=a|0;i=i;return a|0}function Mb(d,e,f){d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;k=Qb(e)|0;j=Rb(e)|0;h=a[k+4|0]|0;e=a[j+4|0]|0;j=(c[j>>2]|0)==4;if((c[k>>2]|0)==4){h=b[f+((h&255)<<1)>>1]|0;if(j){k=h+1+(b[f+((e&255)<<1)>>1]|0)>>1;i=g;return k|0}f=d+204|0;if((Ub(d,c[f>>2]|0)|0)==0){k=h;i=g;return k|0}k=h+1+(b[(c[f>>2]|0)+((e&255)<<1)+28>>1]|0)>>1;i=g;return k|0}if(j){f=b[f+((e&255)<<1)>>1]|0;e=d+200|0;if((Ub(d,c[e>>2]|0)|0)==0){k=f;i=g;return k|0}k=f+1+(b[(c[e>>2]|0)+((h&255)<<1)+28>>1]|0)>>1;i=g;return k|0}f=d+200|0;if((Ub(d,c[f>>2]|0)|0)==0){h=0;f=0}else{h=b[(c[f>>2]|0)+((h&255)<<1)+28>>1]|0;f=1}j=d+204|0;if((Ub(d,c[j>>2]|0)|0)==0){k=h;i=g;return k|0}d=b[(c[j>>2]|0)+((e&255)<<1)+28>>1]|0;if((f|0)==0){k=d;i=g;return k|0}k=h+1+d>>1;i=g;return k|0}function Nb(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;a:do{if((Fc(a,1)|0)==-1){b=1}else{e=b+4|0;c[e>>2]=Fc(a,2)|0;a=Fc(a,5)|0;c[b>>2]=a;if((a&-2|0)==2|(a|0)==4){b=1;break}if((a+ -7|0)>>>0<2|(a|0)==5){if((c[e>>2]|0)==0){b=1;break}}switch(a|0){case 6:case 9:case 10:case 11:case 12:{if((c[e>>2]|0)!=0){b=1;break a}break};default:{}}b=0}}while(0);i=d;return b|0}function Ob(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;k=i;if((d|0)==0){i=k;return}h=b+ -1|0;e=1-b|0;j=~b;m=0;l=0;g=0;while(1){n=(m|0)!=0;if(n){c[a+(l*216|0)+200>>2]=a+((l+ -1|0)*216|0)}else{c[a+(l*216|0)+200>>2]=0}o=(g|0)!=0;do{if(o){c[a+(l*216|0)+204>>2]=a+((l-b|0)*216|0);if(!(m>>>0<h>>>0)){f=10;break}c[a+(l*216|0)+208>>2]=a+((e+l|0)*216|0)}else{c[a+(l*216|0)+204>>2]=0;f=10}}while(0);if((f|0)==10){f=0;c[a+(l*216|0)+208>>2]=0}if(o&n){c[a+(l*216|0)+212>>2]=a+((l+j|0)*216|0)}else{c[a+(l*216|0)+212>>2]=0}m=m+1|0;n=(m|0)==(b|0);l=l+1|0;if((l|0)==(d|0)){break}else{m=n?0:m;g=(n&1)+g|0}}i=k;return}function Pb(a,b){a=a|0;b=b|0;switch(b|0){case 1:{a=c[a+204>>2]|0;break};case 3:{a=c[a+212>>2]|0;break};case 2:{a=c[a+208>>2]|0;break};case 4:{break};case 0:{a=c[a+200>>2]|0;break};default:{a=0}}i=i;return a|0}function Qb(a){a=a|0;i=i;return 6632+(a<<3)|0}function Rb(a){a=a|0;i=i;return 6440+(a<<3)|0}function Sb(a){a=a|0;i=i;return 6248+(a<<3)|0}function Tb(a){a=a|0;i=i;return 6056+(a<<3)|0}function Ub(a,b){a=a|0;b=b|0;var d=0;d=i;if((b|0)==0){i=d;return 0}else{i=d;return(c[a+4>>2]|0)==(c[b+4>>2]|0)|0}return 0}function Vb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;f=i;a:do{if((c[d+284>>2]|0)==0){g=0}else{h=0;while(1){g=c[d+(h*20|0)+288>>2]|0;if((g|0)==5){g=1;break a}else if((g|0)==0){break}h=h+1|0}g=0}}while(0);h=c[b+16>>2]|0;if((h|0)==1){do{if((c[e>>2]|0)==5){h=0}else{h=c[a+12>>2]|0;if(!((c[a+8>>2]|0)>>>0>(c[d+12>>2]|0)>>>0)){break}h=(c[b+12>>2]|0)+h|0}}while(0);k=c[b+36>>2]|0;n=(k|0)==0;if(n){j=0}else{j=(c[d+12>>2]|0)+h|0}e=(c[e+4>>2]|0)==0;j=(((j|0)!=0&e)<<31>>31)+j|0;l=(j|0)!=0;if(l){m=j+ -1|0;j=(m>>>0)%(k>>>0)|0;m=(m>>>0)/(k>>>0)|0}else{j=0;m=0}if(n){p=0}else{n=c[b+40>>2]|0;p=0;o=0;while(1){p=(c[n+(o<<2)>>2]|0)+p|0;o=o+1|0;if(o>>>0<k>>>0){}else{break}}}if(l){m=_(p,m)|0;k=c[b+40>>2]|0;l=0;while(1){m=(c[k+(l<<2)>>2]|0)+m|0;l=l+1|0;if(l>>>0>j>>>0){break}else{}}}else{m=0}if(e){m=(c[b+28>>2]|0)+m|0}e=(c[d+32>>2]|0)+(c[b+32>>2]|0)|0;b=a+12|0;if((g|0)==0){p=((e|0)<0?e:0)+m+(c[d+28>>2]|0)|0;c[b>>2]=h;c[a+8>>2]=c[d+12>>2];i=f;return p|0}else{c[b>>2]=0;c[a+8>>2]=0;p=0;i=f;return p|0}}else if((h|0)==0){if((c[e>>2]|0)==5){c[a+4>>2]=0;c[a>>2]=0;m=0}else{m=c[a>>2]|0}l=d+20|0;k=c[l>>2]|0;h=a;do{if(k>>>0<m>>>0){n=c[b+20>>2]|0;if((m-k|0)>>>0<n>>>1>>>0){j=12;break}b=(c[a+4>>2]|0)+n|0}else{j=12}}while(0);b:do{if((j|0)==12){do{if(k>>>0>m>>>0){b=c[b+20>>2]|0;if(!((k-m|0)>>>0>b>>>1>>>0)){break}b=(c[a+4>>2]|0)-b|0;break b}}while(0);b=c[a+4>>2]|0}}while(0);e=e+4|0;if((c[e>>2]|0)==0){a=c[d+24>>2]|0;p=k+b+((a|0)<0?a:0)|0;i=f;return p|0}c[a+4>>2]=b;j=c[l>>2]|0;d=d+24|0;k=c[d>>2]|0;b=j+b+((k|0)<0?k:0)|0;if((c[e>>2]|0)==0){p=b;i=f;return p|0}if((g|0)==0){c[h>>2]=j;p=b;i=f;return p|0}else{c[a+4>>2]=0;a=c[d>>2]|0;c[h>>2]=(a|0)<0?0-a|0:0;p=0;i=f;return p|0}}else{if((c[e>>2]|0)==5){j=a+12|0;k=0;b=0}else{h=c[d+12>>2]|0;j=a+12|0;k=c[j>>2]|0;if((c[a+8>>2]|0)>>>0>h>>>0){b=(c[b+12>>2]|0)+k|0}else{b=k}k=b;b=(h+b<<1)+(((c[e+4>>2]|0)==0)<<31>>31)|0}if((g|0)==0){c[j>>2]=k;c[a+8>>2]=c[d+12>>2];p=b;i=f;return p|0}else{c[j>>2]=0;c[a+8>>2]=0;p=0;i=f;return p|0}}return 0}function Wb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;d=i;i=i+8|0;e=d;g=i;i=i+8|0;h=i;i=i+8|0;l=i;i=i+8|0;n=i;i=i+8|0;j=i;i=i+8|0;o=i;i=i+8|0;p=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;q=i;i=i+8|0;t=i;i=i+8|0;u=i;i=i+8|0;k=i;i=i+8|0;f=i;i=i+8|0;v=b+0|0;w=v+72|0;do{c[v>>2]=0;v=v+4|0}while((v|0)<(w|0));v=b;w=Rc(a,v)|0;if((w|0)!=0){i=d;return w|0}if((c[v>>2]|0)>>>0>255){w=c[m>>2]|0;c[u>>2]=6840;pa(w|0,6824,u|0)|0;w=1;i=d;return w|0}u=b+4|0;v=Rc(a,u)|0;if((v|0)!=0){w=v;i=d;return w|0}if((c[u>>2]|0)>>>0>31){w=c[m>>2]|0;c[t>>2]=6864;pa(w|0,6824,t|0)|0;w=1;i=d;return w|0}if((Fc(a,1)|0)!=0){w=c[m>>2]|0;c[q>>2]=6888;pa(w|0,6824,q|0)|0;w=1;i=d;return w|0}q=Fc(a,1)|0;if((q|0)==-1){w=1;i=d;return w|0}c[b+8>>2]=(q|0)==1;q=Rc(a,k)|0;if((q|0)!=0){w=q;i=d;return w|0}t=(c[k>>2]|0)+1|0;q=b+12|0;c[q>>2]=t;if(t>>>0>8){w=c[m>>2]|0;c[s>>2]=6920;pa(w|0,6824,s|0)|0;w=1;i=d;return w|0}a:do{if(t>>>0>1){s=b+16|0;t=Rc(a,s)|0;if((t|0)!=0){w=t;i=d;return w|0}s=c[s>>2]|0;if(s>>>0>6){w=c[m>>2]|0;c[r>>2]=6944;pa(w|0,6824,r|0)|0;w=1;i=d;return w|0}switch(s|0){case 5:case 4:case 3:{p=Fc(a,1)|0;if((p|0)==-1){w=1;i=d;return w|0}c[b+32>>2]=(p|0)==1;p=Rc(a,k)|0;if((p|0)==0){c[b+36>>2]=(c[k>>2]|0)+1;break a}else{w=p;i=d;return w|0}};case 6:{r=Rc(a,k)|0;if((r|0)!=0){w=r;i=d;return w|0}u=(c[k>>2]|0)+1|0;t=b+40|0;c[t>>2]=u;w=Xc(u<<2)|0;s=b+44|0;c[s>>2]=w;if((w|0)==0){w=65535;i=d;return w|0}r=c[6968+((c[q>>2]|0)+ -1<<2)>>2]|0;if((u|0)==0){break a}else{u=0}while(1){w=Fc(a,r)|0;c[(c[s>>2]|0)+(u<<2)>>2]=w;u=u+1|0;if(!(w>>>0<(c[q>>2]|0)>>>0)){break}if(!(u>>>0<(c[t>>2]|0)>>>0)){break a}}w=c[m>>2]|0;c[p>>2]=7e3;pa(w|0,6824,p|0)|0;w=1;i=d;return w|0};case 0:{r=c[q>>2]|0;w=Xc(r<<2)|0;p=b+20|0;c[p>>2]=w;if((w|0)==0){w=65535;i=d;return w|0}if((r|0)==0){break a}else{r=0}while(1){t=Rc(a,k)|0;if((t|0)!=0){break}c[(c[p>>2]|0)+(r<<2)>>2]=(c[k>>2]|0)+1;r=r+1|0;if(!(r>>>0<(c[q>>2]|0)>>>0)){break a}}i=d;return t|0};case 2:{s=c[q>>2]|0;w=(s<<2)+ -4|0;v=Xc(w)|0;p=b+24|0;c[p>>2]=v;w=Xc(w)|0;r=b+28|0;c[r>>2]=w;if((v|0)==0|(w|0)==0){w=65535;i=d;return w|0}if((s|0)==1){break a}else{s=0}while(1){t=Rc(a,k)|0;if((t|0)!=0){p=59;break}c[(c[p>>2]|0)+(s<<2)>>2]=c[k>>2];t=Rc(a,k)|0;if((t|0)!=0){p=59;break}c[(c[r>>2]|0)+(s<<2)>>2]=c[k>>2];s=s+1|0;if(!(s>>>0<((c[q>>2]|0)+ -1|0)>>>0)){break a}}if((p|0)==59){i=d;return t|0}break};default:{break a}}}}while(0);p=Rc(a,k)|0;if((p|0)!=0){w=p;i=d;return w|0}p=c[k>>2]|0;if(p>>>0>31){w=c[m>>2]|0;c[o>>2]=7016;pa(w|0,6824,o|0)|0;w=1;i=d;return w|0}c[b+48>>2]=p+1;o=Rc(a,k)|0;if((o|0)!=0){w=o;i=d;return w|0}if((c[k>>2]|0)>>>0>31){w=c[m>>2]|0;c[j>>2]=7048;pa(w|0,6824,j|0)|0;w=1;i=d;return w|0}if((Fc(a,1)|0)!=0){w=c[m>>2]|0;c[n>>2]=7080;pa(w|0,6824,n|0)|0;w=1;i=d;return w|0}if((Fc(a,2)|0)>>>0>2){w=c[m>>2]|0;c[l>>2]=7104;pa(w|0,6824,l|0)|0;w=1;i=d;return w|0}j=Sc(a,f)|0;if((j|0)!=0){w=j;i=d;return w|0}j=(c[f>>2]|0)+26|0;if(j>>>0>51){w=c[m>>2]|0;c[h>>2]=7128;pa(w|0,6824,h|0)|0;w=1;i=d;return w|0}c[b+52>>2]=j;h=Sc(a,f)|0;if((h|0)!=0){w=h;i=d;return w|0}if(((c[f>>2]|0)+26|0)>>>0>51){w=c[m>>2]|0;c[g>>2]=7152;pa(w|0,6824,g|0)|0;w=1;i=d;return w|0}g=Sc(a,f)|0;if((g|0)!=0){w=g;i=d;return w|0}f=c[f>>2]|0;if((f+12|0)>>>0>24){w=c[m>>2]|0;c[e>>2]=7176;pa(w|0,6824,e|0)|0;w=1;i=d;return w|0}c[b+56>>2]=f;e=Fc(a,1)|0;if((e|0)==-1){w=1;i=d;return w|0}c[b+60>>2]=(e|0)==1;e=Fc(a,1)|0;if((e|0)==-1){w=1;i=d;return w|0}c[b+64>>2]=(e|0)==1;e=Fc(a,1)|0;if((e|0)==-1){w=1;i=d;return w|0}c[b+68>>2]=(e|0)==1;Nc(a)|0;w=0;i=d;return w|0}function Xb(b,c,e,f,g,h,j,k,l){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;m=i;i=i+144|0;o=m;p=o;do{if((e|0)<0){n=4}else{if((e+1+k|0)>>>0>g>>>0|(f|0)<0){n=4;break}if((l+f|0)>>>0>h>>>0){n=4}}}while(0);if((n|0)==4){B=k+1|0;Yb(b,p,e,f,g,h,B,l,B);Yb(b+(_(h,g)|0)|0,o+(_(B,l)|0)|0,e,f,g,h,B,l,B);b=p;e=0;f=0;g=B;h=l}n=8-j|0;t=l>>>1;u=(t|0)==0;p=k>>>1;l=(p|0)==0;o=16-k|0;s=(g<<1)-k|0;q=g+1|0;k=g+2|0;r=p<<1;if(u){i=m;return}y=c;w=b+((_(f,g)|0)+e)|0;v=t;while(1){if(l){x=y}else{x=y+r|0;B=w;A=p;while(1){D=d[B]|0;E=d[B+q|0]|0;z=B+2|0;C=d[B+1|0]|0;a[y+8|0]=(((_(E,j)|0)+(_(d[B+g|0]|0,n)|0)<<3)+32|0)>>>6;a[y]=(((_(C,j)|0)+(_(D,n)|0)<<3)+32|0)>>>6;D=d[z]|0;a[y+9|0]=(((_(d[B+k|0]|0,j)|0)+(_(E,n)|0)<<3)+32|0)>>>6;a[y+1|0]=(((_(D,j)|0)+(_(C,n)|0)<<3)+32|0)>>>6;A=A+ -1|0;if((A|0)==0){break}else{B=z;y=y+2|0}}w=w+r|0}v=v+ -1|0;if((v|0)==0){break}else{y=x+o|0;w=w+s|0}}if(u){i=m;return}u=c+64|0;c=b+((_(h+f|0,g)|0)+e)|0;while(1){if(!l){b=u+r|0;f=c;h=p;while(1){D=d[f]|0;C=d[f+q|0]|0;e=f+2|0;E=d[f+1|0]|0;a[u+8|0]=(((_(C,j)|0)+(_(d[f+g|0]|0,n)|0)<<3)+32|0)>>>6;a[u]=(((_(E,j)|0)+(_(D,n)|0)<<3)+32|0)>>>6;D=d[e]|0;a[u+9|0]=(((_(d[f+k|0]|0,j)|0)+(_(C,n)|0)<<3)+32|0)>>>6;a[u+1|0]=(((_(D,j)|0)+(_(E,n)|0)<<3)+32|0)>>>6;h=h+ -1|0;if((h|0)==0){break}else{f=e;u=u+2|0}}u=b;c=c+r|0}t=t+ -1|0;if((t|0)==0){break}else{u=u+o|0;c=c+s|0}}i=m;return}function Yb(b,c,d,e,f,g,h,j,k){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;l=i;q=j+e|0;e=(q|0)<0?0-j|0:e;d=(h+d|0)<0?0-h|0:d;m=(e|0)>(g|0)?g:e;d=(d|0)>(f|0)?f:d;e=d+h|0;p=m+j|0;if((d|0)>0){b=b+d|0}if((m|0)>0){b=b+(_(m,f)|0)|0}n=(d|0)<0;d=n?0-d|0:0;s=(e|0)>(f|0);e=s?e-f|0:0;o=h-d|0;h=o-e|0;y=(m|0)<0?0-m|0:0;m=(p|0)>(g|0)?p-g|0:0;r=j-y|0;p=r-m|0;n=n|s;s=(y|0)==0;do{if(n){if(!s){s=(d|0)==0;x=(o|0)==(e|0);w=(e|0)==0;u=h+ -1|0;t=(u|0)==0;v=b+h|0;A=~g;z=j+ -1-((q|0)>0?q:0)|0;E=(z|0)<(A|0)?A:z;z=~E;z=_(E+((z|0)>0?z:0)+1|0,k)|0;A=c;while(1){if(s){E=A}else{_c(A|0,a[b]|0,d|0)|0;E=A+d|0}do{if(x){C=b;B=E}else{B=E+h|0;a[E]=a[b]|0;if(t){C=v;break}else{C=b;D=u}while(1){E=E+1|0;C=C+1|0;a[E]=a[C]|0;D=D+ -1|0;if((D|0)==0){C=v;break}else{}}}}while(0);if(!w){_c(B|0,a[C+ -1|0]|0,e|0)|0}y=y+ -1|0;if((y|0)==0){break}else{A=A+k|0}}c=c+z|0}if((r|0)==(m|0)){break}r=(d|0)==0;t=(o|0)==(e|0);s=(e|0)==0;v=h+ -1|0;u=(v|0)==0;w=j+ -1|0;x=~g;q=w-((q|0)>0?q:0)|0;q=(q|0)<(x|0)?x:q;w=w-q|0;x=~q;q=j+g+ -1-((w|0)<(g|0)?g:w)-q-((x|0)>0?x:0)|0;j=_(q,k)|0;q=_(q,f)|0;g=c;w=b;while(1){if(r){z=g}else{_c(g|0,a[w]|0,d|0)|0;z=g+d|0}if(t){y=w;x=z}else{x=z+h|0;a[z]=a[w]|0;if(!u){y=w;A=v;do{z=z+1|0;y=y+1|0;a[z]=a[y]|0;A=A+ -1|0;}while((A|0)!=0)}y=w+h|0}if(!s){_c(x|0,a[y+ -1|0]|0,e|0)|0}p=p+ -1|0;if((p|0)==0){break}else{g=g+k|0;w=w+f|0}}b=b+q|0;c=c+j|0}else{if(!s){t=~g;s=j+ -1-((q|0)>0?q:0)|0;E=(s|0)<(t|0)?t:s;s=~E;t=_(E+((s|0)>0?s:0)+1|0,k)|0;s=c;while(1){ad(s|0,b|0,h|0)|0;y=y+ -1|0;if((y|0)==0){break}else{s=s+k|0}}c=c+t|0}if((r|0)==(m|0)){break}r=j+ -1|0;s=~g;q=r-((q|0)>0?q:0)|0;q=(q|0)<(s|0)?s:q;r=r-q|0;s=~q;q=j+g+ -1-((r|0)<(g|0)?g:r)-q-((s|0)>0?s:0)|0;j=_(q,k)|0;q=_(q,f)|0;g=c;r=b;while(1){ad(g|0,r|0,h|0)|0;p=p+ -1|0;if((p|0)==0){break}else{r=r+f|0;g=g+k|0}}b=b+q|0;c=c+j|0}}while(0);j=b+(0-f)|0;if((m|0)==0){i=l;return}r=(d|0)==0;p=(o|0)==(e|0);q=(e|0)==0;o=h+ -1|0;g=(o|0)==0;f=b+(h-f)|0;if(!n){if(r){while(1){ad(c|0,j|0,h|0)|0;m=m+ -1|0;if((m|0)==0){break}else{c=c+k|0}}i=l;return}else{while(1){ad(c|0,j|0,h|0)|0;m=m+ -1|0;if((m|0)==0){break}else{c=c+k|0}}i=l;return}}if(r){while(1){do{if(p){n=j;d=c}else{d=c+h|0;a[c]=a[j]|0;if(g){n=f;break}else{n=j;b=c;r=o}while(1){b=b+1|0;n=n+1|0;a[b]=a[n]|0;r=r+ -1|0;if((r|0)==0){n=f;break}else{}}}}while(0);if(!q){_c(d|0,a[n+ -1|0]|0,e|0)|0}m=m+ -1|0;if((m|0)==0){break}else{c=c+k|0}}i=l;return}else{while(1){_c(c|0,a[j]|0,d|0)|0;r=c+d|0;do{if(p){b=j;n=r}else{n=c+(d+h)|0;a[r]=a[j]|0;if(g){b=f;break}else{b=j;s=o}while(1){r=r+1|0;b=b+1|0;a[r]=a[b]|0;s=s+ -1|0;if((s|0)==0){b=f;break}else{}}}}while(0);if(!q){_c(n|0,a[b+ -1|0]|0,e|0)|0}m=m+ -1|0;if((m|0)==0){break}else{c=c+k|0}}i=l;return}}function Zb(b,c,e,f,g,h,j,k,l){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;m=i;i=i+144|0;o=m;p=o;do{if((e|0)<0){n=4}else{if((k+e|0)>>>0>g>>>0|(f|0)<0){n=4;break}if((f+1+l|0)>>>0>h>>>0){n=4}}}while(0);if((n|0)==4){B=l+1|0;Yb(b,p,e,f,g,h,k,B,k);Yb(b+(_(h,g)|0)|0,o+(_(B,k)|0)|0,e,f,g,h,k,B,k);b=p;e=0;f=0;g=k;h=B}n=8-j|0;u=l>>>1;v=(u|0)==0;o=k>>>1;p=(o|0)==0;l=16-k|0;q=g<<1;r=q-k|0;s=q|1;t=g+1|0;k=o<<1;if(v){i=m;return}z=c;x=b+((_(f,g)|0)+e)|0;w=u;while(1){if(p){y=z}else{y=z+k|0;A=x;B=o;while(1){C=d[A+g|0]|0;D=d[A]|0;a[z+8|0]=(((_(C,n)|0)+(_(d[A+q|0]|0,j)|0)<<3)+32|0)>>>6;a[z]=(((_(D,n)|0)+(_(C,j)|0)<<3)+32|0)>>>6;C=d[A+t|0]|0;D=d[A+1|0]|0;a[z+9|0]=(((_(C,n)|0)+(_(d[A+s|0]|0,j)|0)<<3)+32|0)>>>6;a[z+1|0]=(((_(D,n)|0)+(_(C,j)|0)<<3)+32|0)>>>6;B=B+ -1|0;if((B|0)==0){break}else{A=A+2|0;z=z+2|0}}x=x+k|0}w=w+ -1|0;if((w|0)==0){break}else{z=y+l|0;x=x+r|0}}if(v){i=m;return}c=c+64|0;b=b+((_(h+f|0,g)|0)+e)|0;while(1){if(!p){e=c+k|0;f=b;h=o;while(1){D=d[f+g|0]|0;C=d[f]|0;a[c+8|0]=(((_(D,n)|0)+(_(d[f+q|0]|0,j)|0)<<3)+32|0)>>>6;a[c]=(((_(C,n)|0)+(_(D,j)|0)<<3)+32|0)>>>6;D=d[f+t|0]|0;C=d[f+1|0]|0;a[c+9|0]=(((_(D,n)|0)+(_(d[f+s|0]|0,j)|0)<<3)+32|0)>>>6;a[c+1|0]=(((_(C,n)|0)+(_(D,j)|0)<<3)+32|0)>>>6;h=h+ -1|0;if((h|0)==0){break}else{f=f+2|0;c=c+2|0}}c=e;b=b+k|0}u=u+ -1|0;if((u|0)==0){break}else{c=c+l|0;b=b+r|0}}i=m;return}function _b(b,c,e,f,g,h,j,k,l,m){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;n=i;i=i+168|0;p=n;q=p;do{if((e|0)<0){o=4}else{if((e+1+l|0)>>>0>g>>>0|(f|0)<0){o=4;break}if((f+1+m|0)>>>0>h>>>0){o=4}}}while(0);if((o|0)==4){I=l+1|0;J=m+1|0;Yb(b,q,e,f,g,h,I,J,I);Yb(b+(_(h,g)|0)|0,p+(_(J,I)|0)|0,e,f,g,h,I,J,I);b=q;e=0;f=0;g=I;h=J}p=8-j|0;o=8-k|0;m=m>>>1;q=(m|0)==0;t=g<<1;s=l>>>1;r=(s|0)==0;u=16-l|0;w=t-l|0;y=g+1|0;v=t|1;A=g+2|0;z=t+2|0;x=s<<1;l=0;do{if(!q){E=c+(l<<6)|0;B=b+((_((_(l,h)|0)+f|0,g)|0)+e)|0;C=m;while(1){F=d[B+g|0]|0;if(r){D=E}else{D=E+x|0;G=B;H=(_(F,k)|0)+(_(d[B]|0,o)|0)|0;J=(_(d[B+t|0]|0,k)|0)+(_(F,o)|0)|0;I=s;while(1){K=d[G+y|0]|0;L=(_(K,k)|0)+(_(d[G+1|0]|0,o)|0)|0;K=(_(d[G+v|0]|0,k)|0)+(_(K,o)|0)|0;F=((_(H,p)|0)+32+(_(L,j)|0)|0)>>>6;a[E+8|0]=((_(J,p)|0)+32+(_(K,j)|0)|0)>>>6;a[E]=F;F=G+2|0;J=d[G+A|0]|0;H=(_(J,k)|0)+(_(d[F]|0,o)|0)|0;J=(_(d[G+z|0]|0,k)|0)+(_(J,o)|0)|0;G=((_(L,p)|0)+32+(_(H,j)|0)|0)>>>6;a[E+9|0]=((_(K,p)|0)+32+(_(J,j)|0)|0)>>>6;a[E+1|0]=G;I=I+ -1|0;if((I|0)==0){break}else{G=F;E=E+2|0}}B=B+x|0}C=C+ -1|0;if((C|0)==0){break}else{E=D+u|0;B=B+w|0}}}l=l+1|0;}while((l|0)!=2);i=n;return}function $b(b,c,e,f,g,h,j,k){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;l=i;i=i+448|0;n=l;do{if((e|0)<0){m=4}else{if((j+e|0)>>>0>g>>>0|(f|0)<0){m=4;break}if((f+5+k|0)>>>0>h>>>0){m=4}}}while(0);if((m|0)==4){Yb(b,n,e,f,g,h,j,k+5|0,j);b=n;e=0;f=0;g=j}q=e+g+(_(f,g)|0)|0;o=k>>>2;if((o|0)==0){i=l;return}h=(j|0)==0;e=(g<<2)-j|0;n=64-j|0;m=0-g|0;f=m<<1;k=g<<1;p=c;c=b+q|0;b=b+(q+(g*5|0))|0;while(1){if(!h){q=p+j|0;t=j;r=c;s=b;while(1){w=d[s+f|0]|0;x=d[s+m|0]|0;y=d[s+g|0]|0;A=d[s]|0;z=y+w|0;u=d[r+k|0]|0;a[p+48|0]=a[((d[s+k|0]|0)+16-z-(z<<2)+u+((A+x|0)*20|0)>>5)+5224|0]|0;z=u+A|0;v=d[r+g|0]|0;a[p+32|0]=a[(y+16-z-(z<<2)+v+((x+w|0)*20|0)>>5)+5224|0]|0;z=v+x|0;y=d[r]|0;a[p+16|0]=a[(A+16-z-(z<<2)+y+((u+w|0)*20|0)>>5)+5224|0]|0;w=y+w|0;a[p]=a[(x+16-w-(w<<2)+(d[r+m|0]|0)+((v+u|0)*20|0)>>5)+5224|0]|0;t=t+ -1|0;if((t|0)==0){break}else{s=s+1|0;r=r+1|0;p=p+1|0}}p=q;c=c+j|0;b=b+j|0}o=o+ -1|0;if((o|0)==0){break}else{p=p+n|0;c=c+e|0;b=b+e|0}}i=l;return}function ac(b,c,e,f,g,h,j,k,l){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;m=i;i=i+448|0;o=m;do{if((e|0)<0){n=4}else{if((j+e|0)>>>0>g>>>0|(f|0)<0){n=4;break}if((f+5+k|0)>>>0>h>>>0){n=4}}}while(0);if((n|0)==4){Yb(b,o,e,f,g,h,j,k+5|0,j);b=o;e=0;f=0;g=j}s=e+g+(_(f,g)|0)|0;p=k>>>2;if((p|0)==0){i=m;return}h=(j|0)==0;e=(g<<2)-j|0;o=64-j|0;n=0-g|0;f=n<<1;k=g<<1;q=c;c=b+s|0;r=b+(s+(_(g,l+2|0)|0))|0;l=b+(s+(g*5|0))|0;while(1){if(h){b=r}else{b=r+j|0;s=q+j|0;u=j;t=c;v=l;while(1){y=d[v+f|0]|0;z=d[v+n|0]|0;A=d[v+g|0]|0;C=d[v]|0;B=A+y|0;w=d[t+k|0]|0;a[q+48|0]=((d[((d[v+k|0]|0)+16-B-(B<<2)+w+((C+z|0)*20|0)>>5)+5224|0]|0)+1+(d[r+k|0]|0)|0)>>>1;B=w+C|0;x=d[t+g|0]|0;a[q+32|0]=((d[(A+16-B-(B<<2)+x+((z+y|0)*20|0)>>5)+5224|0]|0)+1+(d[r+g|0]|0)|0)>>>1;B=x+z|0;A=d[t]|0;a[q+16|0]=((d[(C+16-B-(B<<2)+A+((w+y|0)*20|0)>>5)+5224|0]|0)+1+(d[r]|0)|0)>>>1;y=A+y|0;a[q]=((d[(z+16-y-(y<<2)+(d[t+n|0]|0)+((x+w|0)*20|0)>>5)+5224|0]|0)+1+(d[r+n|0]|0)|0)>>>1;u=u+ -1|0;if((u|0)==0){break}else{v=v+1|0;r=r+1|0;t=t+1|0;q=q+1|0}}q=s;c=c+j|0;l=l+j|0}p=p+ -1|0;if((p|0)==0){break}else{q=q+o|0;c=c+e|0;r=b+e|0;l=l+e|0}}i=m;return}function bc(b,c,e,f,g,h,j,k){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;l=i;i=i+448|0;n=l;do{if((e|0)<0){m=4}else{if((e+5+j|0)>>>0>g>>>0|(f|0)<0){m=4;break}if((k+f|0)>>>0>h>>>0){m=4}}}while(0);if((m|0)==4){x=j+5|0;Yb(b,n,e,f,g,h,x,k,x);b=n;e=0;f=0;g=x}if((k|0)==0){i=l;return}n=j>>>2;m=(n|0)==0;h=g-j|0;o=16-j|0;j=n<<2;b=b+(e+5+(_(f,g)|0))|0;while(1){if(m){e=c}else{e=c+j|0;r=b;s=d[b+ -1|0]|0;w=d[b+ -2|0]|0;v=d[b+ -3|0]|0;t=d[b+ -4|0]|0;u=d[b+ -5|0]|0;x=n;while(1){p=t+s|0;g=d[r]|0;a[c]=a[(u+16-p-(p<<2)+g+((v+w|0)*20|0)>>5)+5224|0]|0;p=g+v|0;q=d[r+1|0]|0;a[c+1|0]=a[(t+16-p-(p<<2)+q+((w+s|0)*20|0)>>5)+5224|0]|0;p=q+w|0;f=d[r+2|0]|0;a[c+2|0]=a[(v+16-p-(p<<2)+f+((g+s|0)*20|0)>>5)+5224|0]|0;v=f+s|0;p=d[r+3|0]|0;a[c+3|0]=a[(w+16-v-(v<<2)+p+((q+g|0)*20|0)>>5)+5224|0]|0;x=x+ -1|0;if((x|0)==0){break}else{u=s;t=g;v=q;w=f;s=p;r=r+4|0;c=c+4|0}}b=b+j|0}k=k+ -1|0;if((k|0)==0){break}else{c=e+o|0;b=b+h|0}}i=l;return}function cc(b,c,e,f,g,h,j,k,l){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;m=i;i=i+448|0;o=m;do{if((e|0)<0){n=4}else{if((e+5+j|0)>>>0>g>>>0|(f|0)<0){n=4;break}if((k+f|0)>>>0>h>>>0){n=4}}}while(0);if((n|0)==4){y=j+5|0;Yb(b,o,e,f,g,h,y,k,y);b=o;e=0;f=0;g=y}if((k|0)==0){i=m;return}h=j>>>2;o=(h|0)==0;n=g-j|0;j=16-j|0;p=(l|0)==0;l=h<<2;b=b+(e+5+(_(f,g)|0))|0;while(1){g=d[b+ -5|0]|0;s=d[b+ -4|0]|0;t=d[b+ -3|0]|0;r=d[b+ -2|0]|0;q=d[b+ -1|0]|0;if(!o){if(p){f=c;e=b;y=h;while(1){v=s+q|0;u=d[e]|0;a[f]=(t+1+(d[(g+16-v-(v<<2)+u+((t+r|0)*20|0)>>5)+5224|0]|0)|0)>>>1;v=u+t|0;x=d[e+1|0]|0;a[f+1|0]=(r+1+(d[(s+16-v-(v<<2)+x+((r+q|0)*20|0)>>5)+5224|0]|0)|0)>>>1;v=x+r|0;w=d[e+2|0]|0;a[f+2|0]=(q+1+(d[(t+16-v-(v<<2)+w+((u+q|0)*20|0)>>5)+5224|0]|0)|0)>>>1;t=w+q|0;v=d[e+3|0]|0;a[f+3|0]=(u+1+(d[(r+16-t-(t<<2)+v+((x+u|0)*20|0)>>5)+5224|0]|0)|0)>>>1;y=y+ -1|0;if((y|0)==0){break}else{g=q;s=u;t=x;r=w;q=v;e=e+4|0;f=f+4|0}}}else{e=c;f=b;y=h;while(1){v=s+q|0;u=d[f]|0;a[e]=(r+1+(d[(g+16-v-(v<<2)+u+((t+r|0)*20|0)>>5)+5224|0]|0)|0)>>>1;v=u+t|0;x=d[f+1|0]|0;a[e+1|0]=(q+1+(d[(s+16-v-(v<<2)+x+((r+q|0)*20|0)>>5)+5224|0]|0)|0)>>>1;v=x+r|0;w=d[f+2|0]|0;a[e+2|0]=(u+1+(d[(t+16-v-(v<<2)+w+((u+q|0)*20|0)>>5)+5224|0]|0)|0)>>>1;t=w+q|0;v=d[f+3|0]|0;a[e+3|0]=(x+1+(d[(r+16-t-(t<<2)+v+((x+u|0)*20|0)>>5)+5224|0]|0)|0)>>>1;y=y+ -1|0;if((y|0)==0){break}else{g=q;s=u;t=x;r=w;q=v;f=f+4|0;e=e+4|0}}}c=c+l|0;b=b+l|0}k=k+ -1|0;if((k|0)==0){break}else{c=c+j|0;b=b+n|0}}i=m;return}function dc(b,c,e,f,g,h,j,k,l){b=b|0;c=c|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;m=i;i=i+448|0;o=m;do{if((e|0)<0){n=4}else{if((e+5+j|0)>>>0>g>>>0|(f|0)<0){n=4;break}if((f+5+k|0)>>>0>h>>>0){n=4}}}while(0);if((n|0)==4){D=j+5|0;Yb(b,o,e,f,g,h,D,k+5|0,D);b=o;e=0;f=0;g=D}r=(_(f,g)|0)+e|0;n=(l&1|2)+g+r|0;f=b+n|0;if((k|0)==0){i=m;return}p=j>>>2;q=(p|0)==0;o=g-j|0;e=16-j|0;h=p<<2;r=b+((_(g,l>>>1&1|2)|0)+5+r)|0;l=k;while(1){if(q){s=c}else{s=c+h|0;v=r;w=d[r+ -1|0]|0;B=d[r+ -2|0]|0;z=d[r+ -3|0]|0;C=d[r+ -4|0]|0;D=d[r+ -5|0]|0;A=p;while(1){t=C+w|0;x=d[v]|0;a[c]=a[(D+16-t-(t<<2)+x+((z+B|0)*20|0)>>5)+5224|0]|0;D=x+z|0;t=d[v+1|0]|0;a[c+1|0]=a[(C+16-D-(D<<2)+t+((B+w|0)*20|0)>>5)+5224|0]|0;D=t+B|0;u=d[v+2|0]|0;a[c+2|0]=a[(z+16-D-(D<<2)+u+((x+w|0)*20|0)>>5)+5224|0]|0;D=u+w|0;y=d[v+3|0]|0;a[c+3|0]=a[(B+16-D-(D<<2)+y+((t+x|0)*20|0)>>5)+5224|0]|0;A=A+ -1|0;if((A|0)==0){break}else{D=w;C=x;z=t;B=u;w=y;v=v+4|0;c=c+4|0}}r=r+h|0}l=l+ -1|0;if((l|0)==0){break}else{c=s+e|0;r=r+o|0}}c=k>>>2;if((c|0)==0){i=m;return}p=(j|0)==0;o=(g<<2)-j|0;r=64-j|0;q=0-g|0;h=q<<1;l=g<<1;e=s+(e-(k<<4))|0;k=b+(n+(g*5|0))|0;b=c;while(1){if(!p){n=e+j|0;c=f;s=k;t=j;while(1){B=d[s+h|0]|0;A=d[s+q|0]|0;y=d[s+g|0]|0;w=d[s]|0;C=y+B|0;D=d[c+l|0]|0;x=e+48|0;a[x]=((d[((d[s+l|0]|0)+16-C-(C<<2)+D+((w+A|0)*20|0)>>5)+5224|0]|0)+1+(d[x]|0)|0)>>>1;x=D+w|0;C=d[c+g|0]|0;z=e+32|0;a[z]=((d[(y+16-x-(x<<2)+C+((A+B|0)*20|0)>>5)+5224|0]|0)+1+(d[z]|0)|0)>>>1;z=d[c]|0;x=C+A|0;y=e+16|0;a[y]=((d[(w+16-x-(x<<2)+z+((D+B|0)*20|0)>>5)+5224|0]|0)+1+(d[y]|0)|0)>>>1;B=z+B|0;a[e]=((d[(A+16-B-(B<<2)+(d[c+q|0]|0)+((C+D|0)*20|0)>>5)+5224|0]|0)+1+(d[e]|0)|0)>>>1;t=t+ -1|0;if((t|0)==0){break}else{s=s+1|0;c=c+1|0;e=e+1|0}}e=n;f=f+j|0;k=k+j|0}b=b+ -1|0;if((b|0)==0){break}else{e=e+r|0;f=f+o|0;k=k+o|0}}i=m;return}function ec(b,e,f,g,h,j,k,l){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;m=i;i=i+1792|0;n=m+448|0;p=m;do{if((f|0)<0){o=5}else{if((f+5+k|0)>>>0>h>>>0|(g|0)<0){o=5;break}if((g+5+l|0)>>>0>j>>>0){o=5;break}r=f+5|0;q=l+5|0}}while(0);if((o|0)==5){B=k+5|0;q=l+5|0;Yb(b,p,f,g,h,j,B,q,B);b=p;r=5;g=0;h=B}if((q|0)!=0){f=k>>>2;p=(f|0)==0;j=h-k|0;o=f<<2;t=n;b=b+(r+(_(g,h)|0))|0;while(1){if(p){r=t}else{r=t+(o<<2)|0;g=b;v=d[b+ -1|0]|0;B=d[b+ -2|0]|0;z=d[b+ -3|0]|0;A=d[b+ -4|0]|0;y=d[b+ -5|0]|0;x=f;while(1){w=A+v|0;s=d[g]|0;c[t>>2]=y-w-(w<<2)+s+((z+B|0)*20|0);w=s+z|0;u=d[g+1|0]|0;c[t+4>>2]=A-w+u-(w<<2)+((B+v|0)*20|0);A=u+B|0;w=d[g+2|0]|0;c[t+8>>2]=z-A+w-(A<<2)+((s+v|0)*20|0);A=w+v|0;h=d[g+3|0]|0;c[t+12>>2]=B-A+h-(A<<2)+((u+s|0)*20|0);x=x+ -1|0;if((x|0)==0){break}else{y=v;A=s;z=u;B=w;v=h;g=g+4|0;t=t+16|0}}b=b+o|0}q=q+ -1|0;if((q|0)==0){break}else{t=r;b=b+j|0}}}r=l>>>2;if((r|0)==0){i=m;return}l=(k|0)==0;b=64-k|0;j=k*3|0;f=0-k|0;p=f<<1;o=k<<1;q=n+(k<<2)|0;n=n+(k*6<<2)|0;while(1){if(!l){g=e+k|0;s=q;h=n;t=k;while(1){z=c[h+(p<<2)>>2]|0;y=c[h+(f<<2)>>2]|0;w=c[h+(k<<2)>>2]|0;v=c[h>>2]|0;x=w+z|0;B=c[s+(o<<2)>>2]|0;a[e+48|0]=a[((c[h+(o<<2)>>2]|0)+512-x-(x<<2)+B+((v+y|0)*20|0)>>10)+5224|0]|0;x=B+v|0;A=c[s+(k<<2)>>2]|0;a[e+32|0]=a[(w+512-x-(x<<2)+A+((y+z|0)*20|0)>>10)+5224|0]|0;x=c[s>>2]|0;w=A+y|0;a[e+16|0]=a[(v+512-w-(w<<2)+x+((B+z|0)*20|0)>>10)+5224|0]|0;z=x+z|0;a[e]=a[(y+512-z-(z<<2)+(c[s+(f<<2)>>2]|0)+((A+B|0)*20|0)>>10)+5224|0]|0;t=t+ -1|0;if((t|0)==0){break}e=e+1|0;s=s+4|0;h=h+4|0}e=g;q=q+(k<<2)|0;n=n+(k<<2)|0}r=r+ -1|0;if((r|0)==0){break}else{e=e+b|0;q=q+(j<<2)|0;n=n+(j<<2)|0}}i=m;return}function fc(b,e,f,g,h,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;n=i;i=i+1792|0;o=n+448|0;q=n;do{if((f|0)<0){p=5}else{if((f+5+k|0)>>>0>h>>>0|(g|0)<0){p=5;break}if((g+5+l|0)>>>0>j>>>0){p=5;break}s=f+5|0;r=l+5|0}}while(0);if((p|0)==5){C=k+5|0;r=l+5|0;Yb(b,q,f,g,h,j,C,r,C);b=q;s=5;g=0;h=C}if((r|0)!=0){f=k>>>2;q=(f|0)==0;j=h-k|0;p=f<<2;w=o;b=b+(s+(_(g,h)|0))|0;while(1){if(q){s=w}else{s=w+(p<<2)|0;v=b;u=d[b+ -1|0]|0;y=d[b+ -2|0]|0;C=d[b+ -3|0]|0;A=d[b+ -4|0]|0;z=d[b+ -5|0]|0;B=f;while(1){h=A+u|0;t=d[v]|0;c[w>>2]=z-h-(h<<2)+t+((C+y|0)*20|0);h=t+C|0;x=d[v+1|0]|0;c[w+4>>2]=A-h+x-(h<<2)+((y+u|0)*20|0);h=x+y|0;g=d[v+2|0]|0;c[w+8>>2]=C-h+g-(h<<2)+((t+u|0)*20|0);C=g+u|0;h=d[v+3|0]|0;c[w+12>>2]=y-C+h-(C<<2)+((x+t|0)*20|0);B=B+ -1|0;if((B|0)==0){break}else{z=u;A=t;C=x;y=g;u=h;v=v+4|0;w=w+16|0}}b=b+p|0}r=r+ -1|0;if((r|0)==0){break}else{w=s;b=b+j|0}}}g=l>>>2;if((g|0)==0){i=n;return}b=(k|0)==0;p=64-k|0;l=k*3|0;q=0-k|0;j=q<<1;f=k<<1;r=o+(k<<2)|0;s=o+((_(m+2|0,k)|0)+k<<2)|0;o=o+(k*6<<2)|0;m=g;while(1){if(!b){g=s+(k<<2)|0;h=e+k|0;t=r;u=o;v=k;while(1){A=c[u+(j<<2)>>2]|0;z=c[u+(q<<2)>>2]|0;x=c[u+(k<<2)>>2]|0;w=c[u>>2]|0;y=x+A|0;C=c[t+(f<<2)>>2]|0;a[e+48|0]=((d[((c[u+(f<<2)>>2]|0)+512-y-(y<<2)+C+((w+z|0)*20|0)>>10)+5224|0]|0)+1+(d[((c[s+(f<<2)>>2]|0)+16>>5)+5224|0]|0)|0)>>>1;y=C+w|0;B=c[t+(k<<2)>>2]|0;a[e+32|0]=((d[(x+512-y-(y<<2)+B+((z+A|0)*20|0)>>10)+5224|0]|0)+1+(d[((c[s+(k<<2)>>2]|0)+16>>5)+5224|0]|0)|0)>>>1;y=c[t>>2]|0;x=B+z|0;a[e+16|0]=((d[(w+512-x-(x<<2)+y+((C+A|0)*20|0)>>10)+5224|0]|0)+1+(d[((c[s>>2]|0)+16>>5)+5224|0]|0)|0)>>>1;A=y+A|0;a[e]=((d[(z+512-A-(A<<2)+(c[t+(q<<2)>>2]|0)+((B+C|0)*20|0)>>10)+5224|0]|0)+1+(d[((c[s+(q<<2)>>2]|0)+16>>5)+5224|0]|0)|0)>>>1;v=v+ -1|0;if((v|0)==0){break}e=e+1|0;t=t+4|0;s=s+4|0;u=u+4|0}e=h;r=r+(k<<2)|0;s=g;o=o+(k<<2)|0}m=m+ -1|0;if((m|0)==0){break}else{e=e+p|0;r=r+(l<<2)|0;s=s+(l<<2)|0;o=o+(l<<2)|0}}i=n;return}function gc(b,e,f,g,h,j,k,l,m){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;n=i;i=i+1792|0;o=n+448|0;r=n;p=k+5|0;do{if((f|0)<0){q=4}else{if((f+5+k|0)>>>0>h>>>0|(g|0)<0){q=4;break}if((g+5+l|0)>>>0>j>>>0){q=4}}}while(0);if((q|0)==4){Yb(b,r,f,g,h,j,p,l+5|0,p);b=r;f=0;g=0;h=p}y=f+h+(_(g,h)|0)|0;w=l>>>2;if((w|0)!=0){q=(p|0)==0;r=(h<<2)-k+ -5|0;j=p*3|0;t=0-h|0;s=t<<1;f=h<<1;u=p<<1;g=-5-k|0;x=o+(p<<2)|0;v=b+y|0;b=b+(y+(h*5|0))|0;while(1){if(!q){y=x+(p<<2)|0;z=v;A=b;B=p;while(1){E=d[A+s|0]|0;F=d[A+t|0]|0;H=d[A+h|0]|0;I=d[A]|0;G=H+E|0;C=d[z+f|0]|0;c[x+(u<<2)>>2]=(d[A+f|0]|0)-G-(G<<2)+C+((I+F|0)*20|0);G=C+I|0;D=d[z+h|0]|0;c[x+(p<<2)>>2]=H-G+D-(G<<2)+((F+E|0)*20|0);G=d[z]|0;H=D+F|0;c[x>>2]=I-H+G-(H<<2)+((C+E|0)*20|0);E=G+E|0;c[x+(g<<2)>>2]=F-E+(d[z+t|0]|0)-(E<<2)+((D+C|0)*20|0);B=B+ -1|0;if((B|0)==0){break}else{A=A+1|0;z=z+1|0;x=x+4|0}}x=y;v=v+p|0;b=b+p|0}w=w+ -1|0;if((w|0)==0){break}else{x=x+(j<<2)|0;v=v+r|0;b=b+r|0}}}if((l|0)==0){i=n;return}p=k>>>2;h=(p|0)==0;q=16-k|0;k=p<<2;v=o+(m+2<<2)|0;o=o+20|0;while(1){if(h){m=v}else{m=v+(k<<2)|0;g=e;u=o;t=c[o+ -4>>2]|0;y=c[o+ -8>>2]|0;x=c[o+ -12>>2]|0;w=c[o+ -16>>2]|0;b=c[o+ -20>>2]|0;z=p;while(1){I=w+t|0;s=c[u>>2]|0;a[g]=((d[(b+512-I-(I<<2)+s+((x+y|0)*20|0)>>10)+5224|0]|0)+1+(d[((c[v>>2]|0)+16>>5)+5224|0]|0)|0)>>>1;I=s+x|0;r=c[u+4>>2]|0;a[g+1|0]=((d[(w+512-I-(I<<2)+r+((y+t|0)*20|0)>>10)+5224|0]|0)+1+(d[((c[v+4>>2]|0)+16>>5)+5224|0]|0)|0)>>>1;I=r+y|0;f=c[u+8>>2]|0;a[g+2|0]=((d[(x+512-I-(I<<2)+f+((s+t|0)*20|0)>>10)+5224|0]|0)+1+(d[((c[v+8>>2]|0)+16>>5)+5224|0]|0)|0)>>>1;I=f+t|0;j=c[u+12>>2]|0;a[g+3|0]=((d[(y+512-I-(I<<2)+j+((r+s|0)*20|0)>>10)+5224|0]|0)+1+(d[((c[v+12>>2]|0)+16>>5)+5224|0]|0)|0)>>>1;z=z+ -1|0;if((z|0)==0){break}g=g+4|0;v=v+16|0;u=u+16|0;b=t;w=s;x=r;y=f;t=j}e=e+k|0;o=o+(k<<2)|0}l=l+ -1|0;if((l|0)==0){break}else{e=e+q|0;v=m+20|0;o=o+20|0}}i=n;return}function hc(a,d,e,f,g,h,j,k,l){a=a|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;m=i;r=a+((j<<4)+h)|0;v=b[d>>1]|0;u=b[d+2>>1]|0;p=e+4|0;n=c[p>>2]<<4;o=e+8|0;q=c[o>>2]<<4;f=h+f|0;s=f+(v>>2)|0;g=j+g|0;t=g+(u>>2)|0;switch(c[7200+((v&3)<<4)+((u&3)<<2)>>2]|0){case 14:{gc(c[e>>2]|0,r,s+ -2|0,t+ -2|0,n,q,k,l,1);break};case 11:{fc(c[e>>2]|0,r,s+ -2|0,t+ -2|0,n,q,k,l,1);break};case 13:{dc(c[e>>2]|0,r,s+ -2|0,t+ -2|0,n,q,k,l,1);break};case 5:{dc(c[e>>2]|0,r,s+ -2|0,t+ -2|0,n,q,k,l,0);break};case 6:{gc(c[e>>2]|0,r,s+ -2|0,t+ -2|0,n,q,k,l,0);break};case 10:{ec(c[e>>2]|0,r,s+ -2|0,t+ -2|0,n,q,k,l);break};case 2:{$b(c[e>>2]|0,r,s,t+ -2|0,n,q,k,l);break};case 7:{dc(c[e>>2]|0,r,s+ -2|0,t+ -2|0,n,q,k,l,2);break};case 12:{cc(c[e>>2]|0,r,s+ -2|0,t,n,q,k,l,1);break};case 1:{ac(c[e>>2]|0,r,s,t+ -2|0,n,q,k,l,0);break};case 3:{ac(c[e>>2]|0,r,s,t+ -2|0,n,q,k,l,1);break};case 8:{bc(c[e>>2]|0,r,s+ -2|0,t,n,q,k,l);break};case 0:{Yb(c[e>>2]|0,r,s,t,n,q,k,l,16);break};case 4:{cc(c[e>>2]|0,r,s+ -2|0,t,n,q,k,l,0);break};case 9:{fc(c[e>>2]|0,r,s+ -2|0,t+ -2|0,n,q,k,l,0);break};default:{dc(c[e>>2]|0,r,s+ -2|0,t+ -2|0,n,q,k,l,3)}}j=(h>>>1)+256+(j>>>1<<3)|0;n=a+j|0;h=c[d>>2]|0;d=c[e>>2]|0;r=c[p>>2]|0;s=c[o>>2]|0;p=r<<3;o=s<<3;f=(h<<16>>19)+(f>>>1)|0;q=(h>>19)+(g>>>1)|0;e=h&7;g=h>>>16&7;k=k>>>1;h=l>>>1;s=_(r<<8,s)|0;r=d+s|0;t=(e|0)!=0;l=(g|0)==0;if(!(l|t^1)){_b(r,n,f,q,p,o,e,g,k,h);i=m;return}if(t){Xb(r,n,f,q,p,o,e,k,h);i=m;return}if(l){Yb(r,n,f,q,p,o,k,h,8);Yb(d+((_(o,p)|0)+s)|0,a+(j+64)|0,f,q,p,o,k,h,8);i=m;return}else{Zb(r,n,f,q,p,o,g,k,h);i=m;return}}function ic(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0;d=i;i=i+8|0;g=d;h=i;i=i+8|0;k=i;i=i+8|0;j=i;i=i+8|0;l=i;i=i+8|0;n=i;i=i+8|0;o=i;i=i+8|0;p=i;i=i+8|0;e=i;i=i+8|0;f=b+0|0;q=f+92|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(q|0));f=Fc(a,8)|0;if((f|0)==-1){r=1;i=d;return r|0}c[b>>2]=f;Fc(a,1)|0;Fc(a,1)|0;if((Fc(a,1)|0)==-1){r=1;i=d;return r|0}if((Fc(a,5)|0)==-1){r=1;i=d;return r|0}q=Fc(a,8)|0;if((q|0)==-1){r=1;i=d;return r|0}f=b+4|0;c[f>>2]=q;r=b+8|0;q=Rc(a,r)|0;if((q|0)!=0){r=q;i=d;return r|0}if((c[r>>2]|0)>>>0>31){r=c[m>>2]|0;c[p>>2]=7280;pa(r|0,7264,p|0)|0;r=1;i=d;return r|0}p=Rc(a,e)|0;if((p|0)!=0){r=p;i=d;return r|0}p=c[e>>2]|0;if(p>>>0>12){r=c[m>>2]|0;c[o>>2]=7304;pa(r|0,7264,o|0)|0;r=1;i=d;return r|0}c[b+12>>2]=1<<p+4;o=Rc(a,e)|0;if((o|0)!=0){r=o;i=d;return r|0}o=c[e>>2]|0;if(o>>>0>2){r=c[m>>2]|0;c[n>>2]=7336;pa(r|0,7264,n|0)|0;r=1;i=d;return r|0}c[b+16>>2]=o;a:do{if((o|0)==0){j=Rc(a,e)|0;if((j|0)!=0){r=j;i=d;return r|0}j=c[e>>2]|0;if(!(j>>>0>12)){c[b+20>>2]=1<<j+4;break}r=c[m>>2]|0;c[l>>2]=7360;pa(r|0,7264,l|0)|0;r=1;i=d;return r|0}else if((o|0)==1){l=Fc(a,1)|0;if((l|0)==-1){r=1;i=d;return r|0}c[b+24>>2]=(l|0)==1;l=Sc(a,b+28|0)|0;if((l|0)!=0){r=l;i=d;return r|0}l=Sc(a,b+32|0)|0;if((l|0)!=0){r=l;i=d;return r|0}l=b+36|0;n=Rc(a,l)|0;if((n|0)!=0){r=n;i=d;return r|0}n=c[l>>2]|0;if(n>>>0>255){r=c[m>>2]|0;c[j>>2]=7400;pa(r|0,7264,j|0)|0;r=1;i=d;return r|0}if((n|0)==0){c[b+40>>2]=0;break}r=Xc(n<<2)|0;n=r;j=b+40|0;c[j>>2]=n;if((r|0)==0){r=65535;i=d;return r|0}else{o=0}while(1){n=Sc(a,n+(o<<2)|0)|0;o=o+1|0;if((n|0)!=0){break}if(!(o>>>0<(c[l>>2]|0)>>>0)){break a}n=c[j>>2]|0}i=d;return n|0}}while(0);j=b+44|0;l=Rc(a,j)|0;if((l|0)!=0){r=l;i=d;return r|0}if((c[j>>2]|0)>>>0>16){r=c[m>>2]|0;c[k>>2]=7440;pa(r|0,7264,k|0)|0;r=1;i=d;return r|0}k=Fc(a,1)|0;if((k|0)==-1){r=1;i=d;return r|0}c[b+48>>2]=(k|0)==1;k=Rc(a,e)|0;if((k|0)!=0){r=k;i=d;return r|0}k=b+52|0;c[k>>2]=(c[e>>2]|0)+1;l=Rc(a,e)|0;if((l|0)!=0){r=l;i=d;return r|0}l=b+56|0;c[l>>2]=(c[e>>2]|0)+1;n=Fc(a,1)|0;if((n|0)==0){r=c[m>>2]|0;c[h>>2]=7456;pa(r|0,7264,h|0)|0;r=1;i=d;return r|0}else if((n|0)==-1){r=1;i=d;return r|0}else{if((Fc(a,1)|0)==-1){r=1;i=d;return r|0}h=Fc(a,1)|0;if((h|0)==-1){r=1;i=d;return r|0}r=(h|0)==1;c[b+60>>2]=r&1;do{if(r){h=b+64|0;n=Rc(a,h)|0;if((n|0)!=0){r=n;i=d;return r|0}o=b+68|0;n=Rc(a,o)|0;if((n|0)!=0){r=n;i=d;return r|0}n=b+72|0;p=Rc(a,n)|0;if((p|0)!=0){r=p;i=d;return r|0}p=b+76|0;q=Rc(a,p)|0;if((q|0)!=0){r=q;i=d;return r|0}k=c[k>>2]|0;if((c[h>>2]|0)<=((k<<3)+~c[o>>2]|0)){h=c[l>>2]|0;if((c[n>>2]|0)<=((h<<3)+~c[p>>2]|0)){break}}r=c[m>>2]|0;c[g>>2]=7480;pa(r|0,7264,g|0)|0;r=1;i=d;return r|0}else{h=c[l>>2]|0;k=c[k>>2]|0}}while(0);g=_(h,k)|0;switch(c[f>>2]|0){case 50:{k=22080;h=42393600;f=65;break};case 51:{k=36864;h=70778880;f=65;break};case 11:{k=396;h=345600;f=65;break};case 32:{k=5120;h=7864320;f=65;break};case 40:{k=8192;h=12582912;f=65;break};case 10:{k=99;h=152064;f=65;break};case 30:{k=1620;h=3110400;f=65;break};case 31:{k=3600;h=6912e3;f=65;break};case 41:{k=8192;h=12582912;f=65;break};case 42:{k=8704;h=13369344;f=65;break};case 12:{k=396;h=912384;f=65;break};case 21:{k=792;h=1824768;f=65;break};case 20:{k=396;h=912384;f=65;break};case 13:{k=396;h=912384;f=65;break};case 22:{k=1620;h=3110400;f=65;break};default:{f=66}}do{if((f|0)==65){if(k>>>0<g>>>0){f=66;break}g=(h>>>0)/((g*384|0)>>>0)|0;h=g>>>0<16?g:16;c[e>>2]=h;g=c[j>>2]|0;if(g>>>0>h>>>0){f=68}else{g=h}}}while(0);if((f|0)==66){c[e>>2]=2147483647;g=c[j>>2]|0;f=68}if((f|0)==68){c[e>>2]=g}e=b+88|0;c[e>>2]=g;f=Fc(a,1)|0;if((f|0)==-1){r=1;i=d;return r|0}r=(f|0)==1;c[b+80>>2]=r&1;do{if(r){r=Xc(952)|0;f=r;b=b+84|0;c[b>>2]=f;if((r|0)==0){r=65535;i=d;return r|0}f=Vc(a,f)|0;if((f|0)!=0){r=f;i=d;return r|0}f=c[b>>2]|0;if((c[f+920>>2]|0)==0){break}b=c[f+948>>2]|0;if((c[f+944>>2]|0)>>>0>b>>>0){r=1;i=d;return r|0}if(b>>>0<(c[j>>2]|0)>>>0){r=1;i=d;return r|0}if(b>>>0>(c[e>>2]|0)>>>0){r=1;i=d;return r|0}else{c[e>>2]=(b|0)==0?1:b;break}}}while(0);Nc(a)|0;r=0;i=d;return r|0}return 0}function jc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;a:do{if((c[a>>2]|0)==(c[b>>2]|0)){if((c[a+4>>2]|0)!=(c[b+4>>2]|0)){e=1;break}if((c[a+12>>2]|0)!=(c[b+12>>2]|0)){e=1;break}f=c[a+16>>2]|0;if((f|0)!=(c[b+16>>2]|0)){e=1;break}if((c[a+44>>2]|0)!=(c[b+44>>2]|0)){e=1;break}if((c[a+48>>2]|0)!=(c[b+48>>2]|0)){e=1;break}if((c[a+52>>2]|0)!=(c[b+52>>2]|0)){e=1;break}if((c[a+56>>2]|0)!=(c[b+56>>2]|0)){e=1;break}e=c[a+60>>2]|0;if((e|0)!=(c[b+60>>2]|0)){e=1;break}if((c[a+80>>2]|0)!=(c[b+80>>2]|0)){e=1;break}do{if((f|0)==1){if((c[a+24>>2]|0)!=(c[b+24>>2]|0)){e=1;break a}if((c[a+28>>2]|0)!=(c[b+28>>2]|0)){e=1;break a}if((c[a+32>>2]|0)!=(c[b+32>>2]|0)){e=1;break a}f=c[a+36>>2]|0;if((f|0)!=(c[b+36>>2]|0)){e=1;break a}if((f|0)==0){break}g=c[a+40>>2]|0;h=c[b+40>>2]|0;j=0;while(1){k=j+1|0;if((c[g+(j<<2)>>2]|0)!=(c[h+(j<<2)>>2]|0)){e=1;break a}if(k>>>0<f>>>0){j=k}else{break}}}else if((f|0)==0){if((c[a+20>>2]|0)!=(c[b+20>>2]|0)){e=1;break a}}}while(0);if((e|0)!=0){if((c[a+64>>2]|0)!=(c[b+64>>2]|0)){e=1;break}if((c[a+68>>2]|0)!=(c[b+68>>2]|0)){e=1;break}if((c[a+72>>2]|0)!=(c[b+72>>2]|0)){e=1;break}if((c[a+76>>2]|0)!=(c[b+76>>2]|0)){e=1;break}}e=0}else{e=1}}while(0);i=d;return e|0}function kc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;f=i;i=i+8|0;h=f;l=i;i=i+8|0;k=i;i=i+8|0;o=i;i=i+8|0;j=i;i=i+8|0;n=i;i=i+8|0;r=i;i=i+432|0;A=i;i=i+8|0;p=i;i=i+8|0;r=r+(0-r&15)|0;D=c[b+3376>>2]|0;G=c[e>>2]|0;c[A>>2]=0;z=b+1192|0;c[z>>2]=(c[z>>2]|0)+1;s=b+1200|0;c[s>>2]=0;q=b+12|0;c[p>>2]=(c[e+48>>2]|0)+(c[(c[q>>2]|0)+52>>2]|0);B=e+36|0;C=b+1212|0;w=e+52|0;x=e+56|0;y=e+60|0;v=e+4|0;g=b+1176|0;t=D+12|0;u=D;e=e+44|0;E=b+1220|0;F=b+1172|0;H=0;I=0;a:while(1){J=c[C>>2]|0;if((c[B>>2]|0)==0){if((c[J+(G*216|0)+196>>2]|0)!=0){a=4;break}}K=c[(c[q>>2]|0)+56>>2]|0;N=c[w>>2]|0;M=c[x>>2]|0;L=c[y>>2]|0;c[J+(G*216|0)+4>>2]=c[z>>2];c[J+(G*216|0)+8>>2]=N;c[J+(G*216|0)+12>>2]=M;c[J+(G*216|0)+16>>2]=L;c[J+(G*216|0)+24>>2]=K;J=c[v>>2]|0;do{if(!((J|0)==7|(J|0)==2)){if((I|0)!=0){break}I=Rc(a,A)|0;if((I|0)!=0){a=28;break a}I=c[A>>2]|0;if(I>>>0>((c[g>>2]|0)-G|0)>>>0){a=9;break a}if((I|0)==0){I=0;break}_c(t|0,0,164)|0;c[u>>2]=0;I=1}}while(0);J=c[A>>2]|0;if((J|0)==0){I=Fb(a,D,(c[C>>2]|0)+(G*216|0)|0,c[v>>2]|0,c[e>>2]|0)|0;if((I|0)==0){I=0}else{a=15;break}}else{c[A>>2]=J+ -1}J=Kb((c[C>>2]|0)+(G*216|0)|0,D,d,E,p,G,c[(c[q>>2]|0)+64>>2]|0,r)|0;if((J|0)!=0){a=17;break}H=((c[(c[C>>2]|0)+(G*216|0)+196>>2]|0)==1)+H|0;if((Oc(a)|0)==0){J=(c[A>>2]|0)!=0}else{J=1}N=c[v>>2]|0;if((N|0)==7|(N|0)==2){c[s>>2]=G}G=Pc(c[F>>2]|0,c[g>>2]|0,G)|0;if(J&(G|0)==0){a=23;break}if(!J){a=25;break}}if((a|0)==4){N=c[m>>2]|0;c[n>>2]=7512;pa(N|0,7496,n|0)|0;N=1;i=f;return N|0}else if((a|0)==9){N=c[m>>2]|0;c[j>>2]=7544;pa(N|0,7496,j|0)|0;N=1;i=f;return N|0}else if((a|0)==15){N=c[m>>2]|0;c[o>>2]=7560;pa(N|0,7496,o|0)|0;N=I;i=f;return N|0}else if((a|0)==17){N=c[m>>2]|0;c[k>>2]=7584;pa(N|0,7496,k|0)|0;N=J;i=f;return N|0}else if((a|0)==23){N=c[m>>2]|0;c[l>>2]=7600;pa(N|0,7496,l|0)|0;N=1;i=f;return N|0}else if((a|0)==25){j=b+1196|0;k=(c[j>>2]|0)+H|0;if(k>>>0>(c[g>>2]|0)>>>0){N=c[m>>2]|0;c[h>>2]=7616;pa(N|0,7496,h|0)|0;N=1;i=f;return N|0}else{c[j>>2]=k;N=0;i=f;return N|0}}else if((a|0)==28){i=f;return I|0}return 0}function lc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;f=c[a+1192>>2]|0;j=c[a+1200>>2]|0;e=a+1212|0;a:do{if((j|0)!=0){g=a+16|0;h=0;while(1){do{j=j+ -1|0;if(!(j>>>0>b>>>0)){b=j;break a}}while((c[(c[e>>2]|0)+(j*216|0)+4>>2]|0)!=(f|0));h=h+1|0;k=c[(c[g>>2]|0)+52>>2]|0;if(!(h>>>0<(k>>>0>10?k:10)>>>0)){b=j;break}}}}while(0);g=a+1172|0;a=a+1176|0;while(1){h=c[e>>2]|0;if((c[h+(b*216|0)+4>>2]|0)!=(f|0)){e=11;break}h=h+(b*216|0)+196|0;j=c[h>>2]|0;if((j|0)==0){e=11;break}c[h>>2]=j+ -1;b=Pc(c[g>>2]|0,c[a>>2]|0,b)|0;if((b|0)==0){e=11;break}}if((e|0)==11){i=d;return}}function mc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=i;h=_(f,e)|0;j=c[b+12>>2]|0;if((j|0)==1){_c(a|0,0,h<<2|0)|0;i=g;return}k=c[b+16>>2]|0;do{if((k+ -3|0)>>>0<3){d=_(c[b+36>>2]|0,d)|0;d=d>>>0<h>>>0?d:h;t=c[b+32>>2]|0;if((k+ -4|0)>>>0<2){d=(t|0)==0?d:h-d|0;break}if((h|0)!=0){j=0;do{c[a+(j<<2)>>2]=1;j=j+1|0;}while((j|0)!=(h|0))}q=(e-t|0)>>>1;p=(f-t|0)>>>1;if((d|0)==0){i=g;return}j=t<<1;b=j+ -1|0;h=e+ -1|0;j=1-j|0;f=f+ -1|0;l=p;k=0;o=q;n=q;m=p;s=t+ -1|0;r=p;do{u=a+((_(r,e)|0)+q<<2)|0;v=(c[u>>2]|0)==1;p=v&1;if(v){c[u>>2]=0}do{if((s|0)==-1&(q|0)==(o|0)){o=o+ -1|0;q=(o|0)>0?o:0;o=q;s=0;t=b}else{if((s|0)==1&(q|0)==(n|0)){n=n+1|0;q=(n|0)<(h|0)?n:h;n=q;s=0;t=j;break}if((t|0)==-1&(r|0)==(m|0)){m=m+ -1|0;r=(m|0)>0?m:0;m=r;s=j;t=0;break}if((t|0)==1&(r|0)==(l|0)){l=l+1|0;r=(l|0)<(f|0)?l:f;l=r;s=b;t=0;break}else{q=q+s|0;r=r+t|0;break}}}while(0);k=p+k|0;}while(k>>>0<d>>>0);i=g;return}else{d=0}}while(0);switch(k|0){case 4:{e=c[b+32>>2]|0;if((h|0)==0){i=g;return}j=1-e|0;b=0;do{c[a+(b<<2)>>2]=b>>>0<d>>>0?e:j;b=b+1|0;}while((b|0)!=(h|0));i=g;return};case 2:{d=c[b+24>>2]|0;b=c[b+28>>2]|0;f=j+ -1|0;if((h|0)!=0){k=0;do{c[a+(k<<2)>>2]=f;k=k+1|0;}while((k|0)!=(h|0))}if((f|0)==0){i=g;return}h=j+ -2|0;while(1){k=c[d+(h<<2)>>2]|0;l=(k>>>0)/(e>>>0)|0;k=(k>>>0)%(e>>>0)|0;f=c[b+(h<<2)>>2]|0;j=(f>>>0)/(e>>>0)|0;f=(f>>>0)%(e>>>0)|0;a:do{if(!(l>>>0>j>>>0)){if(k>>>0>f>>>0){while(1){l=l+1|0;if(l>>>0>j>>>0){break a}}}do{m=_(l,e)|0;n=k;do{c[a+(n+m<<2)>>2]=h;n=n+1|0;}while(!(n>>>0>f>>>0));l=l+1|0;}while(!(l>>>0>j>>>0))}}while(0);if((h|0)==0){break}else{h=h+ -1|0}}i=g;return};case 1:{if((h|0)==0){i=g;return}else{d=0}do{c[a+(d<<2)>>2]=((((_((d>>>0)/(e>>>0)|0,j)|0)>>>1)+((d>>>0)%(e>>>0)|0)|0)>>>0)%(j>>>0)|0;d=d+1|0;}while((d|0)!=(h|0));i=g;return};case 0:{e=c[b+20>>2]|0;if((h|0)==0){i=g;return}else{b=0;d=0}while(1){while(1){if(b>>>0<j>>>0){break}else{b=0}}f=e+(b<<2)|0;k=c[f>>2]|0;b:do{if((k|0)==0){k=0}else{l=0;do{m=l+d|0;if(!(m>>>0<h>>>0)){break b}c[a+(m<<2)>>2]=b;l=l+1|0;k=c[f>>2]|0;}while(l>>>0<k>>>0)}}while(0);d=k+d|0;if(d>>>0<h>>>0){b=b+1|0}else{break}}i=g;return};case 5:{b=c[b+32>>2]|0;if((e|0)==0){i=g;return}h=1-b|0;if((f|0)==0){i=g;return}else{k=0;j=0}while(1){n=0;l=j;while(1){m=a+((_(n,e)|0)+k<<2)|0;c[m>>2]=l>>>0<d>>>0?b:h;n=n+1|0;if((n|0)==(f|0)){break}else{l=l+1|0}}k=k+1|0;if((k|0)==(e|0)){break}else{j=j+f|0}}i=g;return};default:{if((h|0)==0){i=g;return}e=c[b+44>>2]|0;d=0;do{c[a+(d<<2)>>2]=c[e+(d<<2)>>2];d=d+1|0;}while((d|0)!=(h|0));i=g;return}}}function nc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;k=i;i=i+8|0;g=k;l=i;i=i+8|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;u=i;i=i+8|0;w=i;i=i+8|0;s=i;i=i+8|0;B=i;i=i+8|0;H=i;i=i+8|0;D=i;i=i+8|0;E=i;i=i+8|0;C=i;i=i+8|0;K=i;i=i+8|0;J=i;i=i+8|0;M=i;i=i+8|0;O=i;i=i+8|0;P=i;i=i+8|0;I=i;i=i+8|0;Q=i;i=i+8|0;R=i;i=i+8|0;z=i;i=i+8|0;y=i;i=i+8|0;F=i;i=i+8|0;G=i;i=i+8|0;h=i;i=i+8|0;n=i;i=i+8|0;_c(b|0,0,988)|0;j=_(c[d+56>>2]|0,c[d+52>>2]|0)|0;L=Rc(a,h)|0;if((L|0)!=0){R=L;i=k;return R|0}L=c[h>>2]|0;c[b>>2]=L;if(!(L>>>0<j>>>0)){Q=c[m>>2]|0;c[R>>2]=7648;pa(Q|0,7632,R|0)|0;R=1;i=k;return R|0}L=Rc(a,h)|0;if((L|0)!=0){R=L;i=k;return R|0}R=c[h>>2]|0;L=b+4|0;c[L>>2]=R;do{if((R|0)==5|(R|0)==0){if((c[f>>2]|0)==5){N=8;break}if((c[d+44>>2]|0)==0){N=8}}else if(!((R|0)==7|(R|0)==2)){N=8}}while(0);if((N|0)==8){R=c[m>>2]|0;c[Q>>2]=7672;pa(R|0,7632,Q|0)|0;R=1;i=k;return R|0}N=Rc(a,h)|0;if((N|0)!=0){R=N;i=k;return R|0}R=c[h>>2]|0;c[b+8>>2]=R;if((R|0)!=(c[e>>2]|0)){R=c[m>>2]|0;c[I>>2]=7688;pa(R|0,7632,I|0)|0;R=1;i=k;return R|0}N=d+12|0;I=c[N>>2]|0;Q=0;while(1){if((I>>>Q|0)==0){break}else{Q=Q+1|0}}Q=Fc(a,Q+ -1|0)|0;if((Q|0)==-1){R=1;i=k;return R|0}I=f;if(!((c[I>>2]|0)!=5|(Q|0)==0)){R=c[m>>2]|0;c[P>>2]=7712;pa(R|0,7632,P|0)|0;R=1;i=k;return R|0}c[b+12>>2]=Q;do{if((c[I>>2]|0)==5){P=Rc(a,h)|0;if((P|0)!=0){R=P;i=k;return R|0}R=c[h>>2]|0;c[b+16>>2]=R;if(!(R>>>0>65535)){break}R=c[m>>2]|0;c[O>>2]=7728;pa(R|0,7632,O|0)|0;R=1;i=k;return R|0}}while(0);O=d+16|0;P=c[O>>2]|0;if((P|0)==0){P=d+20|0;R=c[P>>2]|0;Q=0;while(1){if((R>>>Q|0)==0){break}else{Q=Q+1|0}}R=Fc(a,Q+ -1|0)|0;if((R|0)==-1){R=1;i=k;return R|0}Q=b+20|0;c[Q>>2]=R;do{if((c[e+8>>2]|0)!=0){R=Sc(a,n)|0;if((R|0)==0){c[b+24>>2]=c[n>>2];break}else{i=k;return R|0}}}while(0);do{if((c[I>>2]|0)==5){Q=c[Q>>2]|0;if(Q>>>0>(c[P>>2]|0)>>>1>>>0){R=1;i=k;return R|0}P=c[b+24>>2]|0;if((Q|0)==(((P|0)>0?0:0-P|0)|0)){break}else{A=1}i=k;return A|0}}while(0);P=c[O>>2]|0}do{if((P|0)==1){if((c[d+24>>2]|0)!=0){break}O=Sc(a,n)|0;if((O|0)!=0){R=O;i=k;return R|0}P=b+28|0;c[P>>2]=c[n>>2];do{if((c[e+8>>2]|0)!=0){O=Sc(a,n)|0;if((O|0)==0){c[b+32>>2]=c[n>>2];break}else{R=O;i=k;return R|0}}}while(0);if((c[I>>2]|0)!=5){break}P=c[P>>2]|0;O=(c[d+32>>2]|0)+P+(c[b+32>>2]|0)|0;if((((P|0)<(O|0)?P:O)|0)==0){break}else{A=1}i=k;return A|0}}while(0);do{if((c[e+68>>2]|0)!=0){O=Rc(a,h)|0;if((O|0)!=0){R=O;i=k;return R|0}R=c[h>>2]|0;c[b+36>>2]=R;if(!(R>>>0>127)){break}R=c[m>>2]|0;c[M>>2]=7744;pa(R|0,7632,M|0)|0;R=1;i=k;return R|0}}while(0);M=c[L>>2]|0;if((M|0)==5|(M|0)==0){M=Fc(a,1)|0;if((M|0)==-1){R=1;i=k;return R|0}c[b+40>>2]=M;do{if((M|0)==0){J=c[e+48>>2]|0;if(!(J>>>0>16)){c[b+44>>2]=J;break}R=c[m>>2]|0;c[K>>2]=7800;pa(R|0,7632,K|0)|0;R=1;i=k;return R|0}else{K=Rc(a,h)|0;if((K|0)!=0){R=K;i=k;return R|0}K=c[h>>2]|0;if(!(K>>>0>15)){c[b+44>>2]=K+1;break}R=c[m>>2]|0;c[J>>2]=7768;pa(R|0,7632,J|0)|0;R=1;i=k;return R|0}}while(0);M=c[L>>2]|0}do{if((M|0)==5|(M|0)==0){J=c[b+44>>2]|0;K=c[N>>2]|0;L=Fc(a,1)|0;if((L|0)==-1){R=1;i=k;return R|0}c[b+68>>2]=L;if((L|0)==0){break}else{L=0}a:while(1){if(L>>>0>J>>>0){N=59;break}M=Rc(a,G)|0;if((M|0)!=0){A=M;N=130;break}M=c[G>>2]|0;if(M>>>0>3){N=62;break}c[b+(L*12|0)+72>>2]=M;do{if(M>>>0<2){M=Rc(a,F)|0;if((M|0)!=0){A=M;N=130;break a}M=c[F>>2]|0;if(!(M>>>0<K>>>0)){N=66;break a}c[b+(L*12|0)+76>>2]=M+1}else{if((M|0)!=2){break}M=Rc(a,F)|0;if((M|0)!=0){A=M;N=130;break a}c[b+(L*12|0)+80>>2]=c[F>>2]}}while(0);if((c[G>>2]|0)==3){N=72;break}else{L=L+1|0}}if((N|0)==59){R=c[m>>2]|0;c[C>>2]=8112;pa(R|0,7632,C|0)|0;R=1;i=k;return R|0}else if((N|0)==62){R=c[m>>2]|0;c[E>>2]=8144;pa(R|0,7632,E|0)|0;R=1;i=k;return R|0}else if((N|0)==66){R=c[m>>2]|0;c[D>>2]=8176;pa(R|0,7632,D|0)|0;R=1;i=k;return R|0}else if((N|0)==72){if((L|0)!=0){break}R=c[m>>2]|0;c[H>>2]=8200;pa(R|0,7632,H|0)|0;R=1;i=k;return R|0}else if((N|0)==130){i=k;return A|0}}}while(0);do{if((c[f+4>>2]|0)!=0){C=c[d+44>>2]|0;R=(c[I>>2]|0)==5;D=Fc(a,1)|0;E=(D|0)==-1;if(R){if(E){R=1;i=k;return R|0}c[b+276>>2]=D;r=Fc(a,1)|0;if((r|0)==-1){R=1;i=k;return R|0}c[b+280>>2]=r;if((C|0)!=0|(r|0)==0){break}R=c[m>>2]|0;c[B>>2]=7976;pa(R|0,7632,B|0)|0;R=1;i=k;return R|0}if(E){R=1;i=k;return R|0}c[b+284>>2]=D;if((D|0)==0){break}D=(C<<1)+2|0;G=0;E=0;H=0;B=0;F=0;while(1){if(G>>>0>D>>>0){N=84;break}f=Rc(a,y)|0;if((f|0)!=0){A=f;N=130;break}f=c[y>>2]|0;if(f>>>0>6){N=87;break}c[b+(G*20|0)+288>>2]=f;if((f&-3|0)==1){f=Rc(a,z)|0;if((f|0)!=0){A=f;N=130;break}c[b+(G*20|0)+292>>2]=(c[z>>2]|0)+1;f=c[y>>2]|0}if((f|0)==2){f=Rc(a,z)|0;if((f|0)!=0){A=f;N=130;break}c[b+(G*20|0)+296>>2]=c[z>>2];f=c[y>>2]|0}if((f|0)==3|(f|0)==6){f=Rc(a,z)|0;if((f|0)!=0){A=f;N=130;break}c[b+(G*20|0)+300>>2]=c[z>>2];f=c[y>>2]|0}if((f|0)==4){f=Rc(a,z)|0;if((f|0)!=0){A=f;N=130;break}f=c[z>>2]|0;if(f>>>0>C>>>0){N=100;break}if((f|0)==0){c[b+(G*20|0)+304>>2]=65535}else{c[b+(G*20|0)+304>>2]=f+ -1}f=c[y>>2]|0;x=H+1|0}else{x=H}r=((f|0)==5)+B|0;t=((f|0)!=0&f>>>0<4&1)+E|0;v=((f|0)==6)+F|0;if((f|0)==0){N=106;break}else{G=G+1|0;E=t;H=x;B=r;F=v}}if((N|0)==84){R=c[m>>2]|0;c[s>>2]=8008;pa(R|0,7632,s|0)|0;R=1;i=k;return R|0}else if((N|0)==87){R=c[m>>2]|0;c[w>>2]=8040;pa(R|0,7632,w|0)|0;R=1;i=k;return R|0}else if((N|0)==100){R=c[m>>2]|0;c[u>>2]=8080;pa(R|0,7632,u|0)|0;R=1;i=k;return R|0}else if((N|0)==106){if(x>>>0>1|r>>>0>1|v>>>0>1){R=1;i=k;return R|0}if((t|0)==0|(r|0)==0){break}else{A=1}i=k;return A|0}else if((N|0)==130){i=k;return A|0}}}while(0);r=Sc(a,n)|0;if((r|0)!=0){R=r;i=k;return R|0}R=c[n>>2]|0;c[b+48>>2]=R;R=R+(c[e+52>>2]|0)|0;c[n>>2]=R;if(R>>>0>51){R=c[m>>2]|0;c[q>>2]=7840;pa(R|0,7632,q|0)|0;R=1;i=k;return R|0}do{if((c[e+60>>2]|0)!=0){q=Rc(a,h)|0;if((q|0)!=0){R=q;i=k;return R|0}q=c[h>>2]|0;c[b+52>>2]=q;if(q>>>0>2){R=c[m>>2]|0;c[p>>2]=7856;pa(R|0,7632,p|0)|0;R=1;i=k;return R|0}if((q|0)==1){break}p=Sc(a,n)|0;if((p|0)!=0){R=p;i=k;return R|0}p=c[n>>2]|0;if((p+6|0)>>>0>12){R=c[m>>2]|0;c[o>>2]=7888;pa(R|0,7632,o|0)|0;R=1;i=k;return R|0}c[b+56>>2]=p<<1;o=Sc(a,n)|0;if((o|0)!=0){R=o;i=k;return R|0}n=c[n>>2]|0;if(!((n+6|0)>>>0>12)){c[b+60>>2]=n<<1;break}R=c[m>>2]|0;c[l>>2]=7920;pa(R|0,7632,l|0)|0;R=1;i=k;return R|0}}while(0);if(!((c[e+12>>2]|0)>>>0>1)){R=0;i=k;return R|0}if(!(((c[e+16>>2]|0)+ -3|0)>>>0<3)){R=0;i=k;return R|0}e=e+36|0;l=c[e>>2]|0;o=(((j>>>0)%(l>>>0)|0|0)==0?1:2)+((j>>>0)/(l>>>0)|0)|0;n=0;while(1){l=n+1|0;if((-1<<l&o|0)==0){break}else{n=l}}a=Fc(a,((1<<n)+ -1&o|0)==0?n:l)|0;c[h>>2]=a;if((a|0)==-1){R=1;i=k;return R|0}c[b+64>>2]=a;R=c[e>>2]|0;if(!(a>>>0>(((j+ -1+R|0)>>>0)/(R>>>0)|0)>>>0)){R=0;i=k;return R|0}R=c[m>>2]|0;c[g>>2]=7944;pa(R|0,7632,g|0)|0;R=1;i=k;return R|0}function oc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;i=i+32|0;e=d;g=d+8|0;f=g;c[g+0>>2]=c[a+0>>2];c[g+4>>2]=c[a+4>>2];c[g+8>>2]=c[a+8>>2];c[g+12>>2]=c[a+12>>2];c[g+16>>2]=c[a+16>>2];a=Rc(f,e)|0;do{if((a|0)==0){a=Rc(f,e)|0;if((a|0)!=0){break}a=Rc(f,e)|0;if((a|0)!=0){break}e=c[e>>2]|0;if(e>>>0>255){a=1;break}c[b>>2]=e;a=0}}while(0);i=d;return a|0}function pc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=i;i=i+32|0;g=e;h=e+8|0;f=h;c[h+0>>2]=c[a+0>>2];c[h+4>>2]=c[a+4>>2];c[h+8>>2]=c[a+8>>2];c[h+12>>2]=c[a+12>>2];c[h+16>>2]=c[a+16>>2];a=Rc(f,g)|0;if((a|0)!=0){h=a;i=e;return h|0}a=Rc(f,g)|0;if((a|0)!=0){h=a;i=e;return h|0}g=Rc(f,g)|0;if((g|0)==0){g=0}else{h=g;i=e;return h|0}while(1){if((b>>>g|0)==0){break}else{g=g+1|0}}b=Fc(f,g+ -1|0)|0;if((b|0)==-1){h=1;i=e;return h|0}c[d>>2]=b;h=0;i=e;return h|0}function qc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+32|0;g=f;h=f+8|0;if((d|0)!=5){a=1;i=f;return a|0}d=h;c[h+0>>2]=c[a+0>>2];c[h+4>>2]=c[a+4>>2];c[h+8>>2]=c[a+8>>2];c[h+12>>2]=c[a+12>>2];c[h+16>>2]=c[a+16>>2];h=Rc(d,g)|0;if((h|0)!=0){a=h;i=f;return a|0}h=Rc(d,g)|0;if((h|0)!=0){a=h;i=f;return a|0}g=Rc(d,g)|0;if((g|0)==0){g=0}else{a=g;i=f;return a|0}while(1){if((b>>>g|0)==0){break}else{g=g+1|0}}if((Fc(d,g+ -1|0)|0)==-1){a=1;i=f;return a|0}a=Rc(d,e)|0;i=f;return a|0}function rc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+32|0;h=f;j=f+8|0;g=j;c[j+0>>2]=c[a+0>>2];c[j+4>>2]=c[a+4>>2];c[j+8>>2]=c[a+8>>2];c[j+12>>2]=c[a+12>>2];c[j+16>>2]=c[a+16>>2];a=Rc(g,h)|0;if((a|0)!=0){j=a;i=f;return j|0}a=Rc(g,h)|0;if((a|0)!=0){j=a;i=f;return j|0}a=Rc(g,h)|0;if((a|0)!=0){j=a;i=f;return j|0}j=c[b+12>>2]|0;a=0;while(1){if((j>>>a|0)==0){break}else{a=a+1|0}}if((Fc(g,a+ -1|0)|0)==-1){j=1;i=f;return j|0}do{if((d|0)==5){h=Rc(g,h)|0;if((h|0)==0){break}i=f;return h|0}}while(0);h=c[b+20>>2]|0;b=0;while(1){if((h>>>b|0)==0){break}else{b=b+1|0}}g=Fc(g,b+ -1|0)|0;if((g|0)==-1){j=1;i=f;return j|0}c[e>>2]=g;j=0;i=f;return j|0}function sc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;i=i+32|0;h=f;j=f+8|0;g=j;c[j+0>>2]=c[a+0>>2];c[j+4>>2]=c[a+4>>2];c[j+8>>2]=c[a+8>>2];c[j+12>>2]=c[a+12>>2];c[j+16>>2]=c[a+16>>2];a=Rc(g,h)|0;if((a|0)!=0){j=a;i=f;return j|0}a=Rc(g,h)|0;if((a|0)!=0){j=a;i=f;return j|0}a=Rc(g,h)|0;if((a|0)!=0){j=a;i=f;return j|0}j=c[b+12>>2]|0;a=0;while(1){if((j>>>a|0)==0){break}else{a=a+1|0}}if((Fc(g,a+ -1|0)|0)==-1){j=1;i=f;return j|0}do{if((d|0)==5){h=Rc(g,h)|0;if((h|0)==0){break}i=f;return h|0}}while(0);h=c[b+20>>2]|0;b=0;while(1){if((h>>>b|0)==0){break}else{b=b+1|0}}if((Fc(g,b+ -1|0)|0)==-1){j=1;i=f;return j|0}j=Sc(g,e)|0;i=f;return j|0}function tc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0;g=i;i=i+32|0;j=g;k=g+8|0;h=k;c[k+0>>2]=c[a+0>>2];c[k+4>>2]=c[a+4>>2];c[k+8>>2]=c[a+8>>2];c[k+12>>2]=c[a+12>>2];c[k+16>>2]=c[a+16>>2];a=Rc(h,j)|0;do{if((a|0)==0){a=Rc(h,j)|0;if((a|0)!=0){break}a=Rc(h,j)|0;if((a|0)!=0){break}b=c[b+12>>2]|0;a=0;while(1){if((b>>>a|0)==0){break}else{a=a+1|0}}if((Fc(h,a+ -1|0)|0)==-1){a=1;break}if((d|0)==5){a=Rc(h,j)|0;if((a|0)!=0){break}}a=Sc(h,f)|0;if((a|0)!=0){break}if((e|0)!=0){a=Sc(h,f+4|0)|0;if((a|0)!=0){break}}a=0}}while(0);i=g;return a|0}function uc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;f=i;i=i+40|0;h=f;j=f+8|0;l=f+16|0;g=l;c[l+0>>2]=c[b+0>>2];c[l+4>>2]=c[b+4>>2];c[l+8>>2]=c[b+8>>2];c[l+12>>2]=c[b+12>>2];c[l+16>>2]=c[b+16>>2];b=Rc(g,h)|0;if((b|0)!=0){l=b;i=f;return l|0}b=Rc(g,h)|0;if((b|0)!=0){l=b;i=f;return l|0}b=Rc(g,h)|0;if((b|0)!=0){l=b;i=f;return l|0}k=c[d+12>>2]|0;b=0;while(1){if((k>>>b|0)==0){break}else{b=b+1|0}}if((Fc(g,b+ -1|0)|0)==-1){l=1;i=f;return l|0}b=Rc(g,h)|0;if((b|0)!=0){l=b;i=f;return l|0}b=d+16|0;k=c[b>>2]|0;if((k|0)==0){k=c[d+20>>2]|0;l=0;while(1){if((k>>>l|0)==0){break}else{l=l+1|0}}if((Fc(g,l+ -1|0)|0)==-1){l=1;i=f;return l|0}do{if((c[e+8>>2]|0)!=0){k=Sc(g,j)|0;if((k|0)==0){break}i=f;return k|0}}while(0);k=c[b>>2]|0}do{if((k|0)==1){if((c[d+24>>2]|0)!=0){break}d=Sc(g,j)|0;if((d|0)!=0){l=d;i=f;return l|0}if((c[e+8>>2]|0)==0){break}k=Sc(g,j)|0;if((k|0)==0){break}i=f;return k|0}}while(0);do{if((c[e+68>>2]|0)!=0){k=Rc(g,h)|0;if((k|0)==0){break}i=f;return k|0}}while(0);l=Fc(g,1)|0;c[a>>2]=l;l=(l|0)==-1|0;i=f;return l|0}function vc(a){a=a|0;var b=0;b=i;_c(a|0,0,3396)|0;c[a+8>>2]=32;c[a+4>>2]=256;c[a+1332>>2]=1;i=b;return}function wc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;h=c[b+8>>2]|0;e=a+(h<<2)+20|0;g=c[e>>2]|0;do{if((g|0)==0){h=Xc(92)|0;c[e>>2]=h;if((h|0)==0){b=65535}else{break}i=d;return b|0}else{f=a+8|0;if((h|0)!=(c[f>>2]|0)){Yc(c[g+40>>2]|0);c[(c[e>>2]|0)+40>>2]=0;Yc(c[(c[e>>2]|0)+84>>2]|0);c[(c[e>>2]|0)+84>>2]=0;break}g=a+16|0;if((jc(b,c[g>>2]|0)|0)!=0){Yc(c[(c[e>>2]|0)+40>>2]|0);c[(c[e>>2]|0)+40>>2]=0;Yc(c[(c[e>>2]|0)+84>>2]|0);c[(c[e>>2]|0)+84>>2]=0;c[f>>2]=33;c[a+4>>2]=257;c[g>>2]=0;c[a+12>>2]=0;break}h=b+40|0;Yc(c[h>>2]|0);c[h>>2]=0;h=b+84|0;Yc(c[h>>2]|0);c[h>>2]=0;h=0;i=d;return h|0}}while(0);e=(c[e>>2]|0)+0|0;b=b+0|0;a=e+92|0;do{c[e>>2]=c[b>>2];e=e+4|0;b=b+4|0}while((e|0)<(a|0));h=0;i=d;return h|0}function xc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;g=c[b>>2]|0;e=a+(g<<2)+148|0;f=c[e>>2]|0;do{if((f|0)==0){h=Xc(72)|0;c[e>>2]=h;if((h|0)==0){b=65535}else{break}i=d;return b|0}else{h=a+4|0;if((g|0)!=(c[h>>2]|0)){Yc(c[f+20>>2]|0);c[(c[e>>2]|0)+20>>2]=0;Yc(c[(c[e>>2]|0)+24>>2]|0);c[(c[e>>2]|0)+24>>2]=0;Yc(c[(c[e>>2]|0)+28>>2]|0);c[(c[e>>2]|0)+28>>2]=0;Yc(c[(c[e>>2]|0)+44>>2]|0);c[(c[e>>2]|0)+44>>2]=0;break}if((c[b+4>>2]|0)!=(c[a+8>>2]|0)){c[h>>2]=257;f=c[e>>2]|0}Yc(c[f+20>>2]|0);c[(c[e>>2]|0)+20>>2]=0;Yc(c[(c[e>>2]|0)+24>>2]|0);c[(c[e>>2]|0)+24>>2]=0;Yc(c[(c[e>>2]|0)+28>>2]|0);c[(c[e>>2]|0)+28>>2]=0;Yc(c[(c[e>>2]|0)+44>>2]|0);c[(c[e>>2]|0)+44>>2]=0}}while(0);e=(c[e>>2]|0)+0|0;b=b+0|0;f=e+72|0;do{c[e>>2]=c[b>>2];e=e+4|0;b=b+4|0}while((e|0)<(f|0));h=0;i=d;return h|0}function yc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;e=i;g=a+(b<<2)+148|0;m=c[g>>2]|0;if((m|0)==0){p=1;i=e;return p|0}f=c[m+4>>2]|0;h=c[a+(f<<2)+20>>2]|0;if((h|0)==0){p=1;i=e;return p|0}j=c[h+52>>2]|0;h=_(c[h+56>>2]|0,j)|0;k=c[m+12>>2]|0;a:do{if(k>>>0>1){l=c[m+16>>2]|0;if((l|0)==2){l=c[m+24>>2]|0;m=c[m+28>>2]|0;p=k+ -1|0;n=0;while(1){o=c[l+(n<<2)>>2]|0;k=c[m+(n<<2)>>2]|0;if(!(o>>>0<=k>>>0&k>>>0<h>>>0)){a=1;h=33;break}n=n+1|0;if(((o>>>0)%(j>>>0)|0)>>>0>((k>>>0)%(j>>>0)|0)>>>0){a=1;h=33;break}if(!(n>>>0<p>>>0)){break a}}if((h|0)==33){i=e;return a|0}}else if((l|0)==0){m=c[m+20>>2]|0;l=0;while(1){j=l+1|0;if((c[m+(l<<2)>>2]|0)>>>0>h>>>0){a=1;break}if(j>>>0<k>>>0){l=j}else{break a}}i=e;return a|0}else{if((l+ -3|0)>>>0<3){if((c[m+36>>2]|0)>>>0>h>>>0){a=1}else{break}i=e;return a|0}if((l|0)!=6){break}if((c[m+40>>2]|0)>>>0<h>>>0){a=1}else{break}i=e;return a|0}}}while(0);j=a+4|0;k=c[j>>2]|0;do{if((k|0)==256){c[j>>2]=b;p=c[g>>2]|0;c[a+12>>2]=p;p=c[p+4>>2]|0;c[a+8>>2]=p;p=c[a+(p<<2)+20>>2]|0;c[a+16>>2]=p;o=p+52|0;p=p+56|0;c[a+1176>>2]=_(c[p>>2]|0,c[o>>2]|0)|0;c[a+1340>>2]=c[o>>2];c[a+1344>>2]=c[p>>2];c[a+3380>>2]=1}else{h=a+3380|0;if((c[h>>2]|0)==0){if((k|0)==(b|0)){break}k=a+8|0;if((f|0)==(c[k>>2]|0)){c[j>>2]=b;c[a+12>>2]=c[g>>2];break}if((d|0)==0){p=1;i=e;return p|0}else{c[j>>2]=b;p=c[g>>2]|0;c[a+12>>2]=p;p=c[p+4>>2]|0;c[k>>2]=p;p=c[a+(p<<2)+20>>2]|0;c[a+16>>2]=p;o=p+52|0;p=p+56|0;c[a+1176>>2]=_(c[p>>2]|0,c[o>>2]|0)|0;c[a+1340>>2]=c[o>>2];c[a+1344>>2]=c[p>>2];c[h>>2]=1;break}}c[h>>2]=0;p=a+1212|0;Yc(c[p>>2]|0);c[p>>2]=0;o=a+1172|0;Yc(c[o>>2]|0);g=c[a+1176>>2]|0;f=g*216|0;d=Xc(f)|0;b=d;c[p>>2]=b;p=Xc(g<<2)|0;c[o>>2]=p;if((d|0)==0|(p|0)==0){p=65535;i=e;return p|0}_c(d|0,0,f|0)|0;p=a+16|0;Ob(b,c[(c[p>>2]|0)+52>>2]|0,g);b=c[p>>2]|0;b:do{if((c[a+1216>>2]|0)==0){if((c[b+16>>2]|0)==2){d=1;break}do{if((c[b+80>>2]|0)!=0){d=c[b+84>>2]|0;if((c[d+920>>2]|0)==0){break}if((c[d+944>>2]|0)==0){d=1;break b}}}while(0);d=0}else{d=1}}while(0);p=_(c[b+56>>2]|0,c[b+52>>2]|0)|0;a=qb(a+1220|0,p,c[b+88>>2]|0,c[b+44>>2]|0,c[b+12>>2]|0,d)|0;if((a|0)==0){break}i=e;return a|0}}while(0);p=0;i=e;return p|0}function zc(a){a=a|0;var b=0,d=0,e=0;b=i;c[a+1196>>2]=0;c[a+1192>>2]=0;d=a+1176|0;if((c[d>>2]|0)==0){i=b;return}a=c[a+1212>>2]|0;e=0;do{c[a+(e*216|0)+4>>2]=0;c[a+(e*216|0)+196>>2]=0;e=e+1|0;}while(e>>>0<(c[d>>2]|0)>>>0);i=b;return}function Ac(a){a=a|0;i=i;return(c[a+1188>>2]|0)==0|0}function Bc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;do{if((c[a+1404>>2]|0)==0){if((c[a+1196>>2]|0)==(c[a+1176>>2]|0)){d=1}else{break}i=b;return d|0}else{d=c[a+1176>>2]|0;if((d|0)==0){f=1;i=b;return f|0}a=c[a+1212>>2]|0;e=0;f=0;do{f=((c[a+(e*216|0)+196>>2]|0)!=0)+f|0;e=e+1|0;}while(e>>>0<d>>>0);if((f|0)==(d|0)){d=1}else{break}i=b;return d|0}}while(0);f=0;i=b;return f|0}function Cc(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=c[a+16>>2]|0;mc(c[a+1172>>2]|0,c[a+12>>2]|0,b,c[e+52>>2]|0,c[e+56>>2]|0);i=d;return}function Dc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;f=i;i=i+48|0;m=f;p=f+8|0;o=f+16|0;l=f+24|0;j=f+32|0;h=f+40|0;c[e>>2]=0;k=b;g=c[k>>2]|0;if((g+ -6|0)>>>0<6|(g+ -13|0)>>>0<6){c[e>>2]=1;s=0;i=f;return s|0}if(!((g|0)==5|(g|0)==1)){s=0;i=f;return s|0}g=d+1300|0;n=d+1332|0;if((c[n>>2]|0)!=0){c[e>>2]=1;c[n>>2]=0}n=oc(a,m)|0;if((n|0)!=0){s=n;i=f;return s|0}n=c[d+(c[m>>2]<<2)+148>>2]|0;if((n|0)==0){s=65520;i=f;return s|0}r=c[n+4>>2]|0;m=c[d+(r<<2)+20>>2]|0;if((m|0)==0){s=65520;i=f;return s|0}s=c[d+8>>2]|0;do{if(!((s|0)==32|(r|0)==(s|0))){if((c[k>>2]|0)==5){break}else{e=65520}i=f;return e|0}}while(0);s=c[d+1304>>2]|0;r=c[b+4>>2]|0;do{if((s|0)!=(r|0)){if(!((s|0)==0|(r|0)==0)){break}c[e>>2]=1}}while(0);r=g;s=(c[k>>2]|0)==5;if((c[r>>2]|0)==5){if(!s){q=17}}else{if(s){q=17}}if((q|0)==17){c[e>>2]=1}s=m+12|0;if((pc(a,c[s>>2]|0,p)|0)!=0){s=1;i=f;return s|0}q=d+1308|0;p=c[p>>2]|0;if((c[q>>2]|0)!=(p|0)){c[q>>2]=p;c[e>>2]=1}if((c[k>>2]|0)==5){if((qc(a,c[s>>2]|0,5,o)|0)!=0){s=1;i=f;return s|0}do{if((c[r>>2]|0)==5){q=d+1312|0;p=c[q>>2]|0;o=c[o>>2]|0;if((p|0)==(o|0)){break}c[e>>2]=1;p=o}else{q=d+1312|0;p=c[o>>2]|0}}while(0);c[q>>2]=p}o=c[m+16>>2]|0;do{if((o|0)==1){if((c[m+24>>2]|0)!=0){break}j=n+8|0;l=h;a=tc(a,m,c[k>>2]|0,c[j>>2]|0,l)|0;if((a|0)!=0){s=a;i=f;return s|0}a=d+1324|0;k=c[l>>2]|0;if((c[a>>2]|0)!=(k|0)){c[a>>2]=k;c[e>>2]=1}if((c[j>>2]|0)==0){break}d=d+1328|0;h=c[h+4>>2]|0;if((c[d>>2]|0)==(h|0)){break}c[d>>2]=h;c[e>>2]=1}else if((o|0)==0){if((rc(a,m,c[k>>2]|0,l)|0)!=0){s=1;i=f;return s|0}h=d+1316|0;l=c[l>>2]|0;if((c[h>>2]|0)!=(l|0)){c[h>>2]=l;c[e>>2]=1}if((c[n+8>>2]|0)==0){break}h=sc(a,m,c[k>>2]|0,j)|0;if((h|0)!=0){s=h;i=f;return s|0}d=d+1320|0;h=c[j>>2]|0;if((c[d>>2]|0)==(h|0)){break}c[d>>2]=h;c[e>>2]=1}}while(0);q=b;r=c[q+4>>2]|0;s=g;c[s>>2]=c[q>>2];c[s+4>>2]=r;s=0;i=f;return s|0}function Ec(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;b=i;d=0;a:while(1){h=c[a+(d<<2)+148>>2]|0;b:do{if((h|0)!=0){e=c[a+(c[h+4>>2]<<2)+20>>2]|0;if((e|0)==0){break}f=c[e+52>>2]|0;e=_(c[e+56>>2]|0,f)|0;j=c[h+12>>2]|0;if(!(j>>>0>1)){a=0;d=18;break a}g=c[h+16>>2]|0;if((g|0)==2){g=c[h+24>>2]|0;h=c[h+28>>2]|0;k=j+ -1|0;m=0;while(1){j=c[g+(m<<2)>>2]|0;l=c[h+(m<<2)>>2]|0;if(!(j>>>0<=l>>>0&l>>>0<e>>>0)){break b}m=m+1|0;if(((j>>>0)%(f>>>0)|0)>>>0>((l>>>0)%(f>>>0)|0)>>>0){break b}if(!(m>>>0<k>>>0)){a=0;d=18;break a}}}else if((g|0)==0){f=c[h+20>>2]|0;h=0;while(1){g=h+1|0;if((c[f+(h<<2)>>2]|0)>>>0>e>>>0){break b}if(g>>>0<j>>>0){h=g}else{a=0;d=18;break a}}}else{if((g+ -3|0)>>>0<3){if((c[h+36>>2]|0)>>>0>e>>>0){break}else{a=0;d=18;break a}}if((g|0)!=6){a=0;d=18;break a}if((c[h+40>>2]|0)>>>0<e>>>0){break}else{a=0;d=18;break a}}}}while(0);d=d+1|0;if(!(d>>>0<256)){a=1;d=18;break}}if((d|0)==18){i=b;return a|0}return 0}function Fc(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;h=a+4|0;n=c[h>>2]|0;f=c[a+12>>2]<<3;e=a+16|0;j=c[e>>2]|0;l=f-j|0;do{if((l|0)>31){k=a+8|0;l=c[k>>2]|0;m=(d[n+1|0]|0)<<16|(d[n]|0)<<24|(d[n+2|0]|0)<<8|(d[n+3|0]|0);if((l|0)==0){break}m=(d[n+4|0]|0)>>>(8-l|0)|m<<l}else{k=a+8|0;if((l|0)<=0){m=0;break}p=c[k>>2]|0;o=p+24|0;m=(d[n]|0)<<o;l=l+ -8+p|0;if((l|0)<=0){break}while(1){n=n+1|0;o=o+ -8|0;m=(d[n]|0)<<o|m;l=l+ -8|0;if((l|0)>0){}else{break}}}}while(0);j=j+b|0;c[e>>2]=j;c[k>>2]=j&7;if(j>>>0>f>>>0){p=-1;i=g;return p|0}c[h>>2]=(c[a>>2]|0)+(j>>>3);p=m>>>(32-b|0);i=g;return p|0}function Gc(a){a=a|0;var b=0,e=0,f=0,g=0,h=0;b=i;f=c[a+4>>2]|0;e=(c[a+12>>2]<<3)-(c[a+16>>2]|0)|0;if((e|0)>31){e=c[a+8>>2]|0;a=(d[f+1|0]|0)<<16|(d[f]|0)<<24|(d[f+2|0]|0)<<8|(d[f+3|0]|0);if((e|0)==0){g=a;i=b;return g|0}g=(d[f+4|0]|0)>>>(8-e|0)|a<<e;i=b;return g|0}if((e|0)<=0){g=0;i=b;return g|0}h=c[a+8>>2]|0;a=h+24|0;g=(d[f]|0)<<a;e=e+ -8+h|0;if((e|0)<=0){h=g;i=b;return h|0}while(1){f=f+1|0;a=a+ -8|0;g=(d[f]|0)<<a|g;e=e+ -8|0;if((e|0)>0){}else{break}}i=b;return g|0}function Hc(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;e=a+16|0;b=(c[e>>2]|0)+b|0;c[e>>2]=b;c[a+8>>2]=b&7;if(b>>>0>c[a+12>>2]<<3>>>0){e=-1;i=d;return e|0}c[a+4>>2]=(c[a>>2]|0)+(b>>>3);e=0;i=d;return e|0}function Ic(a){a=a|0;i=i;return(c[a+8>>2]|0)==0|0}function Jc(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;g=i;j=d[8224+b|0]|0;k=d[8280+b|0]|0;b=c[8336+(k*12|0)>>2]<<j;h=c[8340+(k*12|0)>>2]<<j;j=c[8344+(k*12|0)>>2]<<j;if((e|0)==0){c[a>>2]=_(c[a>>2]|0,b)|0}a:do{if((f&65436|0)==0){if((f&98|0)==0){f=(c[a>>2]|0)+32>>6;if((f+512|0)>>>0>1023){k=1;i=g;return k|0}else{c[a+60>>2]=f;c[a+56>>2]=f;c[a+52>>2]=f;c[a+48>>2]=f;c[a+44>>2]=f;c[a+40>>2]=f;c[a+36>>2]=f;c[a+32>>2]=f;c[a+28>>2]=f;c[a+24>>2]=f;c[a+20>>2]=f;c[a+16>>2]=f;c[a+12>>2]=f;c[a+8>>2]=f;c[a+4>>2]=f;c[a>>2]=f;break}}n=a+4|0;k=_(c[n>>2]|0,h)|0;l=a+20|0;m=_(c[l>>2]|0,b)|0;j=a+24|0;e=_(c[j>>2]|0,h)|0;f=c[a>>2]|0;b=(k>>1)-e|0;e=k+(e>>1)|0;h=m+f+32|0;k=h+e>>6;c[a>>2]=k;m=f-m+32|0;f=m+b>>6;c[n>>2]=f;b=m-b>>6;c[a+8>>2]=b;e=h-e>>6;c[a+12>>2]=e;c[a+48>>2]=k;c[a+32>>2]=k;c[a+16>>2]=k;c[a+52>>2]=f;c[a+36>>2]=f;c[l>>2]=f;c[a+56>>2]=b;c[a+40>>2]=b;c[j>>2]=b;c[a+60>>2]=e;c[a+44>>2]=e;c[a+28>>2]=e;if((k+512|0)>>>0>1023){n=1;i=g;return n|0}if((f+512|0)>>>0>1023){n=1;i=g;return n|0}if((b+512|0)>>>0>1023){n=1;i=g;return n|0}if((e+512|0)>>>0>1023){a=1}else{break}i=g;return a|0}else{z=a+4|0;s=a+56|0;w=a+60|0;q=c[w>>2]|0;u=_(c[z>>2]|0,h)|0;c[s>>2]=_(c[s>>2]|0,h)|0;c[w>>2]=_(q,j)|0;w=a+8|0;q=c[w>>2]|0;s=a+16|0;y=_(c[a+20>>2]|0,b)|0;o=_(c[s>>2]|0,j)|0;p=a+12|0;k=c[p>>2]|0;l=_(c[a+32>>2]|0,h)|0;A=_(c[a+24>>2]|0,h)|0;r=c[a+28>>2]|0;t=_(c[a+48>>2]|0,j)|0;f=_(c[a+36>>2]|0,h)|0;m=c[a+44>>2]|0;n=_(c[a+40>>2]|0,j)|0;e=_(c[a+52>>2]|0,h)|0;x=c[a>>2]|0;v=y+x|0;y=x-y|0;x=(u>>1)-A|0;u=(A>>1)+u|0;j=u+v|0;c[a>>2]=j;c[z>>2]=x+y;c[w>>2]=y-x;c[p>>2]=v-u;p=_(h,r+q|0)|0;r=_(q-r|0,h)|0;q=(o>>1)-t|0;o=(t>>1)+o|0;h=o+p|0;c[s>>2]=h;c[a+20>>2]=q+r;c[a+24>>2]=r-q;c[a+28>>2]=p-o;o=_(b,m+k|0)|0;b=_(k-m|0,b)|0;m=(l>>1)-e|0;l=(e>>1)+l|0;e=l+o|0;c[a+32>>2]=e;c[a+36>>2]=m+b;c[a+40>>2]=b-m;c[a+44>>2]=o-l;l=a+56|0;o=c[l>>2]|0;m=o+f|0;o=f-o|0;f=a+60|0;b=c[f>>2]|0;k=(n>>1)-b|0;n=(b>>1)+n|0;b=n+m|0;c[a+48>>2]=b;c[a+52>>2]=k+o;c[l>>2]=o-k;c[f>>2]=m-n;f=3;while(1){y=(h>>1)-b|0;h=(b>>1)+h|0;z=e+j+32|0;A=z+h>>6;c[a>>2]=A;b=j-e+32|0;e=b+y>>6;c[a+16>>2]=e;b=b-y>>6;c[a+32>>2]=b;h=z-h>>6;c[a+48>>2]=h;if((A+512|0)>>>0>1023){a=1;f=19;break}if((e+512|0)>>>0>1023){a=1;f=19;break}if((b+512|0)>>>0>1023){a=1;f=19;break}if((h+512|0)>>>0>1023){a=1;f=19;break}j=a+4|0;if((f|0)==0){break a}e=c[a+36>>2]|0;h=c[a+20>>2]|0;b=c[a+52>>2]|0;a=j;j=c[j>>2]|0;f=f+ -1|0}if((f|0)==19){i=g;return a|0}}}while(0);A=0;i=g;return A|0}function Kc(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;q=i;B=a[8280+d|0]|0;A=a[8224+d|0]|0;D=b+8|0;k=c[D>>2]|0;x=c[b+20>>2]|0;v=b+16|0;f=c[v>>2]|0;u=b+32|0;h=c[u>>2]|0;E=b+12|0;m=c[E>>2]|0;z=c[b+24>>2]|0;r=c[b+28>>2]|0;t=b+48|0;w=c[t>>2]|0;C=c[b+36>>2]|0;g=c[b+40>>2]|0;F=c[b+44>>2]|0;y=c[b+52>>2]|0;o=c[b>>2]|0;p=x+o|0;x=o-x|0;o=b+4|0;j=c[o>>2]|0;n=j-z|0;j=z+j|0;z=j+p|0;c[b>>2]=z;s=n+x|0;c[o>>2]=s;n=x-n|0;c[D>>2]=n;j=p-j|0;c[E>>2]=j;E=r+k|0;r=k-r|0;k=f-w|0;f=w+f|0;w=f+E|0;c[v>>2]=w;p=k+r|0;c[b+20>>2]=p;k=r-k|0;c[b+24>>2]=k;f=E-f|0;c[b+28>>2]=f;E=F+m|0;F=m-F|0;m=h-y|0;h=y+h|0;y=h+E|0;c[b+32>>2]=y;r=m+F|0;c[b+36>>2]=r;m=F-m|0;c[b+40>>2]=m;h=E-h|0;c[b+44>>2]=h;E=b+56|0;F=c[E>>2]|0;D=F+C|0;F=C-F|0;C=b+60|0;x=c[C>>2]|0;l=g-x|0;g=x+g|0;x=g+D|0;c[b+48>>2]=x;e=l+F|0;c[b+52>>2]=e;l=F-l|0;c[E>>2]=l;g=D-g|0;c[C>>2]=g;A=A&255;B=c[8336+((B&255)*12|0)>>2]|0;if(d>>>0>11){F=B<<A+ -2;D=y+z|0;d=z-y|0;C=w-x|0;E=x+w|0;c[b>>2]=_(E+D|0,F)|0;c[v>>2]=_(C+d|0,F)|0;c[u>>2]=_(d-C|0,F)|0;c[t>>2]=_(D-E|0,F)|0;E=r+s|0;D=s-r|0;C=p-e|0;d=e+p|0;c[o>>2]=_(d+E|0,F)|0;c[b+20>>2]=_(C+D|0,F)|0;c[b+36>>2]=_(D-C|0,F)|0;c[b+52>>2]=_(E-d|0,F)|0;d=m+n|0;E=n-m|0;C=k-l|0;D=l+k|0;c[b+8>>2]=_(D+d|0,F)|0;c[b+24>>2]=_(C+E|0,F)|0;c[b+40>>2]=_(E-C|0,F)|0;c[b+56>>2]=_(d-D|0,F)|0;D=h+j|0;d=j-h|0;C=f-g|0;E=g+f|0;c[b+12>>2]=_(E+D|0,F)|0;c[b+28>>2]=_(C+d|0,F)|0;c[b+44>>2]=_(d-C|0,F)|0;c[b+60>>2]=_(D-E|0,F)|0;i=q;return}else{E=(d+ -6|0)>>>0<6?1:2;F=2-A|0;C=y+z|0;A=z-y|0;d=w-x|0;D=x+w|0;c[b>>2]=(_(D+C|0,B)|0)+E>>F;c[v>>2]=(_(d+A|0,B)|0)+E>>F;c[u>>2]=(_(A-d|0,B)|0)+E>>F;c[t>>2]=(_(C-D|0,B)|0)+E>>F;D=r+s|0;C=s-r|0;d=p-e|0;A=e+p|0;c[o>>2]=(_(A+D|0,B)|0)+E>>F;c[b+20>>2]=(_(d+C|0,B)|0)+E>>F;c[b+36>>2]=(_(C-d|0,B)|0)+E>>F;c[b+52>>2]=(_(D-A|0,B)|0)+E>>F;A=m+n|0;D=n-m|0;d=k-l|0;C=l+k|0;c[b+8>>2]=(_(C+A|0,B)|0)+E>>F;c[b+24>>2]=(_(d+D|0,B)|0)+E>>F;c[b+40>>2]=(_(D-d|0,B)|0)+E>>F;c[b+56>>2]=(_(A-C|0,B)|0)+E>>F;C=h+j|0;A=j-h|0;d=f-g|0;D=g+f|0;c[b+12>>2]=(_(D+C|0,B)|0)+E>>F;c[b+28>>2]=(_(d+A|0,B)|0)+E>>F;c[b+44>>2]=(_(A-d|0,B)|0)+E>>F;c[b+60>>2]=(_(C-D|0,B)|0)+E>>F;i=q;return}}function Lc(a,b){a=a|0;b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=c[8336+((d[8280+b|0]|0)*12|0)>>2]|0;if(b>>>0>5){e=e<<(d[8224+b|0]|0)+ -1;b=0}else{b=1}l=c[a>>2]|0;g=a+8|0;h=c[g>>2]|0;n=h+l|0;h=l-h|0;l=a+4|0;k=c[l>>2]|0;m=a+12|0;f=c[m>>2]|0;j=k-f|0;k=f+k|0;c[a>>2]=(_(k+n|0,e)|0)>>b;c[l>>2]=(_(n-k|0,e)|0)>>b;c[g>>2]=(_(j+h|0,e)|0)>>b;c[m>>2]=(_(h-j|0,e)|0)>>b;m=a+16|0;j=c[m>>2]|0;h=a+24|0;g=c[h>>2]|0;l=g+j|0;g=j-g|0;j=a+20|0;k=c[j>>2]|0;a=a+28|0;n=c[a>>2]|0;f=k-n|0;k=n+k|0;c[m>>2]=(_(k+l|0,e)|0)>>b;c[j>>2]=(_(l-k|0,e)|0)>>b;c[h>>2]=(_(f+g|0,e)|0)>>b;c[a>>2]=(_(g-f|0,e)|0)>>b;i=i;return}function Mc(a,b){a=a|0;b=b|0;var c=0,d=0;c=i;b=1<<b+ -1;d=0;do{if((b&a|0)!=0){break}d=d+1|0;b=b>>>1;}while((b|0)!=0);i=c;return d|0}function Nc(a){a=a|0;var b=0,d=0;b=i;d=8-(c[a+8>>2]|0)|0;a=Fc(a,d)|0;if((a|0)==-1){a=1;i=b;return a|0}a=(a|0)!=(c[8616+(d+ -1<<2)>>2]|0)|0;i=b;return a|0}function Oc(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;f=c[a+12>>2]<<3;e=c[a+16>>2]|0;d=f-e|0;if((f|0)==(e|0)){f=0;i=b;return f|0}if(d>>>0>8){f=1;i=b;return f|0}else{f=((Gc(a)|0)>>>(32-d|0)|0)!=(1<<d+ -1|0)|0;i=b;return f|0}return 0}function Pc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;e=i;f=c[a+(d<<2)>>2]|0;do{d=d+1|0;if(!(d>>>0<b>>>0)){break}}while((c[a+(d<<2)>>2]|0)!=(f|0));i=e;return((d|0)==(b|0)?0:d)|0}function Qc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;e=c[a+4>>2]|0;f=(b>>>0)%(e>>>0)|0;d=b-f|0;b=_(c[a+8>>2]|0,e)|0;e=c[a>>2]|0;c[a+12>>2]=e+((d<<8)+(f<<4));d=(f<<3)+(b<<8)+(d<<6)|0;c[a+16>>2]=e+d;c[a+20>>2]=e+(d+(b<<6));i=i;return}function Rc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;e=Gc(a)|0;do{if((e|0)<0){Hc(a,1)|0;c[b>>2]=0;b=0}else{if(e>>>0>1073741823){if((Hc(a,3)|0)==-1){b=1;break}c[b>>2]=(e>>>29&1)+1;b=0;break}if(e>>>0>536870911){if((Hc(a,5)|0)==-1){b=1;break}c[b>>2]=(e>>>27&3)+3;b=0;break}if(e>>>0>268435455){if((Hc(a,7)|0)==-1){b=1;break}c[b>>2]=(e>>>25&7)+7;b=0;break}f=Mc(e,28)|0;e=f+4|0;if((e|0)!=32){Hc(a,f+5|0)|0;a=Fc(a,e)|0;if((a|0)==-1){b=1;break}c[b>>2]=(1<<e)+ -1+a;b=0;break}c[b>>2]=0;Hc(a,32)|0;if((Fc(a,1)|0)!=1){b=1;break}e=Gc(a)|0;if((Hc(a,32)|0)==-1){b=1;break}if((e|0)==1){c[b>>2]=-1;b=1;break}else if((e|0)==0){c[b>>2]=-1;b=0;break}else{b=1;break}}}while(0);i=d;return b|0}function Sc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;i=i+8|0;f=d;c[f>>2]=0;e=Rc(a,f)|0;a=c[f>>2]|0;e=(e|0)==0;do{if((a|0)==-1){if(e){b=1;break}c[b>>2]=-2147483648;b=0}else{if(!e){b=1;break}e=(a+1|0)>>>1;c[b>>2]=(a&1|0)!=0?e:0-e|0;b=0}}while(0);i=d;return b|0}function Tc(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0;f=i;i=i+8|0;g=f;if((Rc(a,g)|0)!=0){a=1;i=f;return a|0}g=c[g>>2]|0;if(g>>>0>47){a=1;i=f;return a|0}c[b>>2]=d[((e|0)==0?8696:8648)+g|0]|0;a=0;i=f;return a|0}function Uc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=i;do{if((d|0)==0){a=Fc(a,1)|0;c[b>>2]=a;if((a|0)==-1){b=1;break}c[b>>2]=a^1;b=0}else{b=Rc(a,b)|0}}while(0);i=e;return b|0}function Vc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;_c(b|0,0,952)|0;f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}h=(f|0)==1;c[b>>2]=h&1;do{if(h){f=Fc(a,8)|0;if((f|0)==-1){h=1;i=d;return h|0}c[b+4>>2]=f;if((f|0)!=255){break}f=Fc(a,16)|0;if((f|0)==-1){h=1;i=d;return h|0}c[b+8>>2]=f;f=Fc(a,16)|0;if((f|0)==-1){h=1;i=d;return h|0}else{c[b+12>>2]=f;break}}}while(0);f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}h=(f|0)==1;c[b+16>>2]=h&1;do{if(h){f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}else{c[b+20>>2]=(f|0)==1;break}}}while(0);f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}h=(f|0)==1;c[b+24>>2]=h&1;do{if(h){f=Fc(a,3)|0;if((f|0)==-1){h=1;i=d;return h|0}c[b+28>>2]=f;f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}c[b+32>>2]=(f|0)==1;f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}h=(f|0)==1;c[b+36>>2]=h&1;if(!h){c[b+40>>2]=2;c[b+44>>2]=2;c[b+48>>2]=2;break}f=Fc(a,8)|0;if((f|0)==-1){h=1;i=d;return h|0}c[b+40>>2]=f;f=Fc(a,8)|0;if((f|0)==-1){h=1;i=d;return h|0}c[b+44>>2]=f;f=Fc(a,8)|0;if((f|0)==-1){h=1;i=d;return h|0}else{c[b+48>>2]=f;break}}else{c[b+28>>2]=5;c[b+40>>2]=2;c[b+44>>2]=2;c[b+48>>2]=2}}while(0);f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}h=(f|0)==1;c[b+52>>2]=h&1;do{if(h){g=b+56|0;f=Rc(a,g)|0;if((f|0)!=0){h=f;i=d;return h|0}if((c[g>>2]|0)>>>0>5){h=1;i=d;return h|0}g=b+60|0;f=Rc(a,g)|0;if((f|0)!=0){h=f;i=d;return h|0}if((c[g>>2]|0)>>>0>5){h=1}else{break}i=d;return h|0}}while(0);f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}h=(f|0)==1;c[b+64>>2]=h&1;do{if(h){f=Gc(a)|0;if((Hc(a,32)|0)==-1|(f|0)==0){h=1;i=d;return h|0}c[b+68>>2]=f;f=Gc(a)|0;if((Hc(a,32)|0)==-1|(f|0)==0){h=1;i=d;return h|0}c[b+72>>2]=f;f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}else{c[b+76>>2]=(f|0)==1;break}}}while(0);f=Fc(a,1)|0;if((f|0)==-1){h=1;i=d;return h|0}h=(f|0)==1;f=b+80|0;c[f>>2]=h&1;do{if(h){h=Wc(a,b+84|0)|0;if((h|0)==0){break}i=d;return h|0}else{c[b+84>>2]=1;c[b+96>>2]=288000001;c[b+224>>2]=288000001;c[b+480>>2]=24;c[b+484>>2]=24;c[b+488>>2]=24;c[b+492>>2]=24}}while(0);g=Fc(a,1)|0;if((g|0)==-1){h=1;i=d;return h|0}h=(g|0)==1;g=b+496|0;c[g>>2]=h&1;do{if(h){h=Wc(a,b+500|0)|0;if((h|0)==0){break}i=d;return h|0}else{c[b+500>>2]=1;c[b+512>>2]=240000001;c[b+640>>2]=240000001;c[b+896>>2]=24;c[b+900>>2]=24;c[b+904>>2]=24;c[b+908>>2]=24}}while(0);if((c[f>>2]|0)==0){if((c[g>>2]|0)!=0){e=46}}else{e=46}do{if((e|0)==46){e=Fc(a,1)|0;if((e|0)==-1){h=1;i=d;return h|0}else{c[b+912>>2]=(e|0)==1;break}}}while(0);e=Fc(a,1)|0;if((e|0)==-1){h=1;i=d;return h|0}c[b+916>>2]=(e|0)==1;e=Fc(a,1)|0;if((e|0)==-1){h=1;i=d;return h|0}h=(e|0)==1;c[b+920>>2]=h&1;do{if(h){e=Fc(a,1)|0;if((e|0)==-1){h=1;i=d;return h|0}c[b+924>>2]=(e|0)==1;f=b+928|0;e=Rc(a,f)|0;if((e|0)!=0){h=e;i=d;return h|0}if((c[f>>2]|0)>>>0>16){h=1;i=d;return h|0}f=b+932|0;e=Rc(a,f)|0;if((e|0)!=0){h=e;i=d;return h|0}if((c[f>>2]|0)>>>0>16){h=1;i=d;return h|0}e=b+936|0;f=Rc(a,e)|0;if((f|0)!=0){h=f;i=d;return h|0}if((c[e>>2]|0)>>>0>16){h=1;i=d;return h|0}e=b+940|0;f=Rc(a,e)|0;if((f|0)!=0){h=f;i=d;return h|0}if((c[e>>2]|0)>>>0>16){h=1;i=d;return h|0}e=Rc(a,b+944|0)|0;if((e|0)!=0){h=e;i=d;return h|0}h=Rc(a,b+948|0)|0;if((h|0)==0){break}i=d;return h|0}else{c[b+924>>2]=1;c[b+928>>2]=2;c[b+932>>2]=1;c[b+936>>2]=16;c[b+940>>2]=16;c[b+944>>2]=16;c[b+948>>2]=16}}while(0);h=0;i=d;return h|0}function Wc(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;d=i;e=b;k=Rc(a,e)|0;a:do{if((k|0)==0){k=(c[e>>2]|0)+1|0;c[e>>2]=k;if(k>>>0>32){k=1;break}g=Fc(a,4)|0;if((g|0)==-1){k=1;break}f=b+4|0;c[f>>2]=g;h=Fc(a,4)|0;if((h|0)==-1){k=1;break}g=b+8|0;c[g>>2]=h;if((c[e>>2]|0)!=0){h=0;do{j=b+(h<<2)+12|0;k=Rc(a,j)|0;if((k|0)!=0){break a}k=c[j>>2]|0;if((k|0)==-1){k=1;break a}k=k+1|0;c[j>>2]=k;c[j>>2]=k<<(c[f>>2]|0)+6;j=b+(h<<2)+140|0;k=Rc(a,j)|0;if((k|0)!=0){break a}k=c[j>>2]|0;if((k|0)==-1){k=1;break a}k=k+1|0;c[j>>2]=k;c[j>>2]=k<<(c[g>>2]|0)+4;j=Fc(a,1)|0;if((j|0)==-1){k=1;break a}c[b+(h<<2)+268>>2]=(j|0)==1;h=h+1|0;}while(h>>>0<(c[e>>2]|0)>>>0)}e=Fc(a,5)|0;if((e|0)==-1){k=1;break}c[b+396>>2]=e+1;e=Fc(a,5)|0;if((e|0)==-1){k=1;break}c[b+400>>2]=e+1;e=Fc(a,5)|0;if((e|0)==-1){k=1;break}c[b+404>>2]=e+1;a=Fc(a,5)|0;if((a|0)==-1){k=1;break}c[b+408>>2]=a;k=0}}while(0);i=d;return k|0}function Xc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;b=i;do{if(a>>>0<245){if(a>>>0<11){a=16}else{a=a+11&-8}p=a>>>3;n=c[2186]|0;o=n>>>p;if((o&3|0)!=0){d=(o&1^1)+p|0;j=d<<1;g=8784+(j<<2)|0;j=8784+(j+2<<2)|0;e=c[j>>2]|0;f=e+8|0;h=c[f>>2]|0;do{if((g|0)==(h|0)){c[2186]=n&~(1<<d)}else{if(h>>>0<(c[8760>>2]|0)>>>0){ka()}k=h+12|0;if((c[k>>2]|0)==(e|0)){c[k>>2]=g;c[j>>2]=h;break}else{ka()}}}while(0);z=d<<3;c[e+4>>2]=z|3;z=e+(z|4)|0;c[z>>2]=c[z>>2]|1;z=f;i=b;return z|0}if(!(a>>>0>(c[8752>>2]|0)>>>0)){break}if((o|0)!=0){e=2<<p;e=o<<p&(e|0-e);e=(e&0-e)+ -1|0;d=e>>>12&16;e=e>>>d;g=e>>>5&8;e=e>>>g;f=e>>>2&4;e=e>>>f;h=e>>>1&2;e=e>>>h;j=e>>>1&1;j=(g|d|f|h|j)+(e>>>j)|0;e=j<<1;h=8784+(e<<2)|0;e=8784+(e+2<<2)|0;f=c[e>>2]|0;d=f+8|0;g=c[d>>2]|0;do{if((h|0)==(g|0)){c[2186]=n&~(1<<j)}else{if(g>>>0<(c[8760>>2]|0)>>>0){ka()}k=g+12|0;if((c[k>>2]|0)==(f|0)){c[k>>2]=h;c[e>>2]=g;break}else{ka()}}}while(0);h=j<<3;e=h-a|0;c[f+4>>2]=a|3;z=f;f=z+a|0;c[z+(a|4)>>2]=e|1;c[z+h>>2]=e;h=c[8752>>2]|0;if((h|0)!=0){g=c[8764>>2]|0;k=h>>>3;j=k<<1;h=8784+(j<<2)|0;l=c[2186]|0;k=1<<k;do{if((l&k|0)==0){c[2186]=l|k;u=8784+(j+2<<2)|0;v=h}else{k=8784+(j+2<<2)|0;j=c[k>>2]|0;if(!(j>>>0<(c[8760>>2]|0)>>>0)){u=k;v=j;break}ka()}}while(0);c[u>>2]=g;c[v+12>>2]=g;c[g+8>>2]=v;c[g+12>>2]=h}c[8752>>2]=e;c[8764>>2]=f;z=d;i=b;return z|0}n=c[8748>>2]|0;if((n|0)==0){break}d=(n&0-n)+ -1|0;y=d>>>12&16;d=d>>>y;x=d>>>5&8;d=d>>>x;z=d>>>2&4;d=d>>>z;f=d>>>1&2;d=d>>>f;e=d>>>1&1;e=c[9048+((x|y|z|f|e)+(d>>>e)<<2)>>2]|0;d=(c[e+4>>2]&-8)-a|0;f=e;while(1){g=c[f+16>>2]|0;if((g|0)==0){g=c[f+20>>2]|0;if((g|0)==0){break}}f=(c[g+4>>2]&-8)-a|0;h=f>>>0<d>>>0;d=h?f:d;f=g;e=h?g:e}g=e;j=c[8760>>2]|0;if(g>>>0<j>>>0){ka()}z=g+a|0;f=z;if(!(g>>>0<z>>>0)){ka()}h=c[e+24>>2]|0;k=c[e+12>>2]|0;do{if((k|0)==(e|0)){l=e+20|0;k=c[l>>2]|0;if((k|0)==0){l=e+16|0;k=c[l>>2]|0;if((k|0)==0){t=0;break}}while(1){n=k+20|0;m=c[n>>2]|0;if((m|0)!=0){l=n;k=m;continue}n=k+16|0;m=c[n>>2]|0;if((m|0)==0){break}else{k=m;l=n}}if(l>>>0<j>>>0){ka()}else{c[l>>2]=0;t=k;break}}else{l=c[e+8>>2]|0;if(l>>>0<j>>>0){ka()}m=l+12|0;if((c[m>>2]|0)!=(e|0)){ka()}j=k+8|0;if((c[j>>2]|0)==(e|0)){c[m>>2]=k;c[j>>2]=l;t=k;break}else{ka()}}}while(0);a:do{if((h|0)!=0){j=c[e+28>>2]|0;k=9048+(j<<2)|0;do{if((e|0)==(c[k>>2]|0)){c[k>>2]=t;if((t|0)!=0){break}c[8748>>2]=c[8748>>2]&~(1<<j);break a}else{if(h>>>0<(c[8760>>2]|0)>>>0){ka()}j=h+16|0;if((c[j>>2]|0)==(e|0)){c[j>>2]=t}else{c[h+20>>2]=t}if((t|0)==0){break a}}}while(0);if(t>>>0<(c[8760>>2]|0)>>>0){ka()}c[t+24>>2]=h;h=c[e+16>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[t+16>>2]=h;c[h+24>>2]=t;break}}}while(0);h=c[e+20>>2]|0;if((h|0)==0){break}if(h>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[t+20>>2]=h;c[h+24>>2]=t;break}}}while(0);if(d>>>0<16){z=d+a|0;c[e+4>>2]=z|3;z=g+(z+4)|0;c[z>>2]=c[z>>2]|1}else{c[e+4>>2]=a|3;c[g+(a|4)>>2]=d|1;c[g+(d+a)>>2]=d;h=c[8752>>2]|0;if((h|0)!=0){g=c[8764>>2]|0;k=h>>>3;j=k<<1;h=8784+(j<<2)|0;l=c[2186]|0;k=1<<k;do{if((l&k|0)==0){c[2186]=l|k;r=8784+(j+2<<2)|0;s=h}else{k=8784+(j+2<<2)|0;j=c[k>>2]|0;if(!(j>>>0<(c[8760>>2]|0)>>>0)){r=k;s=j;break}ka()}}while(0);c[r>>2]=g;c[s+12>>2]=g;c[g+8>>2]=s;c[g+12>>2]=h}c[8752>>2]=d;c[8764>>2]=f}z=e+8|0;i=b;return z|0}else{if(a>>>0>4294967231){a=-1;break}r=a+11|0;a=r&-8;t=c[8748>>2]|0;if((t|0)==0){break}s=0-a|0;r=r>>>8;do{if((r|0)==0){u=0}else{if(a>>>0>16777215){u=31;break}y=(r+1048320|0)>>>16&8;z=r<<y;x=(z+520192|0)>>>16&4;z=z<<x;u=(z+245760|0)>>>16&2;u=14-(x|y|u)+(z<<u>>>15)|0;u=a>>>(u+7|0)&1|u<<1}}while(0);x=c[9048+(u<<2)>>2]|0;b:do{if((x|0)==0){v=0;r=0}else{if((u|0)==31){r=0}else{r=25-(u>>>1)|0}v=0;w=a<<r;r=0;while(1){z=c[x+4>>2]&-8;y=z-a|0;if(y>>>0<s>>>0){if((z|0)==(a|0)){s=y;v=x;r=x;break b}else{s=y;r=x}}y=c[x+20>>2]|0;x=c[x+(w>>>31<<2)+16>>2]|0;v=(y|0)==0|(y|0)==(x|0)?v:y;if((x|0)==0){break}else{w=w<<1}}}}while(0);if((v|0)==0&(r|0)==0){z=2<<u;t=t&(z|0-z);if((t|0)==0){break}z=(t&0-t)+ -1|0;w=z>>>12&16;z=z>>>w;u=z>>>5&8;z=z>>>u;x=z>>>2&4;z=z>>>x;y=z>>>1&2;z=z>>>y;v=z>>>1&1;v=c[9048+((u|w|x|y|v)+(z>>>v)<<2)>>2]|0}if((v|0)!=0){while(1){u=(c[v+4>>2]&-8)-a|0;t=u>>>0<s>>>0;s=t?u:s;r=t?v:r;t=c[v+16>>2]|0;if((t|0)!=0){v=t;continue}v=c[v+20>>2]|0;if((v|0)==0){break}}}if((r|0)==0){break}if(!(s>>>0<((c[8752>>2]|0)-a|0)>>>0)){break}d=r;h=c[8760>>2]|0;if(d>>>0<h>>>0){ka()}f=d+a|0;e=f;if(!(d>>>0<f>>>0)){ka()}g=c[r+24>>2]|0;j=c[r+12>>2]|0;do{if((j|0)==(r|0)){k=r+20|0;j=c[k>>2]|0;if((j|0)==0){k=r+16|0;j=c[k>>2]|0;if((j|0)==0){q=0;break}}while(1){l=j+20|0;m=c[l>>2]|0;if((m|0)!=0){k=l;j=m;continue}l=j+16|0;m=c[l>>2]|0;if((m|0)==0){break}else{j=m;k=l}}if(k>>>0<h>>>0){ka()}else{c[k>>2]=0;q=j;break}}else{k=c[r+8>>2]|0;if(k>>>0<h>>>0){ka()}h=k+12|0;if((c[h>>2]|0)!=(r|0)){ka()}l=j+8|0;if((c[l>>2]|0)==(r|0)){c[h>>2]=j;c[l>>2]=k;q=j;break}else{ka()}}}while(0);c:do{if((g|0)!=0){j=c[r+28>>2]|0;h=9048+(j<<2)|0;do{if((r|0)==(c[h>>2]|0)){c[h>>2]=q;if((q|0)!=0){break}c[8748>>2]=c[8748>>2]&~(1<<j);break c}else{if(g>>>0<(c[8760>>2]|0)>>>0){ka()}h=g+16|0;if((c[h>>2]|0)==(r|0)){c[h>>2]=q}else{c[g+20>>2]=q}if((q|0)==0){break c}}}while(0);if(q>>>0<(c[8760>>2]|0)>>>0){ka()}c[q+24>>2]=g;g=c[r+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[q+16>>2]=g;c[g+24>>2]=q;break}}}while(0);g=c[r+20>>2]|0;if((g|0)==0){break}if(g>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[q+20>>2]=g;c[g+24>>2]=q;break}}}while(0);d:do{if(s>>>0<16){z=s+a|0;c[r+4>>2]=z|3;z=d+(z+4)|0;c[z>>2]=c[z>>2]|1}else{c[r+4>>2]=a|3;c[d+(a|4)>>2]=s|1;c[d+(s+a)>>2]=s;g=s>>>3;if(s>>>0<256){j=g<<1;f=8784+(j<<2)|0;h=c[2186]|0;g=1<<g;do{if((h&g|0)==0){c[2186]=h|g;p=8784+(j+2<<2)|0;o=f}else{h=8784+(j+2<<2)|0;g=c[h>>2]|0;if(!(g>>>0<(c[8760>>2]|0)>>>0)){p=h;o=g;break}ka()}}while(0);c[p>>2]=e;c[o+12>>2]=e;c[d+(a+8)>>2]=o;c[d+(a+12)>>2]=f;break}e=s>>>8;do{if((e|0)==0){e=0}else{if(s>>>0>16777215){e=31;break}y=(e+1048320|0)>>>16&8;z=e<<y;x=(z+520192|0)>>>16&4;z=z<<x;e=(z+245760|0)>>>16&2;e=14-(x|y|e)+(z<<e>>>15)|0;e=s>>>(e+7|0)&1|e<<1}}while(0);g=9048+(e<<2)|0;c[d+(a+28)>>2]=e;c[d+(a+20)>>2]=0;c[d+(a+16)>>2]=0;j=c[8748>>2]|0;h=1<<e;if((j&h|0)==0){c[8748>>2]=j|h;c[g>>2]=f;c[d+(a+24)>>2]=g;c[d+(a+12)>>2]=f;c[d+(a+8)>>2]=f;break}g=c[g>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}e:do{if((c[g+4>>2]&-8|0)==(s|0)){n=g}else{e=s<<e;h=g;while(1){g=h+(e>>>31<<2)+16|0;j=c[g>>2]|0;if((j|0)==0){break}if((c[j+4>>2]&-8|0)==(s|0)){n=j;break e}else{e=e<<1;h=j}}if(g>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[g>>2]=f;c[d+(a+24)>>2]=h;c[d+(a+12)>>2]=f;c[d+(a+8)>>2]=f;break d}}}while(0);e=n+8|0;h=c[e>>2]|0;g=c[8760>>2]|0;if(n>>>0<g>>>0){ka()}if(h>>>0<g>>>0){ka()}else{c[h+12>>2]=f;c[e>>2]=f;c[d+(a+8)>>2]=h;c[d+(a+12)>>2]=n;c[d+(a+24)>>2]=0;break}}}while(0);z=r+8|0;i=b;return z|0}}while(0);n=c[8752>>2]|0;if(!(a>>>0>n>>>0)){d=n-a|0;e=c[8764>>2]|0;if(d>>>0>15){z=e;c[8764>>2]=z+a;c[8752>>2]=d;c[z+(a+4)>>2]=d|1;c[z+n>>2]=d;c[e+4>>2]=a|3}else{c[8752>>2]=0;c[8764>>2]=0;c[e+4>>2]=n|3;z=e+(n+4)|0;c[z>>2]=c[z>>2]|1}z=e+8|0;i=b;return z|0}n=c[8756>>2]|0;if(a>>>0<n>>>0){x=n-a|0;c[8756>>2]=x;z=c[8768>>2]|0;y=z;c[8768>>2]=y+a;c[y+(a+4)>>2]=x|1;c[z+4>>2]=a|3;z=z+8|0;i=b;return z|0}do{if((c[2304]|0)==0){n=va(30)|0;if((n+ -1&n|0)==0){c[9224>>2]=n;c[9220>>2]=n;c[9228>>2]=-1;c[9232>>2]=-1;c[9236>>2]=0;c[9188>>2]=0;c[2304]=(ha(0)|0)&-16^1431655768;break}else{ka()}}}while(0);r=a+48|0;o=c[9224>>2]|0;q=a+47|0;n=o+q|0;o=0-o|0;p=n&o;if(!(p>>>0>a>>>0)){z=0;i=b;return z|0}s=c[9184>>2]|0;do{if((s|0)!=0){y=c[9176>>2]|0;z=y+p|0;if(z>>>0<=y>>>0|z>>>0>s>>>0){d=0}else{break}i=b;return d|0}}while(0);f:do{if((c[9188>>2]&4|0)==0){u=c[8768>>2]|0;g:do{if((u|0)==0){m=182}else{w=9192|0;while(1){t=w;v=c[t>>2]|0;if(!(v>>>0>u>>>0)){s=w+4|0;if((v+(c[s>>2]|0)|0)>>>0>u>>>0){break}}w=c[w+8>>2]|0;if((w|0)==0){m=182;break g}}if((w|0)==0){m=182;break}o=n-(c[8756>>2]|0)&o;if(!(o>>>0<2147483647)){o=0;break}m=na(o|0)|0;u=(m|0)==((c[t>>2]|0)+(c[s>>2]|0)|0);s=m;t=o;n=u?m:-1;o=u?o:0;m=191}}while(0);do{if((m|0)==182){n=na(0)|0;if((n|0)==(-1|0)){o=0;break}s=n;t=c[9220>>2]|0;o=t+ -1|0;if((o&s|0)==0){o=p}else{o=p-s+(o+s&0-t)|0}t=c[9176>>2]|0;u=t+o|0;if(!(o>>>0>a>>>0&o>>>0<2147483647)){o=0;break}s=c[9184>>2]|0;if((s|0)!=0){if(u>>>0<=t>>>0|u>>>0>s>>>0){o=0;break}}s=na(o|0)|0;m=(s|0)==(n|0);t=o;n=m?n:-1;o=m?o:0;m=191}}while(0);h:do{if((m|0)==191){m=0-t|0;if((n|0)!=(-1|0)){m=202;break f}do{if((s|0)!=(-1|0)&t>>>0<2147483647&t>>>0<r>>>0){n=c[9224>>2]|0;n=q-t+n&0-n;if(!(n>>>0<2147483647)){break}if((na(n|0)|0)==(-1|0)){na(m|0)|0;break h}else{t=n+t|0;break}}}while(0);if((s|0)!=(-1|0)){n=s;o=t;m=202;break f}}}while(0);c[9188>>2]=c[9188>>2]|4;m=199}else{o=0;m=199}}while(0);do{if((m|0)==199){if(!(p>>>0<2147483647)){break}n=na(p|0)|0;p=na(0)|0;if(!((p|0)!=(-1|0)&(n|0)!=(-1|0)&n>>>0<p>>>0)){break}p=p-n|0;q=p>>>0>(a+40|0)>>>0;if(q){o=q?p:o;m=202}}}while(0);do{if((m|0)==202){p=(c[9176>>2]|0)+o|0;c[9176>>2]=p;if(p>>>0>(c[9180>>2]|0)>>>0){c[9180>>2]=p}p=c[8768>>2]|0;i:do{if((p|0)==0){z=c[8760>>2]|0;if((z|0)==0|n>>>0<z>>>0){c[8760>>2]=n}c[9192>>2]=n;c[9196>>2]=o;c[9204>>2]=0;c[8780>>2]=c[2304];c[8776>>2]=-1;d=0;do{z=d<<1;y=8784+(z<<2)|0;c[8784+(z+3<<2)>>2]=y;c[8784+(z+2<<2)>>2]=y;d=d+1|0;}while((d|0)!=32);d=n+8|0;if((d&7|0)==0){d=0}else{d=0-d&7}z=o+ -40-d|0;c[8768>>2]=n+d;c[8756>>2]=z;c[n+(d+4)>>2]=z|1;c[n+(o+ -36)>>2]=40;c[8772>>2]=c[9232>>2]}else{q=9192|0;do{t=c[q>>2]|0;s=q+4|0;r=c[s>>2]|0;if((n|0)==(t+r|0)){m=214;break}q=c[q+8>>2]|0;}while((q|0)!=0);do{if((m|0)==214){if((c[q+12>>2]&8|0)!=0){break}q=p;if(!(q>>>0>=t>>>0&q>>>0<n>>>0)){break}c[s>>2]=r+o;d=(c[8756>>2]|0)+o|0;e=p+8|0;if((e&7|0)==0){e=0}else{e=0-e&7}z=d-e|0;c[8768>>2]=q+e;c[8756>>2]=z;c[q+(e+4)>>2]=z|1;c[q+(d+4)>>2]=40;c[8772>>2]=c[9232>>2];break i}}while(0);if(n>>>0<(c[8760>>2]|0)>>>0){c[8760>>2]=n}q=n+o|0;s=9192|0;do{r=s;if((c[r>>2]|0)==(q|0)){m=224;break}s=c[s+8>>2]|0;}while((s|0)!=0);do{if((m|0)==224){if((c[s+12>>2]&8|0)!=0){break}c[r>>2]=n;h=s+4|0;c[h>>2]=(c[h>>2]|0)+o;h=n+8|0;if((h&7|0)==0){h=0}else{h=0-h&7}j=n+(o+8)|0;if((j&7|0)==0){q=0}else{q=0-j&7}s=n+(q+o)|0;t=s;j=h+a|0;m=n+j|0;k=m;p=s-(n+h)-a|0;c[n+(h+4)>>2]=a|3;j:do{if((t|0)==(c[8768>>2]|0)){z=(c[8756>>2]|0)+p|0;c[8756>>2]=z;c[8768>>2]=k;c[n+(j+4)>>2]=z|1}else{if((t|0)==(c[8764>>2]|0)){z=(c[8752>>2]|0)+p|0;c[8752>>2]=z;c[8764>>2]=k;c[n+(j+4)>>2]=z|1;c[n+(z+j)>>2]=z;break}r=o+4|0;v=c[n+(r+q)>>2]|0;if((v&3|0)==1){a=v&-8;u=v>>>3;k:do{if(v>>>0<256){g=c[n+((q|8)+o)>>2]|0;r=c[n+(o+12+q)>>2]|0;s=8784+(u<<1<<2)|0;do{if((g|0)!=(s|0)){if(g>>>0<(c[8760>>2]|0)>>>0){ka()}if((c[g+12>>2]|0)==(t|0)){break}ka()}}while(0);if((r|0)==(g|0)){c[2186]=c[2186]&~(1<<u);break}do{if((r|0)==(s|0)){l=r+8|0}else{if(r>>>0<(c[8760>>2]|0)>>>0){ka()}s=r+8|0;if((c[s>>2]|0)==(t|0)){l=s;break}ka()}}while(0);c[g+12>>2]=r;c[l>>2]=g}else{l=c[n+((q|24)+o)>>2]|0;v=c[n+(o+12+q)>>2]|0;do{if((v|0)==(s|0)){v=q|16;u=n+(r+v)|0;t=c[u>>2]|0;if((t|0)==0){u=n+(v+o)|0;t=c[u>>2]|0;if((t|0)==0){g=0;break}}while(1){v=t+20|0;w=c[v>>2]|0;if((w|0)!=0){u=v;t=w;continue}w=t+16|0;v=c[w>>2]|0;if((v|0)==0){break}else{t=v;u=w}}if(u>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[u>>2]=0;g=t;break}}else{w=c[n+((q|8)+o)>>2]|0;if(w>>>0<(c[8760>>2]|0)>>>0){ka()}u=w+12|0;if((c[u>>2]|0)!=(s|0)){ka()}t=v+8|0;if((c[t>>2]|0)==(s|0)){c[u>>2]=v;c[t>>2]=w;g=v;break}else{ka()}}}while(0);if((l|0)==0){break}t=c[n+(o+28+q)>>2]|0;u=9048+(t<<2)|0;do{if((s|0)==(c[u>>2]|0)){c[u>>2]=g;if((g|0)!=0){break}c[8748>>2]=c[8748>>2]&~(1<<t);break k}else{if(l>>>0<(c[8760>>2]|0)>>>0){ka()}t=l+16|0;if((c[t>>2]|0)==(s|0)){c[t>>2]=g}else{c[l+20>>2]=g}if((g|0)==0){break k}}}while(0);if(g>>>0<(c[8760>>2]|0)>>>0){ka()}c[g+24>>2]=l;l=q|16;s=c[n+(l+o)>>2]|0;do{if((s|0)!=0){if(s>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[g+16>>2]=s;c[s+24>>2]=g;break}}}while(0);l=c[n+(r+l)>>2]|0;if((l|0)==0){break}if(l>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[g+20>>2]=l;c[l+24>>2]=g;break}}}while(0);t=n+((a|q)+o)|0;p=a+p|0}g=t+4|0;c[g>>2]=c[g>>2]&-2;c[n+(j+4)>>2]=p|1;c[n+(p+j)>>2]=p;g=p>>>3;if(p>>>0<256){l=g<<1;d=8784+(l<<2)|0;a=c[2186]|0;g=1<<g;do{if((a&g|0)==0){c[2186]=a|g;e=8784+(l+2<<2)|0;f=d}else{l=8784+(l+2<<2)|0;g=c[l>>2]|0;if(!(g>>>0<(c[8760>>2]|0)>>>0)){e=l;f=g;break}ka()}}while(0);c[e>>2]=k;c[f+12>>2]=k;c[n+(j+8)>>2]=f;c[n+(j+12)>>2]=d;break}e=p>>>8;do{if((e|0)==0){e=0}else{if(p>>>0>16777215){e=31;break}y=(e+1048320|0)>>>16&8;z=e<<y;x=(z+520192|0)>>>16&4;z=z<<x;e=(z+245760|0)>>>16&2;e=14-(x|y|e)+(z<<e>>>15)|0;e=p>>>(e+7|0)&1|e<<1}}while(0);f=9048+(e<<2)|0;c[n+(j+28)>>2]=e;c[n+(j+20)>>2]=0;c[n+(j+16)>>2]=0;g=c[8748>>2]|0;k=1<<e;if((g&k|0)==0){c[8748>>2]=g|k;c[f>>2]=m;c[n+(j+24)>>2]=f;c[n+(j+12)>>2]=m;c[n+(j+8)>>2]=m;break}k=c[f>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}l:do{if((c[k+4>>2]&-8|0)==(p|0)){d=k}else{e=p<<e;while(1){g=k+(e>>>31<<2)+16|0;f=c[g>>2]|0;if((f|0)==0){break}if((c[f+4>>2]&-8|0)==(p|0)){d=f;break l}else{e=e<<1;k=f}}if(g>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[g>>2]=m;c[n+(j+24)>>2]=k;c[n+(j+12)>>2]=m;c[n+(j+8)>>2]=m;break j}}}while(0);f=d+8|0;g=c[f>>2]|0;e=c[8760>>2]|0;if(d>>>0<e>>>0){ka()}if(g>>>0<e>>>0){ka()}else{c[g+12>>2]=m;c[f>>2]=m;c[n+(j+8)>>2]=g;c[n+(j+12)>>2]=d;c[n+(j+24)>>2]=0;break}}}while(0);z=n+(h|8)|0;i=b;return z|0}}while(0);d=p;l=9192|0;while(1){f=c[l>>2]|0;if(!(f>>>0>d>>>0)){g=c[l+4>>2]|0;e=f+g|0;if(e>>>0>d>>>0){break}}l=c[l+8>>2]|0}l=f+(g+ -39)|0;if((l&7|0)==0){l=0}else{l=0-l&7}f=f+(g+ -47+l)|0;f=f>>>0<(p+16|0)>>>0?d:f;l=f+8|0;g=l;m=n+8|0;if((m&7|0)==0){m=0}else{m=0-m&7}z=o+ -40-m|0;c[8768>>2]=n+m;c[8756>>2]=z;c[n+(m+4)>>2]=z|1;c[n+(o+ -36)>>2]=40;c[8772>>2]=c[9232>>2];c[f+4>>2]=27;c[l+0>>2]=c[9192>>2];c[l+4>>2]=c[9196>>2];c[l+8>>2]=c[9200>>2];c[l+12>>2]=c[9204>>2];c[9192>>2]=n;c[9196>>2]=o;c[9204>>2]=0;c[9200>>2]=g;g=f+28|0;c[g>>2]=7;if((f+32|0)>>>0<e>>>0){while(1){l=g+4|0;c[l>>2]=7;if((g+8|0)>>>0<e>>>0){g=l}else{break}}}if((f|0)==(d|0)){break}e=f-p|0;f=d+(e+4)|0;c[f>>2]=c[f>>2]&-2;c[p+4>>2]=e|1;c[d+e>>2]=e;f=e>>>3;if(e>>>0<256){g=f<<1;d=8784+(g<<2)|0;e=c[2186]|0;f=1<<f;do{if((e&f|0)==0){c[2186]=e|f;j=8784+(g+2<<2)|0;k=d}else{f=8784+(g+2<<2)|0;e=c[f>>2]|0;if(!(e>>>0<(c[8760>>2]|0)>>>0)){j=f;k=e;break}ka()}}while(0);c[j>>2]=p;c[k+12>>2]=p;c[p+8>>2]=k;c[p+12>>2]=d;break}d=p;f=e>>>8;do{if((f|0)==0){f=0}else{if(e>>>0>16777215){f=31;break}y=(f+1048320|0)>>>16&8;z=f<<y;x=(z+520192|0)>>>16&4;z=z<<x;f=(z+245760|0)>>>16&2;f=14-(x|y|f)+(z<<f>>>15)|0;f=e>>>(f+7|0)&1|f<<1}}while(0);k=9048+(f<<2)|0;c[p+28>>2]=f;c[p+20>>2]=0;c[p+16>>2]=0;g=c[8748>>2]|0;j=1<<f;if((g&j|0)==0){c[8748>>2]=g|j;c[k>>2]=d;c[p+24>>2]=k;c[p+12>>2]=p;c[p+8>>2]=p;break}j=c[k>>2]|0;if((f|0)==31){f=0}else{f=25-(f>>>1)|0}m:do{if((c[j+4>>2]&-8|0)==(e|0)){h=j}else{f=e<<f;while(1){g=j+(f>>>31<<2)+16|0;k=c[g>>2]|0;if((k|0)==0){break}if((c[k+4>>2]&-8|0)==(e|0)){h=k;break m}else{f=f<<1;j=k}}if(g>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[g>>2]=d;c[p+24>>2]=j;c[p+12>>2]=p;c[p+8>>2]=p;break i}}}while(0);g=h+8|0;f=c[g>>2]|0;e=c[8760>>2]|0;if(h>>>0<e>>>0){ka()}if(f>>>0<e>>>0){ka()}else{c[f+12>>2]=d;c[g>>2]=d;c[p+8>>2]=f;c[p+12>>2]=h;c[p+24>>2]=0;break}}}while(0);d=c[8756>>2]|0;if(!(d>>>0>a>>>0)){break}x=d-a|0;c[8756>>2]=x;z=c[8768>>2]|0;y=z;c[8768>>2]=y+a;c[y+(a+4)>>2]=x|1;c[z+4>>2]=a|3;z=z+8|0;i=b;return z|0}}while(0);c[(wa()|0)>>2]=12;z=0;i=b;return z|0}function Yc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;b=i;if((a|0)==0){i=b;return}p=a+ -8|0;r=p;s=c[8760>>2]|0;if(p>>>0<s>>>0){ka()}u=c[a+ -4>>2]|0;o=u&3;if((o|0)==1){ka()}j=u&-8;m=a+(j+ -8)|0;k=m;a:do{if((u&1|0)==0){w=c[p>>2]|0;if((o|0)==0){i=b;return}r=-8-w|0;u=a+r|0;o=u;p=w+j|0;if(u>>>0<s>>>0){ka()}if((o|0)==(c[8764>>2]|0)){d=a+(j+ -4)|0;if((c[d>>2]&3|0)!=3){d=o;n=p;break}c[8752>>2]=p;c[d>>2]=c[d>>2]&-2;c[a+(r+4)>>2]=p|1;c[m>>2]=p;i=b;return}v=w>>>3;if(w>>>0<256){d=c[a+(r+8)>>2]|0;n=c[a+(r+12)>>2]|0;q=8784+(v<<1<<2)|0;do{if((d|0)!=(q|0)){if(d>>>0<s>>>0){ka()}if((c[d+12>>2]|0)==(o|0)){break}ka()}}while(0);if((n|0)==(d|0)){c[2186]=c[2186]&~(1<<v);d=o;n=p;break}do{if((n|0)==(q|0)){t=n+8|0}else{if(n>>>0<s>>>0){ka()}q=n+8|0;if((c[q>>2]|0)==(o|0)){t=q;break}ka()}}while(0);c[d+12>>2]=n;c[t>>2]=d;d=o;n=p;break}t=c[a+(r+24)>>2]|0;w=c[a+(r+12)>>2]|0;do{if((w|0)==(u|0)){w=a+(r+20)|0;v=c[w>>2]|0;if((v|0)==0){w=a+(r+16)|0;v=c[w>>2]|0;if((v|0)==0){q=0;break}}while(1){x=v+20|0;y=c[x>>2]|0;if((y|0)!=0){w=x;v=y;continue}y=v+16|0;x=c[y>>2]|0;if((x|0)==0){break}else{v=x;w=y}}if(w>>>0<s>>>0){ka()}else{c[w>>2]=0;q=v;break}}else{v=c[a+(r+8)>>2]|0;if(v>>>0<s>>>0){ka()}s=v+12|0;if((c[s>>2]|0)!=(u|0)){ka()}x=w+8|0;if((c[x>>2]|0)==(u|0)){c[s>>2]=w;c[x>>2]=v;q=w;break}else{ka()}}}while(0);if((t|0)==0){d=o;n=p;break}v=c[a+(r+28)>>2]|0;s=9048+(v<<2)|0;do{if((u|0)==(c[s>>2]|0)){c[s>>2]=q;if((q|0)!=0){break}c[8748>>2]=c[8748>>2]&~(1<<v);d=o;n=p;break a}else{if(t>>>0<(c[8760>>2]|0)>>>0){ka()}s=t+16|0;if((c[s>>2]|0)==(u|0)){c[s>>2]=q}else{c[t+20>>2]=q}if((q|0)==0){d=o;n=p;break a}}}while(0);if(q>>>0<(c[8760>>2]|0)>>>0){ka()}c[q+24>>2]=t;s=c[a+(r+16)>>2]|0;do{if((s|0)!=0){if(s>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[q+16>>2]=s;c[s+24>>2]=q;break}}}while(0);r=c[a+(r+20)>>2]|0;if((r|0)==0){d=o;n=p;break}if(r>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[q+20>>2]=r;c[r+24>>2]=q;d=o;n=p;break}}else{d=r;n=j}}while(0);o=d;if(!(o>>>0<m>>>0)){ka()}p=a+(j+ -4)|0;q=c[p>>2]|0;if((q&1|0)==0){ka()}do{if((q&2|0)==0){if((k|0)==(c[8768>>2]|0)){y=(c[8756>>2]|0)+n|0;c[8756>>2]=y;c[8768>>2]=d;c[d+4>>2]=y|1;if((d|0)!=(c[8764>>2]|0)){i=b;return}c[8764>>2]=0;c[8752>>2]=0;i=b;return}if((k|0)==(c[8764>>2]|0)){y=(c[8752>>2]|0)+n|0;c[8752>>2]=y;c[8764>>2]=d;c[d+4>>2]=y|1;c[o+y>>2]=y;i=b;return}n=(q&-8)+n|0;p=q>>>3;b:do{if(q>>>0<256){h=c[a+j>>2]|0;a=c[a+(j|4)>>2]|0;j=8784+(p<<1<<2)|0;do{if((h|0)!=(j|0)){if(h>>>0<(c[8760>>2]|0)>>>0){ka()}if((c[h+12>>2]|0)==(k|0)){break}ka()}}while(0);if((a|0)==(h|0)){c[2186]=c[2186]&~(1<<p);break}do{if((a|0)==(j|0)){l=a+8|0}else{if(a>>>0<(c[8760>>2]|0)>>>0){ka()}j=a+8|0;if((c[j>>2]|0)==(k|0)){l=j;break}ka()}}while(0);c[h+12>>2]=a;c[l>>2]=h}else{k=c[a+(j+16)>>2]|0;p=c[a+(j|4)>>2]|0;do{if((p|0)==(m|0)){p=a+(j+12)|0;l=c[p>>2]|0;if((l|0)==0){p=a+(j+8)|0;l=c[p>>2]|0;if((l|0)==0){h=0;break}}while(1){q=l+20|0;r=c[q>>2]|0;if((r|0)!=0){p=q;l=r;continue}r=l+16|0;q=c[r>>2]|0;if((q|0)==0){break}else{l=q;p=r}}if(p>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[p>>2]=0;h=l;break}}else{q=c[a+j>>2]|0;if(q>>>0<(c[8760>>2]|0)>>>0){ka()}r=q+12|0;if((c[r>>2]|0)!=(m|0)){ka()}l=p+8|0;if((c[l>>2]|0)==(m|0)){c[r>>2]=p;c[l>>2]=q;h=p;break}else{ka()}}}while(0);if((k|0)==0){break}l=c[a+(j+20)>>2]|0;p=9048+(l<<2)|0;do{if((m|0)==(c[p>>2]|0)){c[p>>2]=h;if((h|0)!=0){break}c[8748>>2]=c[8748>>2]&~(1<<l);break b}else{if(k>>>0<(c[8760>>2]|0)>>>0){ka()}l=k+16|0;if((c[l>>2]|0)==(m|0)){c[l>>2]=h}else{c[k+20>>2]=h}if((h|0)==0){break b}}}while(0);if(h>>>0<(c[8760>>2]|0)>>>0){ka()}c[h+24>>2]=k;k=c[a+(j+8)>>2]|0;do{if((k|0)!=0){if(k>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[h+16>>2]=k;c[k+24>>2]=h;break}}}while(0);a=c[a+(j+12)>>2]|0;if((a|0)==0){break}if(a>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[h+20>>2]=a;c[a+24>>2]=h;break}}}while(0);c[d+4>>2]=n|1;c[o+n>>2]=n;if((d|0)!=(c[8764>>2]|0)){break}c[8752>>2]=n;i=b;return}else{c[p>>2]=q&-2;c[d+4>>2]=n|1;c[o+n>>2]=n}}while(0);a=n>>>3;if(n>>>0<256){h=a<<1;e=8784+(h<<2)|0;j=c[2186]|0;a=1<<a;do{if((j&a|0)==0){c[2186]=j|a;f=8784+(h+2<<2)|0;g=e}else{a=8784+(h+2<<2)|0;h=c[a>>2]|0;if(!(h>>>0<(c[8760>>2]|0)>>>0)){f=a;g=h;break}ka()}}while(0);c[f>>2]=d;c[g+12>>2]=d;c[d+8>>2]=g;c[d+12>>2]=e;i=b;return}f=d;g=n>>>8;do{if((g|0)==0){g=0}else{if(n>>>0>16777215){g=31;break}x=(g+1048320|0)>>>16&8;y=g<<x;w=(y+520192|0)>>>16&4;y=y<<w;g=(y+245760|0)>>>16&2;g=14-(w|x|g)+(y<<g>>>15)|0;g=n>>>(g+7|0)&1|g<<1}}while(0);a=9048+(g<<2)|0;c[d+28>>2]=g;c[d+20>>2]=0;c[d+16>>2]=0;j=c[8748>>2]|0;h=1<<g;c:do{if((j&h|0)==0){c[8748>>2]=j|h;c[a>>2]=f;c[d+24>>2]=a;c[d+12>>2]=d;c[d+8>>2]=d}else{a=c[a>>2]|0;if((g|0)==31){g=0}else{g=25-(g>>>1)|0}d:do{if((c[a+4>>2]&-8|0)==(n|0)){e=a}else{g=n<<g;j=a;while(1){a=j+(g>>>31<<2)+16|0;h=c[a>>2]|0;if((h|0)==0){break}if((c[h+4>>2]&-8|0)==(n|0)){e=h;break d}else{g=g<<1;j=h}}if(a>>>0<(c[8760>>2]|0)>>>0){ka()}else{c[a>>2]=f;c[d+24>>2]=j;c[d+12>>2]=d;c[d+8>>2]=d;break c}}}while(0);a=e+8|0;g=c[a>>2]|0;h=c[8760>>2]|0;if(e>>>0<h>>>0){ka()}if(g>>>0<h>>>0){ka()}else{c[g+12>>2]=f;c[a>>2]=f;c[d+8>>2]=g;c[d+12>>2]=e;c[d+24>>2]=0;break}}}while(0);y=(c[8776>>2]|0)+ -1|0;c[8776>>2]=y;if((y|0)==0){d=9200|0}else{i=b;return}while(1){d=c[d>>2]|0;if((d|0)==0){break}else{d=d+8|0}}c[8776>>2]=-1;i=b;return}function Zc(){}function _c(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;i=b&3;h=d|d<<8|d<<16|d<<24;g=f&~3;if(i){i=b+4-i|0;while((b|0)<(i|0)){a[b]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function $c(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function ad(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return ua(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}



function ya(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function za(){return i|0}function Aa(a){a=a|0;i=a}function Ba(a,b){a=a|0;b=b|0;if((n|0)==0){n=a;o=b}}function Ca(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function Da(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function Ea(a){a=a|0;C=a}function Fa(a){a=a|0;D=a}function Ga(a){a=a|0;E=a}function Ha(a){a=a|0;F=a}function Ia(a){a=a|0;G=a}function Ja(a){a=a|0;H=a}function Ka(a){a=a|0;I=a}function La(a){a=a|0;J=a}function Ma(a){a=a|0;K=a}function Na(a){a=a|0;L=a}function Oa(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;h=i;a:do{if(e>>>0>3){if((a[b]|0)!=0){j=19;break}if((a[b+1|0]|0)!=0){j=19;break}m=a[b+2|0]|0;if(!((m&255)<2)){j=19;break}b:do{if((e|0)!=3){l=-3;k=3;j=b+3|0;o=2;while(1){if(m<<24>>24==0){o=o+1|0}else if(m<<24>>24==1){if(o>>>0>1){p=k;o=0;m=0;n=0;break}else{o=0}}else{o=0}n=k+1|0;if((n|0)==(e|0)){break b}l=~k;m=a[j]|0;k=n;j=j+1|0}while(1){r=a[j]|0;q=p+1|0;s=r<<24>>24!=0;n=(s&1^1)+n|0;o=r<<24>>24==3&(n|0)==2?1:o;if(r<<24>>24==1&n>>>0>1){j=14;break}if(s){m=n>>>0>2?1:m;n=0}if((q|0)==(e|0)){j=18;break}else{j=j+1|0;p=q}}if((j|0)==14){e=l+p-n|0;c[f+12>>2]=e;n=n-(n>>>0<3?n:3)|0;break a}else if((j|0)==18){e=l+e-n|0;c[f+12>>2]=e;break a}}}while(0);c[g>>2]=e;s=1;i=h;return s|0}else{j=19}}while(0);if((j|0)==19){c[f+12>>2]=e;o=1;k=0;m=0;n=0}b=b+k|0;c[f>>2]=b;c[f+4>>2]=b;c[f+8>>2]=0;c[f+16>>2]=0;f=f+12|0;c[g>>2]=n+k+e;if((m|0)!=0){s=1;i=h;return s|0}if((o|0)==0){s=0;i=h;return s|0}k=c[f>>2]|0;l=b;g=b;m=0;c:while(1){e=k;b=l;while(1){k=e+ -1|0;if((e|0)==0){j=31;break c}e=a[b]|0;if((m|0)!=2){break}if(!(e<<24>>24==3)){j=29;break}if((k|0)==0){g=1;j=32;break c}b=b+1|0;if((d[b]|0)>3){g=1;j=32;break c}else{m=0;e=k}}if((j|0)==29){j=0;if((e&255)<3){g=1;j=32;break}else{m=2}}a[g]=e;l=b+1|0;g=g+1|0;m=e<<24>>24==0?m+1|0:0}if((j|0)==31){c[f>>2]=g-b+(c[f>>2]|0);s=0;i=h;return s|0}else if((j|0)==32){i=h;return g|0}return 0}function Pa(a,b,f,g){a=a|0;b=b|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;j=i;i=i+128|0;h=j;l=j+64|0;o=Gc(a)|0;M=o>>>16;do{if(f>>>0<2){if((o|0)<0){J=1;break}if(o>>>0>201326591){K=e[648+(o>>>26<<1)>>1]|0;L=25;break}if(o>>>0>16777215){K=e[712+(o>>>22<<1)>>1]|0;L=25;break}if(o>>>0>2097151){K=e[808+((o>>>18)+ -8<<1)>>1]|0;L=25;break}else{K=e[920+(M<<1)>>1]|0;L=25;break}}else{if(f>>>0<4){if((o|0)<0){J=(M&16384|0)!=0?2:2082;break}if(o>>>0>268435455){K=e[984+(o>>>26<<1)>>1]|0;L=25;break}if(o>>>0>33554431){K=e[1048+(o>>>23<<1)>>1]|0;L=25;break}else{K=e[1112+(o>>>18<<1)>>1]|0;L=25;break}}else{if(f>>>0<8){K=o>>>26;if((K+ -8|0)>>>0<56){K=e[1368+(K<<1)>>1]|0;L=25;break}K=e[1496+(o>>>22<<1)>>1]|0;L=25;break}if(f>>>0<17){K=e[1752+(o>>>26<<1)>>1]|0;L=25;break}K=o>>>29;if((K|0)!=0){K=e[1880+(K<<1)>>1]|0;L=25;break}K=e[1896+(o>>>24<<1)>>1]|0;L=25;break}}}while(0);do{if((L|0)==25){if((K|0)==0){q=1}else{J=K;break}i=j;return q|0}}while(0);K=J&31;f=o<<K;L=32-K|0;o=J>>>11&31;if(o>>>0>g>>>0){O=1;i=j;return O|0}J=J>>>5&63;do{if((o|0)==0){n=L;p=0}else{if((J|0)==0){M=0}else{do{if(L>>>0<J>>>0){if((Hc(a,K)|0)==-1){O=1;i=j;return O|0}else{L=32;f=Gc(a)|0;break}}}while(0);K=f>>>(32-J|0);f=f<<J;M=0;N=1<<J+ -1;do{c[h+(M<<2)>>2]=(N&K|0)!=0?-1:1;N=N>>>1;M=M+1|0;}while((N|0)!=0);L=L-J|0}K=J>>>0<3;a:do{if(M>>>0<o>>>0){N=o>>>0>10&K&1;b:while(1){if(L>>>0<16){if((Hc(a,32-L|0)|0)==-1){q=1;L=127;break}O=32;f=Gc(a)|0}else{O=L}do{if((f|0)<0){E=0;L=56}else{if(f>>>0>1073741823){E=1;L=56;break}if(f>>>0>536870911){E=2;L=56;break}if(f>>>0>268435455){E=3;L=56;break}if(f>>>0>134217727){E=4;L=56;break}if(f>>>0>67108863){E=5;L=56;break}if(f>>>0>33554431){E=6;L=56;break}if(f>>>0>16777215){E=7;L=56;break}if(f>>>0>8388607){E=8;L=56;break}if(f>>>0>4194303){E=9;L=56;break}if(f>>>0>2097151){E=10;L=56;break}if(f>>>0>1048575){E=11;L=56;break}if(f>>>0>524287){E=12;L=56;break}if(f>>>0>262143){E=13;L=56;break}if(f>>>0>131071){A=O+ -15|0;v=f<<15;D=14;C=(N|0)!=0?N:4;L=59;break}if(f>>>0<65536){q=1;L=127;break b}s=(N|0)!=0?N:1;B=15<<s;y=(s|0)==0;u=f<<16;t=O+ -16|0;z=12;L=60}}while(0);if((L|0)==56){v=E+1|0;A=O-v|0;v=f<<v;D=E;C=N;L=59}if((L|0)==59){L=0;f=(N|0)==0;O=D<<N;if((C|0)==0){w=f;G=A;F=v;H=O;I=N}else{B=O;y=f;u=v;t=A;s=N;z=C;L=60}}if((L|0)==60){if(t>>>0<z>>>0){if((Hc(a,32-t|0)|0)==-1){q=1;L=127;break}F=32;H=Gc(a)|0}else{F=t;H=u}w=y;G=F-z|0;F=H<<z;H=(H>>>(32-z|0))+B|0;I=s}L=(M|0)==(J|0)&K?H+2|0:H;N=(L+2|0)>>>1;O=w?1:I;c[h+(M<<2)>>2]=(L&1|0)==0?N:0-N|0;M=M+1|0;if(M>>>0<o>>>0){L=G;f=F;N=((N|0)>(3<<O+ -1|0)&O>>>0<6&1)+O|0}else{x=G;r=F;break a}}if((L|0)==127){i=j;return q|0}}else{x=L;r=f}}while(0);if(o>>>0<g>>>0){do{if(x>>>0<9){if((Hc(a,32-x|0)|0)==-1){O=1;i=j;return O|0}else{x=32;r=Gc(a)|0;break}}}while(0);s=r>>>23;c:do{if((g|0)==4){if((r|0)<0){g=1;break}if((o|0)==3){g=17;break}if(r>>>0>1073741823){g=18;break}if((o|0)==2){g=34;break}g=r>>>0>536870911?35:51}else{d:do{switch(o|0){case 1:{if(r>>>0>268435455){g=d[56+(r>>>27)|0]|0;break d}g=d[88+s|0]|0;break};case 2:{g=d[120+(r>>>26)|0]|0;break};case 3:{g=d[184+(r>>>26)|0]|0;break};case 4:{g=d[248+(r>>>27)|0]|0;break};case 5:{g=d[280+(r>>>27)|0]|0;break};case 6:{g=d[312+(r>>>26)|0]|0;break};case 7:{g=d[376+(r>>>26)|0]|0;break};case 8:{g=d[440+(r>>>26)|0]|0;break};case 9:{g=d[504+(r>>>26)|0]|0;break};case 10:{g=d[568+(r>>>27)|0]|0;break};case 11:{g=d[600+(r>>>28)|0]|0;break};case 12:{g=d[616+(r>>>28)|0]|0;break};case 13:{g=d[632+(r>>>29)|0]|0;break};case 14:{g=d[640+(r>>>30)|0]|0;break};default:{g=r>>31&16|1;break c}}}while(0);if((g|0)==0){q=1}else{break}i=j;return q|0}}while(0);u=g&15;x=x-u|0;r=r<<u;u=g>>>4&15}else{u=0}s=o+ -1|0;g=(s|0)==0;if(g){c[b+(u<<2)>>2]=c[h+(s<<2)>>2];n=x;p=1<<u;break}else{t=0}while(1){if((u|0)==0){c[l+(t<<2)>>2]=1;k=x;m=0}else{if(x>>>0<11){if((Hc(a,32-x|0)|0)==-1){q=1;L=127;break}x=32;r=Gc(a)|0}switch(u|0){case 1:{v=d[8+(r>>>31)|0]|0;break};case 2:{v=d[16+(r>>>30)|0]|0;break};case 3:{v=d[24+(r>>>30)|0]|0;break};case 4:{v=d[32+(r>>>29)|0]|0;break};case 5:{v=d[40+(r>>>29)|0]|0;break};case 6:{v=d[48+(r>>>29)|0]|0;break};default:{do{if(r>>>0>536870911){v=r>>>29<<4^115}else{if(r>>>0>268435455){v=116;break}if(r>>>0>134217727){v=133;break}if(r>>>0>67108863){v=150;break}if(r>>>0>33554431){v=167;break}if(r>>>0>16777215){v=184;break}if(r>>>0>8388607){v=201;break}if(r>>>0>4194303){v=218;break}v=r>>>0<2097152?0:235}}while(0);v=(v>>>4&15)>>>0>u>>>0?0:v}}if((v|0)==0){q=1;L=127;break}O=v&15;m=v>>>4&15;c[l+(t<<2)>>2]=m+1;k=x-O|0;r=r<<O;m=u-m|0}t=t+1|0;if(t>>>0<s>>>0){x=k;u=m}else{L=122;break}}if((L|0)==122){c[b+(m<<2)>>2]=c[h+(s<<2)>>2];p=1<<m;if(g){n=k;break}n=o+ -2|0;while(1){m=(c[l+(n<<2)>>2]|0)+m|0;p=1<<m|p;c[b+(m<<2)>>2]=c[h+(n<<2)>>2];if((n|0)==0){n=k;break}else{n=n+ -1|0}}}else if((L|0)==127){i=j;return q|0}}}while(0);if((Hc(a,32-n|0)|0)!=0){O=1;i=j;return O|0}O=p<<16|o<<4;i=j;return O|0}function Qa(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;f=c[b+4>>2]|0;g=c[b+8>>2]|0;if((d|0)==0|(d|0)==5){k=3}else{if((c[a+3384>>2]|0)==0){h=0}else{k=3}}if((k|0)==3){j=a+1220|0;k=0;while(1){h=nb(j,k)|0;k=k+1|0;if(k>>>0<16&(h|0)==0){}else{break}}}j=a+1176|0;m=c[j>>2]|0;do{if((m|0)!=0){o=c[a+1212>>2]|0;l=0;n=0;k=0;do{if((c[o+(n*216|0)+196>>2]|0)!=0){break}n=n+1|0;l=l+1|0;r=(l|0)==(f|0);k=(r&1)+k|0;l=r?0:l;}while(n>>>0<m>>>0);if((n|0)==(m|0)){break}j=a+1212|0;m=c[j>>2]|0;n=_(k,f)|0;if((l|0)!=0){o=a+1204|0;p=l;do{p=p+ -1|0;r=p+n|0;Ra(m+(r*216|0)|0,b,k,p,d,h);c[m+(r*216|0)+196>>2]=1;c[o>>2]=(c[o>>2]|0)+1;}while((p|0)!=0)}q=l+1|0;if(q>>>0<f>>>0){l=a+1204|0;do{o=q+n|0;p=m+(o*216|0)+196|0;if((c[p>>2]|0)==0){Ra(m+(o*216|0)|0,b,k,q,d,h);c[p>>2]=1;c[l>>2]=(c[l>>2]|0)+1}q=q+1|0;}while((q|0)!=(f|0))}do{if((k|0)==0){k=0}else{if((f|0)==0){break}m=k+ -1|0;l=_(m,f)|0;n=a+1204|0;o=0-f|0;r=0;do{p=m;q=(c[j>>2]|0)+((r+l|0)*216|0)|0;while(1){Ra(q,b,p,r,d,h);c[q+196>>2]=1;c[n>>2]=(c[n>>2]|0)+1;if((p|0)==0){break}else{q=q+(o*216|0)|0;p=p+ -1|0}}r=r+1|0;}while((r|0)!=(f|0))}}while(0);o=k+1|0;if(!(o>>>0<g>>>0)){i=e;return 0}a=a+1204|0;if((f|0)==0){i=e;return 0}do{k=c[j>>2]|0;p=_(o,f)|0;n=0;do{l=n+p|0;m=k+(l*216|0)+196|0;if((c[m>>2]|0)==0){Ra(k+(l*216|0)|0,b,o,n,d,h);c[m>>2]=1;c[a>>2]=(c[a>>2]|0)+1}n=n+1|0;}while((n|0)!=(f|0));o=o+1|0;}while((o|0)!=(g|0));i=e;return 0}}while(0);if((d|0)==2|(d|0)==7){if((c[a+3384>>2]|0)==0|(h|0)==0){k=13}else{k=14}}else{if((h|0)==0){k=13}else{k=14}}if((k|0)==13){_c(c[b>>2]|0,-128,_(f*384|0,g)|0)|0}else if((k|0)==14){ad(c[b>>2]|0,h|0,_(f*384|0,g)|0)|0}r=c[j>>2]|0;c[a+1204>>2]=r;if((r|0)==0){i=e;return 0}d=c[a+1212>>2]|0;b=0;do{c[d+(b*216|0)+8>>2]=1;b=b+1|0;}while(b>>>0<(c[j>>2]|0)>>>0);i=e;return 0}function Ra(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0;m=i;i=i+456|0;n=m;P=m+384|0;r=m+448|0;x=r;w=i;i=i+24|0;l=n;k=P;p=c[e+4>>2]|0;q=c[e+8>>2]|0;Qc(e,(_(p,f)|0)+g|0);o=e;t=c[o>>2]|0;u=f<<4;s=g<<4;v=(_(f<<8,p)|0)+s|0;c[b+20>>2]=40;c[b+8>>2]=0;c[b>>2]=6;c[b+12>>2]=0;c[b+16>>2]=0;c[b+24>>2]=0;do{if((h|0)==2|(h|0)==7){_c(l|0,0,384)|0}else{c[r>>2]=0;c[w+4>>2]=p;c[w+8>>2]=q;c[w>>2]=j;if((j|0)==0){_c(l|0,0,384)|0;break}hc(l,x,w,s,u,0,0,16,16);wb(e,l);i=m;return}}while(0);pa=k+0|0;qa=pa+64|0;do{c[pa>>2]=0;pa=pa+4|0}while((pa|0)<(qa|0));do{if((f|0)==0){j=0;h=0;oa=0;na=0;ma=0;ka=0;r=0}else{if((c[b+((0-p|0)*216|0)+196>>2]|0)==0){j=0;h=0;oa=0;na=0;ma=0;ka=0;r=0;break}ka=v-(p<<4)|0;oa=ka|1;na=ka|3;oa=(d[t+oa|0]|0)+(d[t+ka|0]|0)+(d[t+(oa+1)|0]|0)+(d[t+na|0]|0)|0;j=ka|7;na=(d[t+(na+2)|0]|0)+(d[t+(na+1)|0]|0)+(d[t+(na+3)|0]|0)+(d[t+j|0]|0)|0;ma=(d[t+(j+2)|0]|0)+(d[t+(j+1)|0]|0)+(d[t+(j+3)|0]|0)+(d[t+(j+4)|0]|0)|0;ka=(d[t+(j+6)|0]|0)+(d[t+(j+5)|0]|0)+(d[t+(j+7)|0]|0)+(d[t+(ka|15)|0]|0)|0;j=na+oa|0;h=ma+j+ka|0;c[P>>2]=h;j=j-ma-ka|0;c[P+4>>2]=j;r=1}}while(0);do{if((q+ -1|0)==(f|0)){y=0;la=0;ja=0;ia=0;fa=0;s=r}else{if((c[b+(p*216|0)+196>>2]|0)==0){y=0;la=0;ja=0;ia=0;fa=0;s=r;break}fa=v+(p<<8)|0;la=fa|1;ja=fa|3;la=(d[t+la|0]|0)+(d[t+fa|0]|0)+(d[t+(la+1)|0]|0)+(d[t+ja|0]|0)|0;y=fa|7;ja=(d[t+(ja+2)|0]|0)+(d[t+(ja+1)|0]|0)+(d[t+(ja+3)|0]|0)+(d[t+y|0]|0)|0;ia=(d[t+(y+2)|0]|0)+(d[t+(y+1)|0]|0)+(d[t+(y+3)|0]|0)+(d[t+(y+4)|0]|0)|0;fa=(d[t+(y+6)|0]|0)+(d[t+(y+5)|0]|0)+(d[t+(y+7)|0]|0)+(d[t+(fa|15)|0]|0)|0;y=ja+la|0;h=ia+y+h+fa|0;c[P>>2]=h;j=y-ia-fa+j|0;c[P+4>>2]=j;y=1;s=r+1|0}}while(0);do{if((g|0)==0){w=0;u=s;ha=0;ga=0;ea=0;da=0;H=0}else{if((c[b+ -20>>2]|0)==0){w=0;u=s;ha=0;ga=0;ea=0;da=0;H=0;break}wa=v+ -1|0;H=p<<4;u=p<<5;da=p*48|0;ha=(d[t+(wa+H)|0]|0)+(d[t+wa|0]|0)+(d[t+(wa+u)|0]|0)+(d[t+(wa+da)|0]|0)|0;w=p<<6;wa=wa+w|0;ga=(d[t+(wa+H)|0]|0)+(d[t+wa|0]|0)+(d[t+(wa+u)|0]|0)+(d[t+(wa+da)|0]|0)|0;wa=wa+w|0;ea=(d[t+(wa+H)|0]|0)+(d[t+wa|0]|0)+(d[t+(wa+u)|0]|0)+(d[t+(wa+da)|0]|0)|0;w=wa+w|0;da=(d[t+(w+H)|0]|0)+(d[t+w|0]|0)+(d[t+(w+u)|0]|0)+(d[t+(w+da)|0]|0)|0;w=ga+ha|0;h=ea+w+h+da|0;c[P>>2]=h;w=w-ea-da|0;c[P+16>>2]=w;u=s+1|0;H=1}}while(0);do{if((p+ -1|0)==(g|0)){ca=17}else{if((c[b+412>>2]|0)==0){ca=17;break}va=v+16|0;wa=p<<4;A=p<<5;z=p*48|0;x=(d[t+(va+wa)|0]|0)+(d[t+va|0]|0)+(d[t+(va+A)|0]|0)+(d[t+(va+z)|0]|0)|0;B=p<<6;va=va+B|0;b=(d[t+(va+wa)|0]|0)+(d[t+va|0]|0)+(d[t+(va+A)|0]|0)+(d[t+(va+z)|0]|0)|0;va=va+B|0;v=(d[t+(va+wa)|0]|0)+(d[t+va|0]|0)+(d[t+(va+A)|0]|0)+(d[t+(va+z)|0]|0)|0;B=va+B|0;z=(d[t+(B+wa)|0]|0)+(d[t+B|0]|0)+(d[t+(B+A)|0]|0)+(d[t+(B+z)|0]|0)|0;u=u+1|0;t=H+1|0;B=b+x|0;h=v+B+h+z|0;c[P>>2]=h;A=P+16|0;w=B-v-z+w|0;c[A>>2]=w;B=(s|0)!=0;if(B|(H|0)==0){if(B){Q=1;ca=21;break}else{j=A;Q=1;ca=26;break}}else{c[P+4>>2]=ea+da+ga+ha-x-b-v-z>>5;j=A;Q=1;ca=26;break}}}while(0);if((ca|0)==17){if((s|0)==0){Q=0;t=H;ca=22}else{Q=0;t=H;ca=21}}if((ca|0)==21){c[P+4>>2]=j>>s+3;ca=22}do{if((ca|0)==22){j=(t|0)!=0;if(!(j|(r|0)==0|(y|0)==0)){c[P+16>>2]=ma+ka+na+oa-fa-ia-ja-la>>5;break}if(!j){break}j=P+16|0;ca=26}}while(0);if((ca|0)==26){c[j>>2]=w>>t+3}if((u|0)==1){c[P>>2]=h>>4}else if((u|0)==2){c[P>>2]=h>>5}else if((u|0)==3){c[P>>2]=h*21>>10}else{c[P>>2]=h>>6}j=P;Sa(j);u=0;s=l;t=j;while(1){b=c[t+((u>>>2&3)<<2)>>2]|0;if((b|0)<0){b=0}else{b=(b|0)>255?-1:b&255}a[s]=b;b=u+1|0;if((b|0)==256){break}else{u=b;s=s+1|0;t=(b&63|0)==0?t+16|0:t}}wa=_(q,p)|0;s=(r|0)!=0;U=p<<3;q=0-U|0;r=q|1;w=r+1|0;x=q|3;h=x+1|0;v=x+2|0;u=x+3|0;t=q|7;b=P+4|0;G=(y|0)!=0;A=p<<6;z=A|1;C=z+1|0;B=A|3;E=B+1|0;D=B+2|0;y=B+3|0;F=A|7;I=(H|0)!=0;J=U+ -1|0;$=p<<4;L=$+ -1|0;K=L+U|0;N=L+$|0;M=N+U|0;O=N+$|0;H=O+U|0;P=P+16|0;aa=(Q|0)!=0;Z=U+8|0;X=$|8;Y=X+U|0;R=X+$|0;W=R+U|0;$=R+$|0;U=$+U|0;V=I^1;T=aa^1;Q=s^1;ba=G^1;S=wa<<6;ca=fa;fa=0;f=(c[o>>2]|0)+((_(f<<6,p)|0)+(g<<3)+(wa<<8))|0;while(1){pa=k+0|0;qa=pa+64|0;do{c[pa>>2]=0;pa=pa+4|0}while((pa|0)<(qa|0));if(s){oa=(d[f+r|0]|0)+(d[f+q|0]|0)|0;na=(d[f+x|0]|0)+(d[f+w|0]|0)|0;ma=(d[f+v|0]|0)+(d[f+h|0]|0)|0;ka=(d[f+t|0]|0)+(d[f+u|0]|0)|0;g=na+oa|0;ra=ma+g+ka|0;c[j>>2]=ra;g=g-ma-ka|0;c[b>>2]=g;p=1}else{g=0;ra=0;p=0}if(G){la=(d[f+z|0]|0)+(d[f+A|0]|0)|0;ja=(d[f+B|0]|0)+(d[f+C|0]|0)|0;ia=(d[f+D|0]|0)+(d[f+E|0]|0)|0;o=(d[f+F|0]|0)+(d[f+y|0]|0)|0;wa=ja+la|0;ra=ia+wa+ra+o|0;c[j>>2]=ra;g=wa-ia-o+g|0;c[b>>2]=g;p=p+1|0}else{o=ca}if(I){ha=(d[f+J|0]|0)+(d[f+ -1|0]|0)|0;ga=(d[f+K|0]|0)+(d[f+L|0]|0)|0;ea=(d[f+M|0]|0)+(d[f+N|0]|0)|0;da=(d[f+H|0]|0)+(d[f+O|0]|0)|0;ca=ga+ha|0;ra=ea+ca+ra+da|0;c[j>>2]=ra;ca=ca-ea-da|0;c[P>>2]=ca;qa=p+1|0;pa=1}else{ca=0;qa=p;pa=0}do{if(aa){va=(d[f+Z|0]|0)+(d[f+8|0]|0)|0;ua=(d[f+Y|0]|0)+(d[f+X|0]|0)|0;ta=(d[f+W|0]|0)+(d[f+R|0]|0)|0;sa=(d[f+U|0]|0)+(d[f+$|0]|0)|0;qa=qa+1|0;pa=pa+1|0;wa=ua+va|0;ra=ta+wa+ra+sa|0;c[j>>2]=ra;ca=wa-ta-sa+ca|0;c[P>>2]=ca;wa=(p|0)!=0;if(wa|V|T){if(wa){sa=ca;ca=48;break}else{sa=ca;ca=52;break}}else{c[b>>2]=ea+da+ga+ha-va-ua-ta-sa>>4;sa=ca;ca=52;break}}else{if((p|0)==0){sa=ca;ca=49}else{sa=ca;ca=48}}}while(0);if((ca|0)==48){c[b>>2]=g>>p+2;ca=49}do{if((ca|0)==49){ca=0;g=(pa|0)!=0;if(g|Q|ba){if(g){ca=52;break}else{break}}else{c[P>>2]=ma+ka+na+oa-o-ia-ja-la>>4;break}}}while(0);if((ca|0)==52){c[P>>2]=sa>>pa+2}if((qa|0)==1){c[j>>2]=ra>>3}else if((qa|0)==2){c[j>>2]=ra>>4}else if((qa|0)==3){c[j>>2]=ra*21>>9}else{c[j>>2]=ra>>5}Sa(j);g=0;ca=n+((fa<<6)+256)|0;p=j;while(1){pa=c[p+((g>>>1&3)<<2)>>2]|0;if((pa|0)<0){pa=0}else{pa=(pa|0)>255?-1:pa&255}a[ca]=pa;pa=g+1|0;if((pa|0)==64){break}else{g=pa;ca=ca+1|0;p=(pa&15|0)==0?p+16|0:p}}fa=fa+1|0;if((fa|0)==2){break}else{ca=o;f=f+S|0}}wb(e,l);i=m;return}function Sa(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;d=a+4|0;h=c[d>>2]|0;f=a+16|0;g=c[f>>2]|0;e=c[a>>2]|0;if((h|g|0)==0){c[a+60>>2]=e;c[a+56>>2]=e;c[a+52>>2]=e;c[a+48>>2]=e;c[a+44>>2]=e;c[a+40>>2]=e;c[a+36>>2]=e;c[a+32>>2]=e;c[a+28>>2]=e;c[a+24>>2]=e;c[a+20>>2]=e;c[f>>2]=e;c[a+12>>2]=e;c[a+8>>2]=e;c[d>>2]=e;i=b;return}else{l=h+e|0;j=h>>1;k=j+e|0;j=e-j|0;h=e-h|0;c[a>>2]=g+l;f=g>>1;c[a+16>>2]=f+l;c[a+32>>2]=l-f;c[a+48>>2]=l-g;c[d>>2]=g+k;c[a+20>>2]=f+k;c[a+36>>2]=k-f;c[a+52>>2]=k-g;c[a+8>>2]=g+j;c[a+24>>2]=f+j;c[a+40>>2]=j-f;c[a+56>>2]=j-g;c[a+12>>2]=g+h;c[a+28>>2]=f+h;c[a+44>>2]=h-f;c[a+60>>2]=h-g;i=b;return}}function Ta(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,_a=0,$a=0,ab=0,bb=0,cb=0,db=0,eb=0,fb=0,gb=0,hb=0,ib=0,jb=0,kb=0,lb=0,mb=0,nb=0,ob=0,pb=0,qb=0,rb=0,sb=0;l=i;i=i+168|0;S=l;j=l+128|0;k=c[e+4>>2]|0;h=e;G=e+8|0;sb=c[G>>2]|0;ga=_(sb,k)|0;if((sb|0)==0){i=l;return}p=S;q=S+24|0;o=S+16|0;n=S+8|0;m=S;u=S+100|0;t=S+68|0;s=S+36|0;r=S+4|0;K=S+120|0;L=S+112|0;M=S+104|0;N=S+96|0;O=S+88|0;P=S+80|0;Q=S+72|0;R=S+64|0;J=S+56|0;I=S+48|0;H=S+40|0;e=S+32|0;F=S+124|0;E=S+116|0;D=S+108|0;C=S+92|0;B=S+84|0;A=S+76|0;z=S+60|0;y=S+52|0;x=S+44|0;w=S+28|0;v=S+20|0;ba=S+12|0;$=j+28|0;S=j+32|0;Y=j+24|0;ea=k<<4;da=0-ea|0;aa=da<<1;U=_(k,-48)|0;Z=k<<5;V=da<<2;W=k*48|0;X=k<<6;ca=j+24|0;fa=j+12|0;T=ga<<8;ka=ga<<6;la=k<<3;ma=ea|4;ja=j+16|0;ia=j+20|0;ha=j+12|0;na=j+4|0;oa=j+8|0;ga=j;qa=0;pa=0;while(1){ta=c[f+8>>2]|0;a:do{if((ta|0)!=1){ra=f+200|0;wa=c[ra>>2]|0;do{if((wa|0)==0){ua=1}else{if((ta|0)==2){if((c[f+4>>2]|0)!=(c[wa+4>>2]|0)){ua=1;break}}ua=5}}while(0);sa=f+204|0;va=c[sa>>2]|0;do{if((va|0)!=0){if((ta|0)==2){if((c[f+4>>2]|0)!=(c[va+4>>2]|0)){break}}ua=ua|2}}while(0);ta=(ua&2|0)==0;b:do{if(ta){c[q>>2]=0;c[o>>2]=0;c[n>>2]=0;c[m>>2]=0;va=0}else{do{if(!((c[f>>2]|0)>>>0>5)){if((c[va>>2]|0)>>>0>5){break}do{if((b[f+28>>1]|0)==0){if((b[va+48>>1]|0)!=0){xa=2;break}if((c[f+116>>2]|0)!=(c[va+124>>2]|0)){xa=1;break}xa=(b[f+132>>1]|0)-(b[va+172>>1]|0)|0;if(((xa|0)<0?0-xa|0:xa)>>>0>3){xa=1;break}xa=(b[f+134>>1]|0)-(b[va+174>>1]|0)|0;xa=((xa|0)<0?0-xa|0:xa)>>>0>3|0}else{xa=2}}while(0);c[m>>2]=xa;do{if((b[f+30>>1]|0)==0){if((b[va+50>>1]|0)!=0){ya=2;break}if((c[f+116>>2]|0)!=(c[va+124>>2]|0)){ya=1;break}ya=(b[f+136>>1]|0)-(b[va+176>>1]|0)|0;if(((ya|0)<0?0-ya|0:ya)>>>0>3){ya=1;break}ya=(b[f+138>>1]|0)-(b[va+178>>1]|0)|0;ya=((ya|0)<0?0-ya|0:ya)>>>0>3|0}else{ya=2}}while(0);c[n>>2]=ya;do{if((b[f+36>>1]|0)==0){if((b[va+56>>1]|0)!=0){za=2;break}if((c[f+120>>2]|0)!=(c[va+128>>2]|0)){za=1;break}za=(b[f+148>>1]|0)-(b[va+188>>1]|0)|0;if(((za|0)<0?0-za|0:za)>>>0>3){za=1;break}za=(b[f+150>>1]|0)-(b[va+190>>1]|0)|0;za=((za|0)<0?0-za|0:za)>>>0>3|0}else{za=2}}while(0);c[o>>2]=za;do{if((b[f+38>>1]|0)==0){if((b[va+58>>1]|0)!=0){va=2;break}if((c[f+120>>2]|0)!=(c[va+128>>2]|0)){va=1;break}Aa=(b[f+152>>1]|0)-(b[va+192>>1]|0)|0;if(((Aa|0)<0?0-Aa|0:Aa)>>>0>3){va=1;break}va=(b[f+154>>1]|0)-(b[va+194>>1]|0)|0;va=((va|0)<0?0-va|0:va)>>>0>3|0}else{va=2}}while(0);c[q>>2]=va;if((ya|xa|0)==0){if((va|za|0)==0){va=0;break b}}va=1;break b}}while(0);c[q>>2]=4;c[o>>2]=4;c[n>>2]=4;c[m>>2]=4;va=1}}while(0);ua=(ua&4|0)==0;c:do{if(ua){c[u>>2]=0;c[t>>2]=0;c[s>>2]=0;c[r>>2]=0;xa=f}else{xa=f;do{if(!((c[xa>>2]|0)>>>0>5)){if((c[wa>>2]|0)>>>0>5){break}do{if((b[f+28>>1]|0)==0){if((b[wa+38>>1]|0)!=0){ya=2;break}if((c[f+116>>2]|0)!=(c[wa+120>>2]|0)){ya=1;break}ya=(b[f+132>>1]|0)-(b[wa+152>>1]|0)|0;if(((ya|0)<0?0-ya|0:ya)>>>0>3){ya=1;break}ya=(b[f+134>>1]|0)-(b[wa+154>>1]|0)|0;ya=((ya|0)<0?0-ya|0:ya)>>>0>3|0}else{ya=2}}while(0);c[r>>2]=ya;do{if((b[f+32>>1]|0)==0){if((b[wa+42>>1]|0)!=0){za=2;break}if((c[f+116>>2]|0)!=(c[wa+120>>2]|0)){za=1;break}za=(b[f+140>>1]|0)-(b[wa+160>>1]|0)|0;if(((za|0)<0?0-za|0:za)>>>0>3){za=1;break}za=(b[f+142>>1]|0)-(b[wa+162>>1]|0)|0;za=((za|0)<0?0-za|0:za)>>>0>3|0}else{za=2}}while(0);c[s>>2]=za;do{if((b[f+44>>1]|0)==0){if((b[wa+54>>1]|0)!=0){Aa=2;break}if((c[f+124>>2]|0)!=(c[wa+128>>2]|0)){Aa=1;break}Aa=(b[f+164>>1]|0)-(b[wa+184>>1]|0)|0;if(((Aa|0)<0?0-Aa|0:Aa)>>>0>3){Aa=1;break}Aa=(b[f+166>>1]|0)-(b[wa+186>>1]|0)|0;Aa=((Aa|0)<0?0-Aa|0:Aa)>>>0>3|0}else{Aa=2}}while(0);c[t>>2]=Aa;do{if((b[f+48>>1]|0)==0){if((b[wa+58>>1]|0)!=0){wa=2;break}if((c[f+124>>2]|0)!=(c[wa+128>>2]|0)){wa=1;break}Ba=(b[f+172>>1]|0)-(b[wa+192>>1]|0)|0;if(((Ba|0)<0?0-Ba|0:Ba)>>>0>3){wa=1;break}wa=(b[f+174>>1]|0)-(b[wa+194>>1]|0)|0;wa=((wa|0)<0?0-wa|0:wa)>>>0>3|0}else{wa=2}}while(0);c[u>>2]=wa;if((va|0)!=0){break c}if((za|ya|0)==0){if((wa|Aa|0)==0){va=0;break c}}va=1;break c}}while(0);c[u>>2]=4;c[t>>2]=4;c[s>>2]=4;c[r>>2]=4;va=1}}while(0);wa=c[xa>>2]|0;do{if(wa>>>0>5){c[K>>2]=3;c[L>>2]=3;c[M>>2]=3;c[N>>2]=3;c[O>>2]=3;c[P>>2]=3;c[Q>>2]=3;c[R>>2]=3;c[J>>2]=3;c[I>>2]=3;c[H>>2]=3;c[e>>2]=3;c[F>>2]=3;c[E>>2]=3;c[D>>2]=3;c[C>>2]=3;c[B>>2]=3;c[A>>2]=3;c[z>>2]=3;c[y>>2]=3;c[x>>2]=3;c[w>>2]=3;c[v>>2]=3;c[ba>>2]=3}else{do{if((Hb(wa)|0)==1){Ua(f,p)}else{wa=c[xa>>2]|0;if((wa|0)==2){Ia=f+28|0;Da=b[f+32>>1]|0;Ka=Da<<16>>16==0;if(Ka){wa=(b[Ia>>1]|0)!=0?2:0}else{wa=2}c[e>>2]=wa;Ca=b[f+34>>1]|0;Fa=Ca<<16>>16==0;if(Fa){wa=(b[f+30>>1]|0)!=0?2:0}else{wa=2}c[H>>2]=wa;Ea=b[f+40>>1]|0;Ha=Ea<<16>>16==0;if(Ha){wa=(b[f+36>>1]|0)!=0?2:0}else{wa=2}c[I>>2]=wa;Ma=b[f+42>>1]|0;Ga=Ma<<16>>16==0;if(Ga){wa=(b[f+38>>1]|0)!=0?2:0}else{wa=2}c[J>>2]=wa;xa=b[f+48>>1]|0;if(xa<<16>>16==0){wa=(b[f+44>>1]|0)!=0?2:0}else{wa=2}c[N>>2]=wa;ya=b[f+50>>1]|0;Aa=ya<<16>>16==0;if(Aa){wa=(b[f+46>>1]|0)!=0?2:0}else{wa=2}c[M>>2]=wa;wa=b[f+56>>1]|0;za=wa<<16>>16==0;if(za){Ba=(b[f+52>>1]|0)!=0?2:0}else{Ba=2}c[L>>2]=Ba;Ba=(b[f+58>>1]|0)==0;if(Ba){Ja=(b[f+54>>1]|0)!=0?2:0}else{Ja=2}c[K>>2]=Ja;La=b[f+166>>1]|0;Na=b[f+142>>1]|0;Ja=(b[f+44>>1]|0)!=0;do{if(Ja|Ka^1){Ka=2}else{Ka=(b[f+164>>1]|0)-(b[f+140>>1]|0)|0;if(((Ka|0)<0?0-Ka|0:Ka)>>>0>3){Ka=1;break}Ka=La-Na|0;if(((Ka|0)<0?0-Ka|0:Ka)>>>0>3){Ka=1;break}Ka=(c[f+124>>2]|0)!=(c[f+116>>2]|0)|0}}while(0);c[R>>2]=Ka;Ka=b[f+46>>1]|0;Oa=b[f+170>>1]|0;Pa=b[f+146>>1]|0;La=Ka<<16>>16==0;do{if((Ka|Ca)<<16>>16==0){Na=(b[f+168>>1]|0)-(b[f+144>>1]|0)|0;if(((Na|0)<0?0-Na|0:Na)>>>0>3){Na=1;break}Na=Oa-Pa|0;if(((Na|0)<0?0-Na|0:Na)>>>0>3){Na=1;break}Na=(c[f+124>>2]|0)!=(c[f+116>>2]|0)|0}else{Na=2}}while(0);c[Q>>2]=Na;Na=b[f+52>>1]|0;Qa=b[f+182>>1]|0;Pa=b[f+158>>1]|0;Oa=Na<<16>>16==0;do{if((Na|Ea)<<16>>16==0){Ra=(b[f+180>>1]|0)-(b[f+156>>1]|0)|0;if(((Ra|0)<0?0-Ra|0:Ra)>>>0>3){Pa=1;break}Pa=Qa-Pa|0;if(((Pa|0)<0?0-Pa|0:Pa)>>>0>3){Pa=1;break}Pa=(c[f+128>>2]|0)!=(c[f+120>>2]|0)|0}else{Pa=2}}while(0);c[P>>2]=Pa;sb=b[f+54>>1]|0;Ra=b[f+186>>1]|0;Qa=b[f+162>>1]|0;Pa=sb<<16>>16==0;do{if((sb|Ma)<<16>>16==0){Ma=(b[f+184>>1]|0)-(b[f+160>>1]|0)|0;if(((Ma|0)<0?0-Ma|0:Ma)>>>0>3){Ma=1;break}Ma=Ra-Qa|0;if(((Ma|0)<0?0-Ma|0:Ma)>>>0>3){Ma=1;break}Ma=(c[f+128>>2]|0)!=(c[f+120>>2]|0)|0}else{Ma=2}}while(0);c[O>>2]=Ma;Ma=b[f+30>>1]|0;if(Ma<<16>>16==0){Ia=(b[Ia>>1]|0)!=0?2:0}else{Ia=2}c[ba>>2]=Ia;Ia=b[f+36>>1]|0;if(Ia<<16>>16==0){Ma=Ma<<16>>16!=0?2:0}else{Ma=2}c[v>>2]=Ma;if((b[f+38>>1]|0)==0){Ia=Ia<<16>>16!=0?2:0}else{Ia=2}c[w>>2]=Ia;if(Fa){Da=Da<<16>>16!=0?2:0}else{Da=2}c[x>>2]=Da;if(Ha){Ca=Ca<<16>>16!=0?2:0}else{Ca=2}c[y>>2]=Ca;if(Ga){Ca=Ea<<16>>16!=0?2:0}else{Ca=2}c[z>>2]=Ca;if(La){Ca=Ja?2:0}else{Ca=2}c[A>>2]=Ca;if(Oa){Ca=Ka<<16>>16!=0?2:0}else{Ca=2}c[B>>2]=Ca;if(Pa){Ca=Na<<16>>16!=0?2:0}else{Ca=2}c[C>>2]=Ca;if(Aa){xa=xa<<16>>16!=0?2:0}else{xa=2}c[D>>2]=xa;if(za){xa=ya<<16>>16!=0?2:0}else{xa=2}c[E>>2]=xa;if(Ba){wa=wa<<16>>16!=0?2:0}else{wa=2}c[F>>2]=wa;break}else if((wa|0)==3){Fa=f+28|0;Ca=b[f+32>>1]|0;if(Ca<<16>>16==0){wa=(b[Fa>>1]|0)!=0?2:0}else{wa=2}c[e>>2]=wa;ya=b[f+34>>1]|0;Da=ya<<16>>16==0;if(Da){wa=(b[f+30>>1]|0)!=0?2:0}else{wa=2}c[H>>2]=wa;Ba=b[f+40>>1]|0;if(Ba<<16>>16==0){wa=(b[f+36>>1]|0)!=0?2:0}else{wa=2}c[I>>2]=wa;wa=b[f+42>>1]|0;Ea=wa<<16>>16==0;if(Ea){xa=(b[f+38>>1]|0)!=0?2:0}else{xa=2}c[J>>2]=xa;Ga=b[f+44>>1]|0;if(Ga<<16>>16==0){xa=Ca<<16>>16!=0?2:0}else{xa=2}c[R>>2]=xa;xa=b[f+46>>1]|0;Ha=xa<<16>>16==0;if(Ha){za=ya<<16>>16!=0?2:0}else{za=2}c[Q>>2]=za;za=b[f+52>>1]|0;if(za<<16>>16==0){Aa=Ba<<16>>16!=0?2:0}else{Aa=2}c[P>>2]=Aa;Ka=b[f+54>>1]|0;Ia=Ka<<16>>16==0;if(Ia){wa=wa<<16>>16!=0?2:0}else{wa=2}c[O>>2]=wa;Ja=b[f+48>>1]|0;if(Ja<<16>>16==0){wa=Ga<<16>>16!=0?2:0}else{wa=2}c[N>>2]=wa;wa=b[f+50>>1]|0;La=wa<<16>>16==0;if(La){Aa=xa<<16>>16!=0?2:0}else{Aa=2}c[M>>2]=Aa;Aa=b[f+56>>1]|0;if(Aa<<16>>16==0){Ma=za<<16>>16!=0?2:0}else{Ma=2}c[L>>2]=Ma;Ma=(b[f+58>>1]|0)==0;if(Ma){Ka=Ka<<16>>16!=0?2:0}else{Ka=2}c[K>>2]=Ka;Ka=(b[f+30>>1]|0)==0;if(Ka){Fa=(b[Fa>>1]|0)!=0?2:0}else{Fa=2}c[ba>>2]=Fa;if((b[f+38>>1]|0)==0){Fa=(b[f+36>>1]|0)!=0?2:0}else{Fa=2}c[w>>2]=Fa;if(Da){Ca=Ca<<16>>16!=0?2:0}else{Ca=2}c[x>>2]=Ca;if(Ea){Ca=Ba<<16>>16!=0?2:0}else{Ca=2}c[z>>2]=Ca;if(Ha){Ca=Ga<<16>>16!=0?2:0}else{Ca=2}c[A>>2]=Ca;if(Ia){Ca=za<<16>>16!=0?2:0}else{Ca=2}c[C>>2]=Ca;if(La){Ca=Ja<<16>>16!=0?2:0}else{Ca=2}c[D>>2]=Ca;if(Ma){Ca=Aa<<16>>16!=0?2:0}else{Ca=2}c[F>>2]=Ca;Ca=b[f+150>>1]|0;Da=b[f+138>>1]|0;do{if((b[f+36>>1]|0)!=0|Ka^1){Ca=2}else{Ea=(b[f+148>>1]|0)-(b[f+136>>1]|0)|0;if(((Ea|0)<0?0-Ea|0:Ea)>>>0>3){Ca=1;break}Ca=Ca-Da|0;if(((Ca|0)<0?0-Ca|0:Ca)>>>0>3){Ca=1;break}Ca=(c[f+120>>2]|0)!=(c[f+116>>2]|0)|0}}while(0);c[v>>2]=Ca;Ca=b[f+158>>1]|0;Da=b[f+146>>1]|0;do{if((Ba|ya)<<16>>16==0){ya=(b[f+156>>1]|0)-(b[f+144>>1]|0)|0;if(((ya|0)<0?0-ya|0:ya)>>>0>3){ya=1;break}ya=Ca-Da|0;if(((ya|0)<0?0-ya|0:ya)>>>0>3){ya=1;break}ya=(c[f+120>>2]|0)!=(c[f+116>>2]|0)|0}else{ya=2}}while(0);c[y>>2]=ya;Ba=b[f+182>>1]|0;ya=b[f+170>>1]|0;do{if((za|xa)<<16>>16==0){xa=(b[f+180>>1]|0)-(b[f+168>>1]|0)|0;if(((xa|0)<0?0-xa|0:xa)>>>0>3){xa=1;break}xa=Ba-ya|0;if(((xa|0)<0?0-xa|0:xa)>>>0>3){xa=1;break}xa=(c[f+128>>2]|0)!=(c[f+124>>2]|0)|0}else{xa=2}}while(0);c[B>>2]=xa;xa=b[f+190>>1]|0;ya=b[f+178>>1]|0;do{if((Aa|wa)<<16>>16==0){wa=(b[f+188>>1]|0)-(b[f+176>>1]|0)|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=xa-ya|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=(c[f+128>>2]|0)!=(c[f+124>>2]|0)|0}else{wa=2}}while(0);c[E>>2]=wa;break}else{Ca=b[f+32>>1]|0;Da=b[f+140>>1]|0;pb=b[f+132>>1]|0;xa=b[f+142>>1]|0;lb=b[f+134>>1]|0;do{if(Ca<<16>>16==0){if((b[f+28>>1]|0)!=0){wa=2;break}wa=Da-pb|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=xa-lb|0;wa=((wa|0)<0?0-wa|0:wa)>>>0>3|0}else{wa=2}}while(0);c[e>>2]=wa;Ba=b[f+34>>1]|0;Aa=b[f+144>>1]|0;nb=b[f+136>>1]|0;wa=b[f+146>>1]|0;hb=b[f+138>>1]|0;do{if(Ba<<16>>16==0){if((b[f+30>>1]|0)!=0){ya=2;break}ya=Aa-nb|0;if(((ya|0)<0?0-ya|0:ya)>>>0>3){ya=1;break}ya=wa-hb|0;ya=((ya|0)<0?0-ya|0:ya)>>>0>3|0}else{ya=2}}while(0);c[H>>2]=ya;za=b[f+40>>1]|0;Ea=b[f+156>>1]|0;mb=b[f+148>>1]|0;ya=b[f+158>>1]|0;ib=b[f+150>>1]|0;do{if(za<<16>>16==0){if((b[f+36>>1]|0)!=0){Fa=2;break}Fa=Ea-mb|0;if(((Fa|0)<0?0-Fa|0:Fa)>>>0>3){Fa=1;break}Fa=ya-ib|0;Fa=((Fa|0)<0?0-Fa|0:Fa)>>>0>3|0}else{Fa=2}}while(0);c[I>>2]=Fa;Ja=b[f+42>>1]|0;La=b[f+160>>1]|0;rb=b[f+152>>1]|0;Fa=b[f+162>>1]|0;qb=b[f+154>>1]|0;do{if(Ja<<16>>16==0){if((b[f+38>>1]|0)!=0){Ga=2;break}Ga=La-rb|0;if(((Ga|0)<0?0-Ga|0:Ga)>>>0>3){Ga=1;break}Ga=Fa-qb|0;Ga=((Ga|0)<0?0-Ga|0:Ga)>>>0>3|0}else{Ga=2}}while(0);c[J>>2]=Ga;Oa=b[f+44>>1]|0;Ma=b[f+164>>1]|0;Ia=b[f+166>>1]|0;do{if((Oa|Ca)<<16>>16==0){Ga=Ma-Da|0;if(((Ga|0)<0?0-Ga|0:Ga)>>>0>3){Ga=1;break}Ga=Ia-xa|0;if(((Ga|0)<0?0-Ga|0:Ga)>>>0>3){Ga=1;break}Ga=(c[f+124>>2]|0)!=(c[f+116>>2]|0)|0}else{Ga=2}}while(0);c[R>>2]=Ga;Pa=b[f+46>>1]|0;Qa=b[f+168>>1]|0;Ha=b[f+170>>1]|0;do{if((Pa|Ba)<<16>>16==0){Ga=Qa-Aa|0;if(((Ga|0)<0?0-Ga|0:Ga)>>>0>3){Ga=1;break}Ga=Ha-wa|0;if(((Ga|0)<0?0-Ga|0:Ga)>>>0>3){Ga=1;break}Ga=(c[f+124>>2]|0)!=(c[f+116>>2]|0)|0}else{Ga=2}}while(0);c[Q>>2]=Ga;Na=b[f+52>>1]|0;Ka=b[f+180>>1]|0;Ga=b[f+182>>1]|0;do{if((Na|za)<<16>>16==0){Ra=Ka-Ea|0;if(((Ra|0)<0?0-Ra|0:Ra)>>>0>3){Ra=1;break}Ra=Ga-ya|0;if(((Ra|0)<0?0-Ra|0:Ra)>>>0>3){Ra=1;break}Ra=(c[f+128>>2]|0)!=(c[f+120>>2]|0)|0}else{Ra=2}}while(0);c[P>>2]=Ra;eb=b[f+54>>1]|0;cb=b[f+184>>1]|0;Ta=b[f+186>>1]|0;do{if((eb|Ja)<<16>>16==0){Ra=cb-La|0;if(((Ra|0)<0?0-Ra|0:Ra)>>>0>3){Ra=1;break}Ra=Ta-Fa|0;if(((Ra|0)<0?0-Ra|0:Ra)>>>0>3){Ra=1;break}Ra=(c[f+128>>2]|0)!=(c[f+120>>2]|0)|0}else{Ra=2}}while(0);c[O>>2]=Ra;ab=b[f+48>>1]|0;$a=b[f+172>>1]|0;Ra=b[f+174>>1]|0;do{if((ab|Oa)<<16>>16==0){Sa=$a-Ma|0;if(((Sa|0)<0?0-Sa|0:Sa)>>>0>3){Sa=1;break}Sa=Ra-Ia|0;Sa=((Sa|0)<0?0-Sa|0:Sa)>>>0>3|0}else{Sa=2}}while(0);c[N>>2]=Sa;bb=b[f+50>>1]|0;gb=b[f+176>>1]|0;_a=b[f+178>>1]|0;do{if((bb|Pa)<<16>>16==0){Sa=gb-Qa|0;if(((Sa|0)<0?0-Sa|0:Sa)>>>0>3){Sa=1;break}Sa=_a-Ha|0;Sa=((Sa|0)<0?0-Sa|0:Sa)>>>0>3|0}else{Sa=2}}while(0);c[M>>2]=Sa;fb=b[f+56>>1]|0;db=b[f+188>>1]|0;Sa=b[f+190>>1]|0;do{if((fb|Na)<<16>>16==0){jb=db-Ka|0;if(((jb|0)<0?0-jb|0:jb)>>>0>3){jb=1;break}jb=Sa-Ga|0;jb=((jb|0)<0?0-jb|0:jb)>>>0>3|0}else{jb=2}}while(0);c[L>>2]=jb;ob=b[f+58>>1]|0;kb=b[f+192>>1]|0;jb=b[f+194>>1]|0;do{if((ob|eb)<<16>>16==0){sb=kb-cb|0;if(((sb|0)<0?0-sb|0:sb)>>>0>3){sb=1;break}sb=jb-Ta|0;sb=((sb|0)<0?0-sb|0:sb)>>>0>3|0}else{sb=2}}while(0);c[K>>2]=sb;sb=b[f+30>>1]|0;do{if(sb<<16>>16==0){if((b[f+28>>1]|0)!=0){lb=2;break}pb=nb-pb|0;if(((pb|0)<0?0-pb|0:pb)>>>0>3){lb=1;break}lb=hb-lb|0;lb=((lb|0)<0?0-lb|0:lb)>>>0>3|0}else{lb=2}}while(0);c[ba>>2]=lb;lb=b[f+36>>1]|0;do{if((lb|sb)<<16>>16==0){nb=mb-nb|0;if(((nb|0)<0?0-nb|0:nb)>>>0>3){hb=1;break}hb=ib-hb|0;if(((hb|0)<0?0-hb|0:hb)>>>0>3){hb=1;break}hb=(c[f+120>>2]|0)!=(c[f+116>>2]|0)|0}else{hb=2}}while(0);c[v>>2]=hb;do{if((b[f+38>>1]|lb)<<16>>16==0){hb=rb-mb|0;if(((hb|0)<0?0-hb|0:hb)>>>0>3){hb=1;break}hb=qb-ib|0;hb=((hb|0)<0?0-hb|0:hb)>>>0>3|0}else{hb=2}}while(0);c[w>>2]=hb;do{if((Ba|Ca)<<16>>16==0){Ca=Aa-Da|0;if(((Ca|0)<0?0-Ca|0:Ca)>>>0>3){xa=1;break}xa=wa-xa|0;xa=((xa|0)<0?0-xa|0:xa)>>>0>3|0}else{xa=2}}while(0);c[x>>2]=xa;do{if((za|Ba)<<16>>16==0){xa=Ea-Aa|0;if(((xa|0)<0?0-xa|0:xa)>>>0>3){wa=1;break}wa=ya-wa|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=(c[f+120>>2]|0)!=(c[f+116>>2]|0)|0}else{wa=2}}while(0);c[y>>2]=wa;do{if((Ja|za)<<16>>16==0){wa=La-Ea|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=Fa-ya|0;wa=((wa|0)<0?0-wa|0:wa)>>>0>3|0}else{wa=2}}while(0);c[z>>2]=wa;do{if((Pa|Oa)<<16>>16==0){wa=Qa-Ma|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=Ha-Ia|0;wa=((wa|0)<0?0-wa|0:wa)>>>0>3|0}else{wa=2}}while(0);c[A>>2]=wa;do{if((Na|Pa)<<16>>16==0){wa=Ka-Qa|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=Ga-Ha|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=(c[f+128>>2]|0)!=(c[f+124>>2]|0)|0}else{wa=2}}while(0);c[B>>2]=wa;do{if((eb|Na)<<16>>16==0){wa=cb-Ka|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=Ta-Ga|0;wa=((wa|0)<0?0-wa|0:wa)>>>0>3|0}else{wa=2}}while(0);c[C>>2]=wa;do{if((bb|ab)<<16>>16==0){wa=gb-$a|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=_a-Ra|0;wa=((wa|0)<0?0-wa|0:wa)>>>0>3|0}else{wa=2}}while(0);c[D>>2]=wa;do{if((fb|bb)<<16>>16==0){wa=db-gb|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=Sa-_a|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=(c[f+128>>2]|0)!=(c[f+124>>2]|0)|0}else{wa=2}}while(0);c[E>>2]=wa;do{if((ob|fb)<<16>>16==0){wa=kb-db|0;if(((wa|0)<0?0-wa|0:wa)>>>0>3){wa=1;break}wa=jb-Sa|0;wa=((wa|0)<0?0-wa|0:wa)>>>0>3|0}else{wa=2}}while(0);c[F>>2]=wa;break}}}while(0);if((va|0)!=0){break}if((c[e>>2]|0)!=0){break}if((c[H>>2]|0)!=0){break}if((c[I>>2]|0)!=0){break}if((c[J>>2]|0)!=0){break}if((c[R>>2]|0)!=0){break}if((c[Q>>2]|0)!=0){break}if((c[P>>2]|0)!=0){break}if((c[O>>2]|0)!=0){break}if((c[N>>2]|0)!=0){break}if((c[M>>2]|0)!=0){break}if((c[L>>2]|0)!=0){break}if((c[K>>2]|0)!=0){break}if((c[ba>>2]|0)!=0){break}if((c[v>>2]|0)!=0){break}if((c[w>>2]|0)!=0){break}if((c[x>>2]|0)!=0){break}if((c[y>>2]|0)!=0){break}if((c[z>>2]|0)!=0){break}if((c[A>>2]|0)!=0){break}if((c[B>>2]|0)!=0){break}if((c[C>>2]|0)!=0){break}if((c[D>>2]|0)!=0){break}if((c[E>>2]|0)!=0){break}if((c[F>>2]|0)==0){break a}}}while(0);xa=f+20|0;ya=c[xa>>2]|0;wa=f+12|0;va=(c[wa>>2]|0)+ya|0;if((va|0)<0){Ba=0}else{Ba=(va|0)>51?51:va}va=f+16|0;za=(c[va>>2]|0)+ya|0;if((za|0)<0){Aa=0}else{Aa=(za|0)>51?51:za}za=d[1960+Ba|0]|0;c[$>>2]=za;Aa=d[2016+Aa|0]|0;c[S>>2]=Aa;Ba=2072+(Ba*3|0)|0;c[Y>>2]=Ba;do{if(!ta){Ca=c[(c[sa>>2]|0)+20>>2]|0;if((Ca|0)==(ya|0)){c[na>>2]=za;c[oa>>2]=Aa;c[ga>>2]=Ba;break}Da=(ya+1+Ca|0)>>>1;Ca=(c[wa>>2]|0)+Da|0;if((Ca|0)<0){Ca=0}else{Ca=(Ca|0)>51?51:Ca}Da=(c[va>>2]|0)+Da|0;if((Da|0)<0){Da=0}else{Da=(Da|0)>51?51:Da}c[na>>2]=d[1960+Ca|0]|0;c[oa>>2]=d[2016+Da|0]|0;c[ga>>2]=2072+(Ca*3|0)}}while(0);do{if(!ua){Ca=c[(c[ra>>2]|0)+20>>2]|0;if((Ca|0)==(ya|0)){c[ja>>2]=za;c[ia>>2]=Aa;c[ha>>2]=Ba;break}za=(ya+1+Ca|0)>>>1;ya=(c[wa>>2]|0)+za|0;if((ya|0)<0){ya=0}else{ya=(ya|0)>51?51:ya}za=(c[va>>2]|0)+za|0;if((za|0)<0){za=0}else{za=(za|0)>51?51:za}c[ja>>2]=d[1960+ya|0]|0;c[ia>>2]=d[2016+za|0]|0;c[ha>>2]=2072+(ya*3|0)}}while(0);ya=_(pa,k)|0;Aa=3;Ea=0;za=(c[h>>2]|0)+((ya<<8)+(qa<<4))|0;Ba=p;while(1){Ca=c[Ba+4>>2]|0;if((Ca|0)!=0){Ya(za,Ca,fa,ea)}Ca=c[Ba+12>>2]|0;if((Ca|0)!=0){Ya(za+4|0,Ca,ca,ea)}Ca=Ba+16|0;Da=c[Ba+20>>2]|0;if((Da|0)!=0){Ya(za+8|0,Da,ca,ea)}Da=Ba+24|0;Fa=c[Ba+28>>2]|0;if((Fa|0)!=0){Ya(za+12|0,Fa,ca,ea)}Fa=c[Ba>>2]|0;Ga=Ba+8|0;Ha=c[Ga>>2]|0;d:do{if((Fa|0)==(Ha|0)){if((Fa|0)!=(c[Ca>>2]|0)){g=362;break}if((Fa|0)!=(c[Da>>2]|0)){g=362;break}if((Fa|0)==0){break}Ca=c[j+(Ea*12|0)+4>>2]|0;Da=c[j+(Ea*12|0)+8>>2]|0;if(!(Fa>>>0<4)){Ea=(Ca>>>2)+2|0;Fa=za;Ia=16;while(1){Na=Fa+aa|0;Ha=d[Na]|0;Ma=Fa+da|0;Ka=d[Ma]|0;Ga=d[Fa]|0;La=Fa+ea|0;Ja=d[La]|0;Oa=Ka-Ga|0;Qa=(Oa|0)<0?0-Oa|0:Oa;e:do{if(Qa>>>0<Ca>>>0){Oa=Ha-Ka|0;if(!(((Oa|0)<0?0-Oa|0:Oa)>>>0<Da>>>0)){break}Oa=Ja-Ga|0;if(!(((Oa|0)<0?0-Oa|0:Oa)>>>0<Da>>>0)){break}Ra=Fa+U|0;Sa=d[Ra]|0;Oa=Fa+Z|0;Pa=d[Oa]|0;do{if(Qa>>>0<Ea>>>0){Qa=Sa-Ka|0;if(((Qa|0)<0?0-Qa|0:Qa)>>>0<Da>>>0){sb=Ka+Ha+Ga|0;a[Ma]=(Ja+4+(sb<<1)+Sa|0)>>>3;a[Na]=(sb+2+Sa|0)>>>2;a[Ra]=(sb+4+(Sa*3|0)+(d[Fa+V|0]<<1)|0)>>>3}else{a[Ma]=(Ka+2+(Ha<<1)+Ja|0)>>>2}Ma=Pa-Ga|0;if(!(((Ma|0)<0?0-Ma|0:Ma)>>>0<Da>>>0)){break}sb=Ga+Ka+Ja|0;a[Fa]=(Ha+4+(sb<<1)+Pa|0)>>>3;a[La]=(sb+2+Pa|0)>>>2;a[Oa]=(sb+4+(Pa*3|0)+(d[Fa+W|0]<<1)|0)>>>3;break e}else{a[Ma]=(Ka+2+(Ha<<1)+Ja|0)>>>2}}while(0);a[Fa]=(Ha+2+Ga+(Ja<<1)|0)>>>2}}while(0);Ia=Ia+ -1|0;if((Ia|0)==0){break d}else{Fa=Fa+1|0}}}Ea=d[(c[j+(Ea*12|0)>>2]|0)+(Fa+ -1)|0]|0;Fa=0-Ea|0;Ha=Ea+1|0;Ga=za;La=16;while(1){Pa=Ga+aa|0;Na=d[Pa]|0;Ja=Ga+da|0;Ka=d[Ja]|0;Ia=d[Ga]|0;Oa=Ga+ea|0;Ma=d[Oa]|0;Qa=Ka-Ia|0;do{if(((Qa|0)<0?0-Qa|0:Qa)>>>0<Ca>>>0){Qa=Na-Ka|0;if(!(((Qa|0)<0?0-Qa|0:Qa)>>>0<Da>>>0)){break}Qa=Ma-Ia|0;if(!(((Qa|0)<0?0-Qa|0:Qa)>>>0<Da>>>0)){break}Ra=d[Ga+U|0]|0;Qa=Ra-Ka|0;if(((Qa|0)<0?0-Qa|0:Qa)>>>0<Da>>>0){Qa=((Ka+1+Ia|0)>>>1)-(Na<<1)+Ra>>1;if((Qa|0)<(Fa|0)){Qa=Fa}else{Qa=(Qa|0)>(Ea|0)?Ea:Qa}a[Pa]=Qa+Na;Pa=Ha}else{Pa=Ea}Qa=d[Ga+Z|0]|0;Ra=Qa-Ia|0;if(((Ra|0)<0?0-Ra|0:Ra)>>>0<Da>>>0){Qa=((Ka+1+Ia|0)>>>1)-(Ma<<1)+Qa>>1;if((Qa|0)<(Fa|0)){Qa=Fa}else{Qa=(Qa|0)>(Ea|0)?Ea:Qa}a[Oa]=Qa+Ma;Pa=Pa+1|0}Na=Na+4-Ma+(Ia-Ka<<2)>>3;Ma=0-Pa|0;if((Na|0)>=(Ma|0)){Ma=(Na|0)>(Pa|0)?Pa:Na}sb=a[4712+((Ia|512)-Ma)|0]|0;a[Ja]=a[4712+(Ma+(Ka|512))|0]|0;a[Ga]=sb}}while(0);La=La+ -1|0;if((La|0)==0){break}else{Ga=Ga+1|0}}}else{g=362}}while(0);do{if((g|0)==362){g=0;if((Fa|0)!=0){Za(za,Fa,j+(Ea*12|0)|0,ea);Ha=c[Ga>>2]|0}if((Ha|0)!=0){Za(za+4|0,Ha,j+(Ea*12|0)|0,ea)}Ca=c[Ca>>2]|0;if((Ca|0)!=0){Za(za+8|0,Ca,j+(Ea*12|0)|0,ea)}Ca=c[Da>>2]|0;if((Ca|0)==0){break}Za(za+12|0,Ca,j+(Ea*12|0)|0,ea)}}while(0);if((Aa|0)==0){break}else{Aa=Aa+ -1|0;Ea=2;za=za+X|0;Ba=Ba+32|0}}za=c[f+24>>2]|0;Aa=(c[xa>>2]|0)+za|0;if((Aa|0)<0){Aa=0}else{Aa=(Aa|0)>51?51:Aa}Aa=c[8408+(Aa<<2)>>2]|0;Ba=(c[wa>>2]|0)+Aa|0;if((Ba|0)<0){Da=0}else{Da=(Ba|0)>51?51:Ba}Ba=(c[va>>2]|0)+Aa|0;if((Ba|0)<0){Ca=0}else{Ca=(Ba|0)>51?51:Ba}Ba=d[1960+Da|0]|0;c[$>>2]=Ba;Ca=d[2016+Ca|0]|0;c[S>>2]=Ca;Da=2072+(Da*3|0)|0;c[Y>>2]=Da;do{if(!ta){sa=c[(c[sa>>2]|0)+20>>2]|0;if((sa|0)==(c[xa>>2]|0)){c[na>>2]=Ba;c[oa>>2]=Ca;c[ga>>2]=Da;break}sa=sa+za|0;if((sa|0)<0){sa=0}else{sa=(sa|0)>51?51:sa}ta=(Aa+1+(c[8408+(sa<<2)>>2]|0)|0)>>>1;sa=ta+(c[wa>>2]|0)|0;if((sa|0)<0){sa=0}else{sa=(sa|0)>51?51:sa}ta=(c[va>>2]|0)+ta|0;if((ta|0)<0){ta=0}else{ta=(ta|0)>51?51:ta}c[na>>2]=d[1960+sa|0]|0;c[oa>>2]=d[2016+ta|0]|0;c[ga>>2]=2072+(sa*3|0)}}while(0);do{if(!ua){ra=c[(c[ra>>2]|0)+20>>2]|0;if((ra|0)==(c[xa>>2]|0)){c[ja>>2]=Ba;c[ia>>2]=Ca;c[ha>>2]=Da;break}ra=ra+za|0;if((ra|0)<0){ra=0}else{ra=(ra|0)>51?51:ra}ra=(Aa+1+(c[8408+(ra<<2)>>2]|0)|0)>>>1;sa=ra+(c[wa>>2]|0)|0;if((sa|0)<0){sa=0}else{sa=(sa|0)>51?51:sa}ra=(c[va>>2]|0)+ra|0;if((ra|0)<0){ra=0}else{ra=(ra|0)>51?51:ra}c[ja>>2]=d[1960+sa|0]|0;c[ia>>2]=d[2016+ra|0]|0;c[ha>>2]=2072+(sa*3|0)}}while(0);ua=c[h>>2]|0;sa=(qa<<3)+T+(ya<<6)|0;ra=ua+(sa+ka)|0;sa=ua+sa|0;ua=0;ta=p;va=0;while(1){xa=ta+4|0;wa=c[xa>>2]|0;if((wa|0)!=0){Va(sa,wa,fa,la);Va(ra,c[xa>>2]|0,fa,la)}xa=ta+36|0;wa=c[xa>>2]|0;if((wa|0)!=0){Va(sa+ea|0,wa,fa,la);Va(ra+ea|0,c[xa>>2]|0,fa,la)}wa=ta+16|0;ya=ta+20|0;xa=c[ya>>2]|0;if((xa|0)!=0){Va(sa+4|0,xa,ca,la);Va(ra+4|0,c[ya>>2]|0,ca,la)}ya=ta+52|0;xa=c[ya>>2]|0;if((xa|0)!=0){Va(sa+ma|0,xa,ca,la);Va(ra+ma|0,c[ya>>2]|0,ca,la)}ya=ta;za=c[ya>>2]|0;xa=ta+8|0;Aa=c[xa>>2]|0;do{if((za|0)==(Aa|0)){if((za|0)!=(c[wa>>2]|0)){g=411;break}if((za|0)!=(c[ta+24>>2]|0)){g=411;break}if((za|0)==0){break}sb=j+(ua*12|0)|0;Wa(sa,za,sb,la);Wa(ra,c[ya>>2]|0,sb,la)}else{g=411}}while(0);do{if((g|0)==411){g=0;if((za|0)!=0){Aa=j+(ua*12|0)|0;Xa(sa,za,Aa,la);Xa(ra,c[ya>>2]|0,Aa,la);Aa=c[xa>>2]|0}if((Aa|0)!=0){sb=j+(ua*12|0)|0;Xa(sa+2|0,Aa,sb,la);Xa(ra+2|0,c[xa>>2]|0,sb,la)}xa=c[wa>>2]|0;if((xa|0)!=0){sb=j+(ua*12|0)|0;Xa(sa+4|0,xa,sb,la);Xa(ra+4|0,c[wa>>2]|0,sb,la)}xa=ta+24|0;wa=c[xa>>2]|0;if((wa|0)==0){break}sb=j+(ua*12|0)|0;Xa(sa+6|0,wa,sb,la);Xa(ra+6|0,c[xa>>2]|0,sb,la)}}while(0);va=va+1|0;if((va|0)==2){break}else{ra=ra+Z|0;sa=sa+Z|0;ua=2;ta=ta+64|0}}}}while(0);qa=qa+1|0;ra=(qa|0)==(k|0);pa=(ra&1)+pa|0;if(pa>>>0<(c[G>>2]|0)>>>0){qa=ra?0:qa;f=f+216|0}else{break}}i=l;return}function Ua(a,d){a=a|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;e=i;w=a+28|0;f=b[a+32>>1]|0;if(f<<16>>16==0){g=(b[w>>1]|0)!=0?2:0}else{g=2}c[d+32>>2]=g;g=b[a+34>>1]|0;k=g<<16>>16==0;if(k){h=(b[a+30>>1]|0)!=0?2:0}else{h=2}c[d+40>>2]=h;h=b[a+40>>1]|0;l=h<<16>>16==0;if(l){j=(b[a+36>>1]|0)!=0?2:0}else{j=2}c[d+48>>2]=j;s=b[a+42>>1]|0;m=s<<16>>16==0;if(m){j=(b[a+38>>1]|0)!=0?2:0}else{j=2}c[d+56>>2]=j;o=b[a+44>>1]|0;if(o<<16>>16==0){j=f<<16>>16!=0?2:0}else{j=2}c[d+64>>2]=j;n=b[a+46>>1]|0;r=n<<16>>16==0;if(r){j=g<<16>>16!=0?2:0}else{j=2}c[d+72>>2]=j;j=b[a+52>>1]|0;q=j<<16>>16==0;if(q){p=h<<16>>16!=0?2:0}else{p=2}c[d+80>>2]=p;z=b[a+54>>1]|0;p=z<<16>>16==0;if(p){s=s<<16>>16!=0?2:0}else{s=2}c[d+88>>2]=s;s=b[a+48>>1]|0;if(s<<16>>16==0){t=o<<16>>16!=0?2:0}else{t=2}c[d+96>>2]=t;u=b[a+50>>1]|0;v=u<<16>>16==0;if(v){t=n<<16>>16!=0?2:0}else{t=2}c[d+104>>2]=t;t=b[a+56>>1]|0;x=t<<16>>16==0;if(x){y=j<<16>>16!=0?2:0}else{y=2}c[d+112>>2]=y;y=(b[a+58>>1]|0)==0;if(y){z=z<<16>>16!=0?2:0}else{z=2}c[d+120>>2]=z;z=b[a+30>>1]|0;if(z<<16>>16==0){w=(b[w>>1]|0)!=0?2:0}else{w=2}c[d+12>>2]=w;w=b[a+36>>1]|0;if(w<<16>>16==0){z=z<<16>>16!=0?2:0}else{z=2}c[d+20>>2]=z;if((b[a+38>>1]|0)==0){a=w<<16>>16!=0?2:0}else{a=2}c[d+28>>2]=a;if(k){f=f<<16>>16!=0?2:0}else{f=2}c[d+44>>2]=f;if(l){f=g<<16>>16!=0?2:0}else{f=2}c[d+52>>2]=f;if(m){f=h<<16>>16!=0?2:0}else{f=2}c[d+60>>2]=f;if(r){f=o<<16>>16!=0?2:0}else{f=2}c[d+76>>2]=f;if(q){f=n<<16>>16!=0?2:0}else{f=2}c[d+84>>2]=f;if(p){f=j<<16>>16!=0?2:0}else{f=2}c[d+92>>2]=f;if(v){f=s<<16>>16!=0?2:0}else{f=2}c[d+108>>2]=f;if(x){f=u<<16>>16!=0?2:0}else{f=2}c[d+116>>2]=f;if(!y){y=2;z=d+124|0;c[z>>2]=y;i=e;return}y=t<<16>>16!=0?2:0;z=d+124|0;c[z>>2]=y;i=e;return}function Va(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=i;m=b+ -1|0;p=a[b+1|0]|0;l=d[m]|0;k=d[b]|0;n=l-k|0;j=f+4|0;do{if(((n|0)<0?0-n|0:n)>>>0<(c[j>>2]|0)>>>0){n=d[b+ -2|0]|0;q=n-l|0;o=c[f+8>>2]|0;if(!(((q|0)<0?0-q|0:q)>>>0<o>>>0)){break}p=p&255;q=p-k|0;if(!(((q|0)<0?0-q|0:q)>>>0<o>>>0)){break}if(!(e>>>0<4)){a[m]=(l+2+p+(n<<1)|0)>>>2;a[b]=(k+2+(p<<1)+n|0)>>>2;break}q=d[(c[f>>2]|0)+(e+ -1)|0]|0;o=q+1|0;p=4-p+(k-l<<2)+n>>3;n=~q;if((p|0)>=(n|0)){n=(p|0)>(o|0)?o:p}q=a[4712+((k|512)-n)|0]|0;a[m]=a[4712+((l|512)+n)|0]|0;a[b]=q}}while(0);n=b+g|0;l=b+(g+ -1)|0;k=d[l]|0;m=d[n]|0;o=k-m|0;if(!(((o|0)<0?0-o|0:o)>>>0<(c[j>>2]|0)>>>0)){i=h;return}j=d[b+(g+ -2)|0]|0;p=j-k|0;o=c[f+8>>2]|0;if(!(((p|0)<0?0-p|0:p)>>>0<o>>>0)){i=h;return}g=d[b+(g+1)|0]|0;b=g-m|0;if(!(((b|0)<0?0-b|0:b)>>>0<o>>>0)){i=h;return}if(!(e>>>0<4)){a[l]=(k+2+g+(j<<1)|0)>>>2;a[n]=(m+2+(g<<1)+j|0)>>>2;i=h;return}e=d[(c[f>>2]|0)+(e+ -1)|0]|0;f=e+1|0;g=4-g+(m-k<<2)+j>>3;e=~e;if((g|0)>=(e|0)){e=(g|0)>(f|0)?f:g}q=a[4712+((m|512)-e)|0]|0;a[l]=a[4712+((k|512)+e)|0]|0;a[n]=q;i=h;return}function Wa(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;h=i;if(!(e>>>0<4)){k=0-g|0;j=f+4|0;e=k<<1;l=f+8|0;o=7;while(1){m=b+k|0;r=a[b+g|0]|0;f=d[m]|0;n=d[b]|0;p=f-n|0;do{if(((p|0)<0?0-p|0:p)>>>0<(c[j>>2]|0)>>>0){q=d[b+e|0]|0;s=q-f|0;p=c[l>>2]|0;if(!(((s|0)<0?0-s|0:s)>>>0<p>>>0)){break}s=r&255;r=s-n|0;if(!(((r|0)<0?0-r|0:r)>>>0<p>>>0)){break}a[m]=(f+2+s+(q<<1)|0)>>>2;a[b]=(n+2+(s<<1)+q|0)>>>2}}while(0);if((o|0)==0){break}b=b+1|0;o=o+ -1|0}i=h;return}o=d[(c[f>>2]|0)+(e+ -1)|0]|0;l=o+1|0;e=0-g|0;j=f+4|0;k=e<<1;m=f+8|0;f=~o;o=7;while(1){q=b+e|0;t=a[b+g|0]|0;p=d[q]|0;n=d[b]|0;r=p-n|0;do{if(((r|0)<0?0-r|0:r)>>>0<(c[j>>2]|0)>>>0){s=d[b+k|0]|0;u=s-p|0;r=c[m>>2]|0;if(!(((u|0)<0?0-u|0:u)>>>0<r>>>0)){break}u=t&255;t=u-n|0;if(!(((t|0)<0?0-t|0:t)>>>0<r>>>0)){break}r=4-u+(n-p<<2)+s>>3;if((r|0)<(f|0)){r=f}else{r=(r|0)>(l|0)?l:r}u=a[4712+((n|512)-r)|0]|0;a[q]=a[4712+((p|512)+r)|0]|0;a[b]=u}}while(0);if((o|0)==0){break}b=b+1|0;o=o+ -1|0}i=h;return}function Xa(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;h=i;s=d[(c[f>>2]|0)+(e+ -1)|0]|0;e=s+1|0;n=0-g|0;l=f+4|0;k=n<<1;j=f+8|0;f=~s;n=b+n|0;s=a[b+g|0]|0;o=d[n]|0;m=d[b]|0;q=o-m|0;p=c[l>>2]|0;do{if(((q|0)<0?0-q|0:q)>>>0<p>>>0){q=d[b+k|0]|0;t=q-o|0;r=c[j>>2]|0;if(!(((t|0)<0?0-t|0:t)>>>0<r>>>0)){break}s=s&255;t=s-m|0;if(!(((t|0)<0?0-t|0:t)>>>0<r>>>0)){break}p=4-s+(m-o<<2)+q>>3;if((p|0)<(f|0)){p=f}else{p=(p|0)>(e|0)?e:p}t=a[4712+((m|512)-p)|0]|0;a[n]=a[4712+((o|512)+p)|0]|0;a[b]=t;p=c[l>>2]|0}}while(0);n=b+1|0;l=b+(1-g)|0;m=d[l]|0;o=d[n]|0;q=m-o|0;if(!(((q|0)<0?0-q|0:q)>>>0<p>>>0)){i=h;return}k=d[b+(k|1)|0]|0;p=k-m|0;j=c[j>>2]|0;if(!(((p|0)<0?0-p|0:p)>>>0<j>>>0)){i=h;return}b=d[b+(g+1)|0]|0;g=b-o|0;if(!(((g|0)<0?0-g|0:g)>>>0<j>>>0)){i=h;return}b=4-b+(o-m<<2)+k>>3;if((b|0)>=(f|0)){f=(b|0)>(e|0)?e:b}t=a[4712+((o|512)-f)|0]|0;a[l]=a[4712+((m|512)+f)|0]|0;a[n]=t;i=h;return}function Ya(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;k=i;h=c[f+4>>2]|0;j=c[f+8>>2]|0;if(!(e>>>0<4)){e=(h>>>2)+2|0;n=4;while(1){q=b+ -2|0;f=d[q]|0;r=b+ -1|0;p=d[r]|0;o=d[b]|0;l=b+1|0;m=d[l]|0;s=p-o|0;t=(s|0)<0?0-s|0:s;a:do{if(t>>>0<h>>>0){s=f-p|0;if(!(((s|0)<0?0-s|0:s)>>>0<j>>>0)){break}s=m-o|0;if(!(((s|0)<0?0-s|0:s)>>>0<j>>>0)){break}v=b+ -3|0;w=d[v]|0;u=b+2|0;s=d[u]|0;do{if(t>>>0<e>>>0){t=w-p|0;if(((t|0)<0?0-t|0:t)>>>0<j>>>0){t=p+f+o|0;a[r]=(m+4+(t<<1)+w|0)>>>3;a[q]=(t+2+w|0)>>>2;a[v]=(t+4+(w*3|0)+((d[b+ -4|0]|0)<<1)|0)>>>3}else{a[r]=(p+2+(f<<1)+m|0)>>>2}q=s-o|0;if(!(((q|0)<0?0-q|0:q)>>>0<j>>>0)){break}w=o+p+m|0;a[b]=(f+4+(w<<1)+s|0)>>>3;a[l]=(w+2+s|0)>>>2;a[u]=(w+4+(s*3|0)+((d[b+3|0]|0)<<1)|0)>>>3;break a}else{a[r]=(p+2+(f<<1)+m|0)>>>2}}while(0);a[b]=(f+2+o+(m<<1)|0)>>>2}}while(0);n=n+ -1|0;if((n|0)==0){break}else{b=b+g|0}}i=k;return}f=d[(c[f>>2]|0)+(e+ -1)|0]|0;l=0-f|0;e=f+1|0;p=4;while(1){t=b+ -2|0;q=d[t]|0;n=b+ -1|0;o=d[n]|0;m=d[b]|0;s=b+1|0;r=d[s]|0;u=o-m|0;do{if(((u|0)<0?0-u|0:u)>>>0<h>>>0){u=q-o|0;if(!(((u|0)<0?0-u|0:u)>>>0<j>>>0)){break}u=r-m|0;if(!(((u|0)<0?0-u|0:u)>>>0<j>>>0)){break}w=d[b+ -3|0]|0;u=d[b+2|0]|0;v=w-o|0;if(((v|0)<0?0-v|0:v)>>>0<j>>>0){v=((o+1+m|0)>>>1)-(q<<1)+w>>1;if((v|0)<(l|0)){v=l}else{v=(v|0)>(f|0)?f:v}a[t]=v+q;t=e}else{t=f}v=u-m|0;if(((v|0)<0?0-v|0:v)>>>0<j>>>0){u=((o+1+m|0)>>>1)-(r<<1)+u>>1;if((u|0)<(l|0)){u=l}else{u=(u|0)>(f|0)?f:u}a[s]=u+r;t=t+1|0}q=q+4-r+(m-o<<2)>>3;r=0-t|0;if((q|0)>=(r|0)){r=(q|0)>(t|0)?t:q}w=a[4712+((m|512)-r)|0]|0;a[n]=a[4712+((o|512)+r)|0]|0;a[b]=w}}while(0);p=p+ -1|0;if((p|0)==0){break}else{b=b+g|0}}i=k;return}function Za(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;h=i;j=d[(c[f>>2]|0)+(e+ -1)|0]|0;e=0-g|0;k=e<<1;l=f+4|0;f=f+8|0;m=_(g,-3)|0;p=0-j|0;o=j+1|0;n=g<<1;q=3;while(1){x=b+k|0;t=b+e|0;v=b+g|0;w=a[v]|0;s=d[t]|0;r=d[b]|0;u=s-r|0;do{if(((u|0)<0?0-u|0:u)>>>0<(c[l>>2]|0)>>>0){u=d[x]|0;z=u-s|0;y=c[f>>2]|0;if(!(((z|0)<0?0-z|0:z)>>>0<y>>>0)){break}w=w&255;z=w-r|0;if(!(((z|0)<0?0-z|0:z)>>>0<y>>>0)){break}A=d[b+m|0]|0;z=A-s|0;if(((z|0)<0?0-z|0:z)>>>0<y>>>0){y=((s+1+r|0)>>>1)-(u<<1)+A>>1;if((y|0)<(p|0)){y=p}else{y=(y|0)>(j|0)?j:y}a[x]=y+u;y=c[f>>2]|0;x=o}else{x=j}z=d[b+n|0]|0;A=z-r|0;if(((A|0)<0?0-A|0:A)>>>0<y>>>0){y=((s+1+r|0)>>>1)-(w<<1)+z>>1;if((y|0)<(p|0)){y=p}else{y=(y|0)>(j|0)?j:y}a[v]=y+w;x=x+1|0}v=4-w+(r-s<<2)+u>>3;u=0-x|0;if((v|0)>=(u|0)){u=(v|0)>(x|0)?x:v}A=a[4712+((r|512)-u)|0]|0;a[t]=a[4712+((s|512)+u)|0]|0;a[b]=A}}while(0);if((q|0)==0){break}b=b+1|0;q=q+ -1|0}i=h;return}function _a(a,b){a=a|0;b=b|0;var d=0,e=0;d=i;vc(a);e=Xc(2112)|0;c[a+3376>>2]=e;do{if((e|0)==0){a=1}else{if((b|0)==0){a=0;break}c[a+1216>>2]=1;a=0}}while(0);i=d;return a|0}function $a(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;g=i;i=i+8|0;j=g;l=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;v=i;i=i+8|0;u=i;i=i+8|0;x=i;i=i+8|0;z=i;i=i+8|0;C=i;i=i+8|0;D=i;i=i+8|0;o=i;i=i+8|0;E=i;i=i+8|0;w=i;i=i+8|0;k=i;i=i+8|0;p=k;A=i;i=i+96|0;y=i;i=i+72|0;h=i;i=i+24|0;B=i;i=i+8|0;s=i;i=i+8|0;c[B>>2]=0;t=a+3344|0;do{if((c[t>>2]|0)==0){n=4}else{if((c[a+3348>>2]|0)!=(b|0)){n=4;break}b=h;E=a+3356|0;c[b+0>>2]=c[E+0>>2];c[b+4>>2]=c[E+4>>2];c[b+8>>2]=c[E+8>>2];c[b+12>>2]=c[E+12>>2];c[h+4>>2]=c[h>>2];c[h+8>>2]=0;c[h+16>>2]=0;c[f>>2]=c[a+3352>>2]}}while(0);do{if((n|0)==4){if((Oa(b,d,h,f)|0)==0){E=a+3356|0;d=h;c[E+0>>2]=c[d+0>>2];c[E+4>>2]=c[d+4>>2];c[E+8>>2]=c[d+8>>2];c[E+12>>2]=c[d+12>>2];c[E+16>>2]=c[d+16>>2];c[a+3352>>2]=c[f>>2];c[a+3348>>2]=b;break}b=c[m>>2]|0;c[E>>2]=2248;pa(b|0,2232,E|0)|0;b=3;i=g;return b|0}}while(0);c[t>>2]=0;if((Nb(h,p)|0)!=0){b=c[m>>2]|0;c[o>>2]=2264;pa(b|0,2232,o|0)|0;b=3;i=g;return b|0}o=k;b=c[o>>2]|0;if((b|0)==0|b>>>0>12){b=0;i=g;return b|0}d=Dc(h,p,a,B)|0;if((d|0)!=0){b=c[m>>2]|0;c[D>>2]=2280;pa(b|0,2232,D|0)|0;b=(d|0)==65520?4:3;i=g;return b|0}a:do{if((c[B>>2]|0)==0){n=22}else{do{if((c[a+1184>>2]|0)!=0){if((c[a+16>>2]|0)==0){break}if((c[a+3380>>2]|0)!=0){b=c[m>>2]|0;c[C>>2]=2312;pa(b|0,2232,C|0)|0;b=3;i=g;return b|0}if((c[a+1188>>2]|0)==0){E=a+1220|0;b=a+1336|0;c[b>>2]=ob(E)|0;sb(E);Qa(a,b,0)|0}else{Qa(a,a+1336|0,c[a+1372>>2]|0)|0}c[f>>2]=0;c[t>>2]=1;c[a+1180>>2]=0;o=a+1360|0;k=a+1336|0;break a}}while(0);c[a+1188>>2]=0;c[a+1180>>2]=0;n=22}}while(0);do{if((n|0)==22){B=c[o>>2]|0;if((B|0)==8){if((Wb(h,y)|0)==0){xc(a,y)|0;b=0;i=g;return b|0}else{b=c[m>>2]|0;c[x>>2]=2368;pa(b|0,2232,x|0)|0;b=y+20|0;Yc(c[b>>2]|0);c[b>>2]=0;b=y+24|0;Yc(c[b>>2]|0);c[b>>2]=0;b=y+28|0;Yc(c[b>>2]|0);c[b>>2]=0;b=y+44|0;Yc(c[b>>2]|0);c[b>>2]=0;b=3;i=g;return b|0}}else if((B|0)==1|(B|0)==5){x=a+1180|0;if((c[x>>2]|0)!=0){b=0;i=g;return b|0}c[a+1184>>2]=1;do{if((Ac(a)|0)!=0){c[a+1204>>2]=0;c[a+1208>>2]=e;oc(h,w)|0;e=a+8|0;y=c[e>>2]|0;w=yc(a,c[w>>2]|0,(c[o>>2]|0)==5|0)|0;if((w|0)!=0){b=c[m>>2]|0;c[u>>2]=2384;pa(b|0,2232,u|0)|0;c[a+4>>2]=256;c[a+12>>2]=0;c[e>>2]=32;c[a+16>>2]=0;c[a+3380>>2]=0;b=(w|0)==65535?5:4;i=g;return b|0}if((y|0)==(c[e>>2]|0)){break}k=c[a+16>>2]|0;c[s>>2]=1;j=a;l=c[j>>2]|0;if(l>>>0<32){l=c[a+(l<<2)+20>>2]|0}else{l=0}c[f>>2]=0;c[t>>2]=1;do{if((c[o>>2]|0)==5){b=uc(s,h,k,c[a+12>>2]|0,5)|0;if((c[s>>2]|b|0)!=0){n=42;break}if((c[a+1276>>2]|0)!=0|(l|0)==0){n=42;break}if((c[l+52>>2]|0)!=(c[k+52>>2]|0)){n=42;break}if((c[l+56>>2]|0)!=(c[k+56>>2]|0)){n=42;break}if((c[l+88>>2]|0)!=(c[k+88>>2]|0)){n=42;break}vb(a+1220|0)}else{n=42}}while(0);if((n|0)==42){c[a+1280>>2]=0}c[j>>2]=c[e>>2];b=2;i=g;return b|0}}while(0);if((c[a+3380>>2]|0)!=0){b=c[m>>2]|0;c[v>>2]=2312;pa(b|0,2232,v|0)|0;b=3;i=g;return b|0}s=a+1368|0;n=s;t=a+2356|0;f=a+16|0;if((nc(h,t,c[f>>2]|0,c[a+12>>2]|0,p)|0)!=0){b=c[m>>2]|0;c[r>>2]=2408;pa(b|0,2232,r|0)|0;b=3;i=g;return b|0}if((Ac(a)|0)==0){r=a+1220|0}else{r=a+1220|0;do{if((c[o>>2]|0)!=5){if((tb(r,c[a+2368>>2]|0,(c[p+4>>2]|0)!=0|0,c[(c[f>>2]|0)+48>>2]|0)|0)==0){break}b=c[m>>2]|0;c[q>>2]=2424;pa(b|0,2232,q|0)|0;b=3;i=g;return b|0}}while(0);c[a+1336>>2]=ob(r)|0}ad(s|0,t|0,988)|0;c[a+1188>>2]=1;o=a+1360|0;d=k;E=c[d+4>>2]|0;b=o;c[b>>2]=c[d>>2];c[b+4>>2]=E;Cc(a,c[a+1432>>2]|0);sb(r);if((kb(r,a+1436|0,c[a+1380>>2]|0,c[a+1412>>2]|0)|0)!=0){b=c[m>>2]|0;c[l>>2]=2448;pa(b|0,2232,l|0)|0;b=3;i=g;return b|0}k=a+1336|0;if((kc(h,a,k,n)|0)!=0){b=c[m>>2]|0;c[j>>2]=2464;pa(b|0,2232,j|0)|0;lc(a,c[s>>2]|0);b=3;i=g;return b|0}if((Bc(a)|0)==0){b=0;i=g;return b|0}else{c[x>>2]=1;break}}else if((B|0)==7){if((ic(h,A)|0)==0){wc(a,A)|0;b=0;i=g;return b|0}else{b=c[m>>2]|0;c[z>>2]=2352;pa(b|0,2232,z|0)|0;b=A+40|0;Yc(c[b>>2]|0);c[b>>2]=0;b=A+84|0;Yc(c[b>>2]|0);c[b>>2]=0;b=3;i=g;return b|0}}else{b=0;i=g;return b|0}}}while(0);Ta(k,c[a+1212>>2]|0);zc(a);h=Vb(a+1284|0,c[a+16>>2]|0,a+1368|0,o)|0;j=a+1188|0;do{if((c[j>>2]|0)!=0){l=a+1220|0;if((c[a+1364>>2]|0)==0){lb(l,0,k,c[a+1380>>2]|0,h,(c[o>>2]|0)==5|0,c[a+1208>>2]|0,c[a+1204>>2]|0)|0;break}else{lb(l,a+1644|0,k,c[a+1380>>2]|0,h,(c[o>>2]|0)==5|0,c[a+1208>>2]|0,c[a+1204>>2]|0)|0;break}}}while(0);c[a+1184>>2]=0;c[j>>2]=0;b=1;i=g;return b|0}function ab(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=0;while(1){e=a+(d<<2)+20|0;f=c[e>>2]|0;if((f|0)!=0){Yc(c[f+40>>2]|0);c[(c[e>>2]|0)+40>>2]=0;Yc(c[(c[e>>2]|0)+84>>2]|0);c[(c[e>>2]|0)+84>>2]=0;Yc(c[e>>2]|0);c[e>>2]=0}d=d+1|0;if((d|0)==32){d=0;break}}do{e=a+(d<<2)+148|0;f=c[e>>2]|0;if((f|0)!=0){Yc(c[f+20>>2]|0);c[(c[e>>2]|0)+20>>2]=0;Yc(c[(c[e>>2]|0)+24>>2]|0);c[(c[e>>2]|0)+24>>2]=0;Yc(c[(c[e>>2]|0)+28>>2]|0);c[(c[e>>2]|0)+28>>2]=0;Yc(c[(c[e>>2]|0)+44>>2]|0);c[(c[e>>2]|0)+44>>2]=0;Yc(c[e>>2]|0);c[e>>2]=0}d=d+1|0;}while((d|0)!=256);f=a+3376|0;Yc(c[f>>2]|0);c[f>>2]=0;f=a+1212|0;Yc(c[f>>2]|0);c[f>>2]=0;f=a+1172|0;Yc(c[f>>2]|0);c[f>>2]=0;rb(a+1220|0);i=b;return}function bb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;f=i;a=ub(a+1220|0)|0;if((a|0)==0){a=0;i=f;return a|0}c[b>>2]=c[a+4>>2];c[d>>2]=c[a+12>>2];c[e>>2]=c[a+8>>2];a=c[a>>2]|0;i=f;return a|0}function cb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;g=c[a+16>>2]|0;if((g|0)==0){h=0;j=0;g=0}else{k=c[g+52>>2]|0;h=c[g+56>>2]<<4;j=k<<6;g=k<<4}k=ub(a+1220|0)|0;if((k|0)==0){k=0;i=f;return k|0}c[b>>2]=c[k+4>>2];c[d>>2]=c[k+12>>2];c[e>>2]=c[k+8>>2];d=c[k>>2]|0;j=_(j,h)|0;if((d|0)==0){k=0;i=f;return k|0}e=a+3392|0;b=a+3388|0;k=c[b>>2]|0;if((c[e>>2]|0)>>>0<j>>>0){if((k|0)!=0){Yc(k)}c[e>>2]=j;k=Xc(j)|0;c[b>>2]=k}fb(g,h,d,k);k=c[a+3388>>2]|0;i=f;return k|0}function db(a){a=a|0;a=c[a+16>>2]|0;if((a|0)==0){a=0}else{a=c[a+52>>2]|0}i=i;return a|0}function eb(a){a=a|0;a=c[a+16>>2]|0;if((a|0)==0){a=0}else{a=c[a+56>>2]|0}i=i;return a|0}function fb(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;l=_(b,a)|0;j=(a|0)/2|0;if((b|0)<=0){i=g;return}h=0-j|0;k=e+l|0;l=e+(((_(j,b)|0)/2|0)+l)|0;j=0;do{m=0;do{o=(d[k]|0)+ -128|0;q=(d[l]|0)+ -128|0;p=((d[e]|0)*298|0)+ -4640|0;n=p+(q*409|0)>>8;if((n|0)<0){n=0}else{n=(n|0)>255?255:n}q=p+(_(o,-100)|0)+(_(q,-208)|0)>>8;if((q|0)<0){q=0}else{q=(q|0)>255?255:q}o=p+(o*516|0)>>8;do{if((o|0)<0){o=16711680}else{if((o|0)>255){o=16776960;break}o=(o<<8)+16711680|0}}while(0);c[f>>2]=(o+q<<8)+n;m=m+1|0;f=f+4|0;e=e+1|0;if((m&1|0)==0){k=k+1|0;l=l+1|0}}while((m|0)<(a|0));j=j+1|0;if((j&1|0)!=0){k=k+h|0;l=l+h|0}}while((j|0)<(b|0));i=g;return}function gb(a){a=a|0;var b=0;b=i;a=(Ec(a)|0)==0|0;i=b;return a|0}function hb(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0;h=i;a=c[a+16>>2]|0;do{if((a|0)!=0){if((c[a+60>>2]|0)==0){break}c[b>>2]=1;b=a+64|0;c[d>>2]=c[b>>2]<<1;c[e>>2]=(c[a+52>>2]<<4)-((c[a+68>>2]|0)+(c[b>>2]|0)<<1);e=a+72|0;c[f>>2]=c[e>>2]<<1;a=(c[a+56>>2]<<4)-((c[a+76>>2]|0)+(c[e>>2]|0)<<1)|0;c[g>>2]=a;i=h;return}}while(0);c[b>>2]=0;c[d>>2]=0;c[e>>2]=0;c[f>>2]=0;a=0;c[g>>2]=a;i=h;return}function ib(){var a=0,b=0;b=i;a=Xc(3396)|0;i=b;return a|0}function jb(a){a=a|0;var b=0;b=i;Yc(a);i=b;return}function kb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=i;j=a+40|0;l=c[j>>2]|0;if((l|0)!=0){g=a+32|0;h=c[a>>2]|0;k=0;do{if(((c[h+(k*40|0)+20>>2]|0)+ -1|0)>>>0<2){l=c[h+(k*40|0)+12>>2]|0;if(l>>>0>d>>>0){l=l-(c[g>>2]|0)|0}c[h+(k*40|0)+8>>2]=l;l=c[j>>2]|0}k=k+1|0;}while(k>>>0<l>>>0)}if((c[b>>2]|0)==0){q=0;i=f;return q|0}m=c[b+4>>2]|0;if(!(m>>>0<3)){q=0;i=f;return q|0}j=a+32|0;h=a+24|0;g=a;a=a+4|0;l=d;k=0;a:while(1){b:do{if(m>>>0<2){n=c[b+(k*12|0)+8>>2]|0;do{if((m|0)==0){l=l-n|0;if((l|0)>=0){break}l=(c[j>>2]|0)+l|0}else{q=n+l|0;l=c[j>>2]|0;l=q-((q|0)<(l|0)?0:l)|0}}while(0);if(l>>>0>d>>>0){q=l-(c[j>>2]|0)|0}else{q=l}p=c[h>>2]|0;if((p|0)==0){d=1;b=37;break a}o=c[g>>2]|0;m=0;while(1){n=c[o+(m*40|0)+20>>2]|0;if((n+ -1|0)>>>0<2){if((c[o+(m*40|0)+8>>2]|0)==(q|0)){break b}}m=m+1|0;if(!(m>>>0<p>>>0)){d=1;b=37;break a}}}else{n=c[b+(k*12|0)+12>>2]|0;p=c[h>>2]|0;if((p|0)==0){d=1;b=37;break a}o=c[g>>2]|0;m=0;while(1){if((c[o+(m*40|0)+20>>2]|0)==3){if((c[o+(m*40|0)+8>>2]|0)==(n|0)){n=3;break b}}m=m+1|0;if(!(m>>>0<p>>>0)){d=1;b=37;break a}}}}while(0);if(!((m|0)>-1&n>>>0>1)){d=1;b=37;break}if(k>>>0<e>>>0){n=e;while(1){o=n+ -1|0;q=c[a>>2]|0;c[q+(n<<2)>>2]=c[q+(o<<2)>>2];if(o>>>0>k>>>0){n=o}else{break}}o=c[g>>2]|0}n=k+1|0;c[(c[a>>2]|0)+(k<<2)>>2]=o+(m*40|0);if(!(n>>>0>e>>>0)){k=n;p=n;do{q=c[a>>2]|0;o=c[q+(k<<2)>>2]|0;if((o|0)!=((c[g>>2]|0)+(m*40|0)|0)){c[q+(p<<2)>>2]=o;p=p+1|0}k=k+1|0;}while(!(k>>>0>e>>>0))}m=c[b+(n*12|0)+4>>2]|0;if(m>>>0<3){k=n}else{d=0;b=37;break}}if((b|0)==37){i=f;return d|0}return 0}function lb(a,b,d,e,f,g,h,j){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;k=i;i=i+8|0;n=k;l=a+8|0;p=c[l>>2]|0;if((c[d>>2]|0)!=(c[p>>2]|0)){H=c[m>>2]|0;c[n>>2]=2496;pa(H|0,2480,n|0)|0;H=1;i=k;return H|0}q=a+52|0;c[q>>2]=0;d=a+56|0;n=(c[d>>2]|0)==0|0;a:do{if((b|0)==0){c[p+20>>2]=0;H=c[l>>2]|0;c[H+12>>2]=e;c[H+8>>2]=e;c[H+16>>2]=f;c[H+24>>2]=n;if((c[d>>2]|0)!=0){n=0;break}n=a+44|0;c[n>>2]=(c[n>>2]|0)+1;n=0}else{if((g|0)!=0){o=a+20|0;c[o>>2]=0;p=a+16|0;c[p>>2]=0;q=a;f=a+44|0;u=c[q>>2]|0;r=0;do{s=u+(r*40|0)+20|0;do{if((c[s>>2]|0)!=0){c[s>>2]=0;u=c[q>>2]|0;if((c[u+(r*40|0)+24>>2]|0)!=0){break}c[f>>2]=(c[f>>2]|0)+ -1}}while(0);r=r+1|0;}while((r|0)!=16);t=c[d>>2]|0;b:do{if((t|0)==0){s=a+28|0;r=a+12|0;while(1){t=c[s>>2]|0;v=0;y=2147483647;w=0;do{if((c[u+(v*40|0)+24>>2]|0)!=0){z=c[u+(v*40|0)+16>>2]|0;x=(z|0)<(y|0);y=x?z:y;w=x?u+(v*40|0)|0:w}v=v+1|0;}while(!(v>>>0>t>>>0));if((w|0)==0){t=0;break b}G=c[p>>2]|0;c[(c[r>>2]|0)+(G<<4)>>2]=c[w>>2];H=c[r>>2]|0;c[H+(G<<4)+12>>2]=c[w+36>>2];c[H+(c[p>>2]<<4)+4>>2]=c[w+28>>2];c[H+(c[p>>2]<<4)+8>>2]=c[w+32>>2];c[p>>2]=(c[p>>2]|0)+1;c[w+24>>2]=0;if((c[w+20>>2]|0)==0){c[f>>2]=(c[f>>2]|0)+ -1}t=c[d>>2]|0;if((t|0)!=0){break b}u=c[q>>2]|0}}}while(0);r=a+40|0;c[r>>2]=0;q=a+36|0;c[q>>2]=65535;c[a+48>>2]=0;if((c[b>>2]|t|0)!=0){c[p>>2]=0;c[o>>2]=0}b=(c[b+4>>2]|0)==0;c[(c[l>>2]|0)+20>>2]=b?2:3;c[q>>2]=b?65535:0;H=c[l>>2]|0;c[H+12>>2]=0;c[H+8>>2]=0;c[H+16>>2]=0;c[H+24>>2]=n;c[f>>2]=1;c[r>>2]=1;n=0;break}do{if((c[b+8>>2]|0)==0){o=a+40|0;p=c[o>>2]|0;if(p>>>0<(c[a+24>>2]|0)>>>0){b=0;break}if((p|0)==0){p=0;b=1;break}b=a;q=c[b>>2]|0;s=0;r=-1;t=0;do{if(((c[q+(s*40|0)+20>>2]|0)+ -1|0)>>>0<2){u=c[q+(s*40|0)+8>>2]|0;v=(u|0)<(t|0)|(r|0)==-1;r=v?s:r;t=v?u:t}s=s+1|0;}while((s|0)!=(p|0));if(!((r|0)>-1)){b=1;break}c[q+(r*40|0)+20>>2]=0;p=(c[o>>2]|0)+ -1|0;c[o>>2]=p;if((c[(c[b>>2]|0)+(r*40|0)+24>>2]|0)!=0){b=0;break}b=a+44|0;c[b>>2]=(c[b>>2]|0)+ -1;b=0}else{u=a+24|0;v=a;p=a+40|0;w=a+44|0;t=a+36|0;r=a+48|0;x=a+28|0;z=a+16|0;y=a+12|0;A=0;s=0;c:while(1){d:do{switch(c[b+(A*20|0)+12>>2]|0){case 5:{B=c[v>>2]|0;e=0;do{C=B+(e*40|0)+20|0;do{if((c[C>>2]|0)!=0){c[C>>2]=0;B=c[v>>2]|0;if((c[B+(e*40|0)+24>>2]|0)!=0){break}c[w>>2]=(c[w>>2]|0)+ -1}}while(0);e=e+1|0;}while((e|0)!=16);e:do{if((c[d>>2]|0)==0){while(1){e=c[x>>2]|0;C=0;E=2147483647;F=0;do{if((c[B+(C*40|0)+24>>2]|0)!=0){G=c[B+(C*40|0)+16>>2]|0;D=(G|0)<(E|0);E=D?G:E;F=D?B+(C*40|0)|0:F}C=C+1|0;}while(!(C>>>0>e>>>0));if((F|0)==0){break e}G=c[z>>2]|0;c[(c[y>>2]|0)+(G<<4)>>2]=c[F>>2];H=c[y>>2]|0;c[H+(G<<4)+12>>2]=c[F+36>>2];c[H+(c[z>>2]<<4)+4>>2]=c[F+28>>2];c[H+(c[z>>2]<<4)+8>>2]=c[F+32>>2];c[z>>2]=(c[z>>2]|0)+1;c[F+24>>2]=0;if((c[F+20>>2]|0)==0){c[w>>2]=(c[w>>2]|0)+ -1}if((c[d>>2]|0)!=0){break e}B=c[v>>2]|0}}}while(0);c[p>>2]=0;c[t>>2]=65535;c[r>>2]=0;c[q>>2]=1;e=0;break};case 1:{D=e-(c[b+(A*20|0)+16>>2]|0)|0;B=c[u>>2]|0;if((B|0)==0){b=1;break c}C=c[v>>2]|0;E=0;while(1){F=C+(E*40|0)+20|0;if(((c[F>>2]|0)+ -1|0)>>>0<2){if((c[C+(E*40|0)+8>>2]|0)==(D|0)){break}}E=E+1|0;if(!(E>>>0<B>>>0)){b=1;break c}}if((E|0)<0){b=1;break c}c[F>>2]=0;c[p>>2]=(c[p>>2]|0)+ -1;if((c[(c[v>>2]|0)+(E*40|0)+24>>2]|0)!=0){break d}c[w>>2]=(c[w>>2]|0)+ -1;break};case 2:{C=c[b+(A*20|0)+20>>2]|0;D=c[u>>2]|0;if((D|0)==0){b=1;break c}B=c[v>>2]|0;F=0;while(1){E=B+(F*40|0)+20|0;if((c[E>>2]|0)==3){if((c[B+(F*40|0)+8>>2]|0)==(C|0)){break}}F=F+1|0;if(!(F>>>0<D>>>0)){b=1;break c}}if((F|0)<0){b=1;break c}c[E>>2]=0;c[p>>2]=(c[p>>2]|0)+ -1;if((c[(c[v>>2]|0)+(F*40|0)+24>>2]|0)!=0){break d}c[w>>2]=(c[w>>2]|0)+ -1;break};case 4:{B=c[b+(A*20|0)+28>>2]|0;c[t>>2]=B;if((c[u>>2]|0)==0){break d}D=c[v>>2]|0;C=0;do{E=D+(C*40|0)+20|0;do{if((c[E>>2]|0)==3){if(!((c[D+(C*40|0)+8>>2]|0)>>>0>B>>>0)){if((c[t>>2]|0)!=65535){break}}c[E>>2]=0;c[p>>2]=(c[p>>2]|0)+ -1;D=c[v>>2]|0;if((c[D+(C*40|0)+24>>2]|0)!=0){break}c[w>>2]=(c[w>>2]|0)+ -1}}while(0);C=C+1|0;}while(C>>>0<(c[u>>2]|0)>>>0);break};case 3:{C=c[b+(A*20|0)+16>>2]|0;B=c[b+(A*20|0)+24>>2]|0;H=c[t>>2]|0;if((H|0)==65535|H>>>0<B>>>0){b=1;break c}F=c[u>>2]|0;if((F|0)==0){b=1;break c}E=c[v>>2]|0;D=0;do{G=E+(D*40|0)+20|0;if((c[G>>2]|0)==3){if((c[E+(D*40|0)+8>>2]|0)==(B|0)){o=50;break}}D=D+1|0;}while(D>>>0<F>>>0);do{if((o|0)==50){o=0;c[G>>2]=0;c[p>>2]=(c[p>>2]|0)+ -1;E=c[v>>2]|0;if((c[E+(D*40|0)+24>>2]|0)!=0){break}c[w>>2]=(c[w>>2]|0)+ -1}}while(0);D=c[u>>2]|0;C=e-C|0;if((D|0)==0){b=1;break c}else{F=0}while(1){G=E+(F*40|0)+20|0;H=c[G>>2]|0;if((H+ -1|0)>>>0<2){if((c[E+(F*40|0)+8>>2]|0)==(C|0)){break}}F=F+1|0;if(!(F>>>0<D>>>0)){b=1;break c}}if(!((F|0)>-1&H>>>0>1)){b=1;break c}c[G>>2]=3;c[(c[v>>2]|0)+(F*40|0)+8>>2]=B;break};case 6:{B=c[b+(A*20|0)+24>>2]|0;H=c[t>>2]|0;if((H|0)==65535|H>>>0<B>>>0){b=1;o=104;break c}D=c[u>>2]|0;f:do{if((D|0)==0){o=91}else{C=c[v>>2]|0;E=0;while(1){F=C+(E*40|0)+20|0;if((c[F>>2]|0)==3){if((c[C+(E*40|0)+8>>2]|0)==(B|0)){break}}E=E+1|0;if(!(E>>>0<D>>>0)){o=91;break f}}c[F>>2]=0;C=(c[p>>2]|0)+ -1|0;c[p>>2]=C;if((c[(c[v>>2]|0)+(E*40|0)+24>>2]|0)!=0){break}c[w>>2]=(c[w>>2]|0)+ -1}}while(0);if((o|0)==91){o=0;C=c[p>>2]|0}if(!(C>>>0<(c[u>>2]|0)>>>0)){b=1;o=104;break c}s=c[l>>2]|0;c[s+12>>2]=e;c[s+8>>2]=B;c[s+16>>2]=f;c[s+20>>2]=3;c[(c[l>>2]|0)+24>>2]=(c[d>>2]|0)==0;c[p>>2]=(c[p>>2]|0)+1;c[w>>2]=(c[w>>2]|0)+1;s=1;break};case 0:{b=0;o=104;break c};default:{b=1;break c}}}while(0);A=A+1|0}if((s|0)!=0){n=b;break a}p=c[p>>2]|0}}while(0);o=a+40|0;if(!(p>>>0<(c[a+24>>2]|0)>>>0)){n=1;break}H=c[l>>2]|0;c[H+12>>2]=e;c[H+8>>2]=e;c[H+16>>2]=f;c[H+20>>2]=2;c[(c[l>>2]|0)+24>>2]=n;n=a+44|0;c[n>>2]=(c[n>>2]|0)+1;c[o>>2]=(c[o>>2]|0)+1;n=b}}while(0);b=c[l>>2]|0;c[b+36>>2]=g;c[b+28>>2]=h;c[b+32>>2]=j;g:do{if((c[d>>2]|0)==0){j=a+44|0;f=c[j>>2]|0;l=a+28|0;o=c[l>>2]|0;if(!(f>>>0>o>>>0)){break}h=a;b=a+16|0;g=a+12|0;p=1;while(1){do{if(p){p=c[h>>2]|0;q=0;s=2147483647;r=0;do{if((c[p+(q*40|0)+24>>2]|0)!=0){u=c[p+(q*40|0)+16>>2]|0;t=(u|0)<(s|0);s=t?u:s;r=t?p+(q*40|0)|0:r}q=q+1|0;}while(!(q>>>0>o>>>0));if((r|0)==0){break}H=c[b>>2]|0;c[(c[g>>2]|0)+(H<<4)>>2]=c[r>>2];f=c[g>>2]|0;c[f+(H<<4)+12>>2]=c[r+36>>2];c[f+(c[b>>2]<<4)+4>>2]=c[r+28>>2];c[f+(c[b>>2]<<4)+8>>2]=c[r+32>>2];c[b>>2]=(c[b>>2]|0)+1;c[r+24>>2]=0;f=c[j>>2]|0;if((c[r+20>>2]|0)!=0){break}f=f+ -1|0;c[j>>2]=f}}while(0);o=c[l>>2]|0;if(!(f>>>0>o>>>0)){break g}p=(c[d>>2]|0)==0}}else{o=a+16|0;F=c[o>>2]|0;H=a+12|0;c[(c[H>>2]|0)+(F<<4)>>2]=c[b>>2];G=c[l>>2]|0;H=c[H>>2]|0;c[H+(F<<4)+12>>2]=c[G+36>>2];c[H+(c[o>>2]<<4)+4>>2]=c[G+28>>2];c[H+(c[o>>2]<<4)+8>>2]=c[G+32>>2];c[o>>2]=(c[o>>2]|0)+1;o=c[a+28>>2]|0}}while(0);mb(c[a>>2]|0,o+1|0);H=n;i=k;return H|0}function mb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;g=i;i=i+24|0;o=g;k=g+8|0;f=7;do{if(f>>>0<b>>>0){h=f;do{d=a+(h*40|0)|0;j=c[d>>2]|0;d=c[d+4>>2]|0;l=c[a+(h*40|0)+8>>2]|0;t=a+(h*40|0)+12|0;n=c[t+4>>2]|0;m=o;c[m>>2]=c[t>>2];c[m+4>>2]=n;m=c[a+(h*40|0)+20>>2]|0;n=c[a+(h*40|0)+24>>2]|0;t=a+(h*40|0)+28|0;c[k+0>>2]=c[t+0>>2];c[k+4>>2]=c[t+4>>2];c[k+8>>2]=c[t+8>>2];a:do{if(h>>>0<f>>>0){p=h;e=14}else{t=(n|0)==0;b:do{if((m|0)==0){q=h;while(1){p=q-f|0;if((c[a+(p*40|0)+20>>2]|0)!=0){break b}if((c[a+(p*40|0)+24>>2]|0)!=0|t){break b}q=a+(q*40|0)+0|0;r=a+(p*40|0)+0|0;s=q+40|0;do{c[q>>2]=c[r>>2];q=q+4|0;r=r+4|0}while((q|0)<(s|0));if(p>>>0<f>>>0){e=14;break a}else{q=p}}}else{if((m+ -1|0)>>>0<2){r=h}else{q=h;while(1){p=q-f|0;r=c[a+(p*40|0)+20>>2]|0;if((r|0)!=0){if((r+ -1|0)>>>0<2){break b}if((c[a+(p*40|0)+8>>2]|0)<=(l|0)){break b}}q=a+(q*40|0)+0|0;r=a+(p*40|0)+0|0;s=q+40|0;do{c[q>>2]=c[r>>2];q=q+4|0;r=r+4|0}while((q|0)<(s|0));if(p>>>0<f>>>0){e=14;break a}else{q=p}}}while(1){p=r-f|0;t=c[a+(p*40|0)+20>>2]|0;if((t|0)!=0&(t+ -1|0)>>>0<2){q=c[a+(p*40|0)+8>>2]|0;if((q|0)>(l|0)){q=r;break b}r=a+(r*40|0)|0;if((q|0)>=(l|0)){break a}}else{r=a+(r*40|0)|0}q=r+0|0;r=a+(p*40|0)+0|0;s=q+40|0;do{c[q>>2]=c[r>>2];q=q+4|0;r=r+4|0}while((q|0)<(s|0));if(p>>>0<f>>>0){e=14;break a}else{r=p}}}}while(0);r=a+(q*40|0)|0}}while(0);if((e|0)==14){e=0;r=a+(p*40|0)|0}q=r;c[q>>2]=j;c[q+4>>2]=d;c[r+8>>2]=l;q=o;s=c[q+4>>2]|0;t=r+12|0;c[t>>2]=c[q>>2];c[t+4>>2]=s;c[r+20>>2]=m;c[r+24>>2]=n;t=r+28|0;c[t+0>>2]=c[k+0>>2];c[t+4>>2]=c[k+4>>2];c[t+8>>2]=c[k+8>>2];h=h+1|0;}while((h|0)!=(b|0))}f=f>>>1;}while((f|0)!=0);i=g;return}function nb(a,b){a=a|0;b=b|0;var d=0;d=i;do{if(b>>>0>16){a=0}else{a=c[(c[a+4>>2]|0)+(b<<2)>>2]|0;if((a|0)==0){a=0;break}if(!((c[a+20>>2]|0)>>>0>1)){a=0;break}a=c[a>>2]|0}}while(0);i=d;return a|0}function ob(a){a=a|0;var b=0;b=(c[a>>2]|0)+((c[a+28>>2]|0)*40|0)|0;c[a+8>>2]=b;i=i;return c[b>>2]|0}function pb(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0;h=i;c[a+36>>2]=65535;e=e>>>0>1?e:1;c[a+24>>2]=e;d=(g|0)==0?d:e;c[a+28>>2]=d;c[a+32>>2]=f;c[a+56>>2]=g;c[a+44>>2]=0;c[a+40>>2]=0;c[a+48>>2]=0;e=Xc(680)|0;g=e;f=a;c[f>>2]=g;if((e|0)==0){j=65535;i=h;return j|0}_c(e|0,0,680)|0;do{if((d|0)==-1){d=0}else{b=b*384|47;e=g;g=0;while(1){c[e+(g*40|0)+4>>2]=Xc(b)|0;e=c[f>>2]|0;j=c[e+(g*40|0)+4>>2]|0;if((j|0)==0){a=65535;f=10;break}c[e+(g*40|0)>>2]=j+(0-j&15);g=g+1|0;if(!(g>>>0<(d+1|0)>>>0)){f=7;break}e=c[f>>2]|0}if((f|0)==7){d=(d<<4)+16|0;break}else if((f|0)==10){i=h;return a|0}}}while(0);f=Xc(68)|0;c[a+4>>2]=f;j=Xc(d)|0;c[a+12>>2]=j;if((f|0)==0|(j|0)==0){j=65535;i=h;return j|0}f=f+0|0;d=f+68|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(d|0));c[a+20>>2]=0;c[a+16>>2]=0;j=0;i=h;return j|0}function qb(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;j=a;m=c[j>>2]|0;do{if((m|0)==0){m=0}else{k=a+28|0;if((c[k>>2]|0)==-1){break}else{l=0}while(1){Yc(c[m+(l*40|0)+4>>2]|0);c[(c[j>>2]|0)+(l*40|0)+4>>2]=0;l=l+1|0;m=c[j>>2]|0;if(l>>>0<((c[k>>2]|0)+1|0)>>>0){}else{break}}}}while(0);Yc(m);c[j>>2]=0;m=a+4|0;Yc(c[m>>2]|0);c[m>>2]=0;m=a+12|0;Yc(c[m>>2]|0);c[m>>2]=0;m=pb(a,b,d,e,f,g)|0;i=h;return m|0}function rb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0;d=i;b=a;g=c[b>>2]|0;do{if((g|0)==0){g=0}else{e=a+28|0;if((c[e>>2]|0)==-1){break}else{f=0}while(1){Yc(c[g+(f*40|0)+4>>2]|0);c[(c[b>>2]|0)+(f*40|0)+4>>2]=0;f=f+1|0;g=c[b>>2]|0;if(f>>>0<((c[e>>2]|0)+1|0)>>>0){}else{break}}}}while(0);Yc(g);c[b>>2]=0;g=a+4|0;Yc(c[g>>2]|0);c[g>>2]=0;g=a+12|0;Yc(c[g>>2]|0);c[g>>2]=0;i=d;return}function sb(a){a=a|0;var b=0,d=0,e=0,f=0;b=i;d=c[a+40>>2]|0;if((d|0)==0){i=b;return}e=a;a=a+4|0;f=0;do{c[(c[a>>2]|0)+(f<<2)>>2]=(c[e>>2]|0)+(f*40|0);f=f+1|0;}while(f>>>0<d>>>0);i=b;return}function tb(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;f=i;j=a+16|0;c[j>>2]=0;c[a+20>>2]=0;if((e|0)==0){z=0;i=f;return z|0}e=a+48|0;g=c[e>>2]|0;h=(g|0)==(b|0);a:do{if(h){l=40}else{l=a+32|0;r=((g+1|0)>>>0)%((c[l>>2]|0)>>>0)|0;if((r|0)==(b|0)){l=40;break}k=a+28|0;g=a;h=c[(c[g>>2]|0)+((c[k>>2]|0)*40|0)>>2]|0;n=a+40|0;p=a+24|0;o=a+44|0;q=a+56|0;m=a+12|0;b:while(1){t=c[n>>2]|0;if((t|0)==0){t=0}else{s=c[g>>2]|0;u=0;do{if(((c[s+(u*40|0)+20>>2]|0)+ -1|0)>>>0<2){t=c[s+(u*40|0)+12>>2]|0;if(t>>>0>r>>>0){t=t-(c[l>>2]|0)|0}c[s+(u*40|0)+8>>2]=t;t=c[n>>2]|0}u=u+1|0;}while(u>>>0<t>>>0)}do{if(!(t>>>0<(c[p>>2]|0)>>>0)){if((t|0)==0){a=1;l=47;break b}s=c[g>>2]|0;u=0;v=-1;y=0;do{if(((c[s+(u*40|0)+20>>2]|0)+ -1|0)>>>0<2){x=c[s+(u*40|0)+8>>2]|0;w=(x|0)<(y|0)|(v|0)==-1;v=w?u:v;y=w?x:y}u=u+1|0;}while((u|0)!=(t|0));if(!((v|0)>-1)){a=1;l=47;break b}c[s+(v*40|0)+20>>2]=0;c[n>>2]=(c[n>>2]|0)+ -1;if((c[(c[g>>2]|0)+(v*40|0)+24>>2]|0)!=0){break}c[o>>2]=(c[o>>2]|0)+ -1}}while(0);s=c[o>>2]|0;t=c[k>>2]|0;if(!(s>>>0<t>>>0)){do{do{if((c[q>>2]|0)==0){u=c[g>>2]|0;v=0;x=2147483647;y=0;while(1){if((c[u+(v*40|0)+24>>2]|0)==0){w=y}else{z=c[u+(v*40|0)+16>>2]|0;w=(z|0)<(x|0);x=w?z:x;w=w?u+(v*40|0)|0:y}v=v+1|0;if(v>>>0>t>>>0){break}else{y=w}}if((w|0)==0){break}z=c[j>>2]|0;c[(c[m>>2]|0)+(z<<4)>>2]=c[w>>2];s=c[m>>2]|0;c[s+(z<<4)+12>>2]=c[w+36>>2];c[s+(c[j>>2]<<4)+4>>2]=c[w+28>>2];c[s+(c[j>>2]<<4)+8>>2]=c[w+32>>2];c[j>>2]=(c[j>>2]|0)+1;c[w+24>>2]=0;s=c[o>>2]|0;if((c[w+20>>2]|0)!=0){break}s=s+ -1|0;c[o>>2]=s}}while(0);t=c[k>>2]|0;}while(!(s>>>0<t>>>0))}c[(c[g>>2]|0)+(t*40|0)+20>>2]=1;z=c[g>>2]|0;c[z+((c[k>>2]|0)*40|0)+12>>2]=r;c[z+((c[k>>2]|0)*40|0)+8>>2]=r;c[z+((c[k>>2]|0)*40|0)+16>>2]=0;c[z+((c[k>>2]|0)*40|0)+24>>2]=0;c[o>>2]=(c[o>>2]|0)+1;c[n>>2]=(c[n>>2]|0)+1;mb(z,(c[k>>2]|0)+1|0);r=((r+1|0)>>>0)%((c[l>>2]|0)>>>0)|0;if((r|0)==(b|0)){l=32;break}}if((l|0)==32){n=c[j>>2]|0;if((n|0)==0){l=42;break}m=c[m>>2]|0;l=c[k>>2]|0;k=c[g>>2]|0;j=c[k+(l*40|0)>>2]|0;o=0;while(1){p=o+1|0;if((c[m+(o<<4)>>2]|0)==(j|0)){break}if(p>>>0<n>>>0){o=p}else{l=42;break a}}if((l|0)==0){l=42;break}else{n=0}while(1){m=k+(n*40|0)|0;n=n+1|0;if((c[m>>2]|0)==(h|0)){break}if(n>>>0<l>>>0){}else{l=42;break a}}c[m>>2]=j;c[(c[g>>2]|0)+(l*40|0)>>2]=h;l=42;break}else if((l|0)==47){i=f;return a|0}}}while(0);do{if((l|0)==40){if((d|0)==0){break}if(h){a=1}else{l=42;break}i=f;return a|0}}while(0);do{if((l|0)==42){if((d|0)==0){g=c[e>>2]|0;break}c[e>>2]=b;z=0;i=f;return z|0}}while(0);if((g|0)==(b|0)){z=0;i=f;return z|0}z=c[a+32>>2]|0;c[e>>2]=((b+ -1+z|0)>>>0)%(z>>>0)|0;z=0;i=f;return z|0}function ub(a){a=a|0;var b=0,d=0,e=0;b=i;e=a+20|0;d=c[e>>2]|0;if(!(d>>>0<(c[a+16>>2]|0)>>>0)){e=0;i=b;return e|0}a=c[a+12>>2]|0;c[e>>2]=d+1;e=a+(d<<4)|0;i=b;return e|0}function vb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;b=i;h=a;j=c[h>>2]|0;if((j|0)==0){i=b;return}c[a+60>>2]=1;d=a+56|0;if((c[d>>2]|0)!=0){i=b;return}g=a+28|0;e=a+16|0;f=a+12|0;a=a+44|0;while(1){k=c[g>>2]|0;l=0;m=2147483647;n=0;do{if((c[j+(l*40|0)+24>>2]|0)!=0){p=c[j+(l*40|0)+16>>2]|0;o=(p|0)<(m|0);m=o?p:m;n=o?j+(l*40|0)|0:n}l=l+1|0;}while(!(l>>>0>k>>>0));if((n|0)==0){d=13;break}o=c[e>>2]|0;c[(c[f>>2]|0)+(o<<4)>>2]=c[n>>2];p=c[f>>2]|0;c[p+(o<<4)+12>>2]=c[n+36>>2];c[p+(c[e>>2]<<4)+4>>2]=c[n+28>>2];c[p+(c[e>>2]<<4)+8>>2]=c[n+32>>2];c[e>>2]=(c[e>>2]|0)+1;c[n+24>>2]=0;if((c[n+20>>2]|0)==0){c[a>>2]=(c[a>>2]|0)+ -1}if((c[d>>2]|0)!=0){d=13;break}j=c[h>>2]|0}if((d|0)==13){i=b;return}}function wb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;h=i;f=c[a+4>>2]|0;j=c[a+16>>2]|0;e=c[a+20>>2]|0;d=f<<2;g=b+256|0;l=16;k=c[a+12>>2]|0;a=b;while(1){m=c[a+4>>2]|0;c[k>>2]=c[a>>2];c[k+4>>2]=m;m=c[a+12>>2]|0;c[k+8>>2]=c[a+8>>2];c[k+12>>2]=m;l=l+ -1|0;if((l|0)==0){break}else{a=a+16|0;k=k+(d<<2)|0}}a=j;l=e;m=f<<1&2147483646;k=c[b+260>>2]|0;c[a>>2]=c[g>>2];c[j+4>>2]=k;k=c[b+268>>2]|0;c[a+(m<<2)>>2]=c[b+264>>2];c[a+((m|1)<<2)>>2]=k;k=f<<2;j=c[b+276>>2]|0;c[a+(k<<2)>>2]=c[b+272>>2];c[a+((k|1)<<2)>>2]=j;k=k+m|0;j=c[b+284>>2]|0;c[a+(k<<2)>>2]=c[b+280>>2];c[a+((k|1)<<2)>>2]=j;k=k+m|0;j=c[b+292>>2]|0;c[a+(k<<2)>>2]=c[b+288>>2];c[a+((k|1)<<2)>>2]=j;k=k+m|0;j=c[b+300>>2]|0;c[a+(k<<2)>>2]=c[b+296>>2];c[a+((k|1)<<2)>>2]=j;k=k+m|0;j=c[b+308>>2]|0;c[a+(k<<2)>>2]=c[b+304>>2];c[a+((k|1)<<2)>>2]=j;k=k+m|0;j=c[b+316>>2]|0;c[a+(k<<2)>>2]=c[b+312>>2];c[a+((k|1)<<2)>>2]=j;k=c[b+324>>2]|0;c[l>>2]=c[b+320>>2];c[e+4>>2]=k;k=c[b+332>>2]|0;c[l+(m<<2)>>2]=c[b+328>>2];c[l+((m|1)<<2)>>2]=k;k=f<<2;a=c[b+340>>2]|0;c[l+(k<<2)>>2]=c[b+336>>2];c[l+((k|1)<<2)>>2]=a;k=k+m|0;a=c[b+348>>2]|0;c[l+(k<<2)>>2]=c[b+344>>2];c[l+((k|1)<<2)>>2]=a;k=k+m|0;a=c[b+356>>2]|0;c[l+(k<<2)>>2]=c[b+352>>2];c[l+((k|1)<<2)>>2]=a;k=k+m|0;a=c[b+364>>2]|0;c[l+(k<<2)>>2]=c[b+360>>2];c[l+((k|1)<<2)>>2]=a;k=k+m|0;a=c[b+372>>2]|0;c[l+(k<<2)>>2]=c[b+368>>2];c[l+((k|1)<<2)>>2]=a;m=k+m|0;k=c[b+380>>2]|0;c[l+(m<<2)>>2]=c[b+376>>2];c[l+((m|1)<<2)>>2]=k;i=h;return}function xb(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;h=i;k=c[b+4>>2]|0;j=_(c[b+8>>2]|0,k)|0;l=(e>>>0)%(k>>>0)|0;b=c[b>>2]|0;m=e-l|0;p=(m<<8)+(l<<4)|0;n=j<<8;l=l<<3;o=k<<4;s=k<<2&1073741820;t=s<<1;x=t+s|0;q=0;do{w=c[4584+(q<<2)>>2]|0;r=c[4648+(q<<2)>>2]|0;u=(r<<4)+w|0;v=f+u|0;r=p+w+(_(r,o)|0)|0;w=b+r|0;e=c[g+(q<<6)>>2]|0;if((e|0)==16777215){r=c[f+(u+16)>>2]|0;c[w>>2]=c[v>>2];c[w+(s<<2)>>2]=r;v=c[f+(u+48)>>2]|0;c[w+(t<<2)>>2]=c[f+(u+32)>>2];c[w+(x<<2)>>2]=v}else{z=d[f+(u+1)|0]|0;y=c[g+(q<<6)+4>>2]|0;a[w]=a[4712+(e+512+(d[v]|0))|0]|0;v=d[f+(u+2)|0]|0;e=c[g+(q<<6)+8>>2]|0;a[b+(r+1)|0]=a[4712+((z|512)+y)|0]|0;w=d[f+(u+3)|0]|0;y=c[g+(q<<6)+12>>2]|0;a[b+(r+2)|0]=a[4712+(e+512+v)|0]|0;a[b+(r+3)|0]=a[4712+(y+512+w)|0]|0;w=r+o|0;y=d[f+(u+17)|0]|0;v=c[g+(q<<6)+20>>2]|0;a[b+w|0]=a[4712+((c[g+(q<<6)+16>>2]|0)+512+(d[f+(u+16)|0]|0))|0]|0;r=d[f+(u+18)|0]|0;e=c[g+(q<<6)+24>>2]|0;a[b+(w+1)|0]=a[4712+((y|512)+v)|0]|0;v=d[f+(u+19)|0]|0;y=c[g+(q<<6)+28>>2]|0;a[b+(w+2)|0]=a[4712+(e+512+r)|0]|0;a[b+(w+3)|0]=a[4712+(y+512+v)|0]|0;w=w+o|0;v=d[f+(u+33)|0]|0;y=c[g+(q<<6)+36>>2]|0;a[b+w|0]=a[4712+((c[g+(q<<6)+32>>2]|0)+512+(d[f+(u+32)|0]|0))|0]|0;r=d[f+(u+34)|0]|0;e=c[g+(q<<6)+40>>2]|0;a[b+(w+1)|0]=a[4712+((v|512)+y)|0]|0;y=d[f+(u+35)|0]|0;v=c[g+(q<<6)+44>>2]|0;a[b+(w+2)|0]=a[4712+(e+512+r)|0]|0;a[b+(w+3)|0]=a[4712+(v+512+y)|0]|0;w=w+o|0;y=d[f+(u+49)|0]|0;v=c[g+(q<<6)+52>>2]|0;a[b+w|0]=a[4712+((c[g+(q<<6)+48>>2]|0)+512+(d[f+(u+48)|0]|0))|0]|0;r=d[f+(u+50)|0]|0;e=c[g+(q<<6)+56>>2]|0;a[b+(w+1)|0]=a[4712+((y|512)+v)|0]|0;v=d[f+(u+51)|0]|0;u=c[g+(q<<6)+60>>2]|0;a[b+(w+2)|0]=a[4712+(e+512+r)|0]|0;a[b+(w+3)|0]=a[4712+(u+512+v)|0]|0}q=q+1|0;}while((q|0)!=16);j=j<<6;e=k<<3&2147483640;k=f+256|0;f=f+320|0;o=l+n+(m<<6)|0;s=e>>>2;q=e>>>1;l=q+s|0;r=16;do{t=r&3;v=c[4584+(t<<2)>>2]|0;t=c[4648+(t<<2)>>2]|0;u=r>>>0>19;n=u?f:k;m=(t<<3)+v|0;p=n+m|0;u=o+(u?j:0)+v+(_(t,e)|0)|0;t=b+u|0;v=c[g+(r<<6)>>2]|0;if((v|0)==16777215){z=t;y=c[n+(m+8)>>2]|0;c[z>>2]=c[p>>2];c[z+(s<<2)>>2]=y;y=c[n+(m+24)>>2]|0;c[z+(q<<2)>>2]=c[n+(m+16)>>2];c[z+(l<<2)>>2]=y}else{x=d[n+(m+1)|0]|0;z=c[g+(r<<6)+4>>2]|0;a[t]=a[4712+(v+512+(d[p]|0))|0]|0;y=d[n+(m+2)|0]|0;w=c[g+(r<<6)+8>>2]|0;a[b+(u+1)|0]=a[4712+((x|512)+z)|0]|0;z=d[n+(m+3)|0]|0;x=c[g+(r<<6)+12>>2]|0;a[b+(u+2)|0]=a[4712+(w+512+y)|0]|0;a[b+(u+3)|0]=a[4712+(x+512+z)|0]|0;z=u+e|0;x=d[n+(m+9)|0]|0;y=c[g+(r<<6)+20>>2]|0;a[b+z|0]=a[4712+((c[g+(r<<6)+16>>2]|0)+512+(d[n+(m+8)|0]|0))|0]|0;w=d[n+(m+10)|0]|0;v=c[g+(r<<6)+24>>2]|0;a[b+(z+1)|0]=a[4712+((x|512)+y)|0]|0;y=d[n+(m+11)|0]|0;x=c[g+(r<<6)+28>>2]|0;a[b+(z+2)|0]=a[4712+(v+512+w)|0]|0;a[b+(z+3)|0]=a[4712+(x+512+y)|0]|0;z=z+e|0;y=d[n+(m+17)|0]|0;x=c[g+(r<<6)+36>>2]|0;a[b+z|0]=a[4712+((c[g+(r<<6)+32>>2]|0)+512+(d[n+(m+16)|0]|0))|0]|0;w=d[n+(m+18)|0]|0;v=c[g+(r<<6)+40>>2]|0;a[b+(z+1)|0]=a[4712+((y|512)+x)|0]|0;x=d[n+(m+19)|0]|0;y=c[g+(r<<6)+44>>2]|0;a[b+(z+2)|0]=a[4712+(v+512+w)|0]|0;a[b+(z+3)|0]=a[4712+(y+512+x)|0]|0;z=z+e|0;x=d[n+(m+25)|0]|0;y=c[g+(r<<6)+52>>2]|0;a[b+z|0]=a[4712+((c[g+(r<<6)+48>>2]|0)+512+(d[n+(m+24)|0]|0))|0]|0;w=d[n+(m+26)|0]|0;v=c[g+(r<<6)+56>>2]|0;a[b+(z+1)|0]=a[4712+((x|512)+y)|0]|0;y=d[n+(m+27)|0]|0;x=c[g+(r<<6)+60>>2]|0;a[b+(z+2)|0]=a[4712+(v+512+w)|0]|0;a[b+(z+3)|0]=a[4712+(x+512+y)|0]|0}r=r+1|0;}while((r|0)!=24);i=h;return}function yb(a,f,g,h,j,k){a=a|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0;l=i;i=i+24|0;m=l;p=c[j+4>>2]|0;n=(h>>>0)/(p>>>0)|0;o=n<<4;n=h-(_(n,p)|0)<<4;c[m+4>>2]=p;c[m+8>>2]=c[j+8>>2];p=a;s=c[p>>2]|0;do{if((s|0)==2){u=b[f+160>>1]|0;t=b[f+162>>1]|0;r=c[f+144>>2]|0;s=a+4|0;w=c[a+204>>2]|0;do{if((w|0)==0){v=0;w=-1;x=0}else{if((c[w+4>>2]|0)!=(c[s>>2]|0)){v=0;w=-1;x=0;break}if(!((c[w>>2]|0)>>>0<6)){v=0;w=-1;x=1;break}v=w+172|0;v=e[v>>1]|e[v+2>>1]<<16;w=c[w+108>>2]|0;x=1}}while(0);a:do{if((w|0)==(r|0)){y=v>>>16}else{y=c[a+200>>2]|0;do{if((y|0)==0){w=0;y=-1;z=0}else{if((c[y+4>>2]|0)!=(c[s>>2]|0)){w=0;y=-1;z=0;break}if(!((c[y>>2]|0)>>>0<6)){w=0;y=-1;z=1;break}w=y+152|0;w=e[w>>1]|e[w+2>>1]<<16;y=c[y+104>>2]|0;z=1}}while(0);A=c[a+208>>2]|0;do{if((A|0)==0){q=56}else{if((c[A+4>>2]|0)!=(c[s>>2]|0)){q=56;break}if(!((c[A>>2]|0)>>>0<6)){z=-1;x=0;break}x=A+172|0;z=c[A+108>>2]|0;x=e[x>>1]|e[x+2>>1]<<16}}while(0);b:do{if((q|0)==56){q=c[a+212>>2]|0;do{if((q|0)!=0){if((c[q+4>>2]|0)!=(c[s>>2]|0)){break}if(!((c[q>>2]|0)>>>0<6)){z=-1;x=0;break b}x=q+192|0;z=c[q+112>>2]|0;x=e[x>>1]|e[x+2>>1]<<16;break b}}while(0);if((z|0)==0|(x|0)!=0){z=-1;x=0;break}y=w>>>16;v=w;break a}}while(0);q=(y|0)==(r|0);if((((z|0)==(r|0))+(q&1)|0)==1){if(q){y=w>>>16;v=w;break}else{y=x>>>16;v=x;break}}A=w<<16>>16;z=v<<16>>16;y=x<<16>>16;if((v&65535)<<16>>16>(w&65535)<<16>>16){q=z}else{q=A;A=(z|0)<(A|0)?z:A}if((q|0)>=(y|0)){q=(A|0)>(y|0)?A:y}y=w>>16;z=v>>16;x=x>>16;if((v>>>16&65535)<<16>>16>(w>>>16&65535)<<16>>16){v=z}else{v=y;y=(z|0)<(y|0)?z:y}if((v|0)<(x|0)){y=v;v=q;break}y=(y|0)>(x|0)?y:x;v=q}}while(0);q=(v&65535)+(u&65535)|0;u=(y&65535)+(t&65535)|0;if(((q<<16>>16)+8192|0)>>>0>16383){R=1;i=l;return R|0}if(((u<<16>>16)+2048|0)>>>0>4095){R=1;i=l;return R|0}t=nb(g,r)|0;if((t|0)==0){R=1;i=l;return R|0}b[a+160>>1]=q;b[a+162>>1]=u;w=a+160|0;q=a+156|0;w=e[w>>1]|e[w+2>>1]<<16;b[q>>1]=w;b[q+2>>1]=w>>>16;q=a+152|0;b[q>>1]=w;b[q+2>>1]=w>>>16;q=a+148|0;b[q>>1]=w;b[q+2>>1]=w>>>16;q=a+144|0;b[q>>1]=w;b[q+2>>1]=w>>>16;q=a+140|0;b[q>>1]=w;b[q+2>>1]=w>>>16;q=a+136|0;b[q>>1]=w;b[q+2>>1]=w>>>16;q=a+132|0;b[q>>1]=w;b[q+2>>1]=w>>>16;c[a+100>>2]=r;c[a+104>>2]=r;q=a+116|0;c[q>>2]=t;c[a+120>>2]=t;v=b[f+164>>1]|0;u=b[f+166>>1]|0;t=c[f+148>>2]|0;y=c[a+200>>2]|0;z=(y|0)==0;do{if(z){x=0;A=-1}else{if((c[y+4>>2]|0)!=(c[s>>2]|0)){x=0;A=-1;break}if(!((c[y>>2]|0)>>>0<6)){x=0;A=-1;break}x=y+184|0;x=e[x>>1]|e[x+2>>1]<<16;A=c[y+112>>2]|0}}while(0);do{if((A|0)==(t|0)){y=x>>>16;w=x}else{do{if(z){s=0;y=-1}else{if((c[y+4>>2]|0)!=(c[s>>2]|0)){s=0;y=-1;break}if(!((c[y>>2]|0)>>>0<6)){s=0;y=-1;break}s=y+160|0;s=e[s>>1]|e[s+2>>1]<<16;y=c[y+104>>2]|0}}while(0);r=(r|0)==(t|0);if((((y|0)==(t|0))+(r&1)|0)==1){if(r){y=w>>>16;break}else{y=s>>>16;w=s;break}}z=x<<16>>16;A=w<<16>>16;y=s<<16>>16;if((w&65535)<<16>>16>(x&65535)<<16>>16){r=A}else{r=z;z=(A|0)<(z|0)?A:z}if((r|0)>=(y|0)){r=(z|0)>(y|0)?z:y}z=x>>16;y=w>>16;s=s>>16;if((w>>>16&65535)<<16>>16>(x>>>16&65535)<<16>>16){w=y}else{w=z;z=(y|0)<(z|0)?y:z}if((w|0)<(s|0)){y=w;w=r;break}y=(z|0)>(s|0)?z:s;w=r}}while(0);r=(w&65535)+(v&65535)|0;s=(y&65535)+(u&65535)|0;if(((r<<16>>16)+8192|0)>>>0>16383){R=1;i=l;return R|0}if(((s<<16>>16)+2048|0)>>>0>4095){R=1;i=l;return R|0}g=nb(g,t)|0;if((g|0)==0){R=1;i=l;return R|0}else{R=a+164|0;b[a+192>>1]=r;b[a+194>>1]=s;Q=a+192|0;P=a+188|0;Q=e[Q>>1]|e[Q+2>>1]<<16;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+184|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+180|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+176|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+172|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+168|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=R;b[P>>1]=Q;b[P+2>>1]=Q>>>16;c[a+108>>2]=t;c[a+112>>2]=t;P=a+124|0;c[P>>2]=g;c[a+128>>2]=g;Q=m;c[Q>>2]=c[q>>2];hc(k,a+132|0,m,n,o,0,0,16,8);c[Q>>2]=c[P>>2];hc(k,R,m,n,o,0,8,16,8);break}}else if((s|0)==1|(s|0)==0){r=c[f+144>>2]|0;w=a+4|0;u=c[a+200>>2]|0;do{if((u|0)==0){t=0;x=-1;z=0}else{if((c[u+4>>2]|0)!=(c[w>>2]|0)){t=0;x=-1;z=0;break}if(!((c[u>>2]|0)>>>0<6)){t=0;x=-1;z=1;break}t=u+152|0;t=e[t>>1]|e[t+2>>1]<<16;x=c[u+104>>2]|0;z=1}}while(0);u=c[a+204>>2]|0;do{if((u|0)==0){v=0;y=-1;A=0}else{if((c[u+4>>2]|0)!=(c[w>>2]|0)){v=0;y=-1;A=0;break}if(!((c[u>>2]|0)>>>0<6)){v=0;y=-1;A=1;break}v=u+172|0;v=e[v>>1]|e[v+2>>1]<<16;y=c[u+108>>2]|0;A=1}}while(0);do{if((s|0)==0){if((z|0)==0|(A|0)==0){s=0;t=0;break}if((x|t|0)==0){s=0;t=0;break}if((y|v|0)==0){s=0;t=0}else{q=14}}else{q=14}}while(0);do{if((q|0)==14){u=b[f+160>>1]|0;s=b[f+162>>1]|0;q=c[a+208>>2]|0;do{if((q|0)==0){q=18}else{if((c[q+4>>2]|0)!=(c[w>>2]|0)){q=18;break}if(!((c[q>>2]|0)>>>0<6)){z=-1;w=0;q=23;break}w=q+172|0;z=c[q+108>>2]|0;w=e[w>>1]|e[w+2>>1]<<16;q=23}}while(0);c:do{if((q|0)==18){B=c[a+212>>2]|0;do{if((B|0)!=0){if((c[B+4>>2]|0)!=(c[w>>2]|0)){break}if(!((c[B>>2]|0)>>>0<6)){z=-1;w=0;q=23;break c}w=B+192|0;z=c[B+112>>2]|0;w=e[w>>1]|e[w+2>>1]<<16;q=23;break c}}while(0);if((z|0)==0|(A|0)!=0){z=-1;w=0;q=23;break}x=t>>>16}}while(0);do{if((q|0)==23){q=(x|0)==(r|0);x=(y|0)==(r|0);if(((x&1)+(q&1)+((z|0)==(r|0))|0)==1){if(q){x=t>>>16;break}if(x){x=v>>>16;t=v;break}else{x=w>>>16;t=w;break}}z=t<<16>>16;y=v<<16>>16;x=w<<16>>16;if((v&65535)<<16>>16>(t&65535)<<16>>16){q=y}else{q=z;z=(y|0)<(z|0)?y:z}if((q|0)>=(x|0)){q=(z|0)>(x|0)?z:x}z=t>>16;y=v>>16;w=w>>16;if((v>>>16&65535)<<16>>16>(t>>>16&65535)<<16>>16){x=y}else{x=z;z=(y|0)<(z|0)?y:z}if((x|0)<(w|0)){t=q;break}x=(z|0)>(w|0)?z:w;t=q}}while(0);q=(t&65535)+(u&65535)|0;t=(x&65535)+(s&65535)|0;if(((q<<16>>16)+8192|0)>>>0>16383){R=1;i=l;return R|0}if(((t<<16>>16)+2048|0)>>>0>4095){k=1}else{s=q&65535;t=t&65535;break}i=l;return k|0}}while(0);g=nb(g,r)|0;if((g|0)==0){R=1;i=l;return R|0}else{b[a+192>>1]=s;b[a+194>>1]=t;Q=a+192|0;R=a+188|0;Q=e[Q>>1]|e[Q+2>>1]<<16;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+184|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+180|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+176|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+172|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+168|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+164|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+160|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+156|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+152|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+148|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+144|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+140|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+136|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;R=a+132|0;b[R>>1]=Q;b[R+2>>1]=Q>>>16;c[a+100>>2]=r;c[a+104>>2]=r;c[a+108>>2]=r;c[a+112>>2]=r;c[a+116>>2]=g;c[a+120>>2]=g;c[a+124>>2]=g;c[a+128>>2]=g;c[m>>2]=g;hc(k,a+132|0,m,n,o,0,0,16,16);break}}else if((s|0)==3){u=b[f+160>>1]|0;t=b[f+162>>1]|0;r=c[f+144>>2]|0;s=a+4|0;w=c[a+200>>2]|0;do{if((w|0)==0){v=0;x=-1;w=0}else{if((c[w+4>>2]|0)!=(c[s>>2]|0)){v=0;x=-1;w=0;break}if(!((c[w>>2]|0)>>>0<6)){v=0;x=-1;w=1;break}v=w+152|0;v=e[v>>1]|e[v+2>>1]<<16;x=c[w+104>>2]|0;w=1}}while(0);d:do{if((x|0)==(r|0)){z=v>>>16}else{x=c[a+204>>2]|0;do{if((x|0)==0){q=113}else{if((c[x+4>>2]|0)!=(c[s>>2]|0)){q=113;break}if(!((c[x>>2]|0)>>>0<6)){y=-1;w=0;z=-1;x=0;break}R=x+172|0;w=x+188|0;y=c[x+112>>2]|0;w=e[w>>1]|e[w+2>>1]<<16;z=c[x+108>>2]|0;x=e[R>>1]|e[R+2>>1]<<16}}while(0);e:do{if((q|0)==113){x=c[a+212>>2]|0;do{if((x|0)!=0){if((c[x+4>>2]|0)!=(c[s>>2]|0)){break}if(!((c[x>>2]|0)>>>0<6)){y=-1;w=0;z=-1;x=0;break e}w=x+192|0;y=c[x+112>>2]|0;w=e[w>>1]|e[w+2>>1]<<16;z=-1;x=0;break e}}while(0);if((w|0)==0){y=-1;w=0;z=-1;x=0;break}z=v>>>16;break d}}while(0);z=(z|0)==(r|0);if(((z&1)+((y|0)==(r|0))|0)==1){if(z){z=x>>>16;v=x;break}else{z=w>>>16;v=w;break}}B=v<<16>>16;A=x<<16>>16;z=w<<16>>16;if((x&65535)<<16>>16>(v&65535)<<16>>16){y=A}else{y=B;B=(A|0)<(B|0)?A:B}if((y|0)>=(z|0)){y=(B|0)>(z|0)?B:z}z=v>>16;A=x>>16;w=w>>16;if((x>>>16&65535)<<16>>16>(v>>>16&65535)<<16>>16){v=A}else{v=z;z=(A|0)<(z|0)?A:z}if((v|0)<(w|0)){z=v;v=y;break}z=(z|0)>(w|0)?z:w;v=y}}while(0);u=(v&65535)+(u&65535)|0;t=(z&65535)+(t&65535)|0;if(((u<<16>>16)+8192|0)>>>0>16383){R=1;i=l;return R|0}if(((t<<16>>16)+2048|0)>>>0>4095){R=1;i=l;return R|0}v=nb(g,r)|0;if((v|0)==0){R=1;i=l;return R|0}b[a+176>>1]=u;b[a+178>>1]=t;x=a+176|0;t=a+172|0;x=e[x>>1]|e[x+2>>1]<<16;b[t>>1]=x;b[t+2>>1]=x>>>16;t=a+168|0;b[t>>1]=x;b[t+2>>1]=x>>>16;t=a+164|0;b[t>>1]=x;b[t+2>>1]=x>>>16;t=a+144|0;b[t>>1]=x;b[t+2>>1]=x>>>16;t=a+140|0;b[t>>1]=x;b[t+2>>1]=x>>>16;t=a+136|0;b[t>>1]=x;b[t+2>>1]=x>>>16;t=a+132|0;b[t>>1]=x;b[t+2>>1]=x>>>16;c[a+100>>2]=r;c[a+108>>2]=r;t=a+116|0;c[t>>2]=v;c[a+124>>2]=v;w=b[f+164>>1]|0;v=b[f+166>>1]|0;u=c[f+148>>2]|0;z=c[a+208>>2]|0;do{if((z|0)==0){q=138}else{if((c[z+4>>2]|0)!=(c[s>>2]|0)){q=138;break}if(!((c[z>>2]|0)>>>0<6)){y=0;A=-1;z=1;break}y=z+172|0;y=e[y>>1]|e[y+2>>1]<<16;A=c[z+108>>2]|0;z=1}}while(0);do{if((q|0)==138){z=c[a+204>>2]|0;if((z|0)==0){y=0;A=-1;z=0;break}if((c[z+4>>2]|0)!=(c[s>>2]|0)){y=0;A=-1;z=0;break}if(!((c[z>>2]|0)>>>0<6)){y=0;A=-1;z=1;break}y=z+176|0;y=e[y>>1]|e[y+2>>1]<<16;A=c[z+108>>2]|0;z=1}}while(0);f:do{if((A|0)==(u|0)){r=y>>>16;x=y}else{A=c[a+204>>2]|0;do{if((A|0)==0){q=148}else{if((c[A+4>>2]|0)!=(c[s>>2]|0)){q=148;break}if(!((c[A>>2]|0)>>>0<6)){z=-1;s=0;break}s=A+188|0;z=c[A+112>>2]|0;s=e[s>>1]|e[s+2>>1]<<16}}while(0);do{if((q|0)==148){if((z|0)!=0){z=-1;s=0;break}r=x>>>16;break f}}while(0);q=(r|0)==(u|0);r=(z|0)==(u|0);if(((r&1)+(q&1)|0)==1){if(q){r=x>>>16;break}if(r){r=s>>>16;x=s;break}else{r=y>>>16;x=y;break}}z=x<<16>>16;A=s<<16>>16;r=y<<16>>16;if((s&65535)<<16>>16>(x&65535)<<16>>16){q=A}else{q=z;z=(A|0)<(z|0)?A:z}if((q|0)>=(r|0)){q=(z|0)>(r|0)?z:r}z=x>>16;A=s>>16;r=y>>16;if((s>>>16&65535)<<16>>16>(x>>>16&65535)<<16>>16){s=A}else{s=z;z=(A|0)<(z|0)?A:z}if((s|0)<(r|0)){r=s;x=q;break}r=(z|0)>(r|0)?z:r;x=q}}while(0);q=(x&65535)+(w&65535)|0;r=(r&65535)+(v&65535)|0;if(((q<<16>>16)+8192|0)>>>0>16383){R=1;i=l;return R|0}if(((r<<16>>16)+2048|0)>>>0>4095){R=1;i=l;return R|0}g=nb(g,u)|0;if((g|0)==0){R=1;i=l;return R|0}else{R=a+148|0;b[a+192>>1]=q;b[a+194>>1]=r;Q=a+192|0;P=a+188|0;Q=e[Q>>1]|e[Q+2>>1]<<16;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+184|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+180|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+160|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+156|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=a+152|0;b[P>>1]=Q;b[P+2>>1]=Q>>>16;P=R;b[P>>1]=Q;b[P+2>>1]=Q>>>16;c[a+104>>2]=u;c[a+112>>2]=u;P=a+120|0;c[P>>2]=g;c[a+128>>2]=g;Q=m;c[Q>>2]=c[t>>2];hc(k,a+132|0,m,n,o,0,0,8,16);c[Q>>2]=c[P>>2];hc(k,R,m,n,o,8,0,8,16);break}}else{r=a+4|0;t=0;g:while(1){G=f+(t<<2)+176|0;v=Ib(c[G>>2]|0)|0;u=f+(t<<2)+192|0;c[a+(t<<2)+100>>2]=c[u>>2];R=nb(g,c[u>>2]|0)|0;c[a+(t<<2)+116>>2]=R;if((R|0)==0){k=1;q=224;break}if((v|0)!=0){y=t<<2;B=a+(y<<2)+132|0;F=a+(y<<2)+134|0;D=y|1;E=a+(D<<2)+132|0;D=a+(D<<2)+134|0;s=y|2;C=a+(s<<2)+132|0;s=a+(s<<2)+134|0;z=y|3;A=a+(z<<2)+132|0;z=a+(z<<2)+134|0;w=0;do{I=b[f+(t<<4)+(w<<2)+208>>1]|0;H=b[f+(t<<4)+(w<<2)+210>>1]|0;x=Lb(c[G>>2]|0)|0;L=c[u>>2]|0;K=Pb(a,c[4072+(t<<7)+(x<<5)+(w<<3)>>2]|0)|0;q=d[4072+(t<<7)+(x<<5)+(w<<3)+4|0]|0;do{if((K|0)==0){J=0;N=-1;M=0}else{if((c[K+4>>2]|0)!=(c[r>>2]|0)){J=0;N=-1;M=0;break}if(!((c[K>>2]|0)>>>0<6)){J=0;N=-1;M=1;break}J=K+(q<<2)+132|0;J=e[J>>1]|e[J+2>>1]<<16;N=c[K+(q>>>2<<2)+100>>2]|0;M=1}}while(0);q=Pb(a,c[3560+(t<<7)+(x<<5)+(w<<3)>>2]|0)|0;O=d[3560+(t<<7)+(x<<5)+(w<<3)+4|0]|0;do{if((q|0)==0){K=0;O=-1;P=0}else{if((c[q+4>>2]|0)!=(c[r>>2]|0)){K=0;O=-1;P=0;break}if(!((c[q>>2]|0)>>>0<6)){K=0;O=-1;P=1;break}K=q+(O<<2)+132|0;K=e[K>>1]|e[K+2>>1]<<16;O=c[q+(O>>>2<<2)+100>>2]|0;P=1}}while(0);q=Pb(a,c[3048+(t<<7)+(x<<5)+(w<<3)>>2]|0)|0;Q=d[3048+(t<<7)+(x<<5)+(w<<3)+4|0]|0;do{if((q|0)==0){q=184}else{if((c[q+4>>2]|0)!=(c[r>>2]|0)){q=184;break}if(!((c[q>>2]|0)>>>0<6)){P=-1;M=0;q=189;break}M=q+(Q<<2)+132|0;P=c[q+(Q>>>2<<2)+100>>2]|0;M=e[M>>1]|e[M+2>>1]<<16;q=189}}while(0);h:do{if((q|0)==184){q=0;R=Pb(a,c[2536+(t<<7)+(x<<5)+(w<<3)>>2]|0)|0;Q=d[2536+(t<<7)+(x<<5)+(w<<3)+4|0]|0;do{if((R|0)!=0){if((c[R+4>>2]|0)!=(c[r>>2]|0)){break}if(!((c[R>>2]|0)>>>0<6)){P=-1;M=0;q=189;break h}M=R+(Q<<2)+132|0;P=c[R+(Q>>>2<<2)+100>>2]|0;M=e[M>>1]|e[M+2>>1]<<16;q=189;break h}}while(0);if((M|0)==0|(P|0)!=0){P=-1;M=0;q=189;break}L=J>>>16}}while(0);do{if((q|0)==189){q=(N|0)==(L|0);N=(O|0)==(L|0);if(((N&1)+(q&1)+((P|0)==(L|0))|0)==1){if(q){L=J>>>16;break}if(N){L=K>>>16;J=K;break}else{L=M>>>16;J=M;break}}O=J<<16>>16;N=K<<16>>16;L=M<<16>>16;if((K&65535)<<16>>16>(J&65535)<<16>>16){q=N}else{q=O;O=(N|0)<(O|0)?N:O}if((q|0)>=(L|0)){q=(O|0)>(L|0)?O:L}N=J>>16;O=K>>16;M=M>>16;if((K>>>16&65535)<<16>>16>(J>>>16&65535)<<16>>16){L=O}else{L=N;N=(O|0)<(N|0)?O:N}if((L|0)<(M|0)){J=q;break}L=(N|0)>(M|0)?N:M;J=q}}while(0);R=(J&65535)+(I&65535)|0;q=R&65535;H=(L&65535)+(H&65535)|0;I=H&65535;if(((R<<16>>16)+8192|0)>>>0>16383){k=1;q=224;break g}if(((H<<16>>16)+2048|0)>>>0>4095){k=1;q=224;break g}if((x|0)==0){b[B>>1]=q;b[F>>1]=I;b[E>>1]=q;b[D>>1]=I;b[C>>1]=q;b[s>>1]=I;b[A>>1]=q;b[z>>1]=I}else if((x|0)==1){R=(w<<1)+y|0;b[a+(R<<2)+132>>1]=q;b[a+(R<<2)+134>>1]=I;R=R|1;b[a+(R<<2)+132>>1]=q;b[a+(R<<2)+134>>1]=I}else if((x|0)==2){R=w+y|0;b[a+(R<<2)+132>>1]=q;b[a+(R<<2)+134>>1]=I;R=R+2|0;b[a+(R<<2)+132>>1]=q;b[a+(R<<2)+134>>1]=I}else if((x|0)==3){R=w+y|0;b[a+(R<<2)+132>>1]=q;b[a+(R<<2)+134>>1]=I}w=w+1|0;}while(w>>>0<v>>>0)}t=t+1|0;if(!(t>>>0<4)){q=213;break}}if((q|0)==213){g=m;q=0;do{c[g>>2]=c[a+(q<<2)+116>>2];t=Lb(c[f+(q<<2)+176>>2]|0)|0;s=q<<3&8;r=q>>>0<2?0:8;if((t|0)==0){hc(k,a+(q<<2<<2)+132|0,m,n,o,s,r,8,8)}else if((t|0)==1){R=q<<2;hc(k,a+(R<<2)+132|0,m,n,o,s,r,8,4);hc(k,a+((R|2)<<2)+132|0,m,n,o,s,r|4,8,4)}else if((t|0)==2){R=q<<2;hc(k,a+(R<<2)+132|0,m,n,o,s,r,4,8);hc(k,a+((R|1)<<2)+132|0,m,n,o,s|4,r,4,8)}else{P=q<<2;hc(k,a+(P<<2)+132|0,m,n,o,s,r,4,4);Q=s|4;hc(k,a+((P|1)<<2)+132|0,m,n,o,Q,r,4,4);R=r|4;hc(k,a+((P|2)<<2)+132|0,m,n,o,s,R,4,4);hc(k,a+((P|3)<<2)+132|0,m,n,o,Q,R,4,4)}q=q+1|0;}while((q|0)!=4)}else if((q|0)==224){i=l;return k|0}}}while(0);if((c[a+196>>2]|0)>>>0>1){R=0;i=l;return R|0}if((c[p>>2]|0)==0){wb(j,k);R=0;i=l;return R|0}else{xb(j,h,k,f+328|0);R=0;i=l;return R|0}return 0}function zb(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0;h=i;i=i+72|0;k=h;j=h+40|0;m=k;l=j;Ab(d,m,l,e);do{if((Gb(c[a>>2]|0)|0)==1){l=Bb(a,g,b+328|0,m,l,f)|0;if((l|0)==0){break}i=h;return l|0}else{l=Cb(a,g,b,m,l,f)|0;if((l|0)==0){break}i=h;return l|0}}while(0);f=Db(a,g+256|0,b+1352|0,k+21|0,j+16|0,c[b+140>>2]|0,f)|0;if((f|0)!=0){e=f;i=h;return e|0}if((c[a+196>>2]|0)>>>0>1){e=0;i=h;return e|0}wb(d,g);e=0;i=h;return e|0}function Ab(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;l=i;if((f|0)==0){i=l;return}h=c[b+4>>2]|0;j=_(c[b+8>>2]|0,h)|0;g=(f>>>0)/(h>>>0)|0;n=_(g,h)|0;k=f-n|0;o=h<<4;q=c[b>>2]|0;p=(k<<4)+(_(h<<8,g)|0)|0;m=(g|0)!=0;if(m){r=p-(o|1)|0;a[d]=a[q+r|0]|0;a[d+1|0]=a[q+(r+1)|0]|0;a[d+2|0]=a[q+(r+2)|0]|0;a[d+3|0]=a[q+(r+3)|0]|0;a[d+4|0]=a[q+(r+4)|0]|0;a[d+5|0]=a[q+(r+5)|0]|0;a[d+6|0]=a[q+(r+6)|0]|0;a[d+7|0]=a[q+(r+7)|0]|0;a[d+8|0]=a[q+(r+8)|0]|0;a[d+9|0]=a[q+(r+9)|0]|0;a[d+10|0]=a[q+(r+10)|0]|0;a[d+11|0]=a[q+(r+11)|0]|0;a[d+12|0]=a[q+(r+12)|0]|0;a[d+13|0]=a[q+(r+13)|0]|0;a[d+14|0]=a[q+(r+14)|0]|0;a[d+15|0]=a[q+(r+15)|0]|0;a[d+16|0]=a[q+(r+16)|0]|0;a[d+17|0]=a[q+(r+17)|0]|0;a[d+18|0]=a[q+(r+18)|0]|0;a[d+19|0]=a[q+(r+19)|0]|0;a[d+20|0]=a[q+(r+20)|0]|0;d=d+21|0}n=(n|0)!=(f|0);if(n){r=p+ -1|0;a[e]=a[q+r|0]|0;r=r+o|0;a[e+1|0]=a[q+r|0]|0;r=r+o|0;a[e+2|0]=a[q+r|0]|0;r=r+o|0;a[e+3|0]=a[q+r|0]|0;r=r+o|0;a[e+4|0]=a[q+r|0]|0;r=r+o|0;a[e+5|0]=a[q+r|0]|0;r=r+o|0;a[e+6|0]=a[q+r|0]|0;r=r+o|0;a[e+7|0]=a[q+r|0]|0;r=r+o|0;a[e+8|0]=a[q+r|0]|0;r=r+o|0;a[e+9|0]=a[q+r|0]|0;r=r+o|0;a[e+10|0]=a[q+r|0]|0;r=r+o|0;a[e+11|0]=a[q+r|0]|0;r=r+o|0;a[e+12|0]=a[q+r|0]|0;r=r+o|0;a[e+13|0]=a[q+r|0]|0;r=r+o|0;a[e+14|0]=a[q+r|0]|0;a[e+15|0]=a[q+(r+o)|0]|0;e=e+16|0}o=h<<3&2147483640;p=c[b>>2]|0;b=(_(g<<3,o)|0)+(j<<8)+(k<<3)|0;if(m){r=b-(o|1)|0;f=(_((g<<3)+ -1|0,h<<3&2147483640)|0)+(j<<8)+(k<<3)|7;a[d]=a[p+r|0]|0;a[d+1|0]=a[p+(r+1)|0]|0;a[d+2|0]=a[p+(r+2)|0]|0;a[d+3|0]=a[p+(r+3)|0]|0;a[d+4|0]=a[p+(r+4)|0]|0;a[d+5|0]=a[p+(r+5)|0]|0;a[d+6|0]=a[p+(r+6)|0]|0;a[d+7|0]=a[p+(r+7)|0]|0;a[d+8|0]=a[p+(r+8)|0]|0;r=j<<6;q=f+(r+ -8)|0;a[d+9|0]=a[p+q|0]|0;a[d+10|0]=a[p+(q+1)|0]|0;a[d+11|0]=a[p+(q+2)|0]|0;a[d+12|0]=a[p+(q+3)|0]|0;a[d+13|0]=a[p+(q+4)|0]|0;a[d+14|0]=a[p+(q+5)|0]|0;a[d+15|0]=a[p+(q+6)|0]|0;a[d+16|0]=a[p+(q+7)|0]|0;a[d+17|0]=a[p+(f+r)|0]|0}if(!n){i=l;return}f=b+ -1|0;r=(_(g<<3|7,h<<3&2147483640)|0)+(j<<8)+(k<<3)+ -1|0;a[e]=a[p+f|0]|0;f=f+o|0;a[e+1|0]=a[p+f|0]|0;f=f+o|0;a[e+2|0]=a[p+f|0]|0;f=f+o|0;a[e+3|0]=a[p+f|0]|0;f=f+o|0;a[e+4|0]=a[p+f|0]|0;f=f+o|0;a[e+5|0]=a[p+f|0]|0;f=f+o|0;a[e+6|0]=a[p+f|0]|0;a[e+7|0]=a[p+(f+o)|0]|0;r=r+(o+((j<<6)-(h<<6)))|0;a[e+8|0]=a[p+r|0]|0;r=r+o|0;a[e+9|0]=a[p+r|0]|0;r=r+o|0;a[e+10|0]=a[p+r|0]|0;r=r+o|0;a[e+11|0]=a[p+r|0]|0;r=r+o|0;a[e+12|0]=a[p+r|0]|0;r=r+o|0;a[e+13|0]=a[p+r|0]|0;r=r+o|0;a[e+14|0]=a[p+r|0]|0;a[e+15|0]=a[p+(r+o)|0]|0;i=l;return}function Bb(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;k=i;m=b+200|0;l=Ub(b,c[m>>2]|0)|0;j=(j|0)==0;if(!((l|0)==0|j)){y=(Gb(c[c[m>>2]>>2]|0)|0)==2;l=y?0:l}n=b+204|0;m=Ub(b,c[n>>2]|0)|0;if(!((m|0)==0|j)){y=(Gb(c[c[n>>2]>>2]|0)|0)==2;m=y?0:m}o=b+212|0;n=Ub(b,c[o>>2]|0)|0;if(!((n|0)==0|j)){y=(Gb(c[c[o>>2]>>2]|0)|0)==2;n=y?0:n}b=Jb(c[b>>2]|0)|0;if((b|0)==0){if((m|0)==0){y=1;i=k;return y|0}v=g+1|0;w=g+2|0;u=g+3|0;t=g+4|0;s=g+5|0;r=g+6|0;q=g+7|0;p=g+8|0;o=g+9|0;n=g+10|0;h=g+11|0;m=g+12|0;j=g+13|0;l=g+14|0;b=g+15|0;x=g+16|0;g=e;y=0;while(1){a[g]=a[v]|0;a[g+1|0]=a[w]|0;a[g+2|0]=a[u]|0;a[g+3|0]=a[t]|0;a[g+4|0]=a[s]|0;a[g+5|0]=a[r]|0;a[g+6|0]=a[q]|0;a[g+7|0]=a[p]|0;a[g+8|0]=a[o]|0;a[g+9|0]=a[n]|0;a[g+10|0]=a[h]|0;a[g+11|0]=a[m]|0;a[g+12|0]=a[j]|0;a[g+13|0]=a[l]|0;a[g+14|0]=a[b]|0;a[g+15|0]=a[x]|0;y=y+1|0;if((y|0)==16){break}else{g=g+16|0}}}else if((b|0)==2){b=g+1|0;l=(l|0)!=0;m=(m|0)==0;do{if(m|l^1){if(l){g=((d[h]|0)+8+(d[h+1|0]|0)+(d[h+2|0]|0)+(d[h+3|0]|0)+(d[h+4|0]|0)+(d[h+5|0]|0)+(d[h+6|0]|0)+(d[h+7|0]|0)+(d[h+8|0]|0)+(d[h+9|0]|0)+(d[h+10|0]|0)+(d[h+11|0]|0)+(d[h+12|0]|0)+(d[h+13|0]|0)+(d[h+14|0]|0)+(d[h+15|0]|0)|0)>>>4;break}if(m){g=128;break}g=((d[b]|0)+8+(d[g+2|0]|0)+(d[g+3|0]|0)+(d[g+4|0]|0)+(d[g+5|0]|0)+(d[g+6|0]|0)+(d[g+7|0]|0)+(d[g+8|0]|0)+(d[g+9|0]|0)+(d[g+10|0]|0)+(d[g+11|0]|0)+(d[g+12|0]|0)+(d[g+13|0]|0)+(d[g+14|0]|0)+(d[g+15|0]|0)+(d[g+16|0]|0)|0)>>>4}else{m=0;l=0;while(1){b=m+1|0;l=(d[g+b|0]|0)+l+(d[h+m|0]|0)|0;if((b|0)==16){break}else{m=b}}g=(l+16|0)>>>5}}while(0);_c(e|0,g&255|0,256)|0}else if((b|0)==1){if((l|0)==0){y=1;i=k;return y|0}else{g=e;b=0;while(1){y=h+b|0;a[g]=a[y]|0;a[g+1|0]=a[y]|0;a[g+2|0]=a[y]|0;a[g+3|0]=a[y]|0;a[g+4|0]=a[y]|0;a[g+5|0]=a[y]|0;a[g+6|0]=a[y]|0;a[g+7|0]=a[y]|0;a[g+8|0]=a[y]|0;a[g+9|0]=a[y]|0;a[g+10|0]=a[y]|0;a[g+11|0]=a[y]|0;a[g+12|0]=a[y]|0;a[g+13|0]=a[y]|0;a[g+14|0]=a[y]|0;a[g+15|0]=a[y]|0;b=b+1|0;if((b|0)==16){break}else{g=g+16|0}}}}else{if((l|0)==0|(m|0)==0|(n|0)==0){y=1;i=k;return y|0}l=d[g+16|0]|0;y=d[h+15|0]|0;b=d[g]|0;g=(((d[g+9|0]|0)-(d[g+7|0]|0)+((d[g+10|0]|0)-(d[g+6|0]|0)<<1)+(((d[g+11|0]|0)-(d[g+5|0]|0)|0)*3|0)+((d[g+12|0]|0)-(d[g+4|0]|0)<<2)+(((d[g+13|0]|0)-(d[g+3|0]|0)|0)*5|0)+(((d[g+14|0]|0)-(d[g+2|0]|0)|0)*6|0)+(((d[g+15|0]|0)-(d[g+1|0]|0)|0)*7|0)+(l-b<<3)|0)*5|0)+32>>6;b=(((d[h+8|0]|0)-(d[h+6|0]|0)+(y-b<<3)+((d[h+9|0]|0)-(d[h+5|0]|0)<<1)+(((d[h+10|0]|0)-(d[h+4|0]|0)|0)*3|0)+((d[h+11|0]|0)-(d[h+3|0]|0)<<2)+(((d[h+12|0]|0)-(d[h+2|0]|0)|0)*5|0)+(((d[h+13|0]|0)-(d[h+1|0]|0)|0)*6|0)+(((d[h+14|0]|0)-(d[h]|0)|0)*7|0)|0)*5|0)+32>>6;h=(y+l<<4)+16|0;l=0;do{j=h+(_(l+ -7|0,b)|0)|0;m=l<<4;n=0;do{o=j+(_(n+ -7|0,g)|0)>>5;if((o|0)<0){o=0}else{o=(o|0)>255?-1:o&255}a[e+(n+m)|0]=o;n=n+1|0;}while((n|0)!=16);l=l+1|0;}while((l|0)!=16)}Eb(e,f,0);Eb(e,f+64|0,1);Eb(e,f+128|0,2);Eb(e,f+192|0,3);Eb(e,f+256|0,4);Eb(e,f+320|0,5);Eb(e,f+384|0,6);Eb(e,f+448|0,7);Eb(e,f+512|0,8);Eb(e,f+576|0,9);Eb(e,f+640|0,10);Eb(e,f+704|0,11);Eb(e,f+768|0,12);Eb(e,f+832|0,13);Eb(e,f+896|0,14);Eb(e,f+960|0,15);y=0;i=k;return y|0}function Cb(b,e,f,g,h,j){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;k=i;j=(j|0)==0;l=0;a:while(1){o=Qb(l)|0;m=c[o+4>>2]|0;o=Pb(b,c[o>>2]|0)|0;q=Ub(b,o)|0;if(!((q|0)==0|j)){H=(Gb(c[o>>2]|0)|0)==2;q=H?0:q}p=Rb(l)|0;n=c[p+4>>2]|0;p=Pb(b,c[p>>2]|0)|0;r=Ub(b,p)|0;if(!((r|0)==0|j)){H=(Gb(c[p>>2]|0)|0)==2;r=H?0:r}s=(q|0)!=0;if(s&(r|0)!=0){if((Gb(c[o>>2]|0)|0)==0){m=d[o+(m&255)+82|0]|0}else{m=2}if((Gb(c[p>>2]|0)|0)==0){n=d[p+(n&255)+82|0]|0}else{n=2}v=m>>>0<n>>>0?m:n}else{v=2}if((c[f+(l<<2)+12>>2]|0)==0){H=c[f+(l<<2)+76>>2]|0;v=(H>>>0>=v>>>0)+H|0}a[b+l+82|0]=v;m=c[(Sb(l)|0)>>2]|0;m=Pb(b,m)|0;y=Ub(b,m)|0;if(!((y|0)==0|j)){H=(Gb(c[m>>2]|0)|0)==2;y=H?0:y}m=c[(Tb(l)|0)>>2]|0;m=Pb(b,m)|0;A=Ub(b,m)|0;if(!((A|0)==0|j)){H=(Gb(c[m>>2]|0)|0)==2;A=H?0:A}m=c[4584+(l<<2)>>2]|0;n=c[4648+(l<<2)>>2]|0;F=(1285>>>l&1|0)!=0;if(F){o=h+(n+3)|0;p=h+(n+2)|0;q=h+(n+1)|0;t=h+n|0}else{t=(n<<4)+m|0;o=e+(t+47)|0;p=e+(t+31)|0;q=e+(t+15)|0;t=e+(t+ -1)|0}x=a[t]|0;z=a[q]|0;B=a[p]|0;C=a[o]|0;do{if((51>>>l&1|0)==0){H=n+ -1|0;G=(H<<4)+m|0;u=a[e+G|0]|0;E=a[e+(G+1)|0]|0;D=a[e+(G+2)|0]|0;o=a[e+(G+3)|0]|0;w=a[e+(G+4)|0]|0;q=a[e+(G+5)|0]|0;p=a[e+(G+6)|0]|0;t=a[e+(G+7)|0]|0;if(F){F=h+H|0;break}else{F=e+(G+ -1)|0;break}}else{F=g+m|0;t=a[g+(m+8)|0]|0;p=a[g+(m+7)|0]|0;q=a[g+(m+6)|0]|0;w=a[g+(m+5)|0]|0;o=a[g+(m+4)|0]|0;D=a[g+(m+3)|0]|0;E=a[g+(m+2)|0]|0;u=a[g+(m+1)|0]|0}}while(0);F=a[F]|0;switch(v|0){case 1:{if(!s){e=1;h=51;break a}p=_(C&255,16843009)|0;q=_(B&255,16843009)|0;z=_(z&255,16843009)|0;o=_(x&255,16843009)|0;break};case 0:{if((r|0)==0){e=1;h=51;break a}o=(D&255)<<16|(o&255)<<24|(E&255)<<8|u&255;p=o;q=o;z=o;break};case 2:{p=(r|0)==0;do{if(p|s^1){if(s){o=((x&255)+2+(z&255)+(B&255)+(C&255)|0)>>>2;break}if(p){o=128;break}o=((o&255)+2+(D&255)+(E&255)+(u&255)|0)>>>2}else{o=((x&255)+4+(z&255)+(B&255)+(C&255)+(o&255)+(D&255)+(E&255)+(u&255)|0)>>>3}}while(0);o=_(o&255,16843009)|0;p=o;q=o;z=o;break};case 3:{if((r|0)==0){e=1;h=51;break a}x=(y|0)==0;r=E&255;s=D&255;v=s+2|0;z=o&255;y=z+2|0;s=(y+r+(s<<1)|0)>>>2&255;A=(x?o:w)&255;w=(v+(z<<1)+A|0)>>>2&255;q=(x?o:q)&255;y=(y+q+(A<<1)|0)>>>2;z=y&255;p=(x?o:p)&255;A=(A+2+p+(q<<1)|0)>>>2;B=A&255;o=(x?o:t)&255;q=(q+2+o+(p<<1)|0)>>>2;p=(p+2+(o*3|0)|0)>>>2<<24|z|B<<8|q<<16&16711680;q=w|z<<8|q<<24|B<<16;z=z<<16|s|A<<24|w<<8;o=s<<8|y<<24|(v+(u&255)+(r<<1)|0)>>>2&255|w<<16;break};case 4:{if((r|0)==0|s^1|(A|0)==0){e=1;h=51;break a}A=u&255;H=F&255;q=x&255;y=A+2|0;p=(y+q+(H<<1)|0)>>>2;G=p&255;E=E&255;x=H+2|0;A=((A<<1)+E+x|0)>>>2;H=A&255;F=D&255;D=((E<<1)+F+y|0)>>>2;y=z&255;z=(y+(q<<1)+x|0)>>>2&255;B=B&255;q=(q+2+(y<<1)+B|0)>>>2&255;p=(y+2+(B<<1)+(C&255)|0)>>>2&255|q<<8|p<<24|z<<16;q=A<<24|q|G<<16|z<<8;z=z|D<<24|H<<16|G<<8;o=D<<16&16711680|((o&255)+2+E+(F<<1)|0)>>>2<<24|G|H<<8;break};case 5:{if((r|0)==0|s^1|(A|0)==0){e=1;h=51;break a}q=F&255;G=u&255;H=(G+1+q|0)>>>1&255;y=E&255;C=(y+2+(G<<1)+q|0)>>>2&255;x=x&255;E=G+2|0;A=(E+x+(q<<1)|0)>>>2&255;G=(y+1+G|0)>>>1&255;F=D&255;D=((y<<1)+F+E|0)>>>2;E=(F+1+y|0)>>>1;o=o&255;z=z&255;p=D<<24|(x+2+(B&255)+(z<<1)|0)>>>2&255|C<<16|A<<8;q=G<<16|E<<24|(z+2+(x<<1)+q|0)>>>2&255|H<<8;z=D<<16&16711680|(o+2+y+(F<<1)|0)>>>2<<24|A|C<<8;o=E<<16&16711680|(o+1+F|0)>>>1<<24|G<<8|H;break};case 6:{if((r|0)==0|s^1|(A|0)==0){e=1;h=51;break a}H=F&255;o=x&255;x=o+1|0;A=(x+H|0)>>>1&255;w=z&255;y=((o<<1)+2+w+H|0)>>>2;z=(x+w|0)>>>1&255;x=B&255;o=o+2|0;q=(o+(w<<1)+x|0)>>>2;B=(w+1+x|0)>>>1&255;p=C&255;G=u&255;o=(o+G+(H<<1)|0)>>>2;F=E&255;p=q<<24|B<<16|(x+1+p|0)>>>1&255|w+2+(x<<1)+p<<6&65280;q=B|z<<16|q<<8&65280|y<<24;z=y<<8&65280|z|A<<16|o<<24;o=A|((D&255)+2+(F<<1)+G|0)>>>2<<24|F+2+(G<<1)+H<<14&16711680|o<<8&65280;break};case 7:{if((r|0)==0){e=1;h=51;break a}v=(y|0)==0;r=u&255;s=E&255;z=D&255;t=(z+1+s|0)>>>1&255;A=o&255;y=A+1|0;u=(y+z|0)>>>1&255;x=(v?o:w)&255;w=(y+x|0)>>>1;y=z+2|0;B=A+2|0;z=(B+s+(z<<1)|0)>>>2&255;A=(y+(A<<1)+x|0)>>>2&255;q=(v?o:q)&255;B=(B+q+(x<<1)|0)>>>2;p=B<<16&16711680|z|(x+2+((v?o:p)&255)+(q<<1)|0)>>>2<<24|A<<8;q=t|u<<8|w<<16&16711680|(x+1+q|0)>>>1<<24;z=z<<8|B<<24|(y+r+(s<<1)|0)>>>2&255|A<<16;o=u<<16|w<<24|t<<8|(s+1+r|0)>>>1&255;break};default:{if(!s){e=1;h=51;break a}F=x&255;G=z&255;E=B&255;H=(G+1+E|0)>>>1&255;p=C&255;o=(G+2+(E<<1)+p|0)>>>2;D=(E+1+p|0)>>>1&255;z=(E+2+(p*3|0)|0)>>>2;q=p<<16;C=p<<24;p=p<<8|p|q|C;q=C|q|D|z<<8&65280;z=D<<16|H|z<<24|o<<8&65280;o=F+2+(G<<1)+E<<6&65280|(F+1+G|0)>>>1&255|H<<16|o<<24}}H=(n<<4)+m|0;c[e+H>>2]=o;c[e+(H+16)>>2]=z;c[e+(H+32)>>2]=q;c[e+(H+48)>>2]=p;Eb(e,f+(l<<6)+328|0,l);l=l+1|0;if(!(l>>>0<16)){e=0;h=51;break}}if((h|0)==51){i=k;return e|0}return 0}function Db(b,e,f,g,h,j,k){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;k=k|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;l=i;m=b+200|0;n=Ub(b,c[m>>2]|0)|0;k=(k|0)==0;if(!((n|0)==0|k)){x=(Gb(c[c[m>>2]>>2]|0)|0)==2;n=x?0:n}o=b+204|0;m=Ub(b,c[o>>2]|0)|0;if(!((m|0)==0|k)){x=(Gb(c[c[o>>2]>>2]|0)|0)==2;m=x?0:m}o=b+212|0;b=Ub(b,c[o>>2]|0)|0;if((b|0)==0|k){o=b}else{x=(Gb(c[c[o>>2]>>2]|0)|0)==2;o=x?0:b}b=(n|0)==0;k=(m|0)==0;m=b|k|(o|0)==0;n=(n|0)!=0;o=k|n^1;p=16;q=0;while(1){if((j|0)==1){if(b){j=1;b=29;break}else{s=e;r=h;t=8}while(1){t=t+ -1|0;a[s]=a[r]|0;a[s+1|0]=a[r]|0;a[s+2|0]=a[r]|0;a[s+3|0]=a[r]|0;a[s+4|0]=a[r]|0;a[s+5|0]=a[r]|0;a[s+6|0]=a[r]|0;a[s+7|0]=a[r]|0;if((t|0)==0){break}else{r=r+1|0;s=s+8|0}}}else if((j|0)==2){if(k){j=1;b=29;break}else{r=e;t=g;s=8}while(1){t=t+1|0;s=s+ -1|0;a[r]=a[t]|0;a[r+8|0]=a[t]|0;a[r+16|0]=a[t]|0;a[r+24|0]=a[t]|0;a[r+32|0]=a[t]|0;a[r+40|0]=a[t]|0;a[r+48|0]=a[t]|0;a[r+56|0]=a[t]|0;if((s|0)==0){break}else{r=r+1|0}}}else if((j|0)==0){s=g+1|0;do{if(o){if(!k){t=((d[s]|0)+2+(d[g+2|0]|0)+(d[g+3|0]|0)+(d[g+4|0]|0)|0)>>>2;r=((d[g+5|0]|0)+2+(d[g+6|0]|0)+(d[g+7|0]|0)+(d[g+8|0]|0)|0)>>>2;break}if(!n){t=128;r=128;break}r=((d[h]|0)+2+(d[h+1|0]|0)+(d[h+2|0]|0)+(d[h+3|0]|0)|0)>>>2;t=r}else{t=((d[s]|0)+4+(d[g+2|0]|0)+(d[g+3|0]|0)+(d[g+4|0]|0)+(d[h]|0)+(d[h+1|0]|0)+(d[h+2|0]|0)+(d[h+3|0]|0)|0)>>>3;r=((d[g+5|0]|0)+2+(d[g+6|0]|0)+(d[g+7|0]|0)+(d[g+8|0]|0)|0)>>>2}}while(0);w=t&255;x=r&255;_c(e|0,w|0,4)|0;_c(e+4|0,x|0,4)|0;_c(e+8|0,w|0,4)|0;_c(e+12|0,x|0,4)|0;_c(e+16|0,w|0,4)|0;_c(e+20|0,x|0,4)|0;r=e+32|0;_c(e+24|0,w|0,4)|0;_c(e+28|0,x|0,4)|0;do{if(n){u=d[h+4|0]|0;v=d[h+5|0]|0;w=d[h+6|0]|0;x=d[h+7|0]|0;t=(u+2+v+w+x|0)>>>2;if(k){s=t;break}s=t;t=(u+4+v+w+x+(d[g+5|0]|0)+(d[g+6|0]|0)+(d[g+7|0]|0)+(d[g+8|0]|0)|0)>>>3}else{if(k){s=128;t=128;break}s=((d[s]|0)+2+(d[g+2|0]|0)+(d[g+3|0]|0)+(d[g+4|0]|0)|0)>>>2;t=((d[g+5|0]|0)+2+(d[g+6|0]|0)+(d[g+7|0]|0)+(d[g+8|0]|0)|0)>>>2}}while(0);w=s&255;x=t&255;_c(r|0,w|0,4)|0;_c(e+36|0,x|0,4)|0;_c(e+40|0,w|0,4)|0;_c(e+44|0,x|0,4)|0;_c(e+48|0,w|0,4)|0;_c(e+52|0,x|0,4)|0;_c(e+56|0,w|0,4)|0;_c(e+60|0,x|0,4)|0}else{if(m){j=1;b=29;break}v=d[g+8|0]|0;w=d[h+7|0]|0;s=d[g]|0;u=(((d[g+5|0]|0)-(d[g+3|0]|0)+((d[g+6|0]|0)-(d[g+2|0]|0)<<1)+(((d[g+7|0]|0)-(d[g+1|0]|0)|0)*3|0)+(v-s<<2)|0)*17|0)+16>>5;s=(((d[h+4|0]|0)-(d[h+2|0]|0)+(w-s<<2)+((d[h+5|0]|0)-(d[h+1|0]|0)<<1)+(((d[h+6|0]|0)-(d[h]|0)|0)*3|0)|0)*17|0)+16>>5;t=_(u,-3)|0;r=e;v=(w+v<<4)+16+(_(s,-3)|0)|0;w=8;while(1){w=w+ -1|0;x=v+t|0;a[r]=a[(x>>5)+5224|0]|0;x=x+u|0;a[r+1|0]=a[(x>>5)+5224|0]|0;x=x+u|0;a[r+2|0]=a[(x>>5)+5224|0]|0;x=x+u|0;a[r+3|0]=a[(x>>5)+5224|0]|0;x=x+u|0;a[r+4|0]=a[(x>>5)+5224|0]|0;x=x+u|0;a[r+5|0]=a[(x>>5)+5224|0]|0;x=x+u|0;a[r+6|0]=a[(x>>5)+5224|0]|0;a[r+7|0]=a[(x+u>>5)+5224|0]|0;if((w|0)==0){break}else{v=v+s|0;r=r+8|0}}}Eb(e,f,p);x=p|1;Eb(e,f+64|0,x);Eb(e,f+128|0,x+1|0);Eb(e,f+192|0,p|3);q=q+1|0;if(q>>>0<2){e=e+64|0;h=h+8|0;g=g+9|0;f=f+256|0;p=p+4|0}else{j=0;b=29;break}}if((b|0)==29){i=l;return j|0}return 0}




// EMSCRIPTEN_END_FUNCS
return{_h264bsdCroppingParams:hb,_h264bsdDecode:$a,_h264bsdInit:_a,_memset:_c,_h264bsdNextOutputPictureRGBA:cb,_h264bsdAlloc:ib,_h264bsdShutdown:ab,_h264bsdPicHeight:eb,_strlen:$c,_malloc:Xc,_h264bsdNextOutputPicture:bb,_h264bsdPicWidth:db,_memcpy:ad,_free:Yc,_h264bsdConvertToRGBA:fb,_h264bsdFree:jb,_h264bsdCheckValidParamSets:gb,runPostSets:Zc,stackAlloc:ya,stackSave:za,stackRestore:Aa,setThrew:Ba,setTempRet0:Ea,setTempRet1:Fa,setTempRet2:Ga,setTempRet3:Ha,setTempRet4:Ia,setTempRet5:Ja,setTempRet6:Ka,setTempRet7:La,setTempRet8:Ma,setTempRet9:Na}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "_llvm_lifetime_start": _llvm_lifetime_start, "_fflush": _fflush, "__formatString": __formatString, "_time": _time, "_send": _send, "_pwrite": _pwrite, "_abort": _abort, "__reallyNegative": __reallyNegative, "_fwrite": _fwrite, "_sbrk": _sbrk, "_mkport": _mkport, "_fprintf": _fprintf, "___setErrNo": ___setErrNo, "_llvm_lifetime_end": _llvm_lifetime_end, "_fileno": _fileno, "_write": _write, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_sysconf": _sysconf, "___errno_location": ___errno_location, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _h264bsdCroppingParams = Module["_h264bsdCroppingParams"] = asm["_h264bsdCroppingParams"];
var _h264bsdDecode = Module["_h264bsdDecode"] = asm["_h264bsdDecode"];
var _h264bsdInit = Module["_h264bsdInit"] = asm["_h264bsdInit"];
var _memset = Module["_memset"] = asm["_memset"];
var _h264bsdNextOutputPictureRGBA = Module["_h264bsdNextOutputPictureRGBA"] = asm["_h264bsdNextOutputPictureRGBA"];
var _h264bsdAlloc = Module["_h264bsdAlloc"] = asm["_h264bsdAlloc"];
var _h264bsdShutdown = Module["_h264bsdShutdown"] = asm["_h264bsdShutdown"];
var _h264bsdPicHeight = Module["_h264bsdPicHeight"] = asm["_h264bsdPicHeight"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _h264bsdNextOutputPicture = Module["_h264bsdNextOutputPicture"] = asm["_h264bsdNextOutputPicture"];
var _h264bsdPicWidth = Module["_h264bsdPicWidth"] = asm["_h264bsdPicWidth"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _free = Module["_free"] = asm["_free"];
var _h264bsdConvertToRGBA = Module["_h264bsdConvertToRGBA"] = asm["_h264bsdConvertToRGBA"];
var _h264bsdFree = Module["_h264bsdFree"] = asm["_h264bsdFree"];
var _h264bsdCheckValidParamSets = Module["_h264bsdCheckValidParamSets"] = asm["_h264bsdCheckValidParamSets"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






