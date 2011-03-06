var rectangle = function(x, y, width, height) {
	var obj = {
		x: x,
		y: y,
		width: width,
		height: height,
		ul: {
			x: x - width / 2,
			y: y - height / 2
		},
		lr: {
			x: x + width / 2,
			y: y + height / 2
		}
	};
	obj.intersects = function(r) {
		return (! ((obj.ul.x > r.lr.x) || (r.ul.x > obj.lr.x) || (obj.ul.y < r.lr.y) || (r.ul.y < obj.lr.y)));
	};
	obj.contains = function(point) {
		var w = obj.width,
		h = obj.height;
		if ((w | h) < 0) {
			// At least one of the dimensions is negative...
			return false;
		}
		// Note: if either dimension is zero, tests below must return false...
		var x = obj.x;
		var y = obj.y;
		if (point.x < x || point.y < y) {
			return false;
		}
		w += x;
		h += y;
		// overflow || intersect
		return ((w < x || w > point.x) && (h < y || h > point.y));
	};

	return obj;
};

