var vector2 = function(x, y) {
	var liesBetween = function(line) { // line is assumed to be an array of two vectors
		if (line.length != 2) {
			throw "A line needs two points, no less and I certainly don't want more; just give me the edges";
		}
		var a = line[0],
		b = line[1],
		c = {
			x: x,
			y: y
		};
		var crossproduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y);

	};
	return {
		x: x,
		y: y
	};
};

