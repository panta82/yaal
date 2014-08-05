function ResultCollector() {
	var thisResultCollector = this;

	this.errors = null;
	this.results = undefined;

	this.done = function (callback, thisArg) {
		thisArg = thisArg || this;
		if (callback) {
			callback.call(
				thisArg,
				thisResultCollector.errors.count ? thisResultCollector.errors : null,
				thisResultCollector.results);
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