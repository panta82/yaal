# YET ANOTHER ASYNC LIBRARY
## (or YAAL <small><- clever, huh?</small>)
=================================

Yet another async library.

I know what you're thinking.

"Are you insane? Isn't there enough async libraries already? Don't you have anything better to do with your time?"
Maybe on all three. Time will show.

For now, just the simple usage methodology. This will be replaced with proper docs once I'm done.

```javascript
var yaal = require("yaal");

// General usage pattern
// yaal(fns, args, asynchronisity, callback);

// Execute multiple functions (provided as array), each with an argument list
var tasks = [fn1, fn2];
yaal(tasks, ["test", null, 2], function (err, res) {
	// Case with no errors
	test(err, null);
	test(res, ["res1", "res2"]);

	// Case with error from fn2
	test(err, [null, "err2"]);
	test(res, ["res1", undefined]);
	test(err.first(), "err2");
	test(err.compress(), ["err2"]);
	test(res.compress(), ["res1"]);
	test(res.toHash(tasks), {
		fn1: "res1",
		fn2: undefined
	});
});

// Execute single function, on each of the provided arguments
// (note that fn is outside an array)
yaal(toUpperCase, ["a", "b", "c"], function (err, res) {
	// Case with errors from b and c
	test(err, [null, "errb", "errc"]);
	test(res, ["A", undefined, undefined]);
	test(err.compress(), ["errb", "errc"]);
});

// Execute multiple functions as hash.
yaal({ "a": f1, "b": f2 }, function (err, res) {
	// Case where 'b' failed
	test(err, { "a": null, "b": "errb" });
	test(res, { "a": "resa", "b": undefined});
});

// The third argument - asynchronisity. Can be:
//    A number (1, 2, ...) - this is how many tasks can run at same time
//    true (default) - run everything at the same time
//    false (the same as 1) - run functions one at a time (Serial from async.js)
yaal([fn1, fn2], ["test", null, 2], 1, function (err, res) {
    err = null;
    err = [null, new Error("From fn2")];
    res = ["success", undefined];
});

```