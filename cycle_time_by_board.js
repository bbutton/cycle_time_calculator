"use strict";

var Trello = require("trello");
var _ = require("lodash");
var moment = require("moment");
var elapsedTime = require("./elapsedTime").elapsedTime;

var memberId = "me";
var trelloId = process.env.TRELLO_ID;
var trelloToken = process.env.TRELLO_TOKEN;
var boardName = process.env.TRELLO_BOARD;

console.log("TRELLO_ID is " + trelloId);
console.log("TRELLO_TOKEN is " + trelloToken);
console.log("TRELLO_BOARD is " + boardName);

var trello = new Trello(trelloId, trelloToken);
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

function findCorrectBoard(boards, boardName) {
    return _.find(boards, function(board) {
        return board.name == boardName;
    });
}

function getAllCardsForBoard(board) {
  var query = trello.createQuery();
  query.actions = "createCard,updateCard:closed,updateCard:idList,deleteCard";
  query.filter = "all";
  return makeRequest(rest.get, trello.uri + '/1/boards/' + board.id + '/cards', {query: query});
}

function lastWorkingAction(actions) {
  return _.findLast(actions, (action) => {return action.data.listAfter && action.data.listAfter.name == 'Working' });
}

function lastCompleteAction(actions) {
  return _.findLast(actions, (action) => {return action.data.listAfter && action.data.listAfter.name == 'Complete' });
}

function startingTimestamp(actions) {
  var card = lastWorkingAction(actions);
  return card.date;
}

function endTimestamp(actions) {
  var card = lastCompleteAction(actions);
  return card.date;
}

// function getElapsedTime(startTime, endTime) {
//   var startDate = moment(startTime);
//   var endDate = moment(endTime);

//   return endDate.diff(startDate, 'days');
// }

function processCards(cards) {

    console.log("Total cards: " + cards.length);

     _.each(cards, (card) => { 
        if (lastWorkingAction(card.actions) === undefined || lastCompleteAction(card.actions) === undefined) {
          return;
        }
        var cycleTime = elapsedTime(startingTimestamp(card.actions), endTimestamp(card.actions));
        console.log(cycleTime + " days - " + card.name);
     });
}

trello.getBoards(memberId)
    .then((boards) => { return findCorrectBoard(boards, boardName); })
    .then((board) => { return getAllCardsForBoard(board); })
    .then((cards) => { processCards(cards); })
    .then(null, (error) => { console.log("error:" + error); });
