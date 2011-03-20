var marker = function(context, position, width, height, scale, defaultColor) {
	var pos = position,
	previousPos, _scale = scale,
	defaultSelectedColor = '#70E000',
	isSelected = false,
	boundingBox = function() {
		var topLeft = {
			x: vector2.multiply(pos, _scale).x - (width * _scale),
			y: vector2.multiply(pos, _scale).y - (height * _scale)
		};
		return rectangle(topLeft.x, topLeft.y, width * 2 * _scale, height * 2 * _scale);
	},
	showBoundingBox = function() {
		// This function is for debugging purposes
		context.fillStyle = 'rgba(0, 0, 200, 0.5)';
		context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
	},
	drawSelectedHighlighter = function(color) {
		drawCircle(vector2.multiply(pos, _scale), (width * _scale) + 2, color || defaultSelectedColor);
	},
	drawCircle = function(position, radius, color) {
		context.fillStyle = color;
		context.beginPath();
		context.arc(position.x, position.y, radius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	},
	draw = function(color) {
		if (isSelected) {
			drawSelectedHighlighter();
		}

		drawCircle(vector2.multiply(pos, _scale), width * _scale, color || defaultColor);
	};

	return {
		position: function() {
			return pos;
		},
		previousPosition: function() {
			return previousPos;
		},
		scaledPosition: function() {
			return vector2.multiply(pos, _scale);
		},
		draw: draw,
		scale: function(newScale) {
			if (typeof newScale !== "undefined") {
				_scale = newScale;
				draw();
				return;
			}
			return _scale;
		},
		boundingBox: boundingBox,
		moveTo: function(newPosition) { // Do not call this function directly; use the delegation through the main library.
			previousPos = vector2(pos);
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
