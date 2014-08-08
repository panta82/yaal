exports.DEFAULT_OPTIONS = {

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
	firstNotFoundValue: null
};