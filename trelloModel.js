"use strict";

let _ = require('lodash');
let moment = require('moment');

class TrelloModel {
	constructor() {
	}

	findCorrectBoard(boards, boardName) {
		return _.find(boards, (board) => {return board.name == boardName; });
	}

	lastWorkingAction(actions) {
		return _.findLast(actions, (action) => {return action.data.listAfter && action.data.listAfter.name == 'Working'; });
	}

	lastCompleteAction(actions) {
		return _.findLast(actions, (action) => {return action.data.listAfter && action.data.listAfter.name == 'Complete'; });
	}

	startingTimestamp(actions) {
	  let card = this.lastWorkingAction(actions);
	  return card.date;
	}

	endTimestamp(actions) {
	  let card = this.lastCompleteAction(actions);
	  return card.date;
	}

	elapsedTime(startTime, endTime) {
	  var startMoment = moment(startTime);
	  var endMoment = moment(endTime);

	  var dayCount = 0;
	  for(var start = startMoment; start.isBefore(endMoment.startOf('day')); start = start.add(1, 'days')) {
	    if(!(start.weekday() == 0 || start.weekday() == 6)) {
	      dayCount++;
	    }
	  }

	  return dayCount;
	}
	
	getEstimate(card) {
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
}

module.exports = TrelloModel;
