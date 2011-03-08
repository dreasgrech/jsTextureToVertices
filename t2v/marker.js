var marker = function(index, context, position, width, height, defaultColor) {
	var pos = position,
	isSelected = false,
	boundingBox = function() {
		var topLeft = {
			x: pos.x - width,
			y: pos.y - height
		};
		return rectangle(topLeft.x, topLeft.y, width * 2, height * 2);
	},
	showBoundingBox = function() {
		// This function is for debugging purposes
		context.fillStyle = 'rgba(0, 0, 200, 0.5)';
		context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
	};

	return {
		index: index,
		position: function() {
			return pos;
		},
		boundingBox: boundingBox,
		draw: function(color) {
			var bounds = boundingBox();
			context.fillStyle = color || defaultColor;

			context.beginPath();
			context.arc(pos.x, pos.y, width, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();

		},
		moveTo: function(newPosition) {
			pos = newPosition;
		},
		isPointOn: function(point) {
			return boundingBox().contains(point);
		},
		setSelected: function() {

		},
		isSelected: function() {

		}
	};
};

