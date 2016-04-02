"use strict";

class CardMetrics {
	constructor(id, name, cycleTime, estimate, startingTimestamp, endingTimestamp) {
		this.id = id;
		this.name = name;
		this.cycleTime = cycleTime;
		this.estimate = estimate;
		this.startingTimestamp = startingTimestamp;
		this.endingTimestamp = endingTimestamp;
	}

	getName() { return this.name; }
	getId() { return this.id; }
	getCycleTime() { return this.cycleTime; }
	getEstimate() { return this.estimate; }
	getStartingTimestamp() { return startingTimestamp; }
	getEndingTimestamp() { return endingTimestamp; }
}

module.exports = CardMetrics;
