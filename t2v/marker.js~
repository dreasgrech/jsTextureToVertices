var marker = function(context, position, width, height, defaultColor) {
	var pos = position;
	var boundingBox = function() {
		var topLeft = {x: pos.x - width/2, y: pos.y - height/2};
		return rectangle(topLeft.x, topLeft.y, width, height);
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
			console.log(pos);
		},
		isPointOn: function (point) {
			return boundingBox().contains(point);
		}
	};
};
