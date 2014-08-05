var libHelpers = require("./helpers"),

	yaal = require("../lib/yaal");

describe("Yaal", function () {

	describe("when provided a list of tasks", function () {
		it("should execute them correctly", function (done) {
			var fns = [
				libHelpers.makeTimeoutFn(100, null, "res1"),
				libHelpers.makeTimeoutFn(200, null, "res2")
			];
			var startedAt = new Date();
			yaal(fns, function (err, res) {
				expect(err).toEqual(null);
				expect(res.length).toEqual(2);
				expect(res.count).toEqual(2);
				expect(res[0]).toEqual("res1");
				expect(res[1]).toEqual("res2");
				expect(new Date() - startedAt).toBeLessThan(220);
				done();
			});
		});
	});

	describe("when provided a single task", function () {
		it("should correctly execute with non-nested arguments", function (done) {
			yaal(libHelpers.asyncToUppercase, ["a", "b", "c"], function (err, res) {
				expect(err).toEqual(null);
				expect(res.length).toEqual(3);
				expect(res.count).toEqual(3);
				expect(res[0]).toEqual("A");
				expect(res[1]).toEqual("B");
				expect(res[2]).toEqual("C");
				done();
			});
		});

		it("should correctly execute with nested arguments", function (done) {
			yaal(libHelpers.asyncAddSub, [[1, 3], [2, -6]], function (err, res) {
				expect(err).toEqual(null);
				expect(res.length).toEqual(2);
				expect(res.count).toEqual(2);
				expect(res[0][0]).toEqual(4);
				expect(res[0][1]).toEqual(-2);
				expect(res[1][0]).toEqual(-4);
				expect(res[1][1]).toEqual(8);
				done();
			});
		});
	});

	it("should correctly pass on arguments", function (done) {
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
			expect(err.any().message).toEqual("3");
			expect(res[0]).toEqual(10);
			expect(res[1]).toEqual(30);
			done();
		});
	});

	it("should respect meta switch", function (done) {
		var startedAt = new Date(),
			fns = [
				libHelpers.makeTimeoutFn(100, null),
				libHelpers.makeTimeoutFn(200, null, "11"),
				libHelpers.makeTimeoutFn(300, null, "21", "22")
			];

		yaal(fns, 2, yaal.meta, function (_1, _2, meta) {
			var completedAt = new Date();

			libHelpers.expectTimestamp(expect, completedAt, startedAt.getTime() + 400);

			libHelpers.expectTimestamp(expect, meta.startedAt, startedAt);
			libHelpers.expectTimestamp(expect, meta.completedAt, completedAt);

			libHelpers.expectTimestamp(expect, meta[0].startedAt, startedAt);


			libHelpers.expectTimestamp(expect, meta[0].completedAt, startedAt.getTime() + 100);
			libHelpers.expectTimestamp(expect, meta[1].startedAt, startedAt);
			libHelpers.expectTimestamp(expect, meta[1].completedAt, startedAt.getTime() + 200);
			libHelpers.expectTimestamp(expect, meta[2].startedAt, startedAt.getTime() + 100);
			libHelpers.expectTimestamp(expect, meta[2].completedAt, startedAt.getTime() + 400);

			//expect(res[0][0]).toEqual()
			done();
		});
	});

	it("should correctly interpret parallelism options", function (done) {
		var startedAt = new Date(),
			fns = [
				libHelpers.makeTimeoutFn(100, null),
				libHelpers.makeTimeoutFn(100, null),
				libHelpers.makeTimeoutFn(100, null),
				libHelpers.makeTimeoutFn(100, null),
				libHelpers.makeTimeoutFn(100, null)
			];
		done();
/*
		yaal(yaal, [[fns, 1, "meta"], [fns, 5, "meta"], [fns, true, "meta"], [fns, false, "meta"]], function (_, res) {
			var elapsed = new Date() - startedAt;
		});


		yaal(fns, 1, function () {
			var elapsed = new Date() - startedAt;
			expect(elapsed).toBeGreaterThan(500);
			expect(elapsed).toBeLessThan(520);
			done();
		});*/
	});
});
