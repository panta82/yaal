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

/*
	var fn = makeTimeoutFn(1500, null, "result2");
	fn(1, "whatever2", 3, function (err, res) {
		console.log(err, res); // null, result2
	});
*/
exports.makeTimeoutFn = function makeTimeoutFn(ms) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function () {
		var that = this,
			callback = arguments[arguments.length - 1];
		setTimeout(function () {
			callback && callback.apply(that, args);
		}, ms);
	}
};