function ResultCollector() {
	var thisResultCollector = this;

	this.errors = null;
	this.results = undefined;

	this.callback = function(callback, thisArg) {
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

function makeCollector(type) {
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
	return new ctr();
}

exports.makeArrayResultCollector = function makeArrayResultCollector() {
	return makeCollector("array");
};