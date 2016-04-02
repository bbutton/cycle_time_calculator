"use strict";

let rest = require('restler');
let Trello = require('trello');

function makeRequest(fn, uri, options) {
        return new Promise(function(resolve, reject) {
            fn(uri, options)
                .once('complete', function (result) {
                    if (result instanceof Error) {
                        reject(result);
                    } else {
                        resolve(result);
                    }
                });
        });
}

class TrelloGateway {
	constructor(trelloDevKey, trelloToken) {
		this.trello = new Trello(trelloDevKey, trelloToken);
	}

	getAllCardsForBoard(board) {
	  let query = this.trello.createQuery();
	  query.actions = "createCard,updateCard:closed,updateCard:idList,deleteCard";
	  query.filter = "all";
	  return makeRequest(rest.get, this.trello.uri + '/1/boards/' + board.id + '/cards', {query: query});
	}

	getBoards(memberId) {
		return this.trello.getBoards(memberId);
	}
}

module.exports = TrelloGateway;
