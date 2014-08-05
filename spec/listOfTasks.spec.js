var libTools = require("../lib/tools"),

	yaal = require("../lib/yaal");

describe("List of tasks", function () {

	it("should execute in parallel and return flat args without errors", function (done) {
		var fns = [
			libTools.makeTimeoutFn(100, null, "res1"),
			libTools.makeTimeoutFn(200, null, "res2")
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

	it("should correctly interpret synchronisity", function (done) {
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
});
