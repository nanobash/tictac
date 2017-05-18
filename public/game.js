// Create game interface
var gameUI = new GameUI(".container", player);

// Initialize game
var init = function() {
	updateTurn();
};

// Callback function for when the user makes a move
var callback = function(row, col, player) {
	$.ajax({
		url: './move',
		method: 'GET',
		data: {
			row: row,
			col: col,
			player: player
		},
		beforeSend: function () {
			gameUI.setMessage(gameUI.messages.sending);
        },
		success: function (response) {
			if (true === JSON.parse(response)) {
				// Request was received successfully by server

            }
        },
		error: function (error) {
            console.log(error);
        }
	});

    updateTurn();
};

// Set callback for user move
gameUI.callback = callback;

// Initialize game
init()
