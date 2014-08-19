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

		it("should work with an empty list", function (done) {
			yaal([], function (err, res) {
				expect(err).toEqual(null);
				expect(res.count).toEqual(0);
				expect(res.length).toEqual(0);
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

		it("should work with an empty hash", function (done) {
			yaal({}, function (err, res) {
				expect(err).toEqual(null);
				expect(res.count).toEqual(0);
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

		it("should work with an empty list of arguments", function (done) {
			yaal(libHelpers.asyncToUppercase, [], function (err, res) {
				expect(err).toEqual(null);
				expect(res.length).toEqual(0);
				expect(res.count).toEqual(0);
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

	it("should accept non-default emptyErrorsToNull option", function (done) {
		var fns = [libHelpers.makeTimeoutFn(1, null, "a"), libHelpers.makeTimeoutFn(1, null, "b")];
		yaal(fns, { emptyErrorsToNull: false }, function (err) {
			expect(err).not.toBe(null);
			expect(err.length).toBe(2);
			expect(err.count).toBe(0);
			expect(err[0]).toBe(null);
			expect(err[1]).toBe(null);
			expect(err.compact().length).toBe(0);
			expect(err.any()).toBe(null);
			err.each(function () {
				expect(true).toBe(false);
			});
			done();
		});
	});

	describe("if given multiple switches", function () {

		it("can parse them as individual arguments", function (done) {
			var fns = [
				libHelpers.makeTimeoutFn(1, null, "x"),
				function () {
					expect(false).toBe(true);
				}
			];

			yaal(fns, 1, "meta", "first", function (err, res, meta) {
				expect(err).toBe(null);
				expect(res).toBe("x");
				expect(meta).toBeTruthy();

				done();
			});
		});

		it("can parse them using comma notation", function (done) {
			var fns = [
				libHelpers.makeTimeoutFn(1, null, "x"),
				function () {
					expect(false).toBe(true);
				}
			];

			yaal(fns, 1, "meta, first", function (err, res, meta) {
				expect(err).toBe(null);
				expect(res).toBe("x");
				expect(meta).toBeTruthy();

				done();
			});
		});
	});
});
