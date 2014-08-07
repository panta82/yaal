var ArrayCollector = require("../lib/collectors/arrayCollector");

describe("Array collector", function () {

	it("can convert no errors into null", function (done) {
		var arc = new ArrayCollector();
		arc.submit(0, [null, "res0"]);
		arc.submit(1, [null, "res1"]);
		arc.done(function (err) {
			expect(err).toEqual(null);
			done();
		});
	});

	it("can record errors and produce flat results", function (done) {
		var arc = new ArrayCollector();
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

	it("can accept multiple arguments in callback and produce nested results", function (done) {
		var arc = new ArrayCollector();
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

	describe("can flatten the results", function () {
		function testFlatten(done, index, fluid, testFn) {
			var arc = new ArrayCollector();
			arc.submit(0, [null, "01"]);
			arc.submit(1, [null]);
			arc.submit(2, [null, "21", "22", "23"]);
			arc.submit(3, [null, "31", "32"]);
			arc.done(function (err, res) {
				var flat = res.flatten(index, fluid);

				expect(flat).not.toBe(res);
				testFn(flat);

				done();
			});
		}

		it("by keeping all the existing values (not picking)", function (done) {
			testFlatten(done, undefined, undefined, function (arr) {
				expect(arr.length).toEqual(6);
				expect(arr.count).toEqual(6);
				expect(arr[0]).toEqual("01");
				expect(arr[1]).toEqual("21");
				expect(arr[2]).toEqual("22");
				expect(arr[3]).toEqual("23");
				expect(arr[4]).toEqual("31");
				expect(arr[5]).toEqual("32");
			});
		});

		it("by picking rigidly from the left", function (done) {
			testFlatten(done, 0, undefined, function (arr) {
				expect(arr.length).toEqual(4);
				expect(arr[0]).toEqual("01");
				expect(arr[1]).toEqual(undefined);
				expect(arr[2]).toEqual("21");
				expect(arr[3]).toEqual("31");
			});
		});

		it("by picking rigidly from the right", function (done) {
			testFlatten(done, -2, undefined, function (arr) {
				expect(arr.length).toEqual(4);
				expect(arr[0]).toEqual(undefined);
				expect(arr[1]).toEqual(undefined);
				expect(arr[2]).toEqual("22");
				expect(arr[3]).toEqual("31");
			});
		});

		it("by picking fluidly from the left", function (done) {
			testFlatten(done, 2, true, function (arr) {
				expect(arr.length).toEqual(4);
				expect(arr[0]).toEqual("01");
				expect(arr[1]).toEqual(undefined);
				expect(arr[2]).toEqual("23");
				expect(arr[3]).toEqual("32");
			});
		});

		it("by picking fluidly from the right", function (done) {
			testFlatten(done, -2, true, function (arr) {
				expect(arr.length).toEqual(4);
				expect(arr[0]).toEqual("01");
				expect(arr[1]).toEqual(undefined);
				expect(arr[2]).toEqual("22");
				expect(arr[3]).toEqual("31");
			});
		});
	});

	it("can compact errors and flat results", function (done) {
		var arc = new ArrayCollector();
		arc.submit(0, [null, "res0"]);
		arc.submit(1, [null, "res1"]);
		arc.submit(2, [new Error("err2")]);

		arc.done(function (err, res) {
			var cErr = err.compact(),
				cRes = res.compact();

			expect(cErr.length).toEqual(1);
			expect(cErr.count).toEqual(1);
			expect(cErr[0].message).toEqual("err2");

			expect(cRes.length).toEqual(2);
			expect(cRes.count).toEqual(2);
			expect(cRes[0]).toEqual("res0");
			expect(cRes[1]).toEqual("res1");

			done();
		});
	});

	it("can compact nested results", function (done) {
		var arc = new ArrayCollector();
		arc.submit(0, [null, "00", "01"]);
		arc.submit(1, [null]);
		arc.submit(2, [null, "20"]);

		arc.done(function (err, res) {
			var cRes = res.compact();
			expect(cRes.length).toEqual(2);
			expect(cRes.count).toEqual(2);
			expect(cRes[0][0]).toEqual("00");
			expect(cRes[0][1]).toEqual("01");
			expect(cRes[1][0]).toEqual("20");

			done();
		});
	});

	it("can extract any result or error", function (done) {
		var arc = new ArrayCollector();
		arc.submit(0, [null]);
		arc.submit(1, [new Error("err1")]);
		arc.submit(2, [null, "res2"]);
		arc.submit(3, [new Error("err3")]);

		arc.done(function (err, res) {
			var anyErr = err.any(),
				anyRes = res.any();

			expect(anyErr.message).toEqual("err1");
			expect(anyRes).toEqual("res2");

			done();
		});
	});
});
