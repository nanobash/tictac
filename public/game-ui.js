// Create game UI
// container is the DOM element in which the UI should be placed
// player is the current player, which should be "x" or "o"
var GameUI = function(container, player) {
	// Set player
	this.player = player;

	// Build DOM structure
	this.container = $(container);
	this.tableElem = $("<table class='board'>" + 
		"<tr><td></td><td></td><td></td></tr>" + 
		"<tr><td></td><td></td><td></td></tr>" + 
		"<tr><td></td><td></td><td></td></tr>" + 
		"</table>");
	var squareElems = [[], [], []]
	this.tableElem.find("tr").each(function(row, tr) {
		$(tr).find("td").each(function(col, td) {
			squareElems[row][col] = $(td);
		});
	});
	this.squareElems = squareElems;
	this.messageElem = $("<div></div>");
	this.newGameElem = $("<a href='#'>New Game</a>")
		.click(this.newGame)
		.hide();
	this.container
		.append(this.tableElem)
		.append(this.messageElem)
		.append(this.newGameElem);

	// Create game state variables
	this.board = [[], [], []];
	this.ended = false;
	this.winner = "";

	// Initialize game state
	this.reset();
}

// Start a new game by refreshing the client
GameUI.prototype.newGame = function(event) {
	event.preventDefault();
	$.getJSON("/newgame", function(data) {
		document.location.reload(true);
	})
}

// Sets game state
GameUI.prototype.reset = function() {
	for (var row = 0; row < 3; row++) {
		for (var col = 0; col < 3; col++) {
			this.setSquare(row, col, "");
		}
	}
	this.ended = false;
	this.winner = "";
	this.disable();
}

// Disables the UI and prevents the player from making a move
GameUI.prototype.disable = function() {
	this.disabled = true;
	this.tableElem.addClass("disabled")
}

// Enables the UI and allows the player to make a move
GameUI.prototype.enable = function() {
	this.disabled = false;
	this.tableElem.removeClass("disabled")	
}

// Sets the UI message to the given text
GameUI.prototype.setMessage = function(message) {
	this.messageElem.text(message);
}

// Internal link handler for the GameUI
GameUI.prototype.linkHandler = function(event) {
	// Prevent link action
	event.preventDefault();

	// Get row and column
	targetElem = $(event.target);
	var row = targetElem.data("row");
	var col = targetElem.data("col");
	
	// If this is not disabled...
	if (!this.disabled) {
		// Update the square in the UI
		this.setSquare(targetElem.data("row"), targetElem.data("col"), this.player);

		// Disable the UI
		this.disable();

		// Check if the game has ended
		this.checkEnded();

		// Call the callback with the move information
		this.callback(row, col, this.player);
	}
};

// Gets the value of the current square.
// Value will be "x", "o" or "" (empty string)
GameUI.prototype.getSquare = function(row, col) {
	return this.board[row][col];
}

// Sets the given square to given value
// Value should be "x", "o" or "" (empty string)
GameUI.prototype.setSquare = function(row, col, value) {
	// Update the instance variable
	this.board[row][col] = value;

	// Update the DOM
	if (!value || value == " ") {
		// If value is "", set the square to empty
		// Create a clickable element
		var linkElem = $("<a href='#''>&nbsp;</a>");
		linkElem.click(this.linkHandler.bind(this))
			.data({"row": row, "col": col});

		// Add it to the square
		this.squareElems[row][col]
			.empty()
			.append(linkElem);
	} else if (value.toLowerCase() == "o" ) {
		// IF value is "o", set the square to an empty circle
		this.squareElems[row][col].html("&#x25cb;")
	} else if (value.toLowerCase() == "x" ) {
		// IF value is "x", set the square to a cross
		this.squareElems[row][col].html("&times;")
	}
}

// Updates the interface to reflect the given board
GameUI.prototype.setBoard = function(board) {
	for (var row = 0; row < 3; row++) {
		for (var col = 0; col < 3; col++) {
			this.setSquare(row, col, board[row][col]);
		}
	}
	this.checkEnded();
}

// Displays a game message
GameUI.prototype.setMessage = function(message) {
	this.messageElem.text(message);
}

// Get the next move from the player
GameUI.prototype.waitForMove = function() {
	if (!this.ended) {
		this.enable();
	}
}

// Given a board, return true if the game has ended and false otherwise
GameUI.prototype.checkEnded = function() { 
	// Possible lines to check
	var lines = [
		[[0, 0, 0], [0, 1, 2]],
		[[1, 1, 1], [0, 1, 2]],
		[[2, 2, 2], [0, 1, 2]],
		[[0, 1, 2], [0, 0, 0]],
		[[0, 1, 2], [1, 1, 1]],
		[[0, 1, 2], [2, 2, 2]],
		[[0, 1, 2], [0, 1, 2]],
		[[0, 1, 2], [2, 1, 0]]
	];

	// If any line is controlled by a single player, the game is ended
	var winningLine = false;
	for (var i = 0; i < lines.length; i++) {
		if (this.getSquare(lines[i][0][0], lines[i][1][0])
				== this.getSquare(lines[i][0][1], lines[i][1][1])
				&& this.getSquare(lines[i][0][1], lines[i][1][1])
				== this.getSquare(lines[i][0][2], lines[i][1][2])
				&& this.getSquare(lines[i][0][0], lines[i][1][0]) != "") {
			winningLine = true;
			this.squareElems[lines[i][0][0]][lines[i][1][0]].addClass("match");
			this.squareElems[lines[i][0][1]][lines[i][1][1]].addClass("match");
			this.squareElems[lines[i][0][2]][lines[i][1][2]].addClass("match");
			this.winner = this.getSquare(lines[i][0][0], lines[i][1][0]);
		}
	}

	// If all the spots are taken, the game has ended.
	var allFilled = true;
	for (var row = 0; row < 3; row++) {
		for (var col = 0; col < 3; col++) {
			if (this.getSquare(row, col) == "") {
				allFilled = false;
			}
		}
	}
	
	this.ended = winningLine || allFilled;
	if (this.ended) {
		this.newGameElem.show()
		this.disable();
	}
	return this.ended
}

// Defines GameUI object messages
GameUI.prototype.messages = {
	'current': 'It is your move...',
	'sending': 'Sending your move...',
	'waiting': 'Waiting for opponent...',
	'ended': 'The game has ended.',
	'error': 'Detected Error!'
};

function updateBoard() {
    // Updates board from the Server
    socket.on('board', function (response) {
        gameUI.setBoard(response);
    });
}

function updateTurn() {
	// Updates turn from the Server
	socket.on('turn', function (response) {
        gameUI.setMessage(response === gameUI.player ? gameUI.messages.current : gameUI.messages.waiting);

        if (gameUI.player === response || '' === response) {
        	gameUI.enable();
		}

		if (true === gameUI.ended) {
        	gameUI.disable();

            if ('' === gameUI.winner) {
                gameUI.setMessage('It\'s a tie!');
			} else {
                gameUI.setMessage('Winner is ' + gameUI.winner + ' player!');
			}
		}
    });
}
