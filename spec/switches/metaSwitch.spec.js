var libHelpers = require("../helpers"),

	yaal = require("../../lib/yaal");

describe("Yaal", function () {

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
});
