var Board = function() {
  this.currentMove = 0;
	this.BOARD_SIZE = 19;
  this.blacksTurn = true;
  this.bdArr = [];
  return this;
};

var Piece = function(i, j) {
	this.isHead = true;
  this.posx = i;
  this.posy = j;
  this.symbol = "+";
  this.parent = null;
  this.children = [];
  this.nbrs = [];
  return this;
};

Piece.prototype.killBlock = function() {
	var head = this.getHead();
  head.children.forEach(function(child) {
  	child.kill();
  });
  head.kill();
};

Piece.prototype.kill = function() {
	this.isHead = true;
  this.symbol = "+";
  this.children = [];
  this.parent = null;
};

Piece.prototype.blockIsDead = function() {
	var head = this.getHead(); // get the head of this block..
  if (head.hasQi() === true) return false;
  for (var i = 0; i < head.children.length; ++i) {
  	if (head.children[i].hasQi() === true) return false;
  }
  return true;
};

Piece.prototype.hasQi = function() {
	for (var i = 0; i < this.nbrs.length; ++i) {
		if (this.nbrs[i].symbol === "+") return true;
  }
  return false;
};

Piece.prototype.getHead = function() {
	return (this.isHead) ? (this) : (this.parent.getHead());
};

Piece.prototype.updateHead = function() {
  // this function makes 'this' the new head of all its neighbours
	this.nbrs.forEach(function(nbr) {
    if (nbr.symbol === this.symbol) {
    	var oldHead = nbr.getHead(); // if the head is yourself, then exit? seems hacky
      if (oldHead !== this) {
      	this.children = this.children.concat(oldHead.children, [oldHead]);
      	oldHead.isHead = false;
      	oldHead.parent = this;
  		}
    }
  }, this);
};

Board.prototype.clearBoard = function() {
	console.log('called');
	this.bdArr.forEach(function(row) {
  	row.forEach(function(piece) {
    	piece.kill();
    });
  });
}

Board.prototype.createBoard = function() {
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
};

Board.prototype.displayBoard = function() {
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
};

// needs to be able to check its neighbours

Board.prototype.play = function(i, j) {
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
  // update the head

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
};

Board.prototype.createBoardView = function() {
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
};

Board.prototype.updateGameHistory = function(msg) {
  var history = document.getElementById('board-history');
  var newMove = document.createElement('li');
  newMove.innerHTML = msg;
  history.appendChild(newMove);
  history.scrollTop = history.scrollHeight;
};

Board.prototype.updateBoardView = function() {
	var board = document.getElementById('board');
  board.parentNode.removeChild(board);
  var newBoard = this.createBoardView();
  document.getElementById('board-container').appendChild(newBoard);
};

Board.prototype.setUpReset = function() {
	var reset = document.getElementById('reset-btn');
  var self = this;
	reset.addEventListener('click', function() {
		self.clearBoard();
    self.updateBoardView();
	}); // will this work
}

var b = new Board();
b.createBoard();
var insertLocn = document.getElementById('board-container');
insertLocn.appendChild(b.createBoardView());
b.setUpReset();

// how to re-render the DOM though? after something has changed...
// b.play(7, 4);
// b.play(7, 3);
// b.play(7, 2);


// console.log(b.bdArr[5][2]);
// console.log(b.bdArr[5][2].qi);
// console.log(b.bdArr[7][2]);

// VIEW LAYER WILL BE DOWN HERE, USING react
