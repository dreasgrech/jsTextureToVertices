var marker = function(context, position, width, height, scale, defaultColor) {
	var pos = position,
	_scale = scale,
	defaultSelectedColor = '#70E000',
	isSelected = false,
	boundingBox = function() {
		var topLeft = {
			x: pos.x - (width * _scale),
			y: pos.y - (height * _scale)
		};
		return rectangle(topLeft.x, topLeft.y, width * 2 * _scale, height * 2 * _scale);
	},
	showBoundingBox = function() {
		// This function is for debugging purposes
		context.fillStyle = 'rgba(0, 0, 200, 0.5)';
		context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
	},
	drawSelectedHighlighter = function(color) {
		drawCircle(pos, (width * _scale) + 2, color || defaultSelectedColor);
	},
	drawCircle = function(position, radius, color) {
		context.fillStyle = color;
		context.beginPath();
		context.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	};

	return {
		position: function() {
			return pos;
		},
		scale: function(newScale) {
			if (typeof newScale !== "undefined") {
				_scale = newScale;
				return;
			}
			return _scale;
		},
		boundingBox: boundingBox,
		draw: function(color) {
			if (isSelected) {
				drawSelectedHighlighter();
			}

			drawCircle(pos, width * _scale, color || defaultColor);
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
		},
		isSelected: function() {
			return isSelected;
		}
	};
};

