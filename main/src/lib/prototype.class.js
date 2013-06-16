/*
 * Refactored Prototype.js
 *  * Wrapped in a namespace "Prototype"
 *  * No modifications to built-ins (Array.each, ...)
 *  * Contains only the Class object
 */
/*  Prototype JavaScript framework, version 1.7
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

/* Based on Alex Arnell's inheritance implementation. */
var Prototype = (function() {
	
var FUNCTION_CLASS = '[object Function]';

var emptyFunction = function(){};

var slice = Array.prototype.slice;

	
function $A(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

var Objects = {
		extend: function (destination, source) {
			for (var property in source)
				destination[property] = source[property];
			return destination;
		},
		isUndefined: function (object) {
			return typeof object === "undefined";
		},
		isFunction: function(object) {
			return Object.prototype.toString.call(object) === FUNCTION_CLASS;
		}

};

var Functions = {

			update: function(array, args) {
				var arrayLength = array.length, length = args.length;
				while (length--) array[arrayLength + length] = args[length];
				return array;
			},

			merge: function(array, args) {
				array = slice.call(array, 0);
				return Functions.update(array, args);
			},

			argumentNames: function(f) {
				var names = f.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
					.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
					.replace(/\s+/g, '').split(',');
				return names.length == 1 && !names[0] ? [] : names;
			},

			bind: function(f, context) {
				if (arguments.length < 2 && Objects.isUndefined(arguments[0])) return f;
				var __method = f, args = slice.call(arguments, 1+1);
				return function() {
					var a = Functions.merge(args, arguments);
					return __method.apply(context, a);
				};
			},

			bindAsEventListener: function(f, context) {
				var __method = f, args = slice.call(arguments, 1+1);
				return function(event) {
					var a = Functions.update([event || window.event], args);
					return __method.apply(context, a);
				};
			},

			curry: function(f) {
				if (!arguments.length) return f;
				var __method = f, args = slice.call(arguments, 0+1);
				return function() {
					var a = Functions.merge(args, arguments);
					return __method.apply(this, a);
				};
			},

			delay: function(f, timeout) {
				var __method = f, args = slice.call(arguments, 1+1);
				timeout = timeout * 1000;
				return window.setTimeout(function() {
					return __method.apply(__method, args);
				}, timeout);
			},

			defer: function(f) {
				var args = Functions.update([0.01], arguments);
				return Functions.delay.apply(f, args);
			},

			wrap: function(f, wrapper) {
				var __method = f;
				return function() {
					var a = Functions.update([Functions.bind(__method, this)], arguments);
					return wrapper.apply(this, a);
				};
			},

			methodize: function(f) {
				if (f._methodized) return f._methodized;
				var __method = f;
				return f._methodized = function() {
					var a = Functions.update([this], arguments);
					return __method.apply(null, a);
				};
			}
};

this.Class = (function() {

  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      if (p === 'toString') return false;
    }
    return true;
  })();

  function subclass() {}
  function create() {
    var parent = null, properties = $A(arguments);
    if (Objects.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Objects.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass();
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
  	if(!(source instanceof Object)){
  		alert("bad source:" + source);
  		return;
  	}
	var ancestor   = this.superclass && this.superclass.prototype,
	properties = Object.keys(source);

	if (IS_DONTENUM_BUGGY) {
		if (source.toString != Object.prototype.toString)
			properties.push("toString");
		if (source.valueOf != Object.prototype.valueOf)
			properties.push("valueOf");
	}

	for (var i = 0, length = properties.length; i < length; i++) {
		var property = properties[i], value = source[property];
		if (ancestor && Objects.isFunction(value) &&
		Functions.argumentNames(value)[0] == "$super") {
			var method = value;
			value = Functions.wrap((function(m) {
				return function() { return ancestor[m].apply(this, arguments); };
			})(property), method);

			value.valueOf = Functions.bind(method.valueOf, method);
			value.toString = Functions.bind(method.toString, method);
		}
		this.prototype[property] = value;
	}

	return this;
}
  

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})(); // Class

	return this;
}).apply({}); // Prototype

