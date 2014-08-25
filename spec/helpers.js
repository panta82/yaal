var libTools = require("../lib/tools");

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

exports.asyncMirror = function asyncMirror() {
	var x = arguments[0],
		callback = arguments[arguments.length - 1];
	setTimeout(function () {
		callback(null, String(x));
	}, 100);
};

exports.asyncToUppercase = function asyncToUppercase(str, callback) {
	setTimeout(function () {
		if (str) {
			callback(null, String(str).toUpperCase());
		} else {
			callback(new Error("Invalid"));
		}
	}, 100);
};

exports.asyncAddSub = function asyncAddSub(a, b, callback) {
	setTimeout(function () {
		if (libTools.isNumber(a) && libTools.isNumber(b)) {
			callback(null, a + b, a - b);
		} else {
			callback(new Error("Invalid"));
		}
	}, 100);
};

exports.expectTimestamp = function expectTimestamp(expect, ts, target, precision) {
	precision = precision || 35;
	ts = ts.getTime ? ts.getTime() : ts;
	target = target.getTime ? target.getTime() : target;
	expect(ts).toBeGreaterThan(target - precision);
	expect(ts).toBeLessThan(target + precision);
};