var libTools = require("../lib/tools"),
	libHelpers = require("../spec/helpers"),
	yaal = require("../lib/yaal");

if (false)
yaal(libHelpers.asyncToUppercase, ["a", "b", "c"], function (err, res) {
	console.log(err, res);
});

if (true) (function () {
	var fns = [
			libHelpers.makeTimeoutFn(100, null),
			libHelpers.makeTimeoutFn(200, null, "1"),
			libHelpers.makeTimeoutFn(300, null, "21", "22")
		];

	yaal(fns, 2, "meta", function (_, res) {
		console.log(res[0][0].completedAt - res[0][0].startedAt);
	});
})();
