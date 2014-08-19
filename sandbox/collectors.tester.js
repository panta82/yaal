var libTools = require("../lib/tools"),

	ArrayCollector = require("../lib/collectors/arrayCollector"),
	HashCollector = require("../lib/collectors/hashCollector");

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

function testFlattenArr(index, fluid, testFn) {
	var ac = new ArrayCollector();
	ac.submit(0, [null, "01"]);
	ac.submit(1, [null]);
	ac.submit(2, [null, "21", "22", "23"]);
	ac.submit(3, [null, "31", "32"]);
	ac.done(function (err, res) {
		var flat = res.toFlat(index, fluid);
		testFn(flat);
	});
}

if (false) (function () {
	testFlattenArr(undefined, undefined, function (flat) {
		console.log(flat);
	});
})();

function testFlattenHash(index, fluid, testFn) {
	var hc = new HashCollector();
	hc.submit("A", [null, "A1"]);
	hc.submit("B", [null]);
	hc.submit("C", [null, "C1", "C2", "C3"]);
	hc.submit("D", [null, "D1", "D2"]);
	hc.done(function (err, res) {
		var flat = res.toFlat(index, fluid);
		testFn(flat);
	});
}

if (false) (function () {
	testFlattenHash(undefined, undefined, function (flat) {
		console.log(flat);
		console.log(flat.count);
	});
})();

if (false) (function () {
	var hc = new HashCollector();
	hc.submit("A", [null, "resA"]);
	hc.submit("B", [null, "resB"]);
	hc.submit("C", [new Error("errC")]);

	hc.done(function (err, res) {
		var cErr = err.toCompact(),
			cRes = res.toCompact();
		err.compact();
		//res.compact();

		testErr(err);
		testErr(cErr);

		testRes(res);
		testRes(cRes);

		function testErr(hash) {
			console.log(hash, hash.count);
		}

		function testRes(hash) {
			console.log(hash, hash.count);
		}
	});
})();

if (true) (function () {
	var hc = new HashCollector();
	hc.submit("A", [null, "A1"]);
	hc.submit("B", [null]);
	hc.submit("C", [null, "C1", "C2", "C3"]);
	hc.submit("D", [null, "D1", "D2"]);
	hc.done(function (err, res) {
		console.log(err, res);
		var flat = res.flatten();
		console.log(flat);
	});
})();
