var libHelpers = require("../helpers"),

	yaal = require("../../lib/yaal");

describe("Yaal", function () {

	describe("when supplied the 'fatal' switch", function () {

		it("will stop upon the first error and return that error", function (done) {
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
