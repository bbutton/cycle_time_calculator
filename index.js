"use strict";

var Trello = require("trello");
var _ = require("lodash");
var moment = require("moment");

var memberId = "me";
var trello = new Trello("055e3f1d72f6c94bc38c02276978f71f", "edf7869844f0f8429d39d5c23e0c05998f5d5d0e9f0c6a26e07a2f2885ebd092");

var capacityPlanningBoard = null;

var ListData = function(listName) {
  this._listName = listName;
  this._meanDuration = 0;
  this._medianDuration = 0;
};

var BoardData = function(lists) {
  this._lists = lists;
  this._cards = [];
};

BoardData.prototype.lists = function() {
  return this._lists;
};

BoardData.prototype.addCard = function(card) {
  this._cards.push(card);
};

var CardData = function(cardId, cardName) {
  this._cardId = cardId;
  this._cardName = cardName;
  this._durationInList = [];
  this._elapsedTime = 0;
};

function findCorrectBoard(boards, boardName) {
    return _.find(boards, function(board) {
        return board.name == boardName;
    });
}

function findCompleteList(lists) {
    return _.find(lists, (list) => { return list.name == "Complete"; });
}

function getListsForBoard(boardId) {
    capacityPlanningBoard = new BoardData(trello.getListsOnBoard(boardId));
    return capacityPlanningBoard.lists();
}

function getAllCardsForList(listId) {
    var cards = trello.getCardsForList(listId, "createCard,updateCard:closed,updateCard:idList,deleteCard");
  _.forEach(cards, (card) => { capacityPlanningBoard.addCard(card); });
  return cards;
}

function removeHeaderCards(cards) {
    return _.reject(cards, (card) => { return card.name.indexOf("#header") > -1; });
}

function getAllActions(blackboard) {
    return trello.getActionsForList(blackboard.list, null);
}

function startingTimestamp(actions) { return actions[0].date; }
function endTimestamp(actions) { var endIndex = actions.length - 1; return actions[endIndex].date; }

function elapsedTime(actions) {
    var startDate = moment(startingTimestamp(actions));
    var endDate = moment(endTimestamp(actions));

    return startDate.diff(endDate, 'days');
}

function dumpCards(cards) {
    _.each(cards, (card) => {
        console.log(card.name + " : " + card.id + " : " + "isClosed:" + " : " +  card.closed + " : " + elapsedTime(card.actions) + " days");

        _.forEachRight(card.actions, (action) => {
            var result = "";
            if(action.type == "createCard") {
                result += "\t" + action.date + " : " + action.type;
            } else if(action.type == "updateCard") {
                if(action.data.listBefore != null) {
                    result += "\t" + action.date + " : " + action.type + ": " + action.data.listBefore.name + "->" + action.data.listAfter.name;
                }
            }

            if(result.length > 0) {
                console.log(result);
            }
        });
    });
}

function processCards(lookbackPeriods, cards) {
    var lookbackPeriod = lookbackPeriods[0];

    console.log("Total completed cards: " + cards.length);

    dumpCards(cards);
}

trello.getBoards(memberId)
    .then((boards) => { return findCorrectBoard(boards, "Capacity Planning"); })
    .then((capacityPlanningBoard) => { return getListsForBoard(capacityPlanningBoard.id); })
    .then((lists) => { return findCompleteList(lists); })
    .then((completeList) => { return getAllCardsForList(completeList.id); })
    .then((allCompletedCards) => { return removeHeaderCards(allCompletedCards); })
    .then((cards) => { processCards([30], cards); })
    .then(null, (error) => { console.log("error:" + error); });
