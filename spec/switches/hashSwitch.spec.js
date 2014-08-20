var libHelpers = require("../helpers"),

	yaal = require("../../lib/yaal");

describe("Yaal", function () {

	describe("when supplied the 'hash' switch", function () {

		describe("in a single-task scenario", function () {

			it("can map list of arguments into a hash", function (done) {
				yaal(libHelpers.asyncToUppercase, ["a", "b"], "hash", function (err, res) {
					expect(err).toBe(null);
					expect(res.count).toBe(2);
					expect(res["a"]).toBe("A");
					expect(res["b"]).toBe("B");
					done();
				});
			});

			it("can extract meaningful keys from non-string arguments", function (done) {
				var dateStr = "Wed Aug 20 2014 00:57:24 GMT+0200 (CEST)",
					args = ["str", 3, {x: "no"}, {id: "yes"}, [1,2], false, true, /^regex$/, new Date(dateStr), null, undefined];
				yaal(libHelpers.asyncMirror, args, "hash", function (err, res) {
					expect(err).toBe(null);
					expect(res.count).toBe(9);
					expect(res["str"]).not.toBe(undefined);
					expect(res["3"]).not.toBe(undefined);
					expect(res["[object Object]"]).not.toBe(undefined);
					expect(res["yes"]).not.toBe(undefined);
					expect(res["true"]).not.toBe(undefined);
					expect(res["false"]).not.toBe(undefined);
					expect(res["1,2"]).not.toBe(undefined);
					expect(res["/^regex$/"]).not.toBe(undefined);
					expect(res[dateStr]).not.toBe(undefined);
					expect(res["null"]).toBe(undefined);
					expect(res["undefined"]).toBe(undefined);
					done();
				});
			});
		});

		describe("in a list-of-tasks scenario", function () {

			it("can map task names into a hash", function (done) {
				var fns = [
					function a(cb) { cb(null, "A") },
					function b(cb) { cb(null, "B") }
				];
				yaal(fns, "hash", function (err, res) {
					expect(err).toBe(null);
					expect(res.count).toBe(2);
					expect(res["a"]).toBe("A");
					expect(res["b"]).toBe("B");
					done();
				});
			});
		});
	});
});
