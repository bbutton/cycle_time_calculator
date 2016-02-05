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

function getEstimate(card) {

  var estimate = 9999;
  _.each(card.labels, (label) => { 
    var regex = /^([0-9])[ ]*-/;
    var result = label.name.match(regex);
    if(result != null) {
      estimate = result[1];
    }
  });

  return estimate;
}

function processCards(cards) {

  var errorLog = [];

    console.log("Total cards: " + cards.length);

  console.log("cycle time\testimate\tcard name");
  var histogram = new Object();

    _.each(cards, (card) => { 
        if (lastWorkingAction(card.actions) === undefined || lastCompleteAction(card.actions) === undefined) {
          return;
        }
       var cycleTime = elapsedTime(startingTimestamp(card.actions), endTimestamp(card.actions));
       var estimate = getEstimate(card);
       if(estimate != 9999) {
         console.log(cycleTime + "," + estimate + ",\"" + card.name + "\"");
       } else {
         errorLog.push(cycleTime + " days, estimate: " + estimate + " - \"" + card.name + "\"");
       }

      if (! histogram[estimate])
        histogram[estimate] = new Array();

      if ( histogram[estimate][cycleTime] )
        histogram[estimate][cycleTime] += 1;
      else
        histogram[estimate][cycleTime] = 1;
    });

  _.each(histogram, (value, key) => {
    console.log(key + "," + value);
  });

  _.each(errorLog, (error) => { console.error(error); });
}

trello.getBoards(memberId)
    .then((boards) => { return findCorrectBoard(boards, boardName); })
    .then((board) => { return getAllCardsForBoard(board); })
    .then((cards) => { processCards(cards); })
    .then(null, (error) => { console.log("error:" + error); });
