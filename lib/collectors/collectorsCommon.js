var libUtil = require("util");

var libTools = require("../tools");

function Collector() {
	var thisCollector = this;

	this.errors = null;
	this.results = undefined;
	this.meta = undefined;

	this.done = function (callback, thisArg) {
		thisArg = thisArg || this;
		if (thisCollector.meta) {
			thisCollector.meta.completedAt = new Date();
		}
		if (callback) {
			if (thisCollector.meta) {
				callback.call(
					thisArg,
					thisCollector.errors.count ? thisCollector.errors : null,
					thisCollector.results,
					thisCollector.meta);
			} else {
				callback.call(
					thisArg,
					thisCollector.errors.count ? thisCollector.errors : null,
					thisCollector.results);
			}
		}
	};
}
exports.Collector = Collector;

function crumple(ob) {
	if (!ob.flat) {
		return ob;
	}
	libTools.each(ob, function (val, key) {
		if (val !== undefined) {
			ob[key] = [val];
		} else {
			ob[key] = [];
		}
	});
	ob.flat = false;
	return ob;
}
exports.crumple = crumple;