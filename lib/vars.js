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
		Can be enabled through switch.
	 */
	meta: false,

	/*
		First received error is fatal. No more tasks are started, and the exiting ones are left to complete quietly.
		Single error is returned instead of errors hash or array
	 */
	fatal: false
};