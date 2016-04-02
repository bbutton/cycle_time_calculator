"use strict";

class CardMetrics {
	constructor(id, name, cycleTime, estimate) {
		this.id = id;
		this.name = name;
		this.cycleTime = cycleTime;
		this.estimate = estimate;
	}

	getName() { return this.name; }
	getId() { return this.id; }
	getCycleTime() { return this.cycleTime; }
	getEstimate() { return this.estimate; }
}

module.exports = CardMetrics;
