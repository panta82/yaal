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

exports.shallowCopy = function shallowCopy(x, target) {
	if (typeof(x) !== "object") {
		return x;
	}
	if (!target) {
		if (exports.isArray(x)) {
			target = [];
		} else {
			target = {};
		}
	}
	for (var i in x) {
		if (x.hasOwnProperty(i)) {
			target[i] = x[i];
		}
	}
	return target;
};