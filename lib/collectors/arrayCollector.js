var libUtil = require("util");

var libCommon = require("./collectorsCommon"),
	makeArray = require("../types/yaalArray");

function ArrayCollector(options) {
	ArrayCollector.super_.call(this, options);

	var errors = this.errors = makeArray("errors"),
		results = this.results = makeArray("results"),
		meta;

	if (options && options.meta) {
		meta = this.meta = makeArray("meta");
	}

	this.submit = function(ref, args) {
		var index;
		if (meta) {
			index = ref.key;
			ref.meta.completedAt = new Date();
			meta[index] = ref.meta;
		} else {
			index = ref;
		}

		if (args[0]) {
			errors[index] = args[0];
			errors.count++;
		} else {
			errors[index] = null;
		}

		var argsLength = args.length;
		if (argsLength > 2) {
			libCommon.crumple(results);
		}
		if (results.flat) {
			results[index] = args[1];
		} else {
			results[index] = args.slice(1);
		}
		if (argsLength >= 2) {
			results.count++;
		}
	};
}
libUtil.inherits(ArrayCollector, libCommon.Collector);

module.exports = ArrayCollector;