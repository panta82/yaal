var libTools = require("../lib/tools"),
	TaskRunner = require("../lib/taskRunner");

var that = this,
	tr = new TaskRunner();

var readyCount = 0;
tr.on("ready", function () {
	readyCount++;
	if (readyCount === 1) {
		tr.run("key", libTools.makeTimeoutFn(100, new Error("msg"), "b", 3, null, undefined));
	}
	else if (readyCount === 2) {
		setTimeout(console.log, 200);
	}
	else {
		console.log(new Error("Too many ready signals"));
	}
});

var doneCount = 0;
tr.on("done", function (key, args) {
	doneCount++;
	if (doneCount === 1) {
		console.log("done 1");
	}
	else {
		console.log(new Error("Too many done signals"));
	}
});