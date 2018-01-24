class Piece {
	constructor(i,j) {
		this.isHead = true;
	  this.posx = i;
	  this.posy = j;
	  this.symbol = "+";
	  this.parent = null;
	  this.children = [];
	  this.nbrs = [];
	}

	killBlock() {
		var head = this.getHead();
  	head.children.forEach(function(child) {
  		child.kill();
  	});
  	head.kill();
	}

	kill() {
		this.isHead = true;
  	this.symbol = "+";
  	this.children = [];
  	this.parent = null;
	}

	blockIsDead() {
		var head = this.getHead(); // get the head of this block..
	  if (head.hasQi() === true) return false;
	  for (var i = 0; i < head.children.length; ++i) {
	  	if (head.children[i].hasQi() === true) return false;
	  }
	  return true;
	}

	hasQi() {
		for (var i = 0; i < this.nbrs.length; ++i) {
			if (this.nbrs[i].symbol === "+") return true;
  	}
  	return false;
	}

	getHead() {
		return (this.isHead) ? (this) : (this.parent.getHead());
	}

	updateHead() {
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
	}
}
