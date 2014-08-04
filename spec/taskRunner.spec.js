var libTools = require("../lib/tools"),
	TaskRunner = require("../lib/taskRunner");

describe("Task runner", function () {

	it("can emit proper signals and return correct values", function (done) {
		var that = this,
			tr = new TaskRunner();

		var readyCount = 0,
			runTs = new Date();
		tr.on("ready", function () {
			readyCount++;
			if (readyCount === 1) {
				tr.run("key", libTools.makeTimeoutFn(100, new Error("msg"), "b", 3, null, undefined));
			}
			else if (readyCount === 2) {
				expect(new Date() - runTs < 50);
			}
			else if (readyCount === 3) {
				setTimeout(done, 200);
			}
			else {
				that.fail(new Error("Too many ready signals"));
			}
		});

		var doneCount = 0;
		tr.on("done", function (key, args) {
			doneCount++;
			if (doneCount === 1) {
				expect(key).toEqual("key");
				expect(args.length).toEqual(5);
				expect(args[0].message).toEqual("msg");
				expect(args[1]).toEqual("b");
				expect(args[2]).toEqual(3);
				expect(args[4]).toEqual(null);
				expect(args[5]).toEqual(undefined);
			}
			else {
				that.fail(new Error("Too many done signals"));
			}
		});
	});

	it("can run all fns at the same time", function (done) {
		var tr = new TaskRunner(Number.POSITIVE_INFINITY);

		var startedAt = new Date(),
			tasks = [
				libTools.makeTimeoutFn(100),
				libTools.makeTimeoutFn(100),
				libTools.makeTimeoutFn(100),
				libTools.makeTimeoutFn(100),
				libTools.makeTimeoutFn(100)
			],
			index = 0,
			resultCount = 0;

		tr.on("ready", function () {
			if (index < tasks.length) {
				expect(tr.completed).toEqual(0);
				expect(tr.tasks).toEqual(index);
				tr.run(index, tasks[index]);
				index++;
			}
		});
		tr.on("done", function () {
			resultCount++;
			expect(tr.completed).toEqual(resultCount);
			expect(tr.tasks).toEqual(tasks.length - resultCount);
			if (resultCount >= tasks.length) {
				testAndDone();
			}
		});

		function testAndDone() {
			var elapsed = new Date() - startedAt;
			expect(elapsed).toBeLessThan(120);
			done();
		}
	});

	it("can run the fns with precise parallelism control", function (done) {
		var tr = new TaskRunner(2);

		var startedAt = new Date(),
			tasks = [
				libTools.makeTimeoutFn(100),
				libTools.makeTimeoutFn(200),
				libTools.makeTimeoutFn(300), // 100, [100, 200]
				libTools.makeTimeoutFn(100), // 200, [100, 200]
				libTools.makeTimeoutFn(200) // 300, [100, 200] => 500
			],
			index = 0,
			resultCount = 0;

		tr.on("ready", function () {
			if (index < tasks.length) {
				tr.run(index, tasks[index]);
				index++;
			}
			expect(tr.tasks).toBeLessThan(3);
		});
		tr.on("done", function () {
			resultCount++;
			expect(tr.tasks).toBeLessThan(3);
			if (resultCount >= tasks.length) {
				testAndDone();
			}
		});

		function testAndDone() {
			var elapsed = new Date() - startedAt;
			expect(elapsed).toBeGreaterThan(499);
			expect(elapsed).toBeLessThan(520);
			done();
		}
	});

	it("can run one fn at a time", function (done) {
		var tr = new TaskRunner(1);

		var startedAt = new Date(),
			tasks = [
				libTools.makeTimeoutFn(100),
				libTools.makeTimeoutFn(200),
				libTools.makeTimeoutFn(300)
			],
			index = 0,
			resultCount = 0;

		tr.on("ready", function () {
			if (index < tasks.length) {
				tr.run(index, tasks[index]);
				index++;
			}
			expect(tr.tasks).toBeLessThan(2);
		});
		tr.on("done", function () {
			resultCount++;
			expect(tr.tasks).toBeLessThan(2);
			if (resultCount >= tasks.length) {
				testAndDone();
			}
		});

		function testAndDone() {
			var elapsed = new Date() - startedAt;
			expect(elapsed).toBeGreaterThan(599);
			expect(elapsed).toBeLessThan(620);
			done();
		}
	});

	it("can emit an 'end' event", function (done) {
		var tr = new TaskRunner(3, 2);

		var startedAt = new Date(),
			tasks = [
				,
				libTools.makeTimeoutFn(200),
				libTools.makeTimeoutFn(300)
			],
			readyCount = 0,
			resultCount = 0;

		expect(tr.total).toEqual(2);
		expect(tr.ended).toEqual(false);

		tr.on("ready", function () {
			if (readyCount === 0) {
				expect(tr.tasks).toEqual(0);
				tr.run("a", libTools.makeTimeoutFn(100));
				expect(tr.tasks).toEqual(1);
				tr.run("b", libTools.makeTimeoutFn(200));
				expect(tr.tasks).toEqual(2);
				tr.run("c", libTools.makeTimeoutFn(300));
				expect(tr.tasks).toEqual(2);
				expect(tr.completed).toEqual(0);
			}
		});
		tr.on("done", function () {
			expect(tr.total).toEqual(2);
			expect(tr.ended).toEqual(false);
		});
		tr.on("end", function () {
			expect(tr.tasks).toEqual(0);
			expect(tr.completed).toEqual(2);
			expect(tr.total).toEqual(2);
			expect(tr.ended).toEqual(true);
			done();
		});
	});

	it("will refuse to add additional functions if at capacity", function (done) {
		var tr = new TaskRunner(1);

		var ran = false;
		tr.on("ready", function () {
			if (ran) {
				return;
			}
			ran = true;
			var ok1 = tr.run("key1", libTools.makeTimeoutFn(100));
			var ok2 = tr.run("key2", libTools.makeTimeoutFn(100));
			expect(ok1).toEqual(true);
			expect(ok2).toEqual(false);
		});

		var resultCount = 0;
		tr.on("done", function (key) {
			resultCount++;
			expect(key).toEqual("key1");
			expect(resultCount).toBeLessThan(2);
			setTimeout(done, 250);
		});
	});
});
