var TaskRunner = require("./taskRunner");

function makeArrayTaskRunner(fns, args, parallelism, total) {
	var index = 0,
		fnsLength = fns.length;

	var tr = new TaskRunner(parallelism, total);

	tr.on("ready", function () {
		if (index < fnsLength) {
			if (tr.run(index, fns[index], args)) {
				index++;
			}
		}
	});

	return tr;
}
exports.makeArrayTaskRunner = makeArrayTaskRunner;