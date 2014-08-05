var libTools = require("./tools"),

	libTasks = require("./tasks/tasks"),
	libResults = require("./results/results");

function yaal(fns, args, options, callback) {
	if (arguments.length < 4) {
		callback = options;
		options = true;
	}
	if (arguments.length < 3) {
		callback = args;
		args = [];
	}
	if (!libTools.isArray(args)) {
		options = args;
		args = [];
	}

	var parallelism = options.parallelism || options;
	if (parallelism === true) {
		parallelism = Number.POSITIVE_INFINITY;
	}
	else if (!(parallelism >= 1)) {
		parallelism = 1;
	}

	if (libTools.isArray(fns)) {
		return doYaal(
			libTasks.makeArrayTaskRunner(fns, args, parallelism, fns.length),
			libResults.makeArrayResultCollector()
		);
	}
	if (libTools.isObject(fns)) {
		//todo
	}
	if (libTools.isFunction(fns)) {
		//todo
	}
	throw new Error("Invalid argument (must be hash, function or list): " + fns);

	function doYaal(taskRunner, resultCollector) {
		taskRunner.on("done", resultCollector.submit);

		taskRunner.on("end", function () {
			resultCollector.callback(callback);
		});
	}
}

module.exports = yaal;