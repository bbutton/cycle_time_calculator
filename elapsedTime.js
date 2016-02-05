"use strict";

var _ = require("lodash");
var moment = require("moment");

module.exports.elapsedTime = function(startTime, endTime) {
  var startMoment = moment(startTime);
  var endMoment = moment(endTime);

  var dayCount = 0;
  for(var start = startMoment; start.isBefore(endMoment.startOf('day')); start = start.add(1, 'days')) {
    if(!(start.weekday() == 0 || start.weekday() == 6)) {
      dayCount++;
    }
  }

  return dayCount;
};

