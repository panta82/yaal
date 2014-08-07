var libUtil = require("util");

var libTools = require("../tools"),
	libCommon = require("./typesCommon");

function YaalHashInternal(forHash) {
	this.reserved = {
		count: true
	};

	this.clone = function clone(empty) {
		var cloned = make(forHash._yaal.type);
		libTools.shallowCopy(forHash, cloned, empty);
		return cloned;
	};
}
YaalHashInternal.prototype.type = "base";

function YaalHash() {
	Object.defineProperties(this, {
		"_yaal": {
			value: new YaalHashInternal(this)
		},
		"count": {
			value: 0,
			writable: true
		}
	});
}

function YaalResultsHash() {
	YaalResultsHash.super_.call(this);

	this._yaal.type = "results";
	this._yaal.isEmptyMember = libCommon.isEmptyResult.bind(null, this);

	this._yaal.reserved.flat = true;
	attachFlat(this);

	attachCompact(this);
	attachAny(this);
}
libUtil.inherits(YaalResultsHash, YaalHash);

function YaalErrorsHash() {
	YaalErrorsHash.super_.call(this);

	this._yaal.type = "errors";
	this._yaal.isEmptyMember = libCommon.isEmptyError;

	attachCompact(this);
	attachAny(this);
}
libUtil.inherits(YaalErrorsHash, YaalHash);

function YaalMetaHash() {
	YaalMetaHash.super_.call(this);

	this._yaal.type = "meta";

	this._yaal.reserved.startedAt = true;
	this._yaal.reserved.completedAt = true;

	Object.defineProperties(this, {
		"startedAt": {
			value: new Date()
		},
		"completedAt": {
			value: null,
			writable: true
		}
	});
}
libUtil.inherits(YaalMetaHash, YaalHash);

function attachFlat(target) {
	Object.defineProperties(target, {
		flat: {
			value: true,
			writable: true
		},
		flatten: {
			value: libCommon.toMutable(libCommon.yaalFlatten)
		},
		toFlat: {
			value: libCommon.yaalFlatten
		}
	});
}

function attachCompact(target) {
	Object.defineProperties(target, {
		compact: {
			value: libCommon.toMutable(libCommon.yaalCompact)
		},
		toCompact: {
			value: libCommon.yaalCompact
		}
	});
}

function attachAny(target) {
	Object.defineProperties(target, {
		any: {
			value: libCommon.yaalAny
		}
	});
}

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