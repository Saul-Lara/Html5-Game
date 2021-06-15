var jewel = (function () {
	var scriptQueue = [],
		numResourcesLoaded = 0,
		numResources = 0,
		executeRunning = false;

	var settings = {
		rows: 8,
		cols: 8,
		baseScore: 100,
		numJewelTypes: 7,
	};

	function executeScriptQueue() {
		var next = scriptQueue[0],
			first,
			script;

		if (next && next.loaded) {
			executeRunning = true;

			scriptQueue.shift(); // Remove the first element in the queue
			first = document.getElementsByTagName("script")[0];
			script = document.createElement("script");
			script.onload = function () {
				if (next.callback) {
					next.callback();
				}

				executeScriptQueue(); // Try to execute more scripts
			};
			script.src = next.src;
			first.parentNode.insertBefore(script, first);
		} else {
			executeRunning = false;
		}
	}

	function load(src, callback) {
		var image, queueEntry;
		numResources++;

		queueEntry = {
			// Add this resource to the execution queue
			src: src,
			callback: callback,
			loaded: false,
		};

		scriptQueue.push(queueEntry);

		image = new Image();
		image.onload = image.onerror = function () {
			numResourcesLoaded++;
			queueEntry.loaded = true;
			if (!executeRunning) {
				executeScriptQueue();
			}
		};
		image.src = src;
	}

	function setup() {
		jewel.showScreen("splash-screen");
		jewel.dom.bind(document, "touchmove", function (event) {
			event.preventDefault();
		});
	}

	// Hide the screen active (if any) and show the screen with specified id
	function showScreen(screenId) {
		var dom = jewel.dom,
			$ = dom.$,
			activeScreen = $("#game .screen.active")[0],
			screen = $("#" + screenId)[0];

		if (!jewel.screens[screenId]) {
			alert("This module is not implemented yet.");
			return;
		}

		if (activeScreen) {
			dom.removeClass(activeScreen, "active");
		}
		dom.addClass(screen, "active");

		jewel.screens[screenId].run();
	}

	function hasWebWorkers() {
		return "Worker" in window;
	}

	function preload(src) {
		var image = new Image();
		image.src = src;
	}

	return {
		load: load,
		setup: setup,
		showScreen: showScreen,
		screens: {},
		settings: settings,
		hasWebWorkers: hasWebWorkers,
		preload: preload,
	};
})();
