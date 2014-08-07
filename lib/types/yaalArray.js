var libTools = require("../tools"),
	libCommon = require("./typesCommon");

var TYPES = {
	results: libCommon.initYaalResults,
	errors: libCommon.initYaalErrors,
	meta: libCommon.initYaalMeta
};

function make(type) {
	var initType = TYPES[type];
	if (!initType) {
		throw new Error("Unknown array type: " + type);
	}

	var arr = [];
	libCommon.initYaalBase(arr, make);
	initType(arr);

	return arr;
}

make.TYPES = libCommon.TYPES;
module.exports = make;