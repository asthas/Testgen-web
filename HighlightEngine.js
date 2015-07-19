'use strict';

var HighlightEngine = function(spec) {
	this.cases = spec.description;

	var getBackgroundColorFor = function(coverage) {
		if (coverage === 0) {
			return '#FF0000';
		} else if (coverage < 99) {
			return '#FFFF00';
		} else {
			return '#00FF00';
		}
	}

	this.getArguments = function() {
		return this.cases.map(function(_case) {
			var fromLine = {
				line: _case.line - 1,
				ch: 0
			};
			var toLine = {
				line: _case.line ,
				ch: 0
			};
			var options = {
				css: 'background-color: ' + getBackgroundColorFor(_case.coverage)
			}
			return [fromLine, toLine, options];
		});
	}
};

module.exports = HighlightEngine;