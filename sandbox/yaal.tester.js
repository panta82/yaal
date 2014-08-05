var libTools = require("../lib/tools"),
	yaal = require("../lib/yaal");

yaal(libTools.asyncToUppercase, ["a", "b", "c"], function (err, res) {
	console.log(err, res);
});