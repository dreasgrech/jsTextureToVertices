var marker = function(position, width, height, defaultColor) {
	var pos = {x: position.x - width/2, y: position.y - height/2},
	boundingBox = function() {
		return rectangle(pos.x, pos.y, width, height);
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
		isPointOn: function (point) {
				   //point = {x: point.x + width/2, y: point.y + height/2};
				   console.log(point);
				   //console.log(boundingBox());
				   //console.log(boundingBox().contains(point));
				   console.log();
				   return boundingBox().contains(point);
			   }
	};
};
