var libTools = require("../lib/tools"),

	ArrayResultCollector = require("../lib/results/arrayResultCollector");

var arc = new ArrayResultCollector();
arc.submit(0, [null, "res0"]);
arc.submit(1, [null, "res1"]);
arc.submit(2, [new Error("err2")]);

arc.done(function (err, res) {
	/*var cErr = err.toCompact(),
		cRes = res.toCompact();*/
	err.compact();
	//res.compact();

	console.log(err);

});