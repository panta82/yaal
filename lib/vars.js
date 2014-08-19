exports.DEFAULT_OPTIONS = {

	/*
		Converts empty errors array or hash to null. Allows traditional node.js pattern:
	 		if (err) //...
		If this is false, you can test for errors using:
			if (err.count) //...
	 */
	emptyErrorsToNull: true,

	/*
		Determines how many operations will be ran at one time. Possible values:
			- true: all at once
			- false: one at a time
			- [number]: exact number at a time
		Any boolean or number provided directly as argument will be interpreted as one of these
	 */
	parallelism: true,

	/*
		Gather metadata about each run (timestamps) and provide them as the final argument in callbacks.
		Can be enabled through the switch "meta".
	 */
	meta: false,

	/*
		First received error is fatal. No more tasks are started, and the exiting ones are left to complete quietly.
		Single error is returned instead of errors hash or array. Enabled through the switch "fatal".
	 */
	fatal: false,

	/*
		The first 'adequate' callback result is provided in an unwrapped form. What constitutes 'adequate' result
		is determined by the firstFn(x) function. By default, it is any truthy value (another potentially
		useful setting would be anything but undefined). Can be activated through the switch "first".
	 */
	first: false,

	/*
		Function that determines what value should be returned when using the "first" switch.
	 */
	firstFn: function defaultFirstFn(x) {
		return !!x;
	},

	/*
		This value is returned when using the "first" switch, but no return value satisfied the "firstFn"
		and no error was raised.
	 */
	firstNotFoundValue: null,

	/*
		Produce hash result for list-of-tasks or task-for-each modes. In the first case, hash keys
		are function names (or indexes). In the second, specified argument from the list.
		Can be activate using "hash" and "hashX" switches, where X will set hashIndex argument.
		Option has no effect in the hash-of-tasks mode.
	 */
	hash: false,

	/*
		Index of the argument to use as key in the task-for-each scenario. By default, extract the element 0.
		Only applicable if using multiple arguments per call.
	 */
	hashIndex: 0,

	/*
		When converting list-of-tasks into a hash result, this is how we format keys for anonymous functions.
		%d will be replaced with the function's index in the original list.
	 */
	hashAnonymousFunctionFormat: "%d",

	/*
		In case of a hash key collision, we will append a number to the duplicate key. Eg. key, key_1, key_2
		This is the way the key will be formatted. First argument is key base, the second is duplicate number.
		Numbering starts at 1.
	 */
	hashDuplicateKeyFormat: "%s_%d",

	/*
		When trying to convert an object into a hash key, these are properties we check
	 */
	hashKeyProperties: ["id", "name", "key"]
};