var libTools = require("../tools");

exports.TYPES = {
	results: "results",
	errors: "errors",
	meta: "meta"
};

function getPushOrSet(isHash) {
	if (isHash) {
		return safeSet;
	} else {
		return safePush;
	}

	function safePush(ob, val) {
		return ob.push(val);
	}

	function safeSet(ob, val, key) {
		return libTools.safeSet(ob._yaal.reserved, ob, key, val);
	}
}

function isEmptyResult(ob, val) {
	if (ob.flat) {
		return val === undefined;
	}
	return !(val && val.length > 0);
}

function isEmptyError(val) {
	return val === null || val === undefined;
}

function YaalInternal(forOb, make, reserved) {
	this.reserved = reserved || {};

	this.clone = function clone(empty) {
		var cloned = make(forOb._yaal.type);
		libTools.shallowCopy(forOb, cloned, empty);
		return cloned;
	};
}
YaalInternal.prototype.type = "base";
exports.YaalInternal = YaalInternal;

function initYaalBase(target, make, reserved) {
	Object.defineProperties(target, {
		"reserved": {
			value: {}
		},
		"_yaal": {
			value: new YaalInternal(target, make, reserved)
		},
		"count": {
			value: 0,
			writable: true
		},
		"isEmptyMember": {
			value: function () { return false; },
			writable: true
		}
	});
}
exports.initYaalBase = initYaalBase;

function initYaalResults(target) {
	target._yaal.type = "results";
	target._yaal.isEmptyMember = isEmptyResult.bind(null, target);

	target._yaal.reserved.flat = true;
	Object.defineProperties(target, {
		flat: {
			value: true,
			writable: true
		},
		flatten: {
			value: yaalFlatten
		},
		compact: {
			value: yaalCompact
		},
		any: {
			value: yaalAny
		},
		each: {
			value: yaalEach
		}
	});
}
exports.initYaalResults = initYaalResults;

function initYaalErrors(target) {
	target._yaal.type = "errors";
	target._yaal.isEmptyMember = isEmptyError;

	Object.defineProperties(target, {
		compact: {
			value: yaalCompact
		},
		any: {
			value: yaalAny
		},
		each: {
			value: yaalEach
		}
	});
}
exports.initYaalErrors = initYaalErrors;

function initYaalMeta(target) {
	target._yaal.type = "meta";
	target._yaal.reserved.startedAt = true;
	target._yaal.reserved.completedAt = true;

	Object.defineProperties(target, {
		"startedAt": {
			value: new Date()
		},
		"completedAt": {
			value: null,
			writable: true
		}
	});
}
exports.initYaalMeta = initYaalMeta;

function yaalFlatten(index, fluid) {
	var ob = this;
	if (ob.flat) {
		return ob;
	}

	var isHash = !libTools.isArray(ob),
		pushOrSet = getPushOrSet(isHash),
		pick = false,
		searchDirection;
	if (libTools.isNumber(index)) {
		pick = true;
		index = index || 0;
		fluid = fluid === true;
		searchDirection = index >= 0 ? -1 : 1;
	}

	var results = ob._yaal.clone(true),
		newCount = 0;

	libTools.each(ob, function (val, key) {
		var valLength = val.length,
			j, picked, hashKey;

		if (valLength === 0) {
			// Empty array. We add undefined placeholder if we are guaranteed to keep the same number of members
			if (pick || isHash) {
				pushOrSet(results, undefined, key);
			}
		} else {
			if (!pick) {
				// We are not picking values, we just dump them all in the results array
				for (j = 0; j < valLength; j++) {
					if (isHash) {
						hashKey = valLength > 1 ? key + "_" + j : key;
					}
					pushOrSet(results, val[j], hashKey);
					newCount++;
				}
			} else {
				// We pick single value, from left or right
				j = index >= 0 ? index : valLength + index;
				picked = val[j];
				if (fluid) {
					// If fluid is requested, we move along the array until we find value
					while (picked === undefined
						&& ((searchDirection < 0 && j >= 0)
							|| (searchDirection > 0 && j < valLength))) {
						j += searchDirection;
						picked = val[j];
					}
				}
				pushOrSet(results, picked, key);
				if (picked !== undefined) {
					newCount++;
				}
			}
		}
	});

	results.flat = true;
	results.count = newCount;
	return results;
}
exports.yaalFlatten = yaalFlatten;

function yaalCompact() {
	var ob = this,
		pushOrSet = getPushOrSet(!libTools.isArray(ob)),
		results = ob._yaal.clone(true),
		isEmpty = ob._yaal.isEmptyMember;

	libTools.each(ob, function (val, key) {
		if (!isEmpty(val)) {
			pushOrSet(results, val, key);
		}
	});

	results.count = ob.count;
	return results;
}
exports.yaalCompact = yaalCompact;

function yaalAny() {
	var ob = this,
		result = null,
		isEmpty = ob._yaal.isEmptyMember;

	libTools.each(ob, function (val) {
		if (!isEmpty(val)) {
			result = val;
			return false;
		}
		return undefined;
	});

	return result;
}
exports.yaalAny = yaalAny;

function yaalEach(all, fn, thisArg) {
	if (libTools.isFunction(all)) {
		thisArg = fn;
		fn = all;
		all = false;
	}
	var ob = this,
		isEmpty = ob._yaal.isEmptyMember;
	return libTools.each(ob, function (val, key) {
		var response;
		if (all || !isEmpty(val)) {
			if (thisArg) {
				response = fn.call(thisArg, val, key);
			} else {
				response = fn(val, key);
			}
		}
		return response;
	});
}
exports.yaalEach = yaalEach;