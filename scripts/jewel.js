var jewel = (function() {
	var scriptQueue = [],
		numResourcesLoaded = 0,
		numResources = 0,
		executeRunning = false;

	function executeScriptQueue() {
		var next = scriptQueue[0],
			first,
			script;

		if(next && next.loaded){
			executeRunning = true;

			scriptQueue.shift();	// Remove the first element in the queue
			first = document.getElementsByTagName("script")[0];
			script = document.createElement("script");
			script.onload = function () {
				if(next.callback){
					next.callback();
				}

				executeScriptQueue();	// Try to execute more scripts
			};
			script.src = next.src;
			first.parentNode.insertBefore(script, first);
		} else {
			executeRunning = false;
		}
	}

	function load(src, callback){
		var image, queueEntry;
		numResources++;

		queueEntry = {	// Add this resource to the execution queue
			src: src,
			callback: callback,
			loaded: false
		};

		scriptQueue.push(queueEntry);

		image = new Image();
		image.onload = image.onerror = function () {
			numResourcesLoaded++;
			queueEntry.loaded = true;
			if(!executeRunning){
				executeScriptQueue();
			}
		};
		image.src = src;
	}

	function setup() {
		jewel.showScreen("splash-screen");
	}

	// Hide the screen active (if any) and show the screen with specified id
	function showScreen(screenId) {
		var dom = jewel.dom,
			$ = dom.$,
			activeScreen = $("#game .screen.active")[0],
			screen = $("#" + screenId)[0];

		if (activeScreen) {
			dom.removeClass(activeScreen, "active")
		}
		dom.addClass(screen, "active");
	}

	return {
		load: load,
		setup: setup,
		showScreen : showScreen
	};

})();