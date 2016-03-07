"use strict";

let _ = require('lodash');

class TrelloModel {
	constructor() {
	}

	findCorrectBoard(boards, boardName) {
		return _.find(boards, (board) => {return board.name == boardName; });
	}
}

module.exports = TrelloModel;
