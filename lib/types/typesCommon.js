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
exports.isEmptyResult = isEmptyResult;

function isEmptyError(val) {
	return val === null;
}
exports.isEmptyError = isEmptyError;

function toImmutable(fn) {
	return function yaalMutableToImmutableAdapter() {
		var ob = this._yaal.clone();
		return fn.apply(ob, arguments);
	};
}
exports.toImmutable = toImmutable;

function toMutable(fn) {
	return function yaalImmutableToMutableAdapter() {
		var ob = this,
			mutated = fn.apply(ob, arguments);

		if (mutated === ob) {
			return ob;
		}


		var key;
		// Delete no longer needed values, differs for array and hash
		if (libTools.isArray(ob)) {
			ob.length = mutated.length;
		} else {
			for (key in ob) {
				//noinspection JSUnfilteredForInLoop
				if (!mutated.hasOwnProperty(key)) {
					//noinspection JSUnfilteredForInLoop
					delete ob[key];
				}
			}
		}

		// Copy over new enumerable values
		libTools.shallowCopy(mutated, ob, false);

		// Copy over non-enumerable values, except the internal context, which is bound to specific object
		for (key in ob._yaal.reserved) {
			if (key !== "_yaal") {
				//noinspection JSUnfilteredForInLoop
				ob[key] = mutated[key];
			}
		}
		return ob;
	};
}
exports.toMutable = toMutable;

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