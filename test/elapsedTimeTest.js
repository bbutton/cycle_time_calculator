"use strict";

var elapsedTime = require('../elapsedTime').elapsedTime;
var should = require('chai').should();
var moment = require('moment');

describe('elapsedTtime', function() {
  describe('same week', function() {
    it('should return 0 if same day', function() {
      var startDate = "2016-02-01";
      var endDate  = "2016-02-01";

      var diff = elapsedTime(startDate, endDate);

      diff.should.equal(0);
    }),
    it('should return 1 if consecutive weekdays', function() {
      var startDate = "2016-02-01";
      var endDate  = "2016-02-02";

      var diff = elapsedTime(startDate, endDate);

      diff.should.equal(1);
    }),
    it('should return 1 if started on Friday ended on Monday', function() {
      var startDate = "2016-02-05";
      var endDate  = "2016-02-08";

      var diff = elapsedTime(startDate, endDate);

      diff.should.equal(1);
    });
  });
});
