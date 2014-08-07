function makeCollector(type, options) {
	var ctr;
	try {
		ctr = require("./" + type + "Collector");
	}
	catch (err) {
		if (err.code === "MODULE_NOT_FOUND") {
			throw new Error("Invalid collector type: " + type);
		}
		throw err;
	}
	return new ctr(options);
}

exports.makeArrayCollector = function makeArrayCollector(options) {
	return makeCollector("array", options);
};

exports.makeHashCollector = function makeHashCollector(options) {
	return makeCollector("hash", options);
};