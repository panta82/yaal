var libUtils = require("util"),

	libTools = require("../tools"),
	EventEmitter = require("events").EventEmitter;

function TaskRunner(options, total) {
	var parallelism,
		endOnError = false,
		endIfResultFn = null;
	if (libTools.isObject(options)) {
		parallelism = options.parallelism || Number.POSITIVE_INFINITY;
		total = total || options.total;
		endOnError = options.fatal === true;
		if (options.first) {
			endIfResultFn = options.firstFn;
		}
	} else {
		parallelism = options || Number.POSITIVE_INFINITY;
	}
	total = total || null;

	var thisTaskRunner = this,
		readyEmitted = false,
		ended = false,
		tasks = 0,
		completed = 0;

	thisTaskRunner.tasks = 0;
	thisTaskRunner.completed = 0;
	thisTaskRunner.total = total;
	if (total) {
		thisTaskRunner.ended = ended;
	}

	function updateTasks(newValue) {
		tasks = newValue;
		thisTaskRunner.tasks = newValue;
		readyEmitted = false;
	}

	function canRunMoreTasks() {
		return !ended
			&& tasks < parallelism
			&& (!total || completed + tasks < total);
	}

	function check(async) {
		if (async === true) {
			return setImmediate(check.bind(this, false));
		}

		if (canRunMoreTasks() && !readyEmitted) {
			readyEmitted = true;
			thisTaskRunner.emit("ready");
		}
	}

	function run(id, fn, args, thisArg) {
		if (!canRunMoreTasks()) {
			return false;
		}

		thisArg = thisArg || thisTaskRunner;

		args = args ? args.concat(taskCallback) : [taskCallback];
		setImmediate(function () { fn.apply(thisArg, args); });
		updateTasks(tasks + 1);
		check(true);

		return true;

		function taskCallback(err, res) {
			if (ended) {
				return;
			}

			completed++;
			thisTaskRunner.completed++;
			updateTasks(tasks - 1);

			thisTaskRunner.emit("done", id, Array.prototype.slice.call(arguments));

			var endBecause = undefined;
			if (total && total === completed) {
				endBecause = null;
			}
			else if (endOnError && err) {
				endBecause = "fatal";
			}
			else if (endIfResultFn && endIfResultFn(res)) {
				endBecause = "first";
			}

			if (endBecause !== undefined) {
				ended = true;
				thisTaskRunner.ended = true;
				thisTaskRunner.emit("end", endBecause);
			} else {
				check();
			}
		}
	}
	thisTaskRunner.run = run;

	check(true);
}
libUtils.inherits(TaskRunner, EventEmitter);

module.exports = TaskRunner;