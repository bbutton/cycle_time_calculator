"use strict";

var rest = require('restler');

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

module.exports.getAllCardsForBoard = function(trello, board) {
  var query = trello.createQuery();
  query.actions = "createCard,updateCard:closed,updateCard:idList,deleteCard";
  query.filter = "all";
  return makeRequest(rest.get, trello.uri + '/1/boards/' + board.id + '/cards', {query: query});
}

module.exports.getBoards = function(trello, memberId) {
	return trello.getBoards(memberId);
}
