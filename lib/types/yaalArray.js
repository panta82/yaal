var libTools = require("../tools"),
	libCommon = require("./typesCommon");

var MAKE = {
	results: function makeResultsArray(arr) {
		arr._yaal.isEmptyMember = function (val) {
			if (arr.flat) {
				return val === undefined;
			}
			return !(val && val.length > 0);
		};

		arr.flat = true;
		arr._yaal.reserved.flat = true;

		arr.flatten = libCommon.toMutable(libCommon.yaalFlatten);
		arr._yaal.reserved.flatten = true;

		arr.toFlat = libCommon.yaalFlatten;
		arr._yaal.reserved.toFlat = true;

		attachCompact(arr);
		attachAny(arr);

		return arr;
	},
	errors: function makeErrorsArray(arr) {
		arr._yaal.isEmptyMember = function (val) {
			return val === null;
		};

		attachCompact(arr);
		attachAny(arr);

		return arr;
	},
	meta: function makeMetaArray(arr) {
		arr.startedAt = new Date();
		return arr;
	}
};

function attachCompact(arr) {
	arr.compact = libCommon.toMutable(libCommon.yaalCompact);
	arr._yaal.reserved.compact = true;

	arr.toCompact = libCommon.yaalCompact;
	arr._yaal.reserved.toCompact = true;
}

function attachAny(arr) {
	arr.any = libCommon.yaalAny;
	arr._yaal.reserved.any = true;
}

function make(type) {
	var makeType = MAKE[type];
	if (!makeType) {
		throw new Error("Unknown array type: " + type);
	}

	var arr = [];
	arr._yaal = {
		type: type,
		clone: clone,
		reserved: {
			"count": true
		}
	};
	arr.count = 0;

	makeType(arr);

	return arr;

	function clone(empty) {
		var cloned = make(type);
		libTools.shallowCopy(arr, cloned, empty);
		return cloned;
	}
}

make.TYPES = libCommon.TYPES;
module.exports = make;