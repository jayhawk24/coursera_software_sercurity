/*
    http://www.JSON.org/json2.js
    2010-08-25

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf, PARSELY
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

(function () {
    if (!this.PARSELY) { this.PARSELY = {}; }
    var root = this.PARSELY;
    if (!root.JSON) { root.JSON = window.JSON || {}; }

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof root.JSON.stringify !== 'function') {
        root.JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof root.JSON.parse !== 'function') {
        root.JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  if (!this.PARSELY) { this.PARSELY = {}; }
  var root = this.PARSELY;

  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  root.Class = function(){};
 
  // Create a new Class that inherits from this class
  root.Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);       
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

 (function( global, factory ) {
    if (typeof PARSELY === "undefined") { PARSELY = {}; }
    if ( typeof module === "object" && typeof module.exports === "object" ) {
        // For CommonJS and CommonJS-like environments where a proper window is present,
        // execute the factory and get jQuery
        // For environments that do not inherently posses a window with a document
        // (such as Node.js), expose a jQuery-making factory as module.exports
        // This accentuates the need for the creation of a real window
        // e.g. var jQuery = require("jquery")(window);
        // See ticket #14549 for more info
        module.exports = global.document ?
            factory( global, true ) :
            function( w ) {
                if ( !w.document ) {
                    throw new Error( "jQuery requires a window with a document" );
                }
                return factory( w );
            };
        // we can simply pass true here as "noGlobal" because the only thing this controls is whether or not window.$
        // gets set on line 1451. Since we don't care about that and are namespacing the jQuery object that gets returned,
        // we can just do true here (and we know the window has a DOM, since no error got thrown above).
        PARSELY.$ = PARSELY.jQuery = factory( global, true );
    } else {
        PARSELY.$ = PARSELY.jQuery = factory( global, false );
    }

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

var deletedIds = [];
var slice = deletedIds.slice;
var concat = deletedIds.concat;
var push = deletedIds.push;
var indexOf = deletedIds.indexOf;
var class2type = {};
var toString = class2type.toString;
var hasOwn = class2type.hasOwnProperty;
var support = {};

var
	version = "1.11.1 -deprecated,-css,-css/addGetHookIf,-css/curCSS,-css/defaultDisplay,-css/hiddenVisibleSelectors,-css/support,-css/swap,-css/var/cssExpand,-css/var/isHidden,-css/var/rmargin,-css/var/rnumnonpx,-effects,-effects/Tween,-effects/animatedSelector,-effects/support,-dimensions,-offset,-ajax,-ajax/jsonp,-ajax/load,-ajax/parseJSON,-ajax/parseXML,-ajax/script,-ajax/var/nonce,-ajax/var/rquery,-ajax/xhr,-manipulation/_evalUrl",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		return !jQuery.isArray( obj ) && obj - parseFloat( obj ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( support.ownLast ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	guid: 1,

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);
var risSimple = /^.[^:#\[\.,]*$/;

// A central reference to the root jQuery(document)
var rootjQuery,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );

var rnotwhite = (/\S+/g);
var strundefined = typeof undefined;

// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownLast = i !== "0";

/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( elem ) {
	var noData = jQuery.noData[ (elem.nodeName + " ").toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute("classid") === noData;
};


var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

jQuery.extend({
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,
		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	}
});

var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
var rcheckableType = (/^(?:checkbox|radio)$/i);

(function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox 23+ (lack focusin event)
	for ( i in { submit: true, change: true, focusin: true }) {
		eventName = "on" + i;

		if ( !(support[ i + "Bubbles" ] = eventName in window) ) {
			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i + "Bubbles" ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
})();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {
		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		}
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.fn.extend({
	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});

var nodeHook, boolHook,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;


var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;


var rclass = /[\t\r\n\f]/g;


// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});


var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}
return jQuery;
}));

/*! http://mths.be/visibility v1.0.7 by @mathias | MIT license */
(function(window, document, $, undefined) {

    var prefix;
    var property;
    // In Opera, `'onfocusin' in document == true`, hence the extra `hasFocus` check to detect IE-like behavior
    var eventName = 'onfocusin' in document && 'hasFocus' in document
        ? 'focusin focusout'
        : 'focus blur';
    var prefixes = ['webkit', 'o', 'ms', 'moz', ''];
    // patches jQuery, but for our custom bundle, $.support won't exist
    var $support = $.support || {};
    var $event = $.event;

    // Look to see if browser supports a variant of the visibilitychange event
    // by determining if the document has a hidden property which is a boolean
    while ((prefix = prefixes.pop()) != undefined) {
        property = (prefix ? prefix + 'H': 'h') + 'idden';
        if ($support.pageVisibility = typeof document[property] == 'boolean') {
            eventName = prefix + 'visibilitychange';
            break;
        }
    }

    // Attach an event listener either on to the visibilitychange event or
    // focus and blur in the case that the browser doesn't support the
    // visibility API
    var target = /blur$/.test(eventName) ? window : document;
    $(target).on(eventName, function(event) {
        var type = event.type;
        var originalEvent = event.originalEvent;

        // Avoid errors from triggered native events for which `originalEvent` is
        // not available.
        if (!originalEvent) {
            return;
        }

        var toElement = originalEvent.toElement;

        // If it’s a `{focusin,focusout}` event (IE), `fromElement` and `toElement`
        // should both be `null` or `undefined`; else, the page visibility hasn’t
        // changed, but the user just clicked somewhere in the doc. In IE9, we need
        // to check the `relatedTarget` property instead.
        if (
            !/^focus./.test(type) || (
                toElement == undefined &&
                originalEvent.fromElement == undefined &&
                originalEvent.relatedTarget == undefined
            )
        ) {
            var eventTypeToTrigger;
            if (property && document[property] || /^(?:blur|focusout)$/.test(type))
                eventTypeToTrigger = "hide";
            else
                eventTypeToTrigger = "show";
            eventTypeToTrigger += ".visibility";
            $event.trigger(eventTypeToTrigger);
        }
    });

}(this, document, PARSELY.jQuery));

/**
 * Utility functions
 */
(function() {
    this.PARSELY = this.PARSELY || {};

    var root = this.PARSELY,
        util;

    root.util = {};
    util = root.util;


    /**
     * The actual alias we use is a little bit tricky.  In theory, we always
     * want window.top, but it's possible that some third-party site (let's say
     * Google) offers a version of the page in an iFrame.  Now we have a
     * scenario where we have the publisher's content in an iFrame.  If the
     * publisher has our JS in the page, then we should just use window.  If
     * our JS is in an iFrame, we should use window.parent. We have to be
     * careful that we have access to window.top or window.parent and resort
     * to window as a fallback.
     *
     * @returns {Window} A safe window object to use.
     */
    util.getWindow = function() {
        if (root.getWindow && typeof root.getWindow === "function") {
            return root.getWindow();
        }
        try {
            window.top.document.cookie; // jshint ignore:line
            return window.top;
        } catch (ex1) {
            // We didn't have access to window.top, try window.parent
            try {
                window.parent.document.cookie; // jshint ignore:line
                return window.parent;
            } catch (ex2) {
                // We didn't have access to window.top or window.parent, fallback
                // to window
                return window; // fallback
            }
        }
    };

    /*
     * Set a function attribute on `window` without clobbering an existing attribute
     * with the same name
     */
    util.windowSetFunction = function(attrName, callback) {
        var windowAlias = util.getWindow();
        var existingCallback = windowAlias[attrName];
        windowAlias[attrName] = function() {
            callback();
            if (typeof existingCallback === "function") {
                existingCallback();
            }
        };
    };

    /**
     * Cross-browser safe way to add an event listener to the window (or
     * document for IE).
     */
    util.windowAddEventListener = function(evt, callback) {
        // take advantage of passive event listeners in Chrome 51+
        // explanation: https://github.com/Parsely/time-engaged/pull/4/files/3820123e17a630383ad1847d6c578c60a62ff311#r69626677
        var supportsPassive = false;
        try {
            addEventListener("test", null, Object.defineProperty({}, 'passive', {
                get: function() {
                    supportsPassive = true;
                }
            }));
        } catch (e) {}
        var optionsOrCapture = false;
        if (supportsPassive) {
            optionsOrCapture = {
                passive: true,
                capture: false
            };
        }
        if (typeof window.addEventListener !== 'undefined') {
            return window.addEventListener(evt, callback, optionsOrCapture);
        } else if (typeof document.attachEvent !== 'undefined') {
            return document.attachEvent("on" + evt, callback);
        }

        return false;
    };


    /**
     * Cross-browser safe way to add an event listener to an object.
     * @param  {Object}   obj        object to add the listener to
     * @param  {String}   evt        the event type to listen for (e.g. "click")
     * @param  {Function} callback   callback function after event is triggered
     * @param  {Boolean}  useCapture see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     * @return {Object}              the result of addEventListener/attachEvent
     */
    util.objAddEventListener = function(obj, evt, callback, useCapture) {
        useCapture = typeof useCapture === 'undefined' ? false : useCapture;
        if (typeof obj.addEventListener !== 'undefined') {
            return obj.addEventListener(evt, callback, useCapture);
        } else if (typeof obj.attachEvent !== 'undefined') {
            return obj.attachEvent('on' + evt, callback);
        }

        return false;
    };


    util.getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * Determine which url to use for a given event
     * @returns {String}
     */
    util.getEventUrl = function() {
        var eventUrl;

        // allow direct url specification, or defer to previous requests
        if (root.config.eventUrl) {
            eventUrl = root.config.eventUrl;
        } else if (root.lastRequest) {
            eventUrl = root.lastRequest.url;
        } else {
            eventUrl = util.getWindow().location.href;
        }
        return eventUrl;
    };

    root.__experimental = {};

    root.__experimental.mmh3_hash = function(key, seed) {
        if (!key) {
            return null;
        }
        var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i; // jshint ignore:line

        remainder = key.length & 3; // key.length % 4
        bytes = key.length - remainder;
        h1 = seed;
        c1 = 0xcc9e2d51;
        c2 = 0x1b873593;
        i = 0;

        while (i < bytes) {
            k1 =
                ((key.charCodeAt(i) & 0xff)) |
                ((key.charCodeAt(++i) & 0xff) << 8) |
                ((key.charCodeAt(++i) & 0xff) << 16) |
                ((key.charCodeAt(++i) & 0xff) << 24);
            ++i;

            k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
            h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
        }

        k1 = 0;

        switch (remainder) {
            case 3:
                k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16; // jshint ignore:line
            case 2:
                k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8; // jshint ignore:line
            case 1:
                k1 ^= (key.charCodeAt(i) & 0xff); // jshint ignore:line

                k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                h1 ^= k1;
        }

        h1 ^= key.length;

        h1 ^= h1 >>> 16;
        h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0;
    };
}());

/**
 * Cookies.js - 1.1.0
 * Adapted from https://github.com/ScottHamper/Cookies
 */

(function(root) {
    'use strict';

    var factory = function(window) {
        var Cookies = function(key, value, options) {
            return arguments.length === 1 ?
                Cookies.get(key) : Cookies.set(key, value, options);
        };

        // Allows for setter injection in unit tests
        Cookies._document = window.document;

        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)

        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

        Cookies.defaults = {
            path: '/',
            secure: false
        };

        Cookies.get = function(key) {
            Cookies._renewCache();
            return Cookies._cache[Cookies._cacheKeyPrefix + key];
        };

        Cookies.getJSON = function(key) {
            var value = Cookies.get(key);
            return value === undefined ? value : root.JSON.parse(value);
        };

        Cookies.set = function(key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

            try {
                Cookies._document.cookie = Cookies._generateCookieString(key, value, options);
            } catch (err) {
                root.console.log(err);
            }

            return Cookies;
        };

        Cookies.setJSON = function(key, value, options) {
            Cookies.set(key, root.JSON.stringify(value), options);

            return Cookies;
        };

        Cookies.extendExpiry = function(key, expires) {
            var value = Cookies.get(key);
            if (value === undefined) {
                return false; // nothing to do
            }

            Cookies.set(key, value, expires);
        };

        Cookies.expire = function(key, options) {
            if (key.constructor === Array) {
                for (var i = 0; i < key.length; i++) {
                    Cookies.set(key[i], undefined, options);
                }
            } else {
                return Cookies.set(key, undefined, options);
            }
        };

        Cookies._getExtendedOptions = function(options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ? options.secure : Cookies.defaults.secure
            };
        };

        Cookies._isValidDate = function(date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        };

        Cookies._getExpiresDate = function(expires, now) {
            now = now || new Date();

            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }

            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        };

        Cookies._generateCookieString = function(key, value, options) {
            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
            key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};
            var domain = options.domain || root.cookieDomain || Cookies._autoCookieDomain;

            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += domain ? ';domain=' + domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';

            return cookieString;
        };

        Cookies._getCacheFromString = function(documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);
                if (cookieKvp != null) {
                    var cacheKey = Cookies._cacheKeyPrefix + cookieKvp.key;
                    if (cookieCache[cacheKey] === undefined) {
                        cookieCache[cacheKey] = cookieKvp.value;
                    }
                }
            }
            return cookieCache;
        };

        Cookies._getKeyValuePairFromCookieString = function(cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            var cookieKey = cookieString.substr(0, separatorIndex),
                cookieValue = cookieString.substr(separatorIndex + 1);
            try {
                cookieKey = decodeURIComponent(cookieKey);
                cookieValue = decodeURIComponent(cookieValue);
            } catch (e) {
                return null;
            }
            return {
                key: cookieKey,
                value: cookieValue
            };
        };

        Cookies._renewCache = function() {
            try {
                if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                    Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
                    Cookies._cachedDocumentCookie = Cookies._document.cookie;
                }
            } catch (err) {
                root.console.log(err);
            }
        };

        Cookies._isValidDomain = function(domain) {
            var testKey = "cookies.js_dtest",
                areEnabled = Cookies.set(testKey, 1, {
                    "domain": domain
                })
                .get(testKey) === '1';
            Cookies.expire(testKey, {
                "domain": domain
            });
            return areEnabled;
        };

        /**
         * Automatically determine the top level domain to use for all cookies.
         * Adding actual TLD detection would add a lot of weight for Javascript
         * so instead we take a novel approach described in https://developers.google.com/analytics/devguides/collection/analyticsjs/domains#auto.
         * Assuming the user is viewing www.example.co.uk, we try to create a
         * dummy cookie with the following domains:
         * - "co.uk"
         * - "example.co.uk"
         *
         * example.co.uk is the first domain that successfully allows us to set
         * a cookie so this is assumed to be the highest top level domain that
         * we can use.
         */
        Cookies._getAutoCookieDomain = function() {
            var windowAlias = root.util.getWindow(),
                hostname = windowAlias.location.hostname;

            // Check to see if we are dealing with an IPv4 address
            if (!isNaN(parseInt(hostname.replace(".", ""), 10))) {
                // Even if we have an IP address, early Opera versions seem to
                // have a bug so we still have to try and set a cookie to see
                return Cookies._isValidDomain(hostname) ? hostname : null;
            }

            var parts = hostname.split(".");
            // If we have something like "localhost", bailout early
            if (parts.length === 1) {
                return hostname;
            }

            var cookieDomain;
            for (var i = 2; i <= parts.length; i++) {
                var candidateDomain = parts.slice(-i).join(".");
                if (Cookies._isValidDomain(candidateDomain)) {
                    cookieDomain = candidateDomain;
                    break;
                }
            }

            return cookieDomain || hostname;
        };
        Cookies._autoCookieDomain = Cookies._getAutoCookieDomain();

        return Cookies;
    };

    root.Cookies = factory(root.util.getWindow());

})(this.PARSELY);

(function(root) {
    'use strict';

    var LocalStorage_ = function() {};
    LocalStorage_.prototype = (function() {
        var LocalStorage = function(key, value, options) {
            return arguments.length === 1 ?
                LocalStorage.get(key) : LocalStorage.set(key, value, options);
        };

        LocalStorage._keyPrefix = 'pStore-';
        LocalStorage._delimiter = '|^'; // unlikely to appear in stored values
        try {
            LocalStorage._store = root.util.getWindow().localStorage;
        } catch (e) {
            LocalStorage._store = undefined;
        }
        LocalStorage._baseDomain = null;

        LocalStorage.get = function(key) {
            LocalStorage._migrateCookie(key);
            var stored = LocalStorage._store[LocalStorage._keyPrefix + key];
            if (typeof stored === "undefined") {
                return undefined;
            }
            try {
                stored = LocalStorage._deserialize(stored);
            } catch (err) {
                console.log("Error deserializing stored data for key " + key);
                LocalStorage.expire(key);
                return undefined;
            }
            // mimic cookie expiration behavior
            if (typeof stored.expires !== "undefined") {
                var expires = parseInt(stored.expires, 10);
                if (!isNaN(expires) && new Date().getTime() > expires) {
                    LocalStorage.expire(key);
                    return undefined;
                }
            }
            return stored.value;
        };

        LocalStorage.getJSON = function(key) {
            var value = LocalStorage.get(key);
            return typeof value === "undefined" ? value : root.JSON.parse(value);
        };

        LocalStorage.set = function(key, value, options) {
            var storeKey = LocalStorage._keyPrefix + key;
            if (typeof value === "undefined") {
                delete LocalStorage._store[storeKey];
                return LocalStorage;
            }
            options = root.Cookies._getExtendedOptions(options);
            var expires = root.Cookies._getExpiresDate(options.expires),
                toStore;
            if (typeof expires !== "undefined") {
                expires = expires.getTime();
            }
            try {
                toStore = LocalStorage._serialize({
                    value: value,
                    expires: expires
                });
            } catch (err) {
                console.log("Error serializing stored data for key " + key);
                return LocalStorage;
            }
            LocalStorage._store[storeKey] = toStore;
            return LocalStorage;
        };

        LocalStorage.setJSON = function(key, value, options) {
            LocalStorage.set(key, root.JSON.stringify(value), options);
            return LocalStorage;
        };

        LocalStorage.extendExpiry = function(key, expires) {
            var value = LocalStorage.get(key);
            if (typeof value === "undefined") {
                return false;
            }
            LocalStorage.set(key, value, expires);
        };

        LocalStorage.expire = function(key, options) {
            return LocalStorage.set(key, undefined, options);
        };

        LocalStorage._serialize = function(obj) {
            return obj.value + LocalStorage._delimiter + obj.expires;
        };

        LocalStorage._deserialize = function(value) {
            var parts = value.split(LocalStorage._delimiter);
            var deserialized = {
                value: parts[0]
            };
            if (parts.length > 1) {
                deserialized.expires = parts[1];
            }
            return deserialized;
        };

        /*
         * If there is stored cookie with name `key`, store its value in localStorage
         * and delete the cookie
         */
        LocalStorage._migrateCookie = function(key) {
            var storedCookie = root.Cookies.get(key);
            root.Cookies.expire(key);
            if (typeof storedCookie !== "undefined") {
                var expires = root.ParselyStorage.defaults[key],
                    options = {};
                if (typeof expires !== "undefined") {
                    options.expires = expires;
                }
                LocalStorage.set(key, storedCookie, options);
            }
        };

        return {
            constructor: LocalStorage,
            get: LocalStorage.get,
            getJSON: LocalStorage.getJSON,
            set: LocalStorage.set,
            setJSON: LocalStorage.setJSON,
            extendExpiry: LocalStorage.extendExpiry,
            expire: LocalStorage.expire
        };
    }());

    var ParselyStorage_ = function() {};
    ParselyStorage_.prototype = (function() {
        var ParselyStorage = function(key, value, options) {
            return arguments.length === 1 ?
                ParselyStorage.get(key) : ParselyStorage.set(key, value, options);
        };

        var LocalStorage = new LocalStorage_();

        var supportsLocalStorage = function() {
            var mod = LocalStorage._keyPrefix;
            try {
                root.util.getWindow().localStorage.setItem(mod, mod);
                root.util.getWindow().localStorage.removeItem(mod);
                return true;
            } catch (e) {
                return false;
            }
        };
        var isSafari = function() {
            return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
                navigator.userAgent &&
                navigator.userAgent.indexOf('CriOS') === -1 &&
                navigator.userAgent.indexOf('FxiOS') === -1;
        };
        var shouldUseLocalStorage = function() {
            var isAmp = false;
            var visitorInfo = root.Cookies.get("_parsely_visitor");
            if (typeof visitorInfo !== "undefined") {
                // simple check to avoid a heavy json parse
                if (visitorInfo.charAt(0) !== '{') {
                    isAmp = true;
                }
            }
            if (isSafari()) {
                return true;
            }
            return root.use_localstorage === true && !isAmp;
        };

        var _impl = supportsLocalStorage() && shouldUseLocalStorage() ?
            LocalStorage : root.Cookies;

        return {
            supportsCookies: ("cookie" in document &&
                (document.cookie.length > 0 ||
                    (document.cookie = "test").indexOf.call(document.cookie, "test") > -1)),
            get: _impl.get,
            getJSON: _impl.getJSON,
            set: _impl.set,
            setJSON: _impl.setJSON,
            extendExpiry: _impl.extendExpiry,
            expire: _impl.expire,
            defaults: {
                "visitor": {
                    key: "_parsely_visitor",
                    expires: 60 * 60 * 24 * 365 / 12 * 13, // 13 months
                    secure: false
                },
                "session": {
                    key: "_parsely_session",
                    expires: 60 * 30, // 30 minutes
                    secure: false
                }
            }
        };
    }());
    root.ParselyStorage = new ParselyStorage_();
})(this.PARSELY);

(function() {
    var root = this.PARSELY,
        Class = root.Class,
        ParselyStorage = root.ParselyStorage,
        console = root.console,
        JSON = root.JSON,
        LEGACY_COOKIE_NAME = "parsely_uuid", // where we used to store visitor ID
        REQUIRED_KEYS = ["id"],
        OPTOUT_UUID = "OPTOUT";


    var VisitorManager = Class.extend({
        init: function() {
            this.visitorCookieName = root.visitorCookieName ||
                ParselyStorage.defaults.visitor.key;
            this.visitorCookieTimeoutSecs = root.visitorCookieTimeoutSecs ||
                ParselyStorage.defaults.visitor.expires;
            this.visitorCookieSecure = root.visitorCookieSecure ||
                ParselyStorage.defaults.visitor.secure;
            this.legacyVisitorCookieName = root.legacyVisitorCookieName ||
                LEGACY_COOKIE_NAME;
        },

        /**
         * Fetch visitor information from the appropriate cookie. For visitor
         * ID, will first try to fetch from LEGACY_COOKIE_NAME, then fall back
         * to using UUID-4 returned from config server.
         * @return {[object]} Visitor info object which contains the following
         *                    params:
         *                    - id (required): visitor ID
         *                    - session_count (optional): number of sessions the visitor
         *                                                has had (0 if this is the first
         *                                                session). Requires session
         *                                                module.
         *                    - last_session_ts (optional) Unix timestamp (milliseconds)
         *                                                 of last session this visitor
         *                                                 had (0 if this is the first
         *                                                 session). Requires Session
         *                                                 module.
         */
        getVisitorInfo: function(shouldExtendExisting) {
            shouldExtendExisting = shouldExtendExisting || false;
            var visitorInfo = ParselyStorage.get(this.visitorCookieName);
            if (typeof visitorInfo === "undefined") {
                var visitorId = ParselyStorage.get(this.legacyVisitorCookieName);
                var configId = root.config.apikey_uuid || root.config.uuid;
                if (root.optout_disabled_cookies !== false &&
                    typeof visitorId === "undefined" &&
                    ParselyStorage.supportsCookies === false) {
                    visitorId = OPTOUT_UUID;
                    console.log('Setting visitor ID to OPTOUT');
                }
                if (typeof visitorId === "undefined" && configId !== null) {
                    visitorId = configId;
                    console.log('No existing visitor ID found, using UUID from config: ' +
                        visitorId);
                } else {
                    console.log('Using existing value for visitor ID: ' + visitorId);
                }
                visitorInfo = this.initVisitor(visitorId);
                // Get rid of legacy parsely_uuid cookie if it exists
                ParselyStorage.expire(LEGACY_COOKIE_NAME);
            } else {
                // In the event that a publisher is hosting AMP pages, a user
                // with no cookies loads an AMP page first, then any non-AMP
                // page, the visitorCookieName cookie will not be a JSON object
                // but rather a string like
                // "if_cz5dyvTKxrE96YIXklXaIltWsbMH49bl4QwjI7oW2VFl4QAhpeFgJyvXyjYIj"
                // we need to convert this to our visitorInfo object for later use
                var wasJSON = false;
                try {
                    visitorInfo = JSON.parse(visitorInfo);
                    wasJSON = true;
                } catch (err) {
                    console.log('Unable to JSON parse visitorInfo "' + visitorInfo +
                        '", assuming ampid.');
                    // Initialize a new visitorInfo, but maintain the old ID.
                    // Session information goes back to 0 which, although
                    // technically inaccurate, is better than making a bogus assumption
                    visitorInfo = this.initVisitor(visitorInfo);
                }
                if (wasJSON) {
                    if (shouldExtendExisting) {
                        this.extendVisitorExpiry();
                    }
                }
            }
            // Legacy support for root.config.parsely_site_uuid
            root.config.parsely_site_uuid = visitorInfo.id;
            return visitorInfo;
        },
        initVisitor: function(visitorId) {
            return this.setVisitorInfo({
                "id": visitorId,
                "session_count": 0,
                "last_session_ts": 0
            });
        },
        setVisitorInfo: function(visitorInfo) {
            for (var i = 0; i < REQUIRED_KEYS.length; i++) {
                var key = REQUIRED_KEYS[i];
                if (typeof visitorInfo[key] === "undefined" ||
                    visitorInfo[key] === null) {
                    return false;
                }
            }

            ParselyStorage.setJSON(this.visitorCookieName, visitorInfo, {
                expires: this.visitorCookieTimeoutSecs,
                secure: this.visitorCookieSecure
            });
            return visitorInfo;
        },

        extendVisitorExpiry: function() {
            ParselyStorage.extendExpiry(this.visitorCookieName, {
                expires: this.visitorCookieTimeoutSecs,
                secure: this.visitorCookieSecure
            });
        }
    });

    root.visitorManager = new VisitorManager();
})();

(function() {
    var root = this.PARSELY,
        util = root.util,
        Class = root.Class,
        ParselyStorage = root.ParselyStorage,
        console = root.console,
        visitorManager = root.visitorManager;

    var SessionManager = Class.extend({

        /**
         * Initializes a SessionManager object and therefore sessions to be
         * ready for use.  Ensures that the Parse.ly visitor cookie exists and
         * also initializes a Parse.ly session / session cookie.
         */
        init: function() {
            this.windowAlias = util.getWindow();
            this.documentAlias = this.windowAlias.document;

            // Config variable setup, users can override the session cookie
            // names, but not the timeouts unless they go to undocumented
            // PARSELY.sessionManager object. We leave this for us so that we
            // can modify during unit tests
            this.sessionCookieName = root.sessionCookieName ||
                ParselyStorage.defaults.session.key;
            this.sessionCookieTimeoutSecs = ParselyStorage.defaults.session.expires;
            this.sessionCookieSecure = root.sessionCookieSecure ||
                ParselyStorage.defaults.session.secure;

            console.log("Initializing session.");
            // Ensure the session is started, but don't yet extend an existing
            // session, a pixel firing will take care of that
            this.getSession(false);
        },

        /**
         * Return the current session information
         * @param  {boolean} shouldExtendExisting indicates whether existing
         *                                        sessions should be extended.
         *                                        Basically a short form to
         *                                        prevent subsequent calls to
         *                                        extendSessionExpiry.
         * @return {Object} Session object which contains the following parms:
         *                  - sid: session ID == session_count
         *                  - surl: initial URL of the session
         *                  - sref: initial referrer of the session
         *                  - sts: Unix timestamp (milliseconds) of when the session was
         *                         created
         *                  - slts: Unix timestamp (milliseconds) of the last session the
         *                          user had, 0 if this is the user's first session
         */
        getSession: function(shouldExtendExisting) {
            shouldExtendExisting = shouldExtendExisting || false;
            var visitorInfo = visitorManager.getVisitorInfo();
            var session = ParselyStorage.getJSON(this.sessionCookieName);

            if (typeof session === "undefined") {
                var session_count, last_session_ts;
                if (visitorInfo === false) {
                    session_count = 1;
                    last_session_ts = 0;
                } else {
                    // New session, increment our count
                    visitorInfo.session_count++;
                    session_count = visitorInfo.session_count;
                    last_session_ts = visitorInfo.last_session_ts;
                }
                var now = new Date(),
                    url = util.getEventUrl(),
                    ref = root.lastRequest ? root.lastRequest.urlref : this.documentAlias.referrer;
                session = {
                    "sid": session_count,
                    "surl": url,
                    "sref": ref,
                    "sts": now.getTime(),
                    "slts": last_session_ts
                };

                console.log("Session expired/never existed, creating new " +
                    "session with " + this.sessionCookieTimeoutSecs +
                    "s timeout: " + root.JSON.stringify(session));

                ParselyStorage.setJSON(this.sessionCookieName, session, {
                    expires: this.sessionCookieTimeoutSecs,
                    secure: this.sessionCookieSecure
                });

                // Update the visitor cookie
                visitorInfo.last_session_ts = session.sts;
                visitorManager.setVisitorInfo(visitorInfo);
            } else {
                if (shouldExtendExisting) {
                    this.extendSessionExpiry();
                }
            }
            return session;
        },

        /**
         * Extend the current session expiry by an additional
         * this.sessionCookieTimeoutSecs
         */
        extendSessionExpiry: function() {
            ParselyStorage.extendExpiry(this.sessionCookieName, {
                expires: this.sessionCookieTimeoutSecs,
                secure: this.sessionCookieSecure
            });
        }
    });

    root.sessionManager = new SessionManager();
})();

(function metas() {
    var root = this.PARSELY,
        util = root.util,
        JSON = root.JSON,
        $ = root.$,
        windowAlias = util.getWindow(),
        documentAlias = windowAlias.document;

    PARSELY.getLdJsonMetas = function() {
        var scripts = documentAlias.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            if (script.getAttribute('type') === 'application/ld+json') {
                var ldJson;
                try {
                    ldJson = JSON.parse(script.innerHTML);
                } catch (err) {
                    return null;
                }

                var pageType = ldJson['@type'] === 'NewsArticle' ? 'post' : 'sectionpage';
                return {
                    'type': pageType,
                    'title': ldJson.headline,
                    'link': ldJson.url,
                    'image_url': ldJson.thumbnailUrl,
                    'pub_date': ldJson.dateCreated,
                    'section': ldJson.articleSection,
                    'authors': ldJson.creator,
                    'tags': ldJson.keywords
                };
            }
        }

        return null;
    };

    PARSELY.getRepeatedMetaMetas = function() {
        var metas = {};
        var metaTags = documentAlias.getElementsByTagName('meta');
        var parselyMetaMapping = {
            'parsely-title': 'title',
            'parsely-link': 'link',
            'parsely-image-url': 'image_url',
            'parsely-type': 'type',
            'parsely-post-id': 'post_id',
            'parsely-pub-date': 'pub_date',
            'parsely-section': 'section',
            'parsely-author': 'authors',
            'parsely-tags': 'tags'
        };
        for (var i = 0; i < metaTags.length; i++) {
            var meta = metaTags[i];
            var parselyMeta = parselyMetaMapping[meta.getAttribute('name')];
            if (typeof parselyMeta === 'undefined') {
                continue;
            }

            var content = meta.getAttribute('content');
            if (parselyMeta === 'authors') {
                if (typeof metas[parselyMeta] === 'undefined') {
                    metas[parselyMeta] = [content];
                } else {
                    metas[parselyMeta].push(content);
                }
            } else {
                metas[parselyMeta] = parselyMeta === 'tags' ?
                    content.split(',') : content;
            }
        }

        if ($.isEmptyObject(metas)) {
            return null;
        }

        return metas;
    };

    PARSELY.getParselyPageMetas = function() {
        var metaTags = documentAlias.getElementsByTagName('meta');
        for (var i = 0; i < metaTags.length; i++) {
            var meta = metaTags[i];
            if (meta.getAttribute('name') !== 'parsely-page') {
                continue;
            }

            var parselyPage = meta.getAttribute('value') || meta.getAttribute('content');
            try {
                return JSON.parse(parselyPage);
            } catch (err) {
                return null;
            }
        }
        return null;
    };

    PARSELY.getMetas = function() {
        return this.getRepeatedMetaMetas() || this.getParselyPageMetas() ||
            this.getLdJsonMetas();
    };
})();

(function slots() {
    var root = this.PARSELY,
        util = root.util,
        ParselyStorage = root.ParselyStorage,
        windowAlias = root.util.getWindow(),
        parselySlotAttr = 'data-parsely-slot',
        hasParselySlots;

    // don't track slots for non-supported browsers (IE<7)
    if (!document.querySelector) {
        root.console('Slot tracking not supported on this browser');
        return;
    }

    hasParselySlots = !!document.querySelector('[' + parselySlotAttr + ']');

    function getElementXY(element) {
        var x = 0,
            y = 0;

        while (element) {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        }
        return [x, y];
    }

    var ELEMENT_NODE = 1;

    function getElementXPath(element) {
        var xpathAttr = hasParselySlots ? parselySlotAttr : 'id';

        if (element.getAttribute(xpathAttr) !== null) {
            return '//*[@' + xpathAttr + '="' + element.getAttribute(xpathAttr) + '"]';
        }

        if (element === document.body) {
            return '//' + element.tagName.toLowerCase();
        }

        var ix = 0;
        var siblings = element.parentNode.childNodes;
        for (var i = 0; i < siblings.length; i++) {
            var sibling = siblings[i];

            if (sibling === element) {
                return getElementXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) +
                    ']';
            }

            if (sibling.nodeType === ELEMENT_NODE && sibling.tagName === element.tagName) {
                ix++;
            }
        }
    }

    function isBogusLink(url) {
        if (!url || url.indexOf('#') === 0 || url.indexOf('javascript') === 0) {
            return true;
        }

        // Old IE converts relative URLs to absolute (even though it shouldn't)
        // so we try to check for checks for same url or url with an anchor
        var winHref = window.location.href;
        if (url === winHref || url.indexOf(winHref + '#') === 0) {
            return true;
        }

        return false;
    }

    function findParentAnchor(node, options) {
        options = options || {};
        var maxHeight = options.maxHeight || 5;

        function finder(node, currentHeight) {
            if (node === document || currentHeight >= maxHeight || !node) {
                return null;
            }

            if (node.nodeName === 'A') {
                return node;
            }

            return finder(node.parentNode, currentHeight + 1);
        }

        return finder(node, 0);
    }

    function handleDocumentOnClick(event) {
        var element = event.target ? event.target : event.srcElement,
            anchor = findParentAnchor(element);
        if (anchor === null) {
            return true;
        }

        var attrHref = anchor.getAttribute('href');
        if (!isBogusLink(attrHref)) {
            var coords = getElementXY(anchor);
            var slotXpath = getElementXPath(anchor);
            var slotInfo = {
                'url': windowAlias.location.href,
                'x': coords[0],
                'y': coords[1],
                'xpath': slotXpath,
                'href': anchor.href
            };
            ParselyStorage.setJSON('_parsely_slot_click', slotInfo);
        }
    }

    util.objAddEventListener(document.body, 'click', handleDocumentOnClick);
})();

(function(root) {
    'use strict';
    var $ = root.$,
        SAMPLE_RATE = 100,
        MAX_TIME_BETWEEN_HEARTBEATS = 60 * 60 * 1000;

    var factory = function(window) {
        var Sampler = {};

        // Lock variable for the setInterval call - this module ensures it only happens
        // once
        Sampler._hasStartedSampling = false;
        // Internal registry for sample information
        Sampler._accumulators = {};

        Sampler._baseHeartbeatInterval = 10500; // default, 10.5s

        if ($.isNumeric(root.secondsBetweenHeartbeats)) {
            var baseSeconds = Sampler._baseHeartbeatInterval / 1000,
                allowedToDecrease = root.secondsBetweenHeartbeats < baseSeconds &&
                window._parselyIsTest === true;
            if (root.secondsBetweenHeartbeats > baseSeconds || allowedToDecrease) {
                Sampler._baseHeartbeatInterval = root.secondsBetweenHeartbeats * 1000;
            }
        }

        /*
         * Add a sampling function to the registry
         *
         * The sampler maintains a registry mapping keys to sampler functions and
         * heartbeat functions. Every few milliseconds, the sampler function for each key
         * is called. If this function returns true, the accumulator for that key is
         * incremented by the appropriate time step. Every few seconds, the heartbeat
         * function for each key is run if that key's accumulator for the time window
         * is greater than zero.
         *
         * @param {string} key The key by which to identify this sampling function
         *                     in the registry
         * @param {function} sampleFn A function to run every SAMPLE_RATE ms that
                                      returns a boolean indicating whether the sampler
                                      for `key` should increment its accumulator. For
                                      example, engaged time tracking's sampleFn would
                                      return a boolean indicating whether or not the
                                      client is currently engaged.
         * @param {function} heartbeatFn A function to run every
                                         `_baseHeartbeatInterval ms if any
                                         time has been accumulated by the sampler. This
                                         function should accept the number of seconds
                                         accumulated after rounding.
         */
        Sampler.trackKey = function(key, sampleFn, heartbeatFn, duration) {
            // to account for the option to not sample allow undefined or a sample function
            if ((typeof sampleFn !== 'undefined' && typeof sampleFn !== 'function') ||
                typeof heartbeatFn === 'undefined') {
                return;
            }
            if (!Sampler._accumulators.hasOwnProperty(key)) {
                var interval = Sampler._timeoutFromDuration(duration);
                Sampler._accumulators[key] = {
                    "ms": 0,
                    "totalMs": 0,
                    "firstSampleTime": new Date().getTime(),
                    "lastSampleTime": new Date().getTime(),
                    "lastPositiveSampleTime": undefined,
                    "sampleFn": sampleFn,
                    "heartbeatFn": heartbeatFn,
                    "heartbeatInterval": interval,
                    "heartbeatTimer": undefined,
                    "baseHeartbeatInterval": interval,
                    "duration": duration
                };
            }
            if (Sampler._hasStartedSampling === false) {
                window.setInterval(Sampler._sample, SAMPLE_RATE);
                Sampler._hasStartedSampling = true;
            }
            Sampler._setHeartbeatTimeout(key);
        };

        Sampler._setHeartbeatTimeout = function(key) {
            var accumulator = Sampler._accumulators[key];
            if (typeof accumulator.heartbeatTimer !== "undefined") {
                Sampler._unsetHeartbeatTimeout(key);
            }
            var sendHeartbeat = function() {
                Sampler.sendHeartbeat(key);
            };
            if (PARSELY.__experimental.unloadHeartbeatOnly !== true) {
                accumulator.heartbeatTimer = window.setTimeout(sendHeartbeat,
                    accumulator.heartbeatInterval);
            }
        };

        Sampler._unsetHeartbeatTimeout = function(key) {
            var accumulator = Sampler._accumulators[key];
            window.clearTimeout(accumulator.heartbeatTimer);
            accumulator.heartbeatTimer = undefined;
        };

        Sampler._backoff = function(trackedData, totalTrackedMs) {
            totalTrackedMs = typeof totalTrackedMs === "undefined" ?
                (new Date().getTime() - trackedData.firstSampleTime) : totalTrackedMs;
            var totalTrackedSeconds = totalTrackedMs / 1000,
                offsetMatchingBaseInterval = 35,
                backoffProportion = 0.3,
                totalWithOffset = totalTrackedSeconds + offsetMatchingBaseInterval,
                newInterval = totalWithOffset * backoffProportion,
                clampedNewInterval = Math.min(MAX_TIME_BETWEEN_HEARTBEATS, newInterval);
            trackedData.heartbeatInterval = clampedNewInterval * 1000;
        };

        Sampler._timeoutFromDuration = function(duration) {
            /* Returns an appropriate interval timeout in ms, based on the duration
            * of the item being tracked (also in ms), to ensure each of the 5 completion
            * intervals is tracked with a heartbeat.

            * A 'completion interval' is 20% of the total duration of the item being
            * tracked, so there are 5 possible completion intervals/heartbeats to send.

            * For many short videos, cutting the default base interval in half is enough;
            * for some very short videos, we use a custom interval determined by the
            * duration of the video.
            */
            var timeoutDefault = Sampler._baseHeartbeatInterval;
            if (typeof duration === 'undefined' || duration === 0) {
                return timeoutDefault;
            }
            var completionInterval = duration / 5;

            if (completionInterval < timeoutDefault / 2) {
                // use a custom 20% interval if the video is so short that two completion
                // intervals would finish within our current timeout interval
                return duration / 5;
            }
            if (completionInterval < timeoutDefault) {
                // otherwise, use half the default if the video is still short enough that
                // the default would possibly skip a heartbeat
                return timeoutDefault / 2;
            }
            // video is long enough that we don't need a custom interval, default is fine
            return timeoutDefault;
        };

        Sampler.dropKey = function(key) {
            delete Sampler._accumulators[key];
        };

        /*
         * Root sampler function
         *
         * Runs every SAMPLE_RATE ms and increments each key's accumulator
         *
         * @param {int} currentTime The current time as given by new Date().getTime().
         * @param {int} lastSampleTime The time of the last sample as given by
         *                             new Date().getTime().
         */
        Sampler._sample = function(currentTime, lastSampleTime) {
            currentTime = typeof currentTime === 'undefined' ?
                new Date().getTime() : currentTime;

            var trackedData, shouldCountSample, increment, _lastSampleTime,
                timeSinceLastPositiveSample;
            for (var trackedKey in Sampler._accumulators) {
                trackedData = Sampler._accumulators[trackedKey];
                _lastSampleTime = typeof lastSampleTime === 'undefined' ?
                    trackedData.lastSampleTime : lastSampleTime;
                increment = currentTime - _lastSampleTime;

                // if sampleFn is undefined bypass sample function
                shouldCountSample = typeof trackedData.sampleFn === 'undefined' ? true : trackedData
                    .sampleFn(currentTime);

                trackedData.ms += shouldCountSample ? increment : 0;
                trackedData.totalMs += shouldCountSample ? increment : 0;
                trackedData.lastSampleTime = currentTime;
                if (shouldCountSample) {
                    timeSinceLastPositiveSample = currentTime -
                        trackedData.lastPositiveSampleTime;
                    // this condition denotes a key that's been tracked for long enough
                    // to start backing off *and* has been negative since before the
                    // last time it would have sent a heartbeat - eg a video that
                    // just became unpaused
                    if (timeSinceLastPositiveSample > trackedData.baseHeartbeatInterval) {
                        // reset timeout to its value pre-backoff
                        trackedData.heartbeatInterval = trackedData.baseHeartbeatInterval;
                        Sampler._setHeartbeatTimeout(trackedKey);
                    }
                    trackedData.lastPositiveSampleTime = currentTime;
                }
            }
        };

        /*
         * Send a heartbeat for the given key
         *
         * @param {string} trackedKey The key for which to send the heartbeat
         * @param {int} incSecs_ The number of seconds of accumulated time for each
         *                       key. This should be used only for testing.
         */
        Sampler.sendHeartbeat = function(trackedKey, incSecs_, totalSamplingMs, ignoreExperimental,
            isDuringUnload) {
            if (ignoreExperimental !== true &&
                PARSELY.__experimental.unloadHeartbeatOnly === true) {
                return;
            }
            var trackedData = Sampler._accumulators[trackedKey];
            if (typeof trackedData === "undefined") {
                return;
            }
            var incSecs = typeof incSecs_ === 'undefined' ?
                trackedData.ms / 1000 : incSecs_;
            var roundedSecs = Math.round(incSecs);
            if (roundedSecs > 0 && roundedSecs <= MAX_TIME_BETWEEN_HEARTBEATS / 1000) {
                trackedData.heartbeatFn(roundedSecs, undefined, trackedData.totalMs,
                    isDuringUnload);
            }
            trackedData.ms = 0;
            Sampler._backoff(trackedData, totalSamplingMs);
            Sampler._setHeartbeatTimeout(trackedKey);
        };

        /*
         * Send heartbeats for all accumulators with accumulated time
         *
         * @param {int} incSecs_ The number of seconds of accumulated time for each
         *                       key. This should be used only for testing.
         */
        Sampler._sendHeartbeats = function(incSecs_, totalSamplingMs) {
            for (var trackedKey in Sampler._accumulators) {
                Sampler.sendHeartbeat(trackedKey, incSecs_, totalSamplingMs, true, true);
            }
        };
        // Make a best attempt to fire a heartbeat before the browser is closed
        // have to use a wrapper function here since an event listener will
        // normally send arguments that will collide with those _sendHeartbeats
        // is expecting
        root.util.windowAddEventListener(
            'beforeunload',
            function handleBeforeUnload() {
                Sampler._sendHeartbeats();
            });
        return Sampler;
    };

    root.Sampler = factory(root.util.getWindow());

})(this.PARSELY);

/*
  PARSE.LY ENGAGED TIME TRACKING
 */
(function() {
    var root = this.PARSELY,
        settings = root.config.settings,
        Sampler = root.Sampler,
        $ = root.$,
        util = root.util;

    // Allow publishers to disable engaged time pings all together
    if (typeof root.enableHeartbeats === "boolean" && !root.enableHeartbeats) {
        return;
    }

    var MIN_ACTIVE_TIMEOUT = 1, // 1 sec
        MAX_ACTIVE_TIMEOUT = 60, // 60 secs
        EVENT_NAMES = ["focus", "mousedown", "mouseup", "mousemove", "scroll",
            "keyup", "keydown"
        ];

    var activeTimeout = 5; // default, 5 seconds
    if ($.isNumeric(root.activeTimeout) &&
        root.activeTimeout >= MIN_ACTIVE_TIMEOUT &&
        root.activeTimeout <= MAX_ACTIVE_TIMEOUT) {
        activeTimeout = root.activeTimeout;
    }

    var now = new Date().getTime();

    root.engagedTime = root.engagedTime || {};

    // keep track of how recently we saw the last event
    root._lastEventTime = now;
    // externally visible indicator of engaged status
    root.isEngaged = true;
    // externally visible indicator of interacting status
    root.isInteracting = true;
    // maintain a focused property that indicates whether the document has focus
    root.focused = true;
    // externally visible indicator of whether a video is being tracked and is playing
    root.videoPlaying = false;

    root.ENGAGED_TIME_SAMPLER_KEY = "engagedTime";

    // Counts used for testing only
    if (settings.test === true) {
        root._handleEngagementActivityCalls = 0;
    }

    if (root.fbInstantArticles !== true) {
        // for facebook instant articles we don't need to know if focused
        $(document).on("show.visibility", function() {
            root.focused = true;
        });
        $(document).on("hide.visibility", function() {
            root.focused = false;
        });
    }

    // trigger the activity timeout with any of EVENT_NAMES
    var handleEngagementActivity = function() {
        root._lastEventTime = new Date().getTime();
        if (settings.test === true) {
            root._handleEngagementActivityCalls++;
        }
    };

    if (root.fbInstantArticles !== true) {
        $.each(EVENT_NAMES, function(i, eventName) {
            util.windowAddEventListener(eventName, handleEngagementActivity);
        });
    } else {
        // for facebook instant articles don't rely on events to prove engagement
        setInterval(handleEngagementActivity, activeTimeout * 1000);
    }

    // Utility function to expose private members to unit tests
    root.engagedTime.getParams = function() {
        return {
            minActiveTimeout: MIN_ACTIVE_TIMEOUT,
            maxActiveTimeout: MAX_ACTIVE_TIMEOUT,
            activeTimeout: activeTimeout
        };
    };

    root.engagedTime.sample = function(currentTime, lastEventTime, videoPlaying, focused) {
        // Allows us to override for unit testing
        currentTime = typeof currentTime === 'undefined' ?
            new Date().getTime() : currentTime;
        lastEventTime = typeof lastEventTime === 'undefined' ?
            root._lastEventTime : lastEventTime;
        videoPlaying = typeof videoPlaying === 'undefined' ?
            root.videoPlaying : videoPlaying;
        focused = typeof focused === 'undefined' ? root.focused : focused;

        root.isInteracting = (currentTime - lastEventTime) < (activeTimeout * 1000);
        root.isEngaged = (root.isInteracting && focused) || videoPlaying;
        return root.isEngaged;
    };

    root.engagedTime.sendHeartbeat = function(roundedSecs, enableHeartbeats, totalMs,
                                              isDuringUnload)
    {
        // Allows us to override for unit testing
        roundedSecs = typeof roundedSecs === 'undefined' ? 0 : roundedSecs;
        enableHeartbeats = typeof enableHeartbeats === 'undefined' ?
            root.enableHeartbeats : enableHeartbeats;
        isDuringUnload = typeof isDuringUnload === 'undefined' ?
            false : isDuringUnload;

        var heartbeatsEnabled = (typeof enableHeartbeats === 'undefined' ||
            enableHeartbeats === true);

        if (heartbeatsEnabled &&
            (root.config.heartbeat_should_honor_autotrack !== true || root.autotrack)) {
            PARSELY.beacon.pixel.beacon({
                date: new Date().toString(),
                action: "heartbeat",
                inc: roundedSecs,
                tt: totalMs,
                url: util.getEventUrl(),
                urlref: root.lastRequest ? root.lastRequest.urlref : util.getWindow().document.referrer
            }, undefined, isDuringUnload);
            if ($.isFunction(root.onHeartbeat)) {
                root.onHeartbeat(roundedSecs);
            }
        }
    };

    var sampleFn = root.fbInstantArticles === true ? undefined : root.engagedTime.sample;
    Sampler.trackKey(root.ENGAGED_TIME_SAMPLER_KEY,
        sampleFn,
        root.engagedTime.sendHeartbeat);
}());

(function() {
    // import third-party libraries
    var root = this.PARSELY,
        $ = root.$,
        Class = root.Class,
        JSON = root.JSON,
        console = root.console,
        CONFIG = root.config,
        URLS = root.urls,
        visitorManager = root.visitorManager,
        sessionManager = root.sessionManager,
        ParselyStorage = root.ParselyStorage;

    var windowAlias = root.util.getWindow();
    var documentAlias = windowAlias.document,
        screenAlias = windowAlias.screen;

    /***
     * Pixel implements a thin wrapper for a pixel that beacons back information to Parse.ly tracking servers.
     */
    PARSELY.Pixel = Class.extend({
        init: function() {
            var url = root.util.getEventUrl();
            var res = screenAlias.width + "x" + screenAlias.height;
            var availRes = screenAlias.availWidth + "x" + screenAlias.availHeight;
            var depth = screenAlias.colorDepth;
            var resolution = res + "|" + availRes + "|" + depth;

            this.correlationIds = {
                "pageview": "pvid",
                "videostart": "vsid"
            };
            this.callbackName = "parselyStartCallback";
            this.dashDomains = ["https://dash.parsely.com", "https://beta.parsely.com"];
            this.data = {
                idsite: CONFIG.apikey,
                url: url,
                urlref: documentAlias.referrer,
                screen: resolution,
                data: {}
            };
            if (!CONFIG.hasOwnProperty("is_remote_config") ||
                CONFIG.is_remote_config === true) {
                this.data.data.parsely_uuid = CONFIG.network_uuid || CONFIG.uuid;
                this.data.data.parsely_site_uuid = CONFIG.parsely_site_uuid;
            }
            this.remoteEndpoint = URLS.pixel + this.selectEndpoint();
        },
        selectEndpoint: function() {
            var endpoint;
            if (CONFIG.hasOwnProperty("is_remote_config") &&
                CONFIG.is_remote_config === false) {
                if (CONFIG.track_ip_addresses === false) {
                    if (CONFIG.track_third_party_cookies === true) {
                        endpoint = "/eventx/";
                    } else {
                        endpoint = "/px/";
                    }
                } else {
                    if (CONFIG.track_third_party_cookies === true) {
                        endpoint = "/event/";
                    } else {
                        endpoint = "/plogger/";
                    }
                }
            } else {
                if (CONFIG.track_ip_addresses === false) {
                    // special endpoint that strips client IP's and replaces with 0.0.0.0
                    endpoint = "/px/";
                } else {
                    // normal endpoint that preserves client IP's
                    endpoint = "/plogger/";
                }
            }
            return endpoint;
        },
        addDefaults: function(newDefaults) {
            // deep merges newDefaults into the existing data
            $.extend(true, this.data, newDefaults);
        },
        shouldFetchVisitorID: function(visitorId) {
            if (!CONFIG.hasOwnProperty("is_remote_config") ||
                CONFIG.is_remote_config === true) {
                return false;
            }
            if (!visitorId) {
                return true;
            }
            if (root.updateVisitorIds) {
                return visitorId.indexOf("pid=") !== 0;
            }
            return false;
        },
        requestJsonPInit: function(data) {
            windowAlias[this.callbackName] = function(returnedData) {
                // XXX - use visitorManager.initVisitor(CONFIG.uuid) here
                // also, initVisitor should set CONFIG.uuid
                CONFIG.uuid = returnedData.set.length > 0 ? returnedData.set :
                    returnedData.got;
                var sessionInfo = sessionManager.getSession(),
                    visitorInfo = {
                        "id": CONFIG.uuid,
                        // by the time this callback is executed, a session has already
                        // been initiated by getSession at module definition time.
                        // to maintain parity with this existing session, we use its
                        // members here when setting up our new visitorInfo
                        "session_count": sessionInfo.sid,
                        "last_session_ts": sessionInfo.sts
                    };
                ParselyStorage.setJSON(visitorManager.visitorCookieName, visitorInfo, {
                    expires: visitorManager.visitorCookieTimeoutSecs,
                    secure: visitorManager.visitorCookieSecure
                });
                sessionManager.getSession();

                if ($.isFunction(PARSELY.onBeacon)) {
                    PARSELY.onBeacon(data);
                }
            };
            data.callback = this.callbackName;
            var params = $.param(data),
                ipSuffix = CONFIG.track_ip_addresses === false ? "x" : "",
                pixelpath = URLS.pixel + "/start" + ipSuffix + "/?" + params;
            console.log("beaconing to endpoint: " + pixelpath);
            // request the start endpoint using jsonp
            var script = document.createElement('script');
            script.src = pixelpath;
            documentAlias.getElementsByTagName('head')[0].appendChild(script);
        },
        requestImg: function(data, visitorId) {
            console.log("beaconing to endpoint: " + this.remoteEndpoint);
            data.u = visitorId;
            var img = new Image();
            img.src = this.buildEventRequestUrl(data);

            if ($.isFunction(root.onBeacon)) {
                root.onBeacon(data);
            }
        },
        requestFetch: function(data, visitorId) {
            console.log("fetching endpoint: " + this.remoteEndpoint);
            if (typeof windowAlias.fetch === "undefined") {
                return false;
            }
            data.u = visitorId;
            fetch(this.buildEventRequestUrl(data), {
                method: "GET",
                mode: "no-cors",
                keepalive: true  // makes request work during page unload
            });
            return true;
        },
        buildEventRequestUrl: function(data) {
            var params = $.param(data),
                pixelpath = this.remoteEndpoint + "?" + params;
            return pixelpath;
        },
        generatePageloadId: function() {
            if (typeof root.pageload_id === "undefined") {
                root.pageload_id = Math.floor(Math.random() * 99999999);
            }
            return root.pageload_id;
        },
        getCorrelationIdKey: function(action) {
            return "_" + action + "_correlation_id";
        },
        generateEventCorrelationId: function(action, reset) {
            var _idKey = this.getCorrelationIdKey(action);
            if (reset === true) {
                root[_idKey] = Math.floor(Math.random() * 99999999);
            }
            return root[_idKey];
        },
        beacon: function(additionalParams, shouldNotSetLastRequest, attemptFetch) {
            // Get the session and extend its timeout since we're sending a
            // pixel
            var session = sessionManager.getSession(true),
                rand = new Date().getTime(),
                plid = this.generatePageloadId() || 0,
                data = $.extend(true, {
                        rand: rand,
                        plid: plid
                    },
                    this.data, session, additionalParams),
                visitorInfo = root.visitorManager.getVisitorInfo();
            visitorManager.extendVisitorExpiry();

            var correlationId;
            for (var action in this.correlationIds) {
                correlationId = this.generateEventCorrelationId(action,
                    action === data.action);
                if (typeof correlationId !== "undefined") {
                    data[this.correlationIds[action]] = correlationId;
                }
            }

            // Don't send slot info with anything but pageviews
            if (data.action === 'pageview') {
                // "Pop" a slot click off the stack and send this info along
                // with this page view
                var slotInfo = ParselyStorage.getJSON('_parsely_slot_click');
                if (slotInfo) {
                    ParselyStorage.expire('_parsely_slot_click');
                    console.log('Valid slot click found');
                    data.sl_xp = slotInfo.xpath;
                    data.sl_x = slotInfo.x;
                    data.sl_y = slotInfo.y;
                    data.sl_h = slotInfo.href;
                }
            }

            data.data = JSON.stringify(data.data);

            if (shouldNotSetLastRequest !== true) {
                PARSELY.lastRequest = data;
            }
            CONFIG.uuid = visitorInfo.id;

            var dashDomain;
            for (var i = 0; i < this.dashDomains.length; i++) {
                dashDomain = this.dashDomains[i];
                if (documentAlias.location.href.indexOf(dashDomain) === 0) {
                    try {
                        windowAlias.postMessage(data, dashDomain);
                    } catch (err) {
                        console.log("Failed to postMessage to Dash domain " + dashDomain);
                    }
                }
            }

            if (this.shouldFetchVisitorID(visitorInfo.id)) {
                this.requestJsonPInit(data);
            } else {
                var fetchSuccess = false;
                if (attemptFetch === true) {
                    fetchSuccess = this.requestFetch(data, CONFIG.uuid);
                }
                if (fetchSuccess === false) {
                    this.requestImg(data, CONFIG.uuid);
                }
            }
        }
    });
}());

(function() {
    // import third-party libraries
    var root = this.PARSELY,
        $ = root.$,
        $LAB = root.$LAB,
        console = root.console,
        Class = root.Class,
        JSON = root.JSON;

    var windowAlias = root.util.getWindow(),
        documentAlias = windowAlias.document;

    /***
     * Beacon implements a client-side pageview tracking
     */
    PARSELY.Beacon = Class.extend({
        // constructor
        init: function() {
            this.pixel = new PARSELY.Pixel();
            // user may set PARSELY.autotrack to control whether pageview tracking
            // happens automatically when beacon is started
            this.autotrack = (typeof PARSELY.autotrack === "undefined") ?
                true : PARSELY.autotrack;
        },

        trackPageView: function(params, shouldNotSetLastRequest) {
            var data = {
                title: documentAlias.title,
                date: new Date().toString(),
                action: "pageview"
            };
            if (params) {
                $.extend(data, params);
            }

            if (root.hasOwnProperty('metadata')) {
                if (!data.hasOwnProperty('metadata')) {
                    data.metadata = JSON.stringify(root.metadata.get());
                } else {
                    data.metadata = JSON.stringify($.extend(data.metadata, root.metadata.get()));
                }
            }

            this.pixel.beacon(data, shouldNotSetLastRequest);
        },

        trackConversion: function(params) {
            // Deprecation notice
            window.console.warn("[WARN] `PARSELY.beacon.trackConversion()` is being deprecated.");
            window.console.warn(
                "[WARN] Please consult https://www.parse.ly/help/integration/conversions/ to update to the new Conversions js-API."
            );

            var categories = ["active", "lead", "customer"],
                data = {
                    label: undefined
                };

            if (!params || !params.category) {
                console.log("No category specified; category required for conversion events");
            } else if (categories.indexOf(params.category) === -1) {
                console.log("'" + params.category +
                    "' is not a valid conversion category; must be one of: " + categories.join(", ")
                );
            } else {
                $.extend(data, params);

                this.trackPageView({
                    action: "conversion",
                    data: {
                        _conversion_type: params.category,
                        _conversion_label: params.label
                    }
                });
            }
        },

        loadCustomizations: function() {
            if (root.config) {
                var customizations = root.config.customizations;
                if (customizations) {
                    console.log("Found customizations; loading.");
                    var prefix = root.urls["static"];
                    var beacon = this;
                    $LAB.script(prefix + customizations).wait(function() {
                        // allow custimizations to install a PARSELY.pCustom function, which
                        // will be called after the customization file has been loaded.
                        // This will allow things like custom event-tracking configured on
                        // the beacon object.
                        if (typeof PARSELY.pCustom !== "undefined") {
                            PARSELY.pCustom(beacon);
                            console.log("pCustom function called");
                        }
                    });
                }
            }
        },
        start: function() {
            this.startTime = new Date().getTime();
            if (this.autotrack) {
                console.log("autotrack enabled; doing automatic pageview beacon");
                this.trackPageView();
            } else {
                console.log("autotrack disabled; beacon loaded but no data sent");
            }
            this.loadCustomizations();
        }
    }); // end PARSELY.Beacon Class

}());

(function() {
    var config = PARSELY.config,
        settings = config.settings,
        console = PARSELY.console,
        $ = PARSELY.$;

    /*
     * top-level api definitions
     */
    PARSELY.updateDefaults = function(newDefaults) {
        return PARSELY.beacon.pixel.addDefaults(newDefaults);
    };

    PARSELY.setConfigOptions = function(options) {
        var whiteListedConfigKeys = ['track_ip_addresses', 'track_third_party_cookies'];
        for (var x = 0; x < whiteListedConfigKeys.length; x++) {
            if (options.hasOwnProperty(whiteListedConfigKeys[x])) {
                PARSELY.config[whiteListedConfigKeys[x]] = options[whiteListedConfigKeys[x]];
            }
        }
    };

    if (settings.tracker) {
        console.log("tracker enabled, create Beacon");
        var beacon = new PARSELY.Beacon();
        PARSELY.beacon = beacon;
        beacon.start();

        if ($.isFunction(PARSELY.onReady)) {
            PARSELY.onReady();
        }
    }

    var uuid = PARSELY.config.uuid;
    if (uuid === undefined || uuid === null) {
        var visitorInfo = PARSELY.visitorManager.getVisitorInfo();
        if (typeof visitorInfo !== "undefined") {
            uuid = visitorInfo.id;
        }
    }
    var hashedId = PARSELY.__experimental.mmh3_hash(uuid),
        visitorPartition;
    if (hashedId !== null) {
        visitorPartition = hashedId % 1000;
    }
    PARSELY.__experimental.visitorPartition = visitorPartition;
    if (visitorPartition === 0 &&
        typeof PARSELY.__experimental.unloadHeartbeatOnly === "undefined") {
        PARSELY.__experimental.unloadHeartbeatOnly = true;
    }

    // Overlay
    try {
        if (typeof(Storage) !== 'undefined' && localStorage.getItem("parsely-overlay")) {
            var js = document.createElement('script');
            js.setAttribute('src', 'https://dash.parsely.com/static/build/overlay.js?v=' + (new Date()).getTime());
            document.body.appendChild(js);
        }
    } catch (err) {
        PARSELY.console.log(err);
    }
}());