var libUtil = require("util");

var libTools = require("../tools"),
	libResults = require("./results");

function toImmutable(fn) {
	return function yaalMutableToImmutableAdapter() {
		var arr = this.clone();
		return fn.apply(arr, arguments);
	};
}

function toMutable(fn) {
	return function yaalImmutableToMutableAdapter() {
		var arr = this,
			clone = fn.apply(arr, arguments);

		arr.length = clone.length;
		libTools.shallowCopy(clone, arr);
		return arr;
	};
}

function yaalCrumpleMe(filledOutIndexes) {
	var arr = this;
	if (!arr.flat) {
		return;
	}
	var arrLength = arr.length;
	for (var i = 0; i < arrLength; i++) {
		if ((filledOutIndexes && filledOutIndexes.indexOf(i) >= 0)
				|| (!filledOutIndexes && arr[i] !== undefined)) {
			arr[i] = [arr[i]];
		} else {
			arr[i] = [];
		}
	}
	arr.flat = false;
	return arr;
}

function yaalFlatten() {
	var arr = this;
	if (arr.flat) {
		return;
	}
	var arrLength = arr.length,
		results = PER_TYPE[arr.type].make(arr),
		newCount = 0;
	for (var i = 0; i < arrLength; i++) {
		var innerArr = arr[i],
			innerArrLength = innerArr.length;
		if (innerArrLength === 0) {
			results.push(undefined);
		} else {
			for (var j = 0; j < innerArrLength; j++) {
				results.push(innerArr[j]);
				newCount++;
			}
		}
	}
	results.flat = true;
	results.count = newCount;
	return results;
}

function doYaalCompact(isEmptyElement, arr) {
	var arrLength = arr.length,
		val,
		res = PER_TYPE[arr.type].make(arr);
	for (var i = 0; i < arrLength; i++) {
		val = arr[i];
		if (!isEmptyElement(arr, val)) {
			res.push(val);
		}
	}
	res.count = arr.count;
	return res;
}

function doYaalFirst(isEmptyElement, arr) {
	var arrLength = arr.length,
		val;
	for (var i = 0; i < arrLength; i++) {
		val = arr[i];
		if (!isEmptyElement(arr, val)) {
			return val;
		}
	}
	return null;
}

function yaalMakeResultsArrayCommon(arr) {
	arr.count = 0;
	arr.clone = libTools.shallowCopy.bind(null, arr);
	arr.compact = toMutable(PER_TYPE[arr.type].compact);
	arr.toCompact = PER_TYPE[arr.type].compact;
	arr.first = PER_TYPE[arr.type].first;
	arr.any = PER_TYPE[arr.type].first;
}

var ARRAY_TYPES = {
	results: "results",
	errors: "errors"
};

var PER_TYPE = {
	results: {
		make: function makeResultsArray(source) {
			var arr = [];
			arr.type = ARRAY_TYPES.results;

			yaalMakeResultsArrayCommon(arr);

			arr.flat = source && source.flat !== undefined ? source.flat : true;
			arr.crumple = yaalCrumpleMe;
			arr.toCrumpled = toImmutable(yaalCrumpleMe);
			arr.flatten = toMutable(yaalFlatten);
			arr.toFlat = yaalFlatten;

			return arr;
		},
		compact: function yaalCompactResults() {
			return doYaalCompact(PER_TYPE.results.isEmptyElement, this);
		},
		first: function yaalFirstResult() {
			return doYaalFirst(PER_TYPE.results.isEmptyElement, this);
		},
		isEmptyElement: function (arr, val) {
			if (arr.flat) {
				return val === undefined;
			}
			return !(val && val.length > 0);
		}
	},
	errors: {
		make: function makeErrorsArray() {
			var arr = [];
			arr.type = ARRAY_TYPES.errors;

			yaalMakeResultsArrayCommon(arr);

			return arr;
		},
		compact: function yaalCompactErrors() {
			return doYaalCompact(PER_TYPE.errors.isEmptyElement, this);
		},
		first: function yaalFirstError() {
			return doYaalFirst(PER_TYPE.errors.isEmptyElement, this);
		},
		isEmptyElement: function (arr, val) {
			return val === null;
		}
	}
};

function ArrayResultCollector(options) {
	ArrayResultCollector.super_.call(this);

	var errors = this.errors = PER_TYPE.errors.make(),
		results = this.results = PER_TYPE.results.make(),
		filledOutIndexes = [];

	this.submit = function(ref, args) {
		var index, meta = null;
		if (options && options.meta) {
			meta = ref.meta;
			index = ref.index;
			meta.completedAt = new Date();
		} else {
			index = ref;
		}

		filledOutIndexes.push(index);
		if (args[0]) {
			errors[index] = args[0];
			errors.count++;
		} else {
			errors[index] = null;
		}
		var argsLength = args.length;
		if (meta || argsLength > 2) {
			results.crumple();
		}
		if (results.flat) {
			results[index] = args[1];
		} else {
			results[index] = args.slice(1);
			if (meta) {
				results[index].push(meta);
			}
		}
		if (argsLength >= 2) {
			results.count++;
		}
	};
}
libUtil.inherits(ArrayResultCollector, libResults.ResultCollector);

module.exports = ArrayResultCollector;