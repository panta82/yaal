var libTools = require("../tools"),
	libCommon = require("./typesCommon");

var INIT = {
	results: function initResultsArray(arr) {
		arr._yaal.isEmptyMember = libCommon.isEmptyResult.bind(null, arr);

		arr.flat = true;
		arr.flatten = libCommon.toMutable(libCommon.yaalFlatten);
		arr.toFlat = libCommon.yaalFlatten;

		attachCompact(arr);
		attachAny(arr);

		return arr;
	},
	errors: function initErrorsArray(arr) {
		arr._yaal.isEmptyMember = libCommon.isEmptyError;

		attachCompact(arr);
		attachAny(arr);

		return arr;
	},
	meta: function initMetaArray(arr) {
		arr.startedAt = new Date();
		return arr;
	}
};

function attachCompact(arr) {
	arr.compact = libCommon.toMutable(libCommon.yaalCompact);
	arr.toCompact = libCommon.yaalCompact;
}

function attachAny(arr) {
	arr.any = libCommon.yaalAny;
}

function make(type) {
	var initType = INIT[type];
	if (!initType) {
		throw new Error("Unknown array type: " + type);
	}

	var arr = [];
	arr._yaal = {
		type: type,
		clone: clone,
		reserved: false
	};
	arr.count = 0;

	initType(arr);

	return arr;

	function clone(empty) {
		var cloned = make(type);
		libTools.shallowCopy(arr, cloned, empty);
		return cloned;
	}
}

make.TYPES = libCommon.TYPES;
module.exports = make;