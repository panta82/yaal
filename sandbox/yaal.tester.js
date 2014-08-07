var libTools = require("../lib/tools"),
	libHelpers = require("../spec/helpers"),
	yaal = require("../lib/yaal");

if (false)
yaal(libHelpers.asyncToUppercase, ["a", "b", "c"], function (err, res) {
	console.log(err, res);
});

if (false) (function () {
	var fns = [
			libHelpers.makeTimeoutFn(100, null),
			libHelpers.makeTimeoutFn(200, null, "1"),
			libHelpers.makeTimeoutFn(300, null, "21", "22")
		];

	yaal(fns, 2, "meta", function (err, res, meta) {
		console.log(meta);
	});
})();

if (false) (function () {
	var fns = [
		function (x, y, cb) {
			cb(null, (x + 10) / y);
		},
		function (x, y, cb) {
			cb(null, (x - 10) * y);
		},
		function (x, y, cb) {
			cb(new Error("3"));
		}
	];
	yaal(fns, [20, 3], function (err, res) {
		console.log(err.any().message);
	});
})();

if (true) (function () {
	var fns = [
		libHelpers.makeTimeoutFn(50, null, "fn1"),
		libHelpers.makeTimeoutFn(200, null, "fn2"),
		libHelpers.makeTimeoutFn(100, new Error("showstopper")),
		function (cb) {
			cb(new Error("This function should never be called"));
		}
	];
	yaal(fns, 2, "FATAL", function (err, res) {
		console.log(err, res);
	});
})();