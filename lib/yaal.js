var libTools = require("./tools"),

	libVars = require("./vars"),
	libTasks = require("./tasks/tasks"),
	libCollectors = require("./collectors/collectors");

module.exports = yaal;

var SWITCHES = {};
SWITCHES.meta = module.exports.META = "meta";
SWITCHES.fatal = module.exports.FATAL = "fatal";
SWITCHES.first = module.exports.FIRST = "first";
SWITCHES.hash = module.exports.HASH = "hash";

var SPECIAL_SWITCHES = [
	function specialSwitchHash(x, options) {
		if (x.substring(0, 4) !== "hash") {
			return false;
		}
		var index = parseInt(x.substring(4), 10);
		if (!libTools.isNumber(index)) {
			throw new Error("Invalid index in the 'hash' switch: " + x.substring(4));
		}
		options.hash = true;
		options.hashIndex = index;
		return true;
	}
];

module.exports.DEFAULT_OPTIONS = libVars.DEFAULT_OPTIONS;

function yaal(fns) {
	var args,
		options = libTools.shallowCopy(libVars.DEFAULT_OPTIONS),
		callback;

	doParseArguments(arguments, 1);

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

	function doParseArguments(input, fromIndex) {
		fromIndex = fromIndex || 0;
		var inputLength = input.length;

		inputLoop:
		for (var i = fromIndex; i < inputLength; i++) {
			var x = input[i];
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
				if (x.indexOf(",") >= 0) {
					doParseArguments(x
						.split(",")
						.map(function (x) {
							return x.trim();
						})
					);
					continue;
				}

				x = x.toLowerCase();
				if (SWITCHES[x]) {
					options[x] = true;
					continue;
				}
				for (var j = 0; j < SPECIAL_SWITCHES.length; j++) {
					if (SPECIAL_SWITCHES[j](x, options)) {
						continue inputLoop;
					}
				}
			}
			throw new Error("Unable to parse argument: " + x);
		}
	}

	function doYaal(taskRunner, resultCollector) {
		taskRunner.on("done", resultCollector.submit);

		taskRunner.on("end", function (reason) {
			resultCollector.done(reason, callback);

			taskRunner.removeAllListeners();
		});
	}
}