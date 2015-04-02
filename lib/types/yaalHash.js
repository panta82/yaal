var libUtil = require("util");

var libVars = require("../vars"),
	libTools = require("../tools"),
	libCommon = require("./typesCommon");

function YaalHash(options) {
	libCommon.initYaalBase(this, make, {
		count: true
	});
	options = options || libVars.DEFAULT_OPTIONS;
	this._yaal.hashDuplicateKeyFormat = options.hashDuplicateKeyFormat;
	this._yaal.userArgs = options.userArgs;
}

function YaalResultsHash(options) {
	YaalResultsHash.super_.call(this, options);
	libCommon.initYaalResults(this);
}
libUtil.inherits(YaalResultsHash, YaalHash);

function YaalErrorsHash(options) {
	YaalErrorsHash.super_.call(this, options);
	libCommon.initYaalErrors(this);
}
libUtil.inherits(YaalErrorsHash, YaalHash);

function YaalMetaHash(options) {
	YaalMetaHash.super_.call(this, options);
	libCommon.initYaalMeta(this);
}
libUtil.inherits(YaalMetaHash, YaalHash);

var TYPES = {
	results: YaalResultsHash,
	errors: YaalErrorsHash,
	meta: YaalMetaHash
};

function make(type, options) {
	var TypeCtr = TYPES[type];
	if (!TypeCtr) {
		throw new Error("Unknown hash type: " + type);
	}

	return new TypeCtr(options);
}

make.TYPES = libCommon.TYPES;
module.exports = make;