jewel.board = (function () {
	var worker, messageCount, callbacks;

	function initialize(callback) {
		messageCount = 0;
		callbacks = [];
		worker = new Worker("scripts/board.worker.js");
	}

	function post(command, data, callback) {
		callbacks[messageCount] = callback;
		worker.postMessage({
			id: messageCount,
			command: command,
			data: data,
		});
		messageCount++;
	}
})();
