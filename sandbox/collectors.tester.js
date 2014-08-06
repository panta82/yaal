var libTools = require("../lib/tools"),

	ArrayCollector = require("../lib/collectors/arrayCollector");

if (false) (function () {
	var arc = new ArrayCollector();
	arc.submit(0, [null, "00", "01"]);
	arc.submit(1, [null]);
	arc.submit(2, [null, "20"]);

	arc.done(function (err, res) {
		testRes(res);

		//var cRes = res.toCompact();
		res.compact();

		testRes(res);
		//testRes(cRes);

		function testRes(arr) {
			console.log(arr);
		}
	});
})();

if (false) (function () {
	var arc = new ArrayCollector();
	arc.submit(0, [null, "0"]);
	arc.submit(1, [null, "11", "12", "13"]);
	arc.submit(2, [null, "21", "22"]);
	arc.done(function (err, res) {
		var flat = res.toFlat(3, true);

		test(flat);

		function test(arr) {
			console.log(arr);
		}
	});
})();

if (true) (function () {
	testFlatten(undefined, undefined, function (flat) {
		console.log(flat);
	});
})();

function testFlatten(index, fluid, testFn) {
	var arc = new ArrayCollector();
	arc.submit(0, [null, "01"]);
	arc.submit(1, [null]);
	arc.submit(2, [null, "21", "22", "23"]);
	arc.submit(3, [null, "31", "32"]);
	arc.done(function (err, res) {
		var flat = res.toFlat(index, fluid);
		testFn(flat);
	});
}