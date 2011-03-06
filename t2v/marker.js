var marker = function(position, width, height, defaultColor) {
	var pos = position,
	boundingBox = function() {
		return rectangle(pos.x - width / 2, pos.y - height / 2, width, height);
	};

	return {
		position: pos,
		boundingBox: boundingBox,
		draw: function(color) {
			context.fillStyle = color || defaultColor;
			var bounds = boundingBox();
			context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
		},
		moveTo: function(newPosition) {
			pos = newPosition;
		},
	};
};
