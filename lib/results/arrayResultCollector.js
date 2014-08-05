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
		results = arr.make(),
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

function doYaalCompact(arr, filter) {
	var arrLength = arr.length,
		val,
		res = arr.make(),
		shouldKeep = libTools.isFunction(filter)
			? filter
			: function (val) { return val !== filter };
	for (var i = 0; i < arrLength; i++) {
		val = arr[i];
		if (shouldKeep(val)) {
			res.push(val);
		}
	}
	res.count = arr.count;
	return res;
}

function yaalCompactResults() {
	if (this.flat) {
		return doYaalCompact(this, undefined);
	} else {
		return doYaalCompact(this, function (val) {
			return val && val.length > 0;
		});
	}
}

function yaalCompactErrors() {
	return doYaalCompact(this, null);
}

function makeYaalArray() {
	var arr = [];
	arr.count = 0;
	arr.clone = libTools.shallowCopy.bind(null, arr);
	return arr;
}

function makeResultsArray(source) {
	var arr = makeYaalArray();
	arr.make = makeResultsArray.bind(null, arr);
	arr.flat = source && source.flat !== undefined ? source.flat : true;
	arr.crumple = yaalCrumpleMe;
	arr.toCrumpled = toImmutable(yaalCrumpleMe);
	arr.flatten = toMutable(yaalFlatten);
	arr.toFlat = yaalFlatten;
	arr.compact = toMutable(yaalCompactResults);
	arr.toCompact = yaalCompactResults;
	return arr;
}

function makeErrorsArray(source) {
	var arr = makeYaalArray();
	arr.make = makeErrorsArray.bind(null, arr);
	arr.compact = toMutable(yaalCompactErrors);
	arr.toCompact = yaalCompactErrors;
	return arr;
}

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