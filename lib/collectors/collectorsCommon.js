var libTools = require("../tools");

function Collector(options) {
	var thisCollector = this;
	this.errors = null;
	this.results = undefined;
	this.meta = undefined;

	function collectorDone(callback, thisArg) {
		thisArg = thisArg || this;
		if (thisCollector.meta) {
			thisCollector.meta.completedAt = new Date();
		}
		if (callback) {
			var callbackArgs = [
				options && options.fatal
					? (thisCollector.errors.any() || null)
					: thisCollector.errors.count
						? thisCollector.errors
						: null,
				thisCollector.results
			];
			if (thisCollector.meta) {
				callbackArgs.push(thisCollector.meta);
			}
			callback.apply(thisArg, callbackArgs);
		}
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