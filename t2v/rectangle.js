var rectangle = function(x, y, width, height) {
	var xCoor = x, yCoor = y,
	obj = {
		x: xCoor,
		y: yCoor,
		width: width,
		height: height,
		ul: {
			x: xCoor - width / 2,
			y: yCoor - height / 2
		},
		lr: {
			x: xCoor + width / 2,
			y: yCoor + height / 2
		}
	};

	obj.intersects = function(r) {
		return (! ((obj.ul.x > r.lr.x) || (r.ul.x > obj.lr.x) || (obj.ul.y < r.lr.y) || (r.ul.y < obj.lr.y)));
	};

	obj.contains = function(point) {
		return (obj.x < point.x && obj.y < point.y) && point.x < obj.x + width && point.y < obj.y + height;
	};

	return obj;
};

