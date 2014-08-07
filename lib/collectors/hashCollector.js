var libUtil = require("util");

var libTools = require("../tools"),
	libCommon = require("./collectorsCommon"),
	makeHash = require("../types/yaalHash");

function HashCollector(options) {
	HashCollector.super_.call(this);

	var errors = this.errors = makeHash("errors"),
		results = this.results = makeHash("results"),
		meta;

	var setError = libTools.safeSet.bind(null, errors._yaal.reserved, errors),
		setResult = libTools.safeSet.bind(null, results._yaal.reserved, results),
		setMeta;

	if (options && options.meta) {
		meta = this.meta = makeHash("meta");
		setMeta = libTools.safeSet.bind(null, meta._yaal.reserved, meta);
	}

	this.submit = function(ref, args) {
		var key;
		if (meta) {
			key = ref.key;
			ref.meta.completedAt = new Date();
			setMeta(key, ref.meta);
		} else {
			key = ref;
		}

		if (args[0]) {
			setError(key, args[0]);
			errors.count++;
		} else {
			setError(key, null);
		}

		var argsLength = args.length;
		if (argsLength > 2) {
			libCommon.crumple(results);
		}
		if (results.flat) {
			setResult(key, args[1]);
		} else {
			setResult(key, args.slice(1));
		}
		if (argsLength >= 2) {
			results.count++;
		}
	};
}
libUtil.inherits(HashCollector, libCommon.Collector);

module.exports = HashCollector;