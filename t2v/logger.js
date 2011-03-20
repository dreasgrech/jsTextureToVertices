var logger = function() {
	var line = function(message) {

	},
	lines = [];

	return {
		log: function(message) {
			lines.push(message);
		},
		history: function(lineBreak) {
			return lines.join(lineBreak);
		}
	};
};
