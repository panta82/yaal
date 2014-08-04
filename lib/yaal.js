var libTools = require("./tools");

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
		return yaalArray(fns, args, parallelism, callback);
	}
	if (libTools.isObject(fns)) {
		return yaalHash(fns, args, parallelism, callback);
	}
	if (libTools.isFunction(fns)) {
		return yaalSingle(fns, args, parallelism, callback);
	}
	throw new Error("Invalid argument (must be hash, function or list): " + fns);
}

function yaalArray(fns, args, parallelism, callback) {

}


module.exports = yaal;