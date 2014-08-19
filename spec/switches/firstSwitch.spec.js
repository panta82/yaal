var libHelpers = require("../helpers"),

	yaal = require("../../lib/yaal");

describe("Yaal", function () {

	describe("when supplied the 'first' switch", function () {

		it("will stop upon the first result and return that result", function (done) {
			var fns = [
				libHelpers.makeTimeoutFn(50, null),
				libHelpers.makeTimeoutFn(150, null, "res1"),
				libHelpers.makeTimeoutFn(100, new Error("err2")),
				libHelpers.makeTimeoutFn(200, null, "res3"),
				libHelpers.makeTimeoutFn(200, new Error("err4")),
				function () {
					expect(false).toBe(true);
				}
			];
			yaal(fns, 3, yaal.FIRST, function (err, res) {
				expect(err.length).toBe(3);
				expect(err.count).toBe(1);
				expect(err.any().message).toBe("err2");

				expect(res).toBe("res1");

				done();
			});
		});

		it("will return the correct result even if the first found is the last argument", function (done) {
			var fns = [
				libHelpers.makeTimeoutFn(1, null, false),
				libHelpers.makeTimeoutFn(1, null, "res1")];
			yaal(fns, 1, yaal.FIRST, function (err, res) {
				expect(res).toBe("res1");

				done();
			});
		});

		it("will return not found value even if given an empty input data", function (done) {
			yaal(yaal, [[[], "first"], [{}, "first"]], function (err, res) {
				expect(err).toBe(null);
				expect(res[0]).toBe(null);
				expect(res[1]).toBe(null);
				done();
			});
		});

		it("will allow additional options", function (done) {
			var noFn = libHelpers.makeTimeoutFn(1, null, -1, 1),
				errFn = libHelpers.makeTimeoutFn(1, new Error()),
				yesFn = libHelpers.makeTimeoutFn(1, null, 7);

			var opts = {
				parallelism: 1,
				first: true,
				firstFn: function firstPositiveNumber(x) {
					return x > 0;
				},
				firstNotFoundValue: "custom"
			};
			yaal(
				yaal,
				[
					[[errFn, noFn, yesFn, errFn], opts],
					[[noFn, noFn, errFn, noFn], opts],
					[[noFn, noFn], opts]
				],
				function (err, res) {
					expect(err[0].count).toBe(1);
					expect(err[1].count).toBe(1);
					expect(err[2]).toBe(null);

					expect(res[0]).toBe(7);
					expect(res[1]).toBe("custom");
					expect(res[2]).toBe("custom");

					done();
				}
			);
		});
	});
});
