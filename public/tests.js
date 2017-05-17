// Unit tests for the server

"use strict";

asyncTest("Reset the board", 1, function() {
	resetBoard();
});

asyncTest("Initial board", 3, function() {
	Chain.create()
		.add(resetBoard)
		.add(boardEquals, [["", "", ""], ["", "", ""], ["", "", ""]])
		.run();
});


asyncTest("Initial turn", 3, function() {
	Chain.create()
		.add(resetBoard)
		.add(turnEquals, "x")
		.run();
});

asyncTest("Make basic moves", 8, function() {
	Chain.create()
		.add(resetBoard)
		.add(makeMove, 0, 0, "x")
		.add(makeMove, 1, 1, "o")
		.add(makeMove, 2, 2, "x")
		.add(boardEquals, [["x", "", ""], ["", "o", ""], ["", "", "x"]])
		.add(turnEquals, "o")
		.run();
});

asyncTest("Make illegal moves", 8, function() {
	Chain.create()
		.add(resetBoard)
		.add(makeMove, 0, 0, "x")
		.add(makeIllegalMove, 0, 0, "o", "overlaps taken square")
		.add(makeIllegalMove, 0, 1, "x", "out of turn")
		.add(boardEquals, [["x", "", ""], ["", "", ""], ["", "", ""]])
		.add(turnEquals, "o")
		.run();
});

asyncTest("Game win conditions", 11, function() {
	Chain.create()
		.add(resetBoard)
		.add(makeMove, 0, 0, "x")
		.add(makeMove, 1, 0, "o")
		.add(makeMove, 0, 1, "x")
		.add(makeMove, 1, 1, "o")
		.add(makeMove, 0, 2, "x")
		.add(boardEquals, [["x", "x", "x"], ["o", "o", ""], ["", "", ""]])
		.add(turnEquals, "")
		.add(makeIllegalMove, 0, 2, "o", "game has already ended")
		.run();
});

asyncTest("Game draw conditions", 15, function() {
	Chain.create()
		.add(resetBoard)
		.add(makeMove, 0, 0, "x")
		.add(makeMove, 1, 0, "o")
		.add(makeMove, 0, 1, "x")
		.add(makeMove, 1, 1, "o")
		.add(makeMove, 1, 2, "x")
		.add(makeMove, 0, 2, "o")
		.add(makeMove, 2, 0, "x")
		.add(makeMove, 2, 1, "o")
		.add(makeMove, 2, 2, "x")
		.add(boardEquals, [["x", "x", "o"], ["o", "o", "x"], ["x", "o", "x"]])
		.add(turnEquals, "")
		.add(makeIllegalMove, 0, 2, "o", "game has already ended")
		.run();
});


// Helper for running chained async operations
var Chain = function() {
	this.queue = [];  // Queued actions
	this.position = -1;  // Index of last-run action
};

// Creates a new chain
Chain.create = function() {
	return new Chain();
};

// Adds an operation to the chain
Chain.prototype.add = function() {
	// Get function and arguments
	var fn = arguments[0];
	var args = Array.prototype.slice.call(arguments, 1);

	// Add operation to the chain
	args.push(this.run.bind(this));
	this.queue.push(function() {
		fn.apply(this, args);
	});

	return this;
};

// Runs all operations in the chain
Chain.prototype.run = function() {
	// Advance position
	this.position++;

	// If there is a next operation, run it, otherwise start next test
	if (this.position < this.queue.length) {
		this.queue[this.position]();
	} else {
		start();
	}

	return this;
};

// Resets the board
var resetBoard = function(callback) {
	$.getJSON("/reset")
	.done(function(data) {
		ok(true, "GET '/reset' successful");
		if (callback) {
			callback();
		} else {
			start();
		}
	})
	.fail(function() {
		ok(false, "GET '/reset' failed");
		start();
	});
};

// Checks if board is equal to an expected board
var boardEquals = function(board, callback) {
	$.getJSON("/board")
	.done(function(data) {
		ok(true, "GET '/board' successful");
		deepEqual(data, board, "Board is equal to expected board");
		if (callback) {
			callback();
		} else {
			start();
		}
	})
	.fail(function() {
		ok(false, "GET '/board' failed");
		start();
	});
};

// Check if it is the expected player's turn
var turnEquals = function(turn, callback) {
	$.getJSON("/turn")
	.done(function(data) {
		ok(true, "GET '/turn' successful");
		deepEqual(data, turn, "Current turn should be player '" + turn + "'");
		if (callback) {
			callback();
		} else {
			start();
		}
	})
	.fail(function() {
		ok(false, "GET '/turn' failed");
		start();
	});
};

// Make a player move
var makeMove = function(row, col, player, callback) {
	$.getJSON("/move", {"row": row, "col": col, "player": player})
	.done(function(data) {
		ok(true, "Move {'row': " + row + ", 'col': " + col + ", 'player': '" + player + "'}");
		if (callback) {
			callback();
		} else {
			start();
		}
	})
	.fail(function() {
		ok(false, "GET '/move' failed");
		start();
	});
};

// Make an illegal move
var makeIllegalMove = function(row, col, player, reason, callback) {
	$.getJSON("/move", {"row": row, "col": col, "player": player})
	.done(function(data) {
		equal(data, false, "Illegal move {'row': " + row + ", 'col': " + col + ", 'player': '" + player + "'} should be disallowed: " + reason + "");
		if (callback) {
			callback();
		} else {
			start();
		}
	})
	.fail(function() {
		ok(false, "GET '/move' failed");
		start();
	});
};
