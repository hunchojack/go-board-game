// client side code;
var b = new Board();
b.createBoard();
var insertLocn = document.getElementById('board-container');
insertLocn.appendChild(b.createBoardView());
b.setUpReset();

//? connects a socket to the game obj?
