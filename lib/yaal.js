var libTools = require("./tools"),

	libVars = require("./vars"),
	libTasks = require("./tasks/tasks"),
	libResults = require("./results/results");

module.exports = yaal;

var SWITCHES = {};
SWITCHES.meta = module.exports.meta = "meta";

function yaal(fns) {
	var args,
		options = libTools.shallowCopy(libVars.DEFAULT_OPTIONS),
		callback,
		argumentsLength = arguments.length;
	for (var i = 1; i < argumentsLength; i++) {
		var x = arguments[i];
		if (args === undefined && libTools.isArray(x)) {
			args = x;
			continue;
		}
		if (libTools.isFunction(x)) {
			callback = x;
			break;
		}
		if (libTools.isBoolean(x) || x >= 1) {
			options.parallelism = x;
		}
		if (libTools.isObject(x)) {
			libTools.shallowCopy(x, options);
		}
		if (libTools.isString(x) && SWITCHES[x]) {
			options[x] = true;
		}
		throw new Error("Unable to parse argument: " + x);
	}

	if (options.parallelism === true) {
		options.parallelism = Number.POSITIVE_INFINITY;
	}
	else if (!(options.parallelism >= 1)) {
		options.parallelism = 1;
	}

	if (libTools.isArray(fns)) {
		return doYaal(
			libTasks.makeArrayTaskRunner(fns, args, options),
			libResults.makeArrayResultCollector(options)
		);
	}
	if (libTools.isObject(fns)) {
		//todo
	}
	if (libTools.isFunction(fns)) {
		return doYaal(
			libTasks.makeSingleTaskRunner(fns, args, options),
			libResults.makeArrayResultCollector(options)
		);
	}
	throw new Error("Invalid argument (must be hash, function or list): " + fns);

	function doYaal(taskRunner, resultCollector) {
		taskRunner.on("done", resultCollector.submit);

		taskRunner.on("end", function () {
			resultCollector.done(callback);
		});
	}
}