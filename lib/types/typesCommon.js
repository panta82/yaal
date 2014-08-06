var libTools = require("../tools");

exports.TYPES = {
	results: "results",
	errors: "errors",
	meta: "meta"
};

function pushOrSet(ob, item, key) {
	if (ob.push) {
		ob.push(item);
	}
	else if (!ob._yaal.reserved[key]) {
		ob[key] = item;
	}
}

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

		libTools.shallowCopy(mutated, ob, false);
		if (mutated.length !== undefined) {
			ob.length = mutated.length;
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

	var pick = false,
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
			if (pick) {
				pushOrSet(results, undefined, key);
			}
		} else {
			if (!pick) {
				// We are not picking values, we just dump them all in the results array
				for (j = 0; j < valLength; j++) {
					hashKey = valLength > 1 ? key + "_" + j : key;
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
				newCount++;
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
		results = ob._yaal.clone(true),
		isEmpty = ob._yaal.isEmptyMember;

	libTools.each(ob, function (val, key) {
		if (!isEmpty(val)) {
			pushOrSet(results, val, key);
		}
	});

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