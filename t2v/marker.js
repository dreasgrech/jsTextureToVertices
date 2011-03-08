var marker = function(index, context, position, width, height, defaultColor) {
	var pos = position,
	defaultSelectedColor = '#70E000',
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
	},
	drawSelectedHighlighter = function(color) {
		drawCircle(pos, width + 2, color || defaultSelectedColor);
	},
	drawCircle = function(position, radius, color) {
		context.fillStyle = color;
		context.beginPath();
		context.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	};

	return {
		index: index,
		position: function() {
			return pos;
		},
		boundingBox: boundingBox,
		draw: function(color) {
			if (isSelected) {
				drawSelectedHighlighter();
			}

			drawCircle(pos, width, color || defaultColor);
		},
		moveTo: function(newPosition) {
			pos = newPosition;
		},
		isPointOn: function(point) {
			return boundingBox().contains(point);
		},
		select: function() {
		     isSelected = true;

		},
		unselect: function() {
		     isSelected = false;
		}
	};
};

