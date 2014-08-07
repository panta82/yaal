# YAAL

### or, Yet Another Async LibraryYAAL <small>(clever, huh?)</small>

----

Yet another async library. Execute any number of tasks, with any number of arguments, in parallel or series. Recieve all the results, and then easily parse them to get the data you need. All you need is ingle function call:

```javascript
	// Stat a group of files, one at the time
    yaal(fs.stat, ["file1.txt", "file2.txt", "missing.txt"], 1, function (err, res) {
    	if (err) {
        	console.log("One of the raised errors: " + err.any());
        }
        
        // Let's process all the recieved stats, skipping undefineds
        res.compact().forEach(processStat);
    });
```


##### Background: 

I know what you're thinking.

 - "Are you insane?"
 - "Isn't there enough async libraries already?"
 - "Don't you have anything better to do with your time?"

Maybe on all three counts.

The truth is, I really liked the excellent [js async library](https://github.com/caolan/async),
except I needed a few additional features. For example, I needed to be able to get all the received data and not just the first raised error. Also, to be able to interrupt the execution upon receiving a truthy result (without the error hacks). On the other hand, async has a lot of functionality that I didn't really need.

I started hacking on the async, intent on adding the features I needed, but then I started thinking about all the ways async methods could be made more powerful. I decided I really wanted the ability to swallow the errors, and then later process them. Also, that I would need to wrap them into some kind of utility to ease the processing inside the callback. I looked around, but surprisingly none of the other libraries I found had the kind of interface I envisioned. Furthermore, they all suffered from the crippling deficit of being invented nowhere near my house or even the surrounding area.

Thus, ***yaal*** was born.

**TLDR:** *I wanted a single powerful async function that swallows errors and allows you to easily process them afterwards. I made yaal*

##### Features:

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