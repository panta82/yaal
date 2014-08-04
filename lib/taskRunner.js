var libUtils = require("util"),
	EventEmitter = require("events").EventEmitter;

function TaskRunner(parallelism) {
	parallelism = parallelism || Number.POSITIVE_INFINITY;
	var thisTaskRunner = this,
		tasks = 0,
		readyEmitted = false;

	thisTaskRunner.tasks = 0;
	function updateTasks(newValue) {
		tasks = newValue;
		thisTaskRunner.tasks = newValue;
		readyEmitted = false;
	}

	function check(async) {
		if (async === true) {
			return setImmediate(check.bind(this, false));
		}

		if (!readyEmitted && tasks < parallelism) {
			readyEmitted = true;
			thisTaskRunner.emit("ready");
		}
	}

	function run(id, fn, args, thisArg) {
		if (tasks >= parallelism) {
			return false;
		}

		thisArg = thisArg || thisTaskRunner;

		args = args ? args.concat(taskCallback) : [taskCallback];
		fn.apply(thisArg, args);
		updateTasks(tasks + 1);
		check(true);

		return true;

		function taskCallback() {
			updateTasks(tasks - 1);
			thisTaskRunner.emit("done", id, Array.prototype.slice.call(arguments));
			check();
		}
	}
	thisTaskRunner.run = run;

	check(true);
}
libUtils.inherits(TaskRunner, EventEmitter);

module.exports = TaskRunner;