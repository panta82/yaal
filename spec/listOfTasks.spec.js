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

	it("should execute and return crumpled args with errors", function (done) {
		var fns = [
			libTools.makeTimeoutFn(100, null, "res1"),
			libTools.makeTimeoutFn(200, new Error("err2")),
			libTools.makeTimeoutFn(150, null, "res3", "additional")
		];
		yaal(fns, function (err, res) {
			expect(err.length).toEqual(3);
			expect(err.count).toEqual(1);
			expect(err[0]).toEqual(null);
			expect(err[1].message).toEqual("err2");
			expect(err[2]).toEqual(null);

			expect(res.length).toEqual(3);
			expect(res.count).toEqual(2);
			expect(res[0].length).toEqual(1);
			expect(res[0][0]).toEqual("res1");
			expect(res[1].length).toEqual(0);
			expect(res[2].length).toEqual(2);
			expect(res[2][0]).toEqual("res3");
			expect(res[2][1]).toEqual("additional");
			done();
		});
	});
});
