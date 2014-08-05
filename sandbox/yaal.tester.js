var yaal = require("../lib/yaal");

var fns = [
	function (x, y, cb) {
		cb(null, (x + 10) / y);
	},
	function (x, y, cb) {
		cb(null, (x - 10) * y);
	},
	function (x, y, cb) {
		cb(new Error("3"));
	}
];
yaal(fns, [20, 3], function (err, res) {
	console.log(err, res);
});