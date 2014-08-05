var libTools = require("../lib/tools"),
	libHelpers = require("../spec/helpers"),
	yaal = require("../lib/yaal");

if (false)
yaal(libHelpers.asyncToUppercase, ["a", "b", "c"], function (err, res) {
	console.log(err, res);
});
