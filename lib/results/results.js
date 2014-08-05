function ResultCollector() {
	var thisResultCollector = this;

	this.errors = null;
	this.results = undefined;
	this.meta = undefined;

	this.done = function (callback, thisArg) {
		thisArg = thisArg || this;
		if (thisResultCollector.meta) {
			thisResultCollector.meta.completedAt = new Date();
		}
		if (callback) {
			if (thisResultCollector.meta) {
				callback.call(
					thisArg,
					thisResultCollector.errors.count ? thisResultCollector.errors : null,
					thisResultCollector.results,
					thisResultCollector.meta);
			} else {
				callback.call(
					thisArg,
					thisResultCollector.errors.count ? thisResultCollector.errors : null,
					thisResultCollector.results);
			}
		}
	};
}
exports.ResultCollector = ResultCollector;

function makeCollector(type, options) {
	var ctr;
	try {
		ctr = require("./" + type + "ResultCollector");
	}
	catch (err) {
		if (err.code === "MODULE_NOT_FOUND") {
			throw new Error("Invalid collector type: " + type);
		}
		throw err;
	}
	return new ctr(options);
}

exports.makeArrayResultCollector = function makeArrayResultCollector(options) {
	return makeCollector("array", options);
};