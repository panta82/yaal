var libTools = require("../tools"),
	libVars = require("../vars");

function Collector(options) {
	var thisCollector = this;

	options = options || libVars.DEFAULT_OPTIONS;

	thisCollector.errors = null;
	thisCollector.results = undefined;
	thisCollector.meta = undefined;

	function submit(ref, args) {
		thisCollector.lastSubmit = {
			ref: ref,
			args: args
		};
	}
	thisCollector.submit = submit;

	function collectorDone(reason, callback, thisArg) {
		if (libTools.isFunction(reason)) {
			callback = reason;
			reason = null;
		}
		if (!callback) {
			return;
		}

		thisArg = thisArg || null;

		var meta = thisCollector.meta,
			err = thisCollector.errors,
			res = thisCollector.results;

		if (meta) {
			meta.completedAt = new Date();
		}

		var callbackArgs = [
			reason === "fatal"
				? (err.any() || null)
				: err.count || !options.emptyErrorsToNull
					? err
					: null,
			reason === "first"
				? thisCollector.lastSubmit.args[1]
				: options.first
					? options.firstNotFoundValue
					: res
		];
		if (thisCollector.meta) {
			callbackArgs.push(thisCollector.meta);
		}
		callback.apply(thisArg, callbackArgs);

		delete thisCollector.errors;
		delete thisCollector.results;
		delete thisCollector.meta;
		delete thisCollector.lastSubmit;
	}
	this.done = collectorDone;
}
exports.Collector = Collector;

function crumple(ob) {
	if (!ob.flat) {
		return ob;
	}
	libTools.each(ob, function (val, key) {
		if (val !== undefined) {
			ob[key] = [val];
		} else {
			ob[key] = [];
		}
	});
	ob.flat = false;
	return ob;
}
exports.crumple = crumple;