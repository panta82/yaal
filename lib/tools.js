var libUtil = require("util");

exports.isObject = function isObject(x, nullIsObject, arrayIsObject) {
	return typeof(x) === "object" && (nullIsObject || x !== null) && (arrayIsObject || !exports.isArray(x));
};

exports.isAnonObject = function isAnonObject(x, nullIsObject) {
	return exports.isObject(x, nullIsObject) && x.constructor.name === "Object";
};

exports.isFunction = function isFunction(x) {
	return typeof(x) === "function";
};

exports.isString = function isString(x) {
	return typeof(x) === "string";
};

exports.isArray = function isArray(x) {
	return Object.prototype.toString.call(x) === '[object Array]';
};

exports.isNumber = function isNumber(x, nanIsNumber, infinityIsNumber) {
	return typeof(x) === "number" && (nanIsNumber || !isNaN(x)) && (infinityIsNumber || isFinite(x));
};

exports.isBoolean = function isBoolean(x) {
	return typeof(x) === "boolean";
};

/*
	Override base method attached to property name, with replacement fn
 */
exports.override = function override(target, name, fn) {
	var base = target[name];
	target[name] = function () {
		base.apply(target, arguments);
		fn.apply(target, arguments);
	};
};

/*
	Source can be any object, but main purpose is to copy array or hash.
	Target can be an existing object. Otherwise, a new array or hash is created.
	The 'constrain' switch will ensure only properties that already exist in the target are overwritten.
 */
exports.shallowCopy = function shallowCopy(source, target, constrain) {
	constrain = constrain === true;
	if (typeof(source) !== "object") {
		return source;
	}
	if (!target) {
		if (exports.isArray(source)) {
			target = [];
		} else {
			target = {};
		}
	}
	for (var i in source) {
		if (source.hasOwnProperty(i)
				&& (!constrain || target.hasOwnProperty(i))) {
			target[i] = source[i];
		}
	}
	return target;
};

exports.each = function each(ob, fn) {
	var i,
		obLength = ob.length,
		res;
	if (obLength !== undefined) {
		// array-like
		for (i = 0; i < obLength; i++) {
			res = fn(ob[i], i, ob);
			if (res === false) {
				return false;
			}
		}
	} else {
		// hash-like
		for (i in ob) {
			if (ob.hasOwnProperty(i)) {
				res = fn(ob[i], i, ob);
				if (res === false) {
					return false;
				}
			}
		}
	}
	return true;
};

exports.safeSet = function safeSet(reserved, ob, key, val, duplicateKeyFormat, duplicateKeyIndex) {
	if (reserved[key]) {
		return false;
	}
	if (duplicateKeyFormat) {
		var index = duplicateKeyIndex || 0;
		do {
			if (index > 0) {
				key = libUtil.format(duplicateKeyFormat, key, index);
			}
			index++;
		}
		while (typeof ob[key] !== "undefined");
	}
	ob[key] = val;
	return true;
};

/*
	Wrapper around util.format that swallows additional arguments instead of appending them to the end
 */
exports.safeFormat = function safeFormat(f, a, b, c) {
	var placeholderCount = f.match(/%[sdj]/g).length;
	if (placeholderCount === 0) {
		return f;
	}
	if (placeholderCount === 1) {
		return libUtil.format(f, a);
	}
	if (placeholderCount === 2) {
		return libUtil.format(f, a, b);
	}
	if (placeholderCount === 3) {
		return libUtil.format(f, a, b, c);
	}
	throw new Error("Too many placeholders!");
};

exports.arrayFirst = function arrayFirst(arr, fn, def) {
	var fnRes = undefined;
	for (var i = 0; i < arr.length; i++) {
		fnRes = fn(arr[i], i, arr);
		if (fnRes === true) {
			return arr[i];
		}
		else if (fnRes !== false && fnRes !== undefined) {
			return fnRes;
		}
	}
	return def;
};