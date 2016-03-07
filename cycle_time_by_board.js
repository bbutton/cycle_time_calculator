"use strict";

let _ = require("lodash");
let TrelloGateway = require("./trelloGateway");
let TrelloModel = require("./trelloModel");

var memberId = "me";
var trelloId = process.env.TRELLO_ID;
var trelloToken = process.env.TRELLO_TOKEN;
var boardName = process.env.TRELLO_BOARD;

console.log("TRELLO_ID is " + trelloId);
console.log("TRELLO_TOKEN is " + trelloToken);
console.log("TRELLO_BOARD is " + boardName);

let trelloGateway = new TrelloGateway(trelloId, trelloToken);
let trelloModel = new TrelloModel();

function findCorrectBoard(boards, boardName) {
  return trelloModel.findCorrectBoard(boards, boardName);
}

function lastWorkingAction(actions) {
  return trelloModel.lastWorkingAction(actions);
}

function lastCompleteAction(actions) {
  return trelloModel.lastCompleteAction(actions);
}

function startingTimestamp(actions) {
  return trelloModel.startingTimestamp(actions);
}

function endTimestamp(actions) {
  return trelloModel.endTimestamp(actions);
}

function getEstimate(card) {
  return trelloModel.getEstimate(card);
}

function processCards(cards) {

  var errorLog = [];

  console.log("Total cards: " + cards.length);

  console.log("cycle time\testimate\tcard name");
  var histogram = new Object();

  _.each(cards, (card) => {
    if (trelloModel.lastWorkingAction(card.actions) === undefined || trelloModel.lastCompleteAction(card.actions) === undefined) {
      return;
    }
    var cycleTime = trelloModel.elapsedTime(trelloModel.startingTimestamp(card.actions), trelloModel.endTimestamp(card.actions));
    var estimate = trelloModel.getEstimate(card);
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

trelloGateway.getBoards(memberId)
  .then((boards) => { return trelloModel.findCorrectBoard(boards, boardName); })
  .then((board) => { return trelloGateway.getAllCardsForBoard(board); })
  .then((cards) => { processCards(cards); })
  .then(null, (error) => { console.log("error:" + error); });
