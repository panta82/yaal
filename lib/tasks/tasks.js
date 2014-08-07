var libTools = require("../tools"),

	TaskRunner = require("./taskRunner");

function wrapKey(key, meta) {
	if (!meta) {
		return key;
	}
	return {
		key: key,
		meta: {
			startedAt: new Date()
		}
	};
}

function makeArrayTaskRunner(fns, args, options) {
	var index = 0,
		fnsLength = fns.length;

	var tr = new TaskRunner(options, fnsLength);

	tr.on("ready", function () {
		if (index < fnsLength) {
			if (tr.run(wrapKey(index, options.meta), fns[index], args)) {
				index++;
			}
		}
	});

	return tr;
}
exports.makeArrayTaskRunner = makeArrayTaskRunner;

function makeHashTaskRunner(hash, args, options) {
	var keys = Object.keys(hash),
		index = 0,
		keysLength = keys.length;

	var tr = new TaskRunner(options, keysLength);

	tr.on("ready", function () {
		if (index < keysLength) {
			if (tr.run(wrapKey(keys[index], options.meta), hash[keys[index]], args)) {
				index++;
			}
		}
	});

	return tr;
}
exports.makeHashTaskRunner = makeHashTaskRunner;

function makeSingleTaskRunner(fn, args, options) {
	if (!args) {
		throw new Error("You must provide an array of arguments to use with the task");
	}

	// Note: Heuristics only checks the first argument in the array. If user wants to supply a literal array as argument,
	// it must be wrapped. Eg. [[[1, 2, 3]], [[4, 5, 6]]]
	var nested = libTools.isArray(args[0]);

	var index = 0,
		argsLength = args.length;

	var tr = new TaskRunner(options, args.length);

	tr.on("ready", function () {
		if (index < argsLength) {
			var argValue = args[index];
			if (tr.run(wrapKey(index, options.meta), fn, nested ? argValue : [argValue])) {
				index++;
			}
		}
	});

	return tr;
}
exports.makeSingleTaskRunner = makeSingleTaskRunner;