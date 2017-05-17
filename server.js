// Main server program

// Import packages
var express = require("express");
var ejs = require("ejs");

// Create server
var app = express();

// Print HTTP requests to console
app.use(express.logger());

// Serve static files from public directory
app.use(express.static(__dirname + "/public"));

// Parse HTTP POST parameters
app.use(express.bodyParser());

// Use the EJS templating engine
app.set("view engine", "ejs");

// Look for view files in the view directory
app.set("views", __dirname + "/views");

// Game state variables
var board; 
var turn;

// Reset the game
var resetGame = function() {
	board = [["", "", ""], ["", "", ""] ,["", "", ""]];
	turn = "x";
};

// Given a board, return true if the game has ended and false otherwise
var gameEnded = function(board) { 
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
	for (var i = 0; i < lines.length; i++) {
		if (board[lines[i][0][0]][lines[i][1][0]]
				== board[lines[i][0][1]][lines[i][1][1]]
				&& board[lines[i][0][1]][lines[i][1][1]]
				== board[lines[i][0][2]][lines[i][1][2]]
				&& board[lines[i][0][0]][lines[i][1][0]] != "") {
			return true;
		}
	}

	// If all the spots are taken, the game has ended.
	for (var row = 0; row < 3; row++) {
		for (var col = 0; col < 3; col++) {
			if (board[row][col] == "") {
				return false;
			}
		}
	}
	return true;
}

// Client page for Player X
app.get("/playerx", function(req, res) {
	res.render("client", {"player": "x"});
});

// Client page for Player Y
app.get("/playero", function(req, res) {
	res.render("client", {"player": "o"});
});

// HTTP GET endpoint that resets the game
app.get("/reset", function(req, res) {
	resetGame();
	res.send(JSON.stringify(true));
	res.end();
});


// HTTP GET endpoint that resets the game only if it is finished
app.get("/newgame", function(req, res) {
	if (gameEnded(board)) {
		resetGame();
		res.send(JSON.stringify(true));
		res.end();
	} else {
		res.send(JSON.stringify(false));
		res.end();
	}
});

// HTTP GET endpoint that gets the board
app.get("/board", function(req, res) {
	res.send(JSON.stringify(board));
	res.end();
});

// HTTP GET endpoint that gets whose turn it is
app.get("/turn", function(req, res) {
	res.send(JSON.stringify(turn));
	res.end();
});

// HTTP GET endpoint that makes a player move
app.get("/move", function(req, res) {
	// TODO: Implement this
	res.send(JSON.stringify("Unimplemented"));
	res.end();
});

// Initialize the game
resetGame();

// Listen for new HTTP connections at the given port number
var port = process.env.PORT || 4000;
app.listen(port);
console.log("Listening for new connections on http://localhost:" + port + "/");
