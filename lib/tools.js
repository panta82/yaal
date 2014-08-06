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
				&& i[0] !== "_"
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