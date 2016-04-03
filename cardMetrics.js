"use strict";

class CardMetrics {
	constructor(id, name, boardId, boardName, cycleTime, estimate, startingTimestamp, endingTimestamp) {
		this.id = id;
		this.name = name;
		this.cycleTime = cycleTime;
		this.estimate = estimate;
		this.startingTimestamp = startingTimestamp;
		this.endingTimestamp = endingTimestamp;
		this.boardId = boardId;
		this.boardName = boardName;
	}

	getName() { return this.name; }
	getId() { return this.id; }
	getCycleTime() { return this.cycleTime; }
	getEstimate() { return this.estimate; }
	getStartingTimestamp() { return this.startingTimestamp; }
	getEndingTimestamp() { return this.endingTimestamp; }
	getBoardId() { return this.boardId; }
	getBoardName() { return this.boardName; }
}

module.exports = CardMetrics;
