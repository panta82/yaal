var libTools = require("../lib/tools"),

	ArrayResultCollector = require("../lib/results/arrayResultCollector");

if (false) (function () {
	var arc = new ArrayResultCollector();
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

if (true) (function () {
	var arc = new ArrayResultCollector();
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