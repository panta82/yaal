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

			it("can extract keys using a custom hash index", function (done) {
				var args1 = [libHelpers.asyncMirror, [[1, "a"], [2, "b", "c"], [3]], "hash", { hashIndex: 1 }];
				var args2 = [libHelpers.asyncMirror, [[1, "a"], [2, "b", "c"], [3]], "hash1"];
				var args3 = [libHelpers.asyncMirror, [[1, "a"], [2, "b", "c"], [3]], "hash-1"];
				yaal(yaal, [args1, args2, args3], function (_, results) {
					expect(results[0].count).toEqual(2);
					expect(results[0]["a"]).toBeTruthy();
					expect(results[0]["b"]).toBeTruthy();

					expect(results[1].count).toEqual(2);
					expect(results[1]["a"]).toBeTruthy();
					expect(results[1]["b"]).toBeTruthy();

					expect(results[2].count).toEqual(3);
					expect(results[2]["a"]).toBeTruthy();
					expect(results[2]["c"]).toBeTruthy();
					expect(results[2]["3"]).toBeTruthy();

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

			it("can handle anonymous functions", function (done) {
				var fns = [
					function (cb) { cb(null, "A") },
					function b(cb) { cb(null, "B") },
					function (cb) { cb(null, "C") }
				];
				yaal(fns, "hash", function (err, res) {
					expect(err).toBe(null);
					expect(res.count).toBe(3);
					expect(res["0"]).toBe("A");
					expect(res["b"]).toBe("B");
					expect(res["2"]).toBe("C");
					done();
				});
			});
		});
	});
});
