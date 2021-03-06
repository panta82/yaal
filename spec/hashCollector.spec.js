var HashCollector = require("../lib/collectors/hashCollector");

describe("Hash collector", function () {

	it("can convert no errors into null", function (done) {
		var hc = new HashCollector();
		hc.submit("A", [null, "resA"]);
		hc.submit("B", [null, "resB"]);
		hc.done(function (err) {
			expect(err).toEqual(null);
			done();
		});
	});

	it("can record errors and produce flat results", function (done) {
		var hc = new HashCollector();
		hc.submit("A", [null, "resA"]);
		hc.submit("B", [new Error("errB")]);
		hc.submit("C", [null, "resC"]);
		hc.done(function (err, res) {
			expect(err.count).toEqual(1);
			expect(err["A"]).toEqual(null);
			expect(err["B"].message).toEqual("errB");
			expect(err["C"]).toEqual(null);

			expect(res.flat).toEqual(true);
			expect(res.count).toEqual(2);
			expect(res["A"]).toEqual("resA");
			expect(res["B"]).toEqual(undefined);
			expect(res.hasOwnProperty("B")).toBeTruthy();
			expect(res["C"]).toEqual("resC");
			done();
		});
	});

	it("can accept multiple arguments in callback and produce nested results", function (done) {
		var hc = new HashCollector();
		hc.submit("A", [null, "A0"]);
		hc.submit("B", [null]);
		hc.submit("C", [null, "C0", "C1"]);
		hc.done(function (err, res) {
			expect(res.count).toEqual(2);
			expect(res.flat).toEqual(false);

			expect(res["A"].length).toEqual(1);
			expect(res["A"][0]).toEqual("A0");

			expect(res["B"].length).toEqual(0);

			expect(res["C"].length).toEqual(2);
			expect(res["C"][0]).toEqual("C0");
			expect(res["C"][1]).toEqual("C1");

			done();
		});
	});

	describe("can flatten the results", function () {
		function testFlatten(done, index, fluid, testFn) {
			var hc = new HashCollector();
			hc.submit("A", [null, "A1"]);
			hc.submit("B", [null]);
			hc.submit("C", [null, "C1", "C2", "C3"]);
			hc.submit("D", [null, "D1", "D2"]);
			hc.done(function (err, res) {
				var flat = res.flatten(index, fluid);

				expect(flat).not.toBe(res);
				testFn(flat);

				done();
			});
		}

		it("by keeping all the existing values (not picking)", function (done) {
			testFlatten(done, undefined, undefined, function (hash) {
				expect(hash.count).toEqual(6);
				expect(hash["A"]).toEqual("A1");
				expect(hash["B"]).toEqual(undefined);
				expect(hash.hasOwnProperty("B")).toBeTruthy();
				expect(hash["C"]).toEqual("C1");
				expect(hash["C_1"]).toEqual("C2");
				expect(hash["C_2"]).toEqual("C3");
				expect(hash["D"]).toEqual("D1");
				expect(hash["D_1"]).toEqual("D2");
			});
		});

		it("by picking rigidly from the left", function (done) {
			testFlatten(done, 0, undefined, function (hash) {
				expect(hash.count).toEqual(3);
				expect(hash["A"]).toEqual("A1");
				expect(hash["B"]).toEqual(undefined);
				expect(hash.hasOwnProperty("B")).toBeTruthy();
				expect(hash["C"]).toEqual("C1");
				expect(hash["D"]).toEqual("D1");
			});
		});

		it("by picking rigidly from the right", function (done) {
			testFlatten(done, -2, undefined, function (hash) {
				expect(hash.count).toEqual(2);
				expect(hash["A"]).toEqual(undefined);
				expect(hash.hasOwnProperty("A")).toBeTruthy();
				expect(hash["B"]).toEqual(undefined);
				expect(hash.hasOwnProperty("B")).toBeTruthy();
				expect(hash["C"]).toEqual("C2");
				expect(hash["D"]).toEqual("D1");
			});
		});

		it("by picking fluidly from the left", function (done) {
			testFlatten(done, 2, true, function (hash) {
				expect(hash.count).toEqual(3);
				expect(hash["A"]).toEqual("A1");
				expect(hash["B"]).toEqual(undefined);
				expect(hash.hasOwnProperty("B")).toBeTruthy();
				expect(hash["C"]).toEqual("C3");
				expect(hash["D"]).toEqual("D2");
			});
		});

		it("by picking fluidly from the right", function (done) {
			testFlatten(done, -2, true, function (hash) {
				expect(hash.count).toEqual(3);
				expect(hash["A"]).toEqual("A1");
				expect(hash["B"]).toEqual(undefined);
				expect(hash.hasOwnProperty("B")).toBeTruthy();
				expect(hash["C"]).toEqual("C2");
				expect(hash["D"]).toEqual("D1");
			});
		});
	});

	describe("when called compact()", function () {

		it("can compact errors and flat results", function (done) {
			var hc = new HashCollector();
			hc.submit("A", [null, "resA"]);
			hc.submit("B", [null, "resB"]);
			hc.submit("C", [new Error("errC")]);

			hc.done(function (err, res) {
				var cErr = err.compact(),
					cRes = res.compact();

				expect(cErr.count).toEqual(1);
				expect(cErr.hasOwnProperty("A")).toBeFalsy();
				expect(cErr.hasOwnProperty("B")).toBeFalsy();
				expect(cErr["C"].message).toEqual("errC");

				expect(cRes.count).toEqual(2);
				expect(cRes["A"]).toEqual("resA");
				expect(cRes["B"]).toEqual("resB");
				expect(cRes.hasOwnProperty("C")).toBeFalsy();

				done();
			});
		});

		it("can compact nested results", function (done) {
			var hc = new HashCollector();
			hc.submit("A", [null, "A1", "A2"]);
			hc.submit("B", [null]);
			hc.submit("C", [null, "C1"]);

			hc.done(function (err, res) {
				var cRes = res.compact();

				expect(cRes.count).toEqual(2);
				expect(cRes["A"][0]).toEqual("A1");
				expect(cRes["A"][1]).toEqual("A2");
				expect(cRes.hasOwnProperty("B")).toBeFalsy();
				expect(cRes["C"][0]).toEqual("C1");

				done();
			});
		});
	});

	describe("when called any()", function () {

		it("an return single result or error", function (done) {
			var hc = new HashCollector();
			hc.submit("A", [null]);
			hc.submit("B", [new Error("errB")]);
			hc.submit("C", [null, "resC"]);
			hc.submit("D", [new Error("errD")]);

			hc.done(function (err, res) {
				var anyErr = err.any(),
					anyRes = res.any();

				expect(anyErr.message).toEqual("errB");
				expect(anyRes).toEqual("resC");

				done();
			});
		});
	});

	describe("when called each()", function () {

		it("can iterate over results or errors, skipping over the empty values", function (done) {
			var hc = new HashCollector();
			hc.submit("A", [null]);
			hc.submit("B", [new Error("errB")]);
			hc.submit("C", [null, "resC"]);
			hc.submit("D", [new Error("errD")]);

			hc.done(function (err, res) {
				var index = 0;
				err.each(function (e, i) {
					if (index === 0) {
						expect(e.message).toBe("errB");
						expect(i).toBe("B");
					}
					if (index === 1) {
						expect(e.message).toBe("errD");
						expect(i).toBe("D");
					}
					expect(index).toBeLessThan(2);
					index++;
				});

				index = 0;
				res.each(function (r, i) {
					if (index === 0) {
						expect(r).toBe("resC");
						expect(i).toBe("C");
					}
					expect(index).toBeLessThan(1);
					index++;
				});

				done();
			});
		});

		it("can iterate over results or errors, including the empty values", function (done) {
			var arc = new HashCollector();
			arc.submit("A", [null]);
			arc.submit("B", [new Error("errB")]);

			arc.done(function (err) {
				var index = 0;
				err.each(true, function (e, i) {
					if (index === 0) {
						expect(e).toBe(null);
						expect(i).toBe("A");
					}
					if (index === 1) {
						expect(e.message).toBe("errB");
						expect(i).toBe("B");
					}
					expect(index).toBeLessThan(2);
					index++;
				});
				done();
			});
		});
	});
});
