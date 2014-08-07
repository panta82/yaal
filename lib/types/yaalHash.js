var libUtil = require("util");

var libTools = require("../tools"),
	libCommon = require("./typesCommon");

function YaalHash() {
	libCommon.initYaalBase(this, make, {
		count: true
	});
}

function YaalResultsHash() {
	YaalResultsHash.super_.call(this);
	libCommon.initYaalResults(this);
}
libUtil.inherits(YaalResultsHash, YaalHash);

function YaalErrorsHash() {
	YaalErrorsHash.super_.call(this);
	libCommon.initYaalErrors(this);
}
libUtil.inherits(YaalErrorsHash, YaalHash);

function YaalMetaHash() {
	YaalMetaHash.super_.call(this);
	libCommon.initYaalMeta(this);
}
libUtil.inherits(YaalMetaHash, YaalHash);

var TYPES = {
	results: YaalResultsHash,
	errors: YaalErrorsHash,
	meta: YaalMetaHash
};

function make(type) {
	var TypeCtr = TYPES[type];
	if (!TypeCtr) {
		throw new Error("Unknown hash type: " + type);
	}

	return new TypeCtr();
}

make.TYPES = libCommon.TYPES;
module.exports = make;