var libTools = require("../lib/tools"),

	ArrayResultCollector = require("../lib/results/arrayResultCollector");

describe("Array result converter", function () {

	it("can convert no errors into null", function (done) {
		var arc = new ArrayResultCollector();
		arc.submit(0, [null, "res0"]);
		arc.submit(1, [null, "res1"]);
		arc.done(function (err, res) {
			expect(err).toEqual(null);
			done();
		});
	});

	it("can record errors and produce flat results", function (done) {
		var arc = new ArrayResultCollector();
		arc.submit(2, [null, "res2"]);
		arc.submit(1, [new Error("err1")]);
		arc.submit(0, [null, "res0"]);
		arc.done(function (err, res) {
			expect(err.length).toEqual(3);
			expect(err.count).toEqual(1);
			expect(err[0]).toEqual(null);
			expect(err[1].message).toEqual("err1");
			expect(err[2]).toEqual(null);

			expect(res.flat).toEqual(true);
			expect(res.length).toEqual(3);
			expect(res.count).toEqual(2);
			expect(res[0]).toEqual("res0");
			expect(res[1]).toEqual(undefined);
			expect(res[2]).toEqual("res2");
			done();
		});
	});

	it("can record multiple callback args and produce crumpled results", function (done) {
		var arc = new ArrayResultCollector();
		arc.submit(2, [null, "res2", "21"]);
		arc.submit(1, [null]);
		arc.submit(0, [null, "res0"]);
		arc.submit(3, [null, "res3", "31", "32"]);
		arc.done(function (err, res) {
			expect(res.length).toEqual(4);
			expect(res.count).toEqual(3);
			expect(res.flat).toEqual(false);

			expect(res[0].length).toEqual(1);
			expect(res[0][0]).toEqual("res0");

			expect(res[1].length).toEqual(0);

			expect(res[2].length).toEqual(2);
			expect(res[2][0]).toEqual("res2");
			expect(res[2][1]).toEqual("21");

			expect(res[3].length).toEqual(3);
			expect(res[3][0]).toEqual("res3");
			expect(res[3][1]).toEqual("31");
			expect(res[3][2]).toEqual("32");

			done();
		});
	});

	it("can convert flat results into crumpled", function (done) {
		var arc = new ArrayResultCollector();
		arc.submit(0, [null, "res0"]);
		arc.submit(1, [null]);
		arc.done(function (err, res) {
			var crumpled = res.toCrumpled();
			res.crumple();

			expect(crumpled !== res).toBeTruthy();

			test(res);
			test(crumpled);

			done();

			function test(arr) {
				expect(arr[0].length).toEqual(1);
				expect(arr[0][0]).toEqual("res0");
				expect(arr[1].length).toEqual(0);
			}
		});
	});

	it("can convert crumpled results into flat", function (done) {
		var arc = new ArrayResultCollector();
		arc.submit(0, [null, "0"]);
		arc.submit(1, [null]);
		arc.submit(2, [null, "21", "22"]);
		arc.done(function (err, res) {
			var flat = res.toFlat();
			res.flatten();

			expect(flat !== res).toBeTruthy();
			test(res);
			test(flat);

			done();

			function test(arr) {
				expect(arr.length).toEqual(4);
				expect(arr[0]).toEqual("0");
				expect(arr[1]).toEqual(undefined);
				expect(arr[2]).toEqual("21");
				expect(arr[3]).toEqual("22");
			}
		});
	});

	it("can compact errors and flat results", function (done) {
		var arc = new ArrayResultCollector();
		arc.submit(0, [null, "res0"]);
		arc.submit(1, [null, "res1"]);
		arc.submit(2, [new Error("err2")]);

		arc.done(function (err, res) {
			var cErr = err.toCompact(),
				cRes = res.toCompact();
			err.compact();
			res.compact();

			testErr(err);
			testErr(cErr);

			testRes(res);
			testRes(cRes);

			done();

			function testErr(arr) {
				expect(arr.length).toEqual(1);
				expect(arr.count).toEqual(1);
				expect(arr[0].message).toEqual("err2");
			}

			function testRes(arr) {
				expect(arr.length).toEqual(2);
				expect(arr.count).toEqual(2);
				expect(arr[0]).toEqual("res0");
				expect(arr[1]).toEqual("res1");
			}
		});
	});

	it("can compact crumpled results", function (done) {
		var arc = new ArrayResultCollector();
		arc.submit(0, [null, "00", "01"]);
		arc.submit(1, [null]);
		arc.submit(2, [null, "20"]);

		arc.done(function (err, res) {
			var cRes = res.toCompact();
			res.compact();

			testRes(res);
			testRes(cRes);

			done();

			function testRes(arr) {
				expect(arr.length).toEqual(2);
				expect(arr.count).toEqual(2);
				expect(arr[0][0]).toEqual("00");
				expect(arr[0][1]).toEqual("01");
				expect(arr[1][0]).toEqual("20");
			}
		});
	});
});
