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

	describe("when provided a hash of tasks", function () {
		it("should execute them correctly", function (done) {
			var fns = {
				"A": libHelpers.makeTimeoutFn(100, null, "resA"),
				"B": libHelpers.makeTimeoutFn(200, null, "resB"),
				"C": libHelpers.makeTimeoutFn(5, new Error("errC")),
				"count": libHelpers.makeTimeoutFn(150, null, "collision")
			};
			var startedAt = new Date();
			yaal(fns, function (err, res) {
				expect(err.count).toEqual(1);
				expect(err.C.message).toEqual("errC");

				expect(res.count).toEqual(2);
				expect(res.A).toEqual("resA");
				expect(res.B).toEqual("resB");
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

	describe("when supplied the 'meta' switch", function () {

		it("should collect metadata in an array", function (done) {
			var startedAt = new Date(),
				fns = [
					libHelpers.makeTimeoutFn(100, null),
					libHelpers.makeTimeoutFn(200, null, "11"),
					libHelpers.makeTimeoutFn(300, null, "21", "22")
				];

			yaal(fns, 2, yaal.META, function (_1, _2, meta) {
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

				done();
			});
		});

		it("should collect metadata in a hash", function (done) {
			var startedAt = new Date(),
				fns = {
					"A": libHelpers.makeTimeoutFn(100, null),
					"B": libHelpers.makeTimeoutFn(200, null, "B1"),
					3: libHelpers.makeTimeoutFn(300, null, "31", "32")
				};

			yaal(fns, 3, yaal.META, function (_1, _2, meta) {
				var completedAt = new Date();

				libHelpers.expectTimestamp(expect, completedAt, startedAt.getTime() + 300);

				libHelpers.expectTimestamp(expect, meta.startedAt, startedAt);
				libHelpers.expectTimestamp(expect, meta.completedAt, completedAt);

				libHelpers.expectTimestamp(expect, meta["A"].startedAt, startedAt);
				libHelpers.expectTimestamp(expect, meta["A"].completedAt, startedAt.getTime() + 100);
				libHelpers.expectTimestamp(expect, meta["B"].startedAt, startedAt);
				libHelpers.expectTimestamp(expect, meta["B"].completedAt, startedAt.getTime() + 200);
				libHelpers.expectTimestamp(expect, meta["3"].startedAt, startedAt);
				libHelpers.expectTimestamp(expect, meta["3"].completedAt, startedAt.getTime() + 300);

				done();
			});
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

		yaal(yaal, [[fns, 1, "meta"], [fns, 5, "meta"], [fns, true, "meta"], [fns, false, "meta"]], function (_, res) {
			libHelpers.expectTimestamp(expect, res[0][1].completedAt, startedAt.getTime() + 500);
			libHelpers.expectTimestamp(expect, res[1][1].completedAt, startedAt.getTime() + 100);
			libHelpers.expectTimestamp(expect, res[2][1].completedAt, startedAt.getTime() + 100);
			libHelpers.expectTimestamp(expect, res[3][1].completedAt, startedAt.getTime() + 500);

			done();
		});
	});

	describe("when supplied the 'fatal' switch", function () {
		it("will interrupt ongoing iteration and return the single error", function (done) {
			var fns = [
				libHelpers.makeTimeoutFn(50, null, "fn1"),
				libHelpers.makeTimeoutFn(200, null, "fn2"),
				libHelpers.makeTimeoutFn(100, new Error("showstopper")),
				function () {
					expect(false).toBe(true);
				}
			];
			yaal(fns, 2, yaal.FATAL, function (err, res) {
				expect(err.message).toBe("showstopper");
				expect(res.length).toEqual(3);
				expect(res[0]).toEqual("fn1");
				expect(res[1]).toBe(undefined);
				expect(res[2]).toBe(undefined);
				done();
			});
		});
	});
});
