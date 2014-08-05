var libTools = require("../lib/tools"),

	ArrayResultCollector = require("../lib/results/arrayResultCollector");

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