var libTools = require("../lib/tools"),
	TaskRunner = require("../lib/taskRunner");

var tr = new TaskRunner(3, 2);

var startedAt = new Date(),
	tasks = [
		,
		libTools.makeTimeoutFn(200),
		libTools.makeTimeoutFn(300)
	],
	readyCount = 0,
	resultCount = 0;

console.log(tr.total);
console.log(tr.ended);

tr.on("ready", function () {
	if (readyCount === 0) {
		console.log(tr.tasks);
		tr.run("a", libTools.makeTimeoutFn(100));
		console.log(tr.tasks);
		tr.run("b", libTools.makeTimeoutFn(200));
		console.log(tr.tasks);
		tr.run("c", libTools.makeTimeoutFn(300));
		console.log(tr.tasks);
		console.log(tr.completed);
	}
});
tr.on("done", function () {
	console.log(tr.total);
	console.log(tr.ended);
});
tr.on("end", function () {
	console.log(tr.tasks);
	console.log(tr.completed);
	console.log(tr.total);
	console.log(tr.ended);
	console.log("done");
});