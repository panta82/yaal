var libTools = require("../tools"),
	libVars = require("../vars"),

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

function skipTask(callback) {
	setImmediate(callback, null);
}

function tryDetermineHashKey(index, value, options) {
	var valueType = typeof value;
	switch (valueType) {
		case "undefined":
			return false;
		case "string":
			return value;
		case "boolean":
		case "number":
			return String(value);
		case "function":
			return value.name || libTools.safeFormat(options.hashAnonymousFunctionFormat, index);
	}
	if (libTools.isArray(value)) {
		return value.toString();
	}
	if (!value) {
		return false;
	}
	if (valueType === "object") {
		var res = libTools.arrayFirst(options.hashKeyProperties, function (prop) {
			var x = value[prop],
				xType = typeof x;
			if (xType === "number" || xType === "string") {
				return x;
			}
			return false;
		});
		if (res) {
			return res;
		}
		else if (value.toString) {
			return value.toString();
		}
		else {
			return String(value);
		}
	}
	return false;
}

function makeArrayTaskRunner(fns, args, options) {
	options = options || libVars.DEFAULT_OPTIONS;

	var index = 0,
		fnsLength = fns.length;

	var tr = new TaskRunner(options, fnsLength);

	tr.on("ready", function () {
		if (index < fnsLength) {
			var key = options.hash ? tryDetermineHashKey(index, fns[index], options) : index,
				wrapped = wrapKey(key, options.meta);

			if ((key === false && tr.run(wrapped, skipTask))
					|| (key !== false && tr.run(wrapped, fns[index], args))) {
				index++;
			}
		}
	});

	return tr;
}
exports.makeArrayTaskRunner = makeArrayTaskRunner;

function makeHashTaskRunner(hash, args, options) {
	options = options || libVars.DEFAULT_OPTIONS;

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

	options = options || libVars.DEFAULT_OPTIONS;

	// Note: Heuristics only checks the first argument in the array. If user wants to supply a literal array as argument,
	// it must be wrapped. Eg. [[[1, 2, 3]], [[4, 5, 6]]]
	var nested = libTools.isArray(args[0]);

	var index = 0,
		argsLength = args.length;

	var tr = new TaskRunner(options, args.length);

	tr.on("ready", function () {
		if (index < argsLength) {
			var argValue = args[index],
				key;

			if (options.hash) {
				var keySource = nested
					? options.hashIndex >= 0
						? argValue[options.hashIndex]
						: argValue[argValue.length + options.hashIndex]
					: argValue;
				key = tryDetermineHashKey(index, keySource, options);
			} else {
				key = index;
			}

			var wrapped = wrapKey(key, options.meta);

			if ((key === false && tr.run(wrapped, skipTask))
				|| (key !== false && tr.run(wrapped, fn, nested ? argValue : [argValue]))) {
				index++;
			}
		}
	});

	return tr;
}
exports.makeSingleTaskRunner = makeSingleTaskRunner;