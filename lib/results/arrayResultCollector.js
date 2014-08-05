var libUtil = require("util");

var libResults = require("./results");

function yaalCrumple(filledOutIndexes) {
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
	var arrLength = arr.length;
	for (var i = 0; i < arrLength; i++) {
		var innerArr = arr[i],
			innerArrLength = innerArr.length;
		if (innerArrLength === 0) {
			arr.push(undefined);
		} else {
			for (var j = 0; j < innerArrLength; j++) {
				arr.push(innerArr[j]);
			}
		}
	}
	arr.splice(0, arrLength);
	arr.flat = true;
	return arr;
}

function makeResultsArray(arr) {
	arr = arr || [];
	arr.count = 0;
	arr.flat = true;
	arr.crumple = yaalCrumple;
	arr.flatten = yaalFlatten;
	return arr;
}

function makeErrorsArray(arr) {
	arr = arr || [];
	arr.count = 0;
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