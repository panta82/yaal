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
			clone = fn.apply(arr, arguments),
			cloneLength = clone.length;

		arr.length = cloneLength;
		for (var i = 0; i < cloneLength; i++) {
			arr[i] = clone[i];
		}
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
		results = MAKE_ARRAY_TYPES[arr.type]();
	for (var i = 0; i < arrLength; i++) {
		var innerArr = arr[i],
			innerArrLength = innerArr.length;
		if (innerArrLength === 0) {
			results.push(undefined);
		} else {
			for (var j = 0; j < innerArrLength; j++) {
				results.push(innerArr[j]);
			}
		}
	}
	results.flat = true;
	return results;
}

function doYaalCompact(arr, emptyValue) {
	var arrLength = arr.length,
		val,
		res = [];
	for (var i = arrLength - 1; i >= 0; i++) {
		val = arr[i];
		if (val !== emptyValue) {
			res.push(val);
		}
	}
	return res;
}

function yaalCompactNulls() {
	return doYaalCompact(this, null);
}

function yaalCompactUndefineds() {
	return doYaalCompact(this, undefined);
}

function makeYaalArray(arr) {
	arr = arr || [];
	arr.count = arr.count || 0;
	arr.clone = libTools.shallowCopy.bind(null, arr);
	return arr;
}

function makeResultsArray(arr) {
	arr.type = "results";
	arr.make = makeResultsArray;
	arr.flat = arr.flat !== undefined ? arr.flat : true;
	arr.crumple = yaalCrumpleMe;
	arr.toCrumpled = toImmutable(yaalCrumpleMe);
	arr.flatten = toMutable(yaalFlatten);
	arr.toFlat = yaalFlatten;
	arr.compact = toMutable(yaalCompactUndefineds);
	arr.toCompact = yaalCompactUndefineds;
	return arr;
}

function makeErrorsArray(arr) {
	arr = makeYaalArray(arr);
	arr.type = "errors";
	arr.compact = toMutable(yaalCompactNulls);
	arr.toCompact = yaalCompactNulls;
	return arr;
}

var MAKE_ARRAY_TYPES = {
	results: makeResultsArray,
	errors: makeErrorsArray
};

function ArrayResultCollector() {
	ArrayResultCollector.super_.call(this);

	var errors = this.errors = makeErrorsArray(),
		results = this.results =  makeResultsArray(),
		filledOutIndexes = [];

	this.submit = function(index, args) {
		filledOutIndexes.push(index);
		if (args[0]) {
			errors[index] = args[0];
			errors.count++;
		} else {
			errors[index] = null;
		}
		var argsLength = args.length;
		if (argsLength > 2) {
			results.crumple();
		}
		if (argsLength <= 2 && results.flat) {
			results[index] = args[1];
		} else {
			results[index] = args.slice(1);
		}
		if (argsLength >= 2) {
			results.count++;
		}
	};
}
libUtil.inherits(ArrayResultCollector, libResults.ResultCollector);

module.exports = ArrayResultCollector;