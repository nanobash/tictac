// Create game interface
var gameUI = new GameUI(".container", player);
var socket = io();

// Initialize game
var init = function() {
	updateBoard();
	updateTurn();
};

socket.on('connecting', function () {
    gameUI.setMessage(gameUI.messages.sending);
});

// Callback function for when the user makes a move
var callback = function(row, col, player) {
    socket.emit('move', {
        request: {
            row: row,
            col: col,
            player: player
        }
    });

    updateBoard();
    updateTurn();
};

// Set callback for user move
gameUI.callback = callback;

// Initialize game
init();
