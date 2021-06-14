jewel.board = (function () {
	var settings, jewels, cols, rows, baseScore, numJewelTypes;

	function initialize(callback) {
		settings = jewel.settings;
		numJewelTypes = settings.numJewelTypes;
		baseScore = settings.baseScore;
		cols = settings.cols;
		rows = settings.rows;
		fillBoard();
		if (callback) {
			callback();
		}
	}

	function fillBoard() {
		var x, y, type;

		jewels = [];
		for (var x = 0; x < cols; x++) {
			jewels[x] = [];
			for (var y = 0; y < rows; y++) {
				type = randomJewel();
				while (
					(type === getJewel(x - 1, y) && type === getJewel(x - 2, y)) ||
					(type === getJewel(x, y - 1) && type === getJewel(x, y - 2))
				) {
					type = randomJewel();
				}
				jewels[x][y] = type;
			}
		}

		// Try again if new board has no moves
		if (!hasMoves()) {
			fillBoard();
		}
	}

	function randomJewel() {
		return Math.floor(Math.random() * numJewelTypes);
	}

	function getJewel(x, y) {
		if (x < 0 || x > cols - 1 || y < 0 || y > rows - 1) {
			return -1;
		} else {
			return jewels[x][y];
		}
	}

	function print() {
		var str = "";
		for (var y = 0; y < rows; y++) {
			for (var x = 0; x < cols; x++) {
				str += getJewel(x, y) + " ";
			}
			str += "\r\n";
		}
		console.log(str);
	}

	// return the number jewels in the chain
	function checkChain(x, y) {
		var type = getJewel(x, y),
			left = 0,
			right = 0,
			down = 0,
			up = 0;

		// look right
		while (type === getJewel(x + right + 1, y)) {
			right++;
		}

		// look left
		while (type === getJewel(x - left - 1, y)) {
			left++;
		}

		// look up
		while (type === getJewel(x, y + up + 1)) {
			up++;
		}

		// look down
		while (type === getJewel(x, y - down - 1)) {
			down++;
		}

		return Math.max(left + 1 + right, up + 1 + down);
	}

	// return true if (x1, y1) can be swapped with (x2, y2)
	function canSwap(x1, y1, x2, y2) {
		var type1 = getJewel(x1, y1),
			type2 = getJewel(x2, y2),
			chain;

		if (!isAdjacent(x1, y1, x2, y2)) {
			return false;
		}

		// temporally swap jewels
		jewels[x1][y1] = type2;
		jewels[x2][y2] = type1;

		chain = checkChain(x2, y2) > 2 || checkChain(x1, y1) > 2;

		// swap back
		jewels[x1][y1] = type1;
		jewels[x2][y2] = type2;

		return chain;
	}

	// return true if (x1, y1) is adjacent to (x2, y2)
	function isAdjacent(x1, y1, x2, y2) {
		var dx = Math.abs(x1 - x2),
			dy = Math.abs(y1 - y2);

		return dx + dy === 1;
	}

	// returns a two-dimensional map of chain-lengths
	function getChains() {
		var x,
			y,
			chains = [];

		for (var x = 0; x < cols; x++) {
			chains[x] = [];
			for (var y = 0; y < rows; y++) {
				chains[x][y] = checkChain(x, y);
			}
		}

		return chains;
	}

	function check(events) {
		var chains = getChains(),
			hadChains = false,
			score = 0,
			removed = [],
			moved = [],
			gaps = [];

		for (var x = 0; x < cols; x++) {
			gaps[x] = 0;
			for (var y = rows - 1; y >= 0; y--) {
				if (chains[x][y] > 2) {
					hadChains = true;
					gaps[x]++;
					removed.push({ x: x, y: y, type: getJewel(x, y) });

					score += baseScore * Math.pow(2, chains[x][y] - 3); // Add points to score
				} else if (gaps[x] > 0) {
					moved.push({
						toX: x,
						toY: y + gaps[x],
						fromX: x,
						fromY: y,
						type: getJewel(x, y),
					});
					jewels[x][y + gaps[x]] = getJewel(x, y);
				}
			}
		}

		// fill from top
		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < gaps[x]; y++) {
				jewels[x][y] = randomJewel();
				moved.push({
					toX: x,
					toY: y,
					fromX: x,
					fromY: y - gaps[x],
					type: jewels[x][y],
				});
			}
		}

		events = events || [];

		if (hadChains) {
			events.push(
				{ type: "remove", data: removed },
				{ type: "score", data: score },
				{ type: "move", data: moved }
			);

			// Refill if no more moves
			if (!hasMoves()) {
				fillBoard();
				events.push({ type: "refill", data: getBoard() });
			}
			return check(events);
		} else {
			return events;
		}
	}

	// Returns true if at least one match can be made
	function hasMoves() {
		for (var x = 0; x < cols; x++) {
			for (var y = 0; y < rows; y++) {
				if (canJewelMove(x, y)) {
					return true;
				}
			}
		}
		return false;
	}

	// Returns true if (x, y) is a valid position and if the jewel
	// at (x, y) can be swapped with a neighbor
	function canJewelMove(x, y) {
		return (
			(x > 0 && canSwap(x, y, x - 1, y)) ||
			(x < cols - 1 && canSwap(x, y, x + 1, y)) ||
			(y > 0 && canSwap(x, y, x, y - 1)) ||
			(y < rows - 1 && canSwap(x, y, x, y + 1))
		);
	}

	function getBoard() {
		var copy = [];

		for (var x = 0; x < cols; x++) {
			copy[x] = jewels[x].slice(0);
		}

		return copy;
	}

	return {
		canSwap: canSwap,
		initialize: initialize,
		print: print,
		getBoard: getBoard,
	};
})();
