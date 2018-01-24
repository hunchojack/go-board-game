class Board {
  constructor() {
    this.currentMove = 0;
	  this.BOARD_SIZE = 19;
    this.blacksTurn = true;
    this.bdArr = [];
  }
  
  clearBoard() {
    console.log('called');
  	this.bdArr.forEach(function(row) {
    	row.forEach(function(piece) {
      	piece.kill();
      });
    });
  }

  createBoard() {
    var board = [];
    for (var i = 0; i < this.BOARD_SIZE; ++i) {
    	var row = [];
    	for (var j = 0; j < this.BOARD_SIZE; ++j) {
      	row.push(new Piece(i, j)); // update the neighbours
      }
      board.push(row);
    }

    this.bdArr = board;

    for (var i = 0; i < this.BOARD_SIZE; ++i) {
    	for (var j = 0; j < this.BOARD_SIZE; ++j) {
      	if (i-1 >= 0) this.bdArr[i][j].nbrs.push(this.bdArr[i-1][j]); // north
    		if (i+1 < this.BOARD_SIZE) this.bdArr[i][j].nbrs.push(this.bdArr[i+1][j]); // south
    		if (j-1 >= 0) this.bdArr[i][j].nbrs.push(this.bdArr[i][j-1]); // west
    		if (j+1 < this.BOARD_SIZE) this.bdArr[i][j].nbrs.push(this.bdArr[i][j+1]);
      }
    }
  }

  displayBoard() {
    var fd = this.currentMove + "~~~~~~~~~~~~~~~~~~~~\n";
    fd += "-0123456789012345678\n";
    for (var i = 0; i < this.BOARD_SIZE; ++i) {
    	var row = i%10 + "";
      for (var j = 0; j < this.BOARD_SIZE; ++j) {
      	row += this.bdArr[i][j].symbol;
      }
      row += "\n";
      fd += row;
    }
    fd += "~~~~~~~~~~~~~~~~~~~~~\n";
    console.log(fd);
  }

  play(i, j) {
    if (this.bdArr[i][j].symbol !== "+") {
    	return "Invalid move";
    }

    if (i >= this.BOARD_SIZE || j >= this.BOARD_SIZE || i < 0 || j < 0) {
    	return "Out of bounds";
    }

    this.currentMove++;
    var newPiece = this.bdArr[i][j];
    newPiece.symbol = this.blacksTurn ? "X" : "O";

    newPiece.updateHead();
      // check if your newly placed piece kills any surrounding pieces
    newPiece.nbrs.forEach(function(nbr) {
    	if (nbr.symbol !== "+" && nbr.symbol !== newPiece.symbol) {
      	if (nbr.blockIsDead()) {
        	nbr.killBlock();
        }
      }
    });

    // if it does not, then it is a suicide move, and you lose your piece.
    if (newPiece.blockIsDead()) { // this should be an invalid move...
    	newPiece.killBlock();
      return "Suicidal move";
    }

    this.blacksTurn = !this.blacksTurn;
    this.displayBoard();
    return "Played at (" + i + ", " + j + ")";
  }

  createBoardView() {
    var board = document.createElement('table');
    board.id = 'board';
    board.classList.add('no-spacing');
    for (var i = 0; i < this.BOARD_SIZE; ++i) {
    	var row = board.appendChild(document.createElement('tr'));
      for (var j = 0; j < this.BOARD_SIZE; ++j) {
      	var cell = row.appendChild(document.createElement('td'));
        var self = this;
       	var currentPiece = this.bdArr[i][j];
        var pieceView = cell.appendChild(document.createElement('div'));
        pieceView.innerHTML = "";
        if (currentPiece.symbol === "+") {
          pieceView.classList.add('no-piece');
        } else if (currentPiece.symbol === "O") {
        	pieceView.classList.add('white-piece');
        } else if (currentPiece.symbol === "X") {
          pieceView.classList.add('black-piece');
        }
        // no piece played
        cell.addEventListener('click', (function(i, j) {
          //try this
          return function() {
          	// it should CALL play, and then another function
            // which updates the DOM.
            var msg = self.play(i, j);
            self.updateBoardView();
            self.updateGameHistory(msg);
          	console.log(self.bdArr[i][j]);
        	}
        })(i, j));
      }
    }
    return board;
  }

  updateGameHistory(msg) {
    var history = document.getElementById('board-history');
    var newMove = document.createElement('li');
    newMove.innerHTML = msg;
    history.appendChild(newMove);
    history.scrollTop = history.scrollHeight;
  }

  updateBoardView() {
    var board = document.getElementById('board');
    board.parentNode.removeChild(board);
    var newBoard = this.createBoardView();
    document.getElementById('board-container').appendChild(newBoard);
  }

  setUpReset() {
    var reset = document.getElementById('reset-btn');
    var self = this;
  	reset.addEventListener('click', function() {
  		self.clearBoard();
      self.updateBoardView();
  	});
  }
}
