var libTools = require("./tools"),

	libVars = require("./vars"),
	libTasks = require("./tasks/tasks"),
	libCollectors = require("./collectors/collectors");

module.exports = yaal;

var SWITCHES = {};
SWITCHES.meta = module.exports.META = "meta";
SWITCHES.fatal = module.exports.FATAL = "fatal";
SWITCHES.first = module.exports.FIRST = "first";

module.exports.DEFAULT_OPTIONS = libVars.DEFAULT_OPTIONS;

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
			continue;
		}
		if (libTools.isObject(x)) {
			libTools.shallowCopy(x, options);
			continue;
		}
		if (libTools.isString(x)) {
			x = x.toLowerCase();
			if (SWITCHES[x]) {
				options[x] = true;
				continue;
			}
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
			libCollectors.makeArrayCollector(options)
		);
	}
	if (libTools.isFunction(fns)) {
		return doYaal(
			libTasks.makeSingleTaskRunner(fns, args, options),
			libCollectors.makeArrayCollector(options)
		);
	}
	if (libTools.isObject(fns)) {
		return doYaal(
			libTasks.makeHashTaskRunner(fns, args, options),
			libCollectors.makeHashCollector(options)
		);
	}

	throw new Error("Invalid argument (must be hash, function or array): " + fns);

	function doYaal(taskRunner, resultCollector) {
		taskRunner.on("done", resultCollector.submit);

		taskRunner.on("end", function (reason) {
			resultCollector.done(reason, callback);

			taskRunner.removeAllListeners();
		});
	}
}