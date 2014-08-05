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
		Can be enabled through switch 'meta'.
	 */
	meta: false
};