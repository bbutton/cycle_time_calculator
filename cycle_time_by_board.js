"use strict";

let _ = require("lodash");
let TrelloGateway = require("./trelloGateway");
let TrelloModel = require("./trelloModel");
let CardMetrics = require('./cardMetrics');

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

  let collectedMetrics = []

  _.each(cards, (card) => {
    if (trelloModel.lastWorkingAction(card.actions) === undefined || trelloModel.lastCompleteAction(card.actions) === undefined) {
      return;
    }

    let cycleTime = trelloModel.elapsedTime(trelloModel.startingTimestamp(card.actions), trelloModel.endTimestamp(card.actions));
    let estimate = trelloModel.getEstimate(card);

    let cardMetrics = new CardMetrics(card.id, card.name, cycleTime, estimate);
    collectedMetrics.push(cardMetrics);
  });

  _.each(collectedMetrics, (cardMetrics) => {
    if(cardMetrics.getEstimate() != 9999) {
      console.log(cardMetrics.getCycleTime() + "," + cardMetrics.getEstimate() + ",\"" + cardMetrics.getName() + "\"");
    } else {
      errorLog.push(cardMetrics.getCycleTime() + " days, estimate: " + cardMetrics.getEstimate() + " - \"" + cardMetrics.getName() + "\"");
    }

    if (! histogram[cardMetrics.getEstimate()])
      histogram[cardMetrics.getEstimate()] = new Array();

    if ( histogram[cardMetrics.getEstimate()][cardMetrics.getCycleTime()] )
      histogram[cardMetrics.getEstimate()][cardMetrics.getCycleTime()] += 1;
    else
      histogram[cardMetrics.getEstimate()][cardMetrics.getCycleTime()] = 1;
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
