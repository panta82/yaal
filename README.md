# YAAL

----

Yet Another Async Library. Execute any number of tasks, with any number of arguments, in parallel or series. Receive all the results, and then easily manipulate them to get the data you need. The one async function to rule them all (or at least that's the goal).

Install with:

```bash
npm install yaal
```

Then use like this:

```javascript
    // You only need this one function.
	var yaal = require("yaal");

	// Stat a group of files, one at the time
    yaal(fs.stat, ["file1.txt", "file2.txt", "missing"], 1, function (err, res) {
    	if (err) {
        	console.log("One of the raised errors: " + err.any());
        }
        
        // Let's process all the received stats, skipping those not found
        res.compact().forEach(processStat);
    });
```

[Click to skip the boring stuff and see more code.](#more_code)


----
### Background

I know what you're thinking. "Are you insane?" "Isn't there enough async libraries already?" "Don't you have anything better to do with your time?"

Maybe on all three counts.

The truth is, I really liked the excellent [js async library](https://github.com/caolan/async). It's just that I needed a few additional features. Like the ability to get all the results, even if there was an error. Or to handle ALL the raised errors, not just the first one.

So I started hacking at a solution. I decided the correct approach was to wrap all raised errors (and results) into custom objects, to allow for easier processing. Also, I preferred one versatile function in place of many simple ones (less verbose API). I thought I came up with a really cool idea. I looked around, but surprisingly none of the other libraries I found had the kind of interface I envisioned. Furthermore, they all suffered from the crippling deficit of being invented nowhere near here.

Thus, ***yaal*** was born.

**TLDR:** *I wanted something like async.js that doesn't stop on first error. I made yaal*

----
### Features

 - Simple installation and usage (single function)
 - Callback / closure syntax, following node.js standards (no huge refactoring required)
 - Three execution modes:
  - Array of tasks, receive array of results
  - Hash of tasks, receive hash of results
  - Single task, executed on array of arguments, receive array of results
 - All raised errors returned, but they are still easy to handle thanks to custom return types
 - Execute in series, in parallel or with custom number of parallel tasks at once
 - Can provide metadata on timings of each task (useful for profiling)
 - Can stop on the first error (acting like most other async libs)
 - Can stop on the first result
 - Can generate hash from input arrays, with customizable key lookup 
 - Full test suite and [documentation](#documentation)
 - No dependencies
 
----
<a name="documentation"></a>
### Documentation

#### Basics

Here's how you use yaal:

> `yaal(fn, <[args]>, <true/false/number..."switch1,switch2"...{options}>, <callback>)`

`fn` must be the first argument. It can be one of:

- **An array**: Execute a list of tasks using args for each
- **A hash**: Execute each value in the hash using args for each
- **A function**: Execute function on each argument

Args (the second arguments) isn't mandatory. Callback must be the last argument. Everything in between is interpreted as one of:

- **parallelism**: A number or true/false. Determines how many tasks can be executed at once. `true` is for infinite, `false` for 1. Defaults to `true`.
- **switches**: Some of the options can be switched to `true` by providing 'magic' strings as arguments. All available switches are listed here and in [vars.js](lib/vars.js). You can also combine multiple switches inside one string. Eg: `"meta, first,fatal"`
- **options**: Options hash (a last resort). The full list of options is available inside [vars.js](lib/vars.js) file.

#### Custom types (results and errors)

##### Count

> `<err/res/meta>.count`

The number of actual values that are in the array / hash. For example, if a single error is raised, results array will have one less count than its length.

```javascript
yaal(
    [function (cb) { cb(new Error()); },
    function (cb) { cb(null, "a"); },
    function (cb) { cb(null, "b", "c"); }],
    function (err, res) {
		console.log(err.length); // > 3
		console.log(err.count); // > 1
		console.log(res.length); // > 3
		console.log(res.count); // > 2
    });
)
```

##### Compact

Gets rid of the empty values in errors or results array / hash.

> `<err/res>.compact()`

Note this also removes the information on which function led to which outcome. After calling `compact()` on an array, `count` property should be the same as `length`.

```javascript
		// ... continuing from previous code
		console.log(err.compact().length); // > 1
		console.log(res.compact()); // > [["a"], ["b", "c"]]
```

##### Flat and flatten

Normally, each task is expected to return a single value in its callback. These values then become members of the results (res) array or properties on the res hash.. Such array or hash is then considered "flat" and has `flat` property set to `true`.

> `res.flat`

However, if any of your callbacks return multiple values, all the results will become *"nested"* within arrays. Flat property will be set to `false`.

```javascript
yaal(
    [function (cb) { cb(null); },
    function (cb) { cb(null, "a"); },
    function (cb) { cb(null, "b", "c"); }],
    function (err, res) {
    	console.log(res.flat); // > false
        console.log(res[0]); // > []
        console.log(res[1]); // > ["a"]
        console.log(res[2]); // > ["b", "c"]
    });
)
```

If you want to get rid of the nesting, you can use the `flatten` function.

> `res.flatten(<index>, <fluid>)`

Without any arguments, all elements are preserved. In case of an array, the values are just dumped into a new array with the "empty" ones removed.

```javascript
		var res2 = res.flatten();
        console.log(res2.flat); // > true
        console.log(res2); // > ["a", "b", "c"]
```

In case of hashes, duplicate properties are renamed to pattern "`<oldname>_<index> = <value>`" (by default, can be changed). 

```javascript
yaal({
		x: function (cb) { cb(null, "a", "b"); },
		y: function (cb) { cb(null, "c"); },
		z: function (cb) { cb(null); }
	},
    function (err, hash) {
    	console.log(hash); // {x: ["a", "b"], y: ["c"], "z": []}
    	var hash2 = hash.flatten();
    	console.log(hash2); // {x: "a", x_1: "b", y: "c", z: undefined}
    });
)
```

If you call flatten with an index, it will extract only a single value for each result and throw away the rest.

```javascript
		console.log(res); // > [[], ["a"], ["b", "c"]]
		console.log(res.flatten(1)); // > [undefined, undefined, "c"]
```

Notice that, in this case, the `undefined` from the first callback was left intact. You can use negative value to index the array from the end.

If the second argument is true, we will try to find the first non-empty value if the index overflows (like it did in the previous example).

```javascript
		console.log(res); // > [[], ["a"], ["b", "c"], ["d", "e", "f"]]
		console.log(res.flatten(-1)); // > [undefined, "a", "c", "f"]
		console.log(res.flatten(-3)); // > [undefined, "a", "b", "d"]
```

##### Any

If you just want any value from the errors or results array / hash, you can call

> `<err/res>.any()`

```javascript
yaal(
    [function (cb) { cb(new Error("1")); },
    function (cb) { cb(new Error("2")); }],
    function (err, res) {
    	console.log(err.any().message); // > 1
    });
)
```

Currently, for arrays it returns the first value, but it shouldn't be relied upon.

##### Each

> `<err/res>.each(<all>, function (item, key/index) {}, <thisArg>)`

Iterates over a results or errors object and calls the supplied function for each element.

The first argument (`all`) determines whether the fn will be called for everything or only for non-empty values. Is is by default `false` and can be left out if you're only interested in hits.

You can return false to end the iteration. The last argument becomes `this` within your callback, if you supply it.     

```javascript
var files = ["a.txt", "not_there1", "not_there2"];
yaal(fs.stat, files, function (err, res) {
	if (err) {
		console.log(err.count); // > 2
		err.each(function (e, index) {
			console.log("Couldn't stat '" + files[index] + "'");
			return false;
		});
		// Output: Couldn't stat 'not_there1'
	}
	//...
});
```

#### Options

#### `"meta"` switch

If you provide `"meta"` switch in the arguments, or set `meta: true` in options, callback will be given a value with detailed execution times of the tasks. It will follow the same format of res and err: array for array, hash for hash.

```javascript
yaal(fns, args, "meta", function (err, _, meta) {
	console.log(meta.startedAt); // > when we called yaal()
    console.log(meta.completedAt); // > when all the tasks ended
    console.log(meta[0].startedAt, meta[0].completedAt); // > times for the first task
});
```

#### `"fatal"` switch

Provide `"fatal"` in arguments or options to switch to the 'single error death' style of error handling, like in async.js. The first raised error will be immediately returned unwrapped. The remaining tasks will be canceled.

```javascript
yaal([fnGood, fnBad], yaal.FATAL, function (err, res) {
	console.log(err); // > Error: returned by fnBad
    console.log(res.length); // > 2
    console.log(res[0]); // > ??? (who knows, depends on the timing)
});
```

#### `"first"` switch

Provide `"first"` switch in arguments or options to return the first result (unwrapped) matching the criteria (by default, 'truthy'). Execution is immediately stopped and no further tasks processed. In case no result match the criteria, we return null (also configurable). 

```javascript
yaal(processors, item, "first", function (err, res) {
	if (res) {
		console.log("Processing result:" + res);
	} else {
		console.log("No processor was able to handle " + item);
	}
});
```

#### `"hash"` switch

A way to produce a hash-based result from an array-of-tasks or single-task input.

In the former case, hash keys are extracted from task function names. In case of anonymous functions, keys are stringified indexes from the input array (can be customized in [vars.js](lib/vars.js))

```javascript
var fns = [
	function getData() { /*...*/ },
	function () { /*...*/ }
];
yaal(processors, item, "hash", function (err, res) {
	console.log(Object.keys(res)); // > ['getData', '1']
});
```

If used in a single-task scenario, the keys for the resulting hash will by default be extracted from the first element of each submitted argument.  

```javascript
yaal(toUpperCase, ["a", "b"], "hash", function (err, res) {
	console.log(res.a) // > "A"
	console.log(res.b) // > "B"
});
```

Hash switch allows an additional form: `hash$num`, where `$num` is the specific index from which to extract hash key. Negative values are indexed from right. This is only applicable in cases with nested argument arrays.

```javascript
yaal(upload, [[file, "site1.com"], [file, "site2.com"]], "hash1", function (err, res) {
	console.log(res["site1.com"]) // > "Ok"
	console.log(err["site2.com"]) // > "[Error: Connection timeout]"
});
```

#####For more details about the options, consult the [vars.js](lib/vars.js) file.

----

<a name="more_code"></a>
### Code examples

Execute a list of tasks in parallel. Handle all the errors.

```javascript
yaal([
      saveToDB,
      writeToLog,
      sendToAffiliates
  ],
  [customerLead],
  function (err) {
	if (err) {
    	err.compact().forEach(that.emit.bind(that, "error"));
    }
});
```

Load records into a hash. Escape in case of any error.

```javascript
var records = {
	user: getUserDetails,
    offers: getOffers,
    cart: getCart
};
yaal(records, [dc, userId], function (err, res) {
	if (err) {
    	return handleError(err.any());
    }
    console.log("User " + res.user.name + " has "
    	+ res.offers.length + " available offers");
});
```

Ping each server in a list, performing max 10 pings at one time. Take only the time values.

```javascript
function ping(ip, callback) {
    // ...
    callback(null, success, ms, raw);
}

yaal(ping, ips, 10, function (err, res) {
	if (err) {
    	err.forEach(function (e, i) {
        	if (e) console.log("Couldn't ping ip " + ips[i] + ": " + e.message);
        });
        return;
    }
    console.log(res[0]); // > ["success", 15, {stdout: "...", stderr: "..."}]
    var times = res.flatten(1);
    console.log(times[0]); // > 15
});
```

Query multiple databases (with multiple arguments each). Compare the response times using the `meta` switch.

```javascript
	yaal(testQuery, [[myConn, x], [pgConn, y]], 1, "meta", function (err, _, meta) {
    	if (err) { return; }
        
        var elapsedMySQL = meta[0].completedAt - meta[0].startedAt,
        	elapsed = meta.completedAt - meta.startedAt;
        console.log("It took MySQL " + elapsedMySQL + " ms");
        console.log("Total time: " + elapsed + " ms");
    });
```

For advanced usage examples (with switches and more), check out the [documentation](#documentation) examples and the `spec/` folder.

----

### Feature updates

Version|Date      |Description
-------|----------|-----------
0.6    |2014/08/07|Production ready
0.7    |2014/08/08|Added `"fatal"` switch
0.8    |2014/08/09|Added `"first"` switch
0.8.1  |2014/08/09|Added comma notation for switches (`"switch1, switch2"`)
0.9    |2014/08/11|Added `<res/err>.each()` method
0.9.2  |2014/08/12|Added `emptyErrorsToNull` option
0.9.3  |2014/08/18|Added `hashDuplicateKeyFormat` option
0.10.0 |2014/08/25|Added `hash` switch

----

### Breaking changes

Version|Date      |Description
-------|----------|-----------
0.9.3  |2014/08/18|Changed the way duplicate hash keys are numbered. Used to be: `["key_0", "key_1", "key_2"]`. Now: `["key", "key_1", "key_2"]`.

----

### TODO

Ideas for future updates. Near the top: expect them soon. Near the bottom: meh.

- ~~`first` switch. Stop execution and return with the first truthy value. One result is returned. Sort of useful for a "find" functionality.~~
- ~~`fatal` switch. Any error is fatal and stops the execution. One error is returned. Like async.js.~~
- ~~Single task applied to an array of arguments, but producing a hash of results, with picked element of each argument serving as key.~~
-  Is it possible to add some kind of fixed arguments in a single-task scenario, that will be supplied for each call?
- Single task applied on each key/value of a hash, producing hash of results.
- Context for callback with a few useful methods. For example, call `this.each(fn)` to iterate over all errors and results at once.
- Multiple functions mapped to multiple arguments (so far, we have `1 -> many` and `many -> 1`).
- `chain` switch: results from previous function used as arguments for the next one.
- `safe` switch to catch the errors and pretend they were in callback.
- Callback commands. Instead of error, use the first argument in callback to provide all sorts of commands to the state machine. Primary use: `stop` command to end the execution immediately (but without an error)
- Allow adding more tasks after the initial yaal call (by returning some kind of "job" object)
- `repeat` switch. Repeat operation until error or `stop`.

Your own ideas, feedback, bug reports or PRs welcome.

----

### Licence

Apache v2. Read it [here](LICENSE).