"use strict";

var Trello = require("trello");
var _ = require("lodash");
var moment = require("moment");
var rest = require('restler');
var elapsedTime = require("./elapsedTime").elapsedTime;

var memberId = "me";

console.log("TRELLO_ID is " + process.env.TRELLO_ID);
console.log("TRELLO_TOKEN is " + process.env.TRELLO_TOKEN);
console.log("TRELLO_BOARD is " + process.env.TRELLO_BOARD);
console.log("TRELLO_DAYS_BACK is " + process.env.TRELLO_DAYS_BACK );

var trello = new Trello(process.env.TRELLO_ID, process.env.TRELLO_TOKEN);

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
  return _.findLast(actions, (action) => {return action.data.listAfter && action.data.listAfter.name == 'Working'; });
}

function lastCompleteAction(actions) {
  return _.findLast(actions, (action) => {return action.data.listAfter && action.data.listAfter.name == 'Complete'; });
}

function startingTimestamp(actions) {
  var card = lastWorkingAction(actions);
  return card.date;
}

function endTimestamp(actions) {
  var card = lastCompleteAction(actions);
  return card.date;
}

function getEstimate(card) {

  var estimate = undefined;
  _.each(card.labels, (label) => { 
    var regex = /^([0-9])[ ]*-/;
    var result = label.name.match(regex);
    if(result != null) {
      estimate = result[1];
    }
  });

  return estimate;
}

function processCards(cards, days_back) {

  var errorLog = [];

  console.log("Total cards: " + cards.length);

  console.log("cycle time\testimate\tcard name");
  var histogram = new Object();

    _.each(cards, (card) => { 
       if (lastWorkingAction(card.actions) === undefined || lastCompleteAction(card.actions) === undefined) {
         console.error( "Skipping unfinished card " + card.name + ", " + card.shortUrl );
         return;
       }
       if ( moment().subtract(days_back, 'days').isAfter(startingTimestamp(card.actions) ) ) {
         console.error( "Skipping old card " + card.name + ", " + card.shortUrl );
         return;
       }

       var cycleTime = elapsedTime(startingTimestamp(card.actions), endTimestamp(card.actions));
       var estimate = getEstimate(card);

       if(estimate != 9999) {
         console.log(cycleTime + "," + estimate + ",\"" + card.name + "\"");
       } else {
         errorLog.push(cycleTime + " days, estimate: " + estimate + " - \"" + card.name + "\"");
       }

      if (! histogram[estimate]) {
        histogram[estimate] = new Array();
        histogram[estimate]["count"] = 0;
        histogram[estimate]["total"] = 0;
      }

      if ( histogram[estimate][cycleTime] )
        histogram[estimate][cycleTime] += 1;
      else
        histogram[estimate][cycleTime] = 1;

      histogram[estimate]["total"] += cycleTime;
      histogram[estimate]["count"] += 1;

    });

    _.each(histogram, (value, key) => {
      console.log(key + "," + value);
    });

    _.each(histogram, (value, key) => {
      console.log("Average for estimate " + key + ": " + histogram[key]["total"] / histogram[key]["count"] );
    });

  _.each(errorLog, (error) => { console.error(error); });
}

trello.getBoards(memberId)
    .then((boards) => { return findCorrectBoard(boards, process.env.TRELLO_BOARD); })
    .then((board) => { return getAllCardsForBoard(board); })
    .then((cards) => { processCards(cards, process.env.TRELLO_DAYS_BACK); })
    .then(null, (error) => { console.log("error:" + error); });
