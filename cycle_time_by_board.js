"use strict";

let _ = require("lodash");
let TrelloGateway = require("./trelloGateway");
let TrelloModel = require("./trelloModel");
let CardMetrics = require('./cardMetrics');

var memberId = "me";
var trelloId = process.env.TRELLO_ID;
var trelloToken = process.env.TRELLO_TOKEN;
//var boardName = process.env.TRELLO_BOARD;
var boardName = "Feature Team: Platform Security";

console.log("TRELLO_ID is " + trelloId);
console.log("TRELLO_TOKEN is " + trelloToken);
console.log("TRELLO_BOARD is " + boardName);

let trelloGateway = new TrelloGateway(trelloId, trelloToken);
let trelloModel = new TrelloModel();

function calculateCycleTime(cards) {
  let collectedMetrics = [];

  _.each(cards, (card) => {
    if (trelloModel.lastWorkingAction(card.actions) === undefined || trelloModel.lastCompleteAction(card.actions) === undefined) {
      console.log("Skipping " + card.name);
      return;
    }

    let startingTimestamp = trelloModel.startingTimestamp(card.actions);
    let endingTimestamp = trelloModel.endTimestamp(card.actions);

    let cycleTime = trelloModel.elapsedTime(startingTimestamp, endingTimestamp);
    let estimate = trelloModel.getEstimate(card);

    let cardMetrics = new CardMetrics(card.id, card.name, cycleTime, estimate, startingTimestamp, endingTimestamp);
    collectedMetrics.push(cardMetrics);
  });

  return collectedMetrics;
}

function displayCycleTimes(cards, collectedMetrics) {
  console.log("Total cards: " + cards.length);
  console.log("Metrics collected for " + collectedMetrics.length + " cards.");

  console.log("cycle time\testimate\tcard name");

  var errorLog = [];
  _.each(collectedMetrics, (cardMetrics) => {
    if(cardMetrics.getEstimate() != 9999) {
      console.log(cardMetrics.getCycleTime() + "," + cardMetrics.getEstimate() + ",\"" + cardMetrics.getName() + "\"");
    } else {
      errorLog.push(cardMetrics.getCycleTime() + " days, estimate: " + cardMetrics.getEstimate() + " - \"" + cardMetrics.getName() + "\"");
    }
  });

  _.each(errorLog, (error) => { console.error(error); });
}

function createCycleTimeHistogram(collectedMetrics) {
  var histogram = new Object();
  _.each(collectedMetrics, (cardMetrics) => {
    if (! histogram[cardMetrics.getEstimate()])
      histogram[cardMetrics.getEstimate()] = new Array();

    if ( histogram[cardMetrics.getEstimate()][cardMetrics.getCycleTime()] )
      histogram[cardMetrics.getEstimate()][cardMetrics.getCycleTime()] += 1;
    else
      histogram[cardMetrics.getEstimate()][cardMetrics.getCycleTime()] = 1;
  });

  return histogram;
}

function displayHistogram(histogram) {
  _.each(histogram, (value, key) => {
    console.log(key + "," + value);
  });
}

function processCards(cards) {

  let collectedMetrics = calculateCycleTime(cards);
  displayCycleTimes(cards, collectedMetrics);

  var histogram = createCycleTimeHistogram(collectedMetrics);
  displayHistogram(histogram);
}

trelloGateway.getBoards(memberId)
  .then((boards) => { return trelloModel.findCorrectBoard(boards, boardName); })
  .then((board) => { return trelloGateway.getAllCardsForBoard(board); })
  .then((cards) => { processCards(cards); })
  .then(null, (error) => { console.log("error:" + error); });
