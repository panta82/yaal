var libUtil = require("util");

var libTools = require("../tools"),
	libCommon = require("./collectorsCommon"),
	makeHash = require("../types/yaalHash");

function HashCollector(options) {
	HashCollector.super_.call(this, options);

	var errors = this.errors = makeHash("errors", options),
		results = this.results = makeHash("results", options),
		meta;

	var setError = libTools.safeSet.bind(null, errors._yaal.reserved, errors),
		setResult = libTools.safeSet.bind(null, results._yaal.reserved, results),
		setMeta;

	if (options && options.meta) {
		meta = this.meta = makeHash("meta", options);
		setMeta = libTools.safeSet.bind(null, meta._yaal.reserved, meta);
	}

	function submitToHash(ref, args) {
		var key;
		if (meta) {
			key = ref.key;
			ref.meta.completedAt = new Date();
			if (setMeta(key, ref.meta)) {
				meta.count++;
			}
		} else {
			key = ref;
		}

		if (key !== false) {
			if (args[0]) {
				if (setError(key, args[0])) {
					errors.count++;
				}
			} else {
				setError(key, null);
			}

			var argsLength = args.length;
			if (argsLength > 2) {
				libCommon.crumple(results);
			}
			var setResultValue = results.flat ? args[1] : args.slice(1);
			if (setResult(key, setResultValue) && argsLength >= 2) {
				results.count++;
			}
		}
	}
	libTools.override(this, "submit", submitToHash);
}
libUtil.inherits(HashCollector, libCommon.Collector);

module.exports = HashCollector;