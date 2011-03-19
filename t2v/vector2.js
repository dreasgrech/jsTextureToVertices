var vector2 = function(x, y) {
	if (x && typeof x.x !== "undefined" && typeof x.y !== "undefined") { // passed in an object containing x and y, rather than seperate x and y coordinates
		y = x.y;
		x = x.x;
	}

	var liesBetween = function(line) { // 'line' is assumed to be an array of two vectors
		// TODO: put reference to code (from stackoverflow)
		var epsilon = 200, a = line[0], b = line[1], c = out,
		crossproduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y);
		if (Math.abs(crossproduct) > epsilon) {
			return false;
		}

		var dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y);
		if (dotproduct < 0) {
			return false;
		}

		var squaredlengthba = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
		if (dotproduct > squaredlengthba) {
			return false;
		}
		return true;
	}, out = {
		x: x,
		y: y,
		isOnLine: liesBetween
	}, round = function (value, decimalPlaces) {
		var n = 10 * decimalPlaces;
		return Math.round(value * n) / n;
	}, isBetween = function (value, n1, n2) {
		var max = Math.max(n1, n2), min = Math.min(n1, n2);
		return value > min && value < max;
	};

	return out;
};

// The Math.ceil in the vector2 static functions will probably be removed later on (I forgot why I put them in...)

vector2.divide = function (vector, scalar) {
		return vector2(Math.ceil(vector.x / scalar), Math.ceil(vector.y / scalar));
};

vector2.multiply = function (vector, scalar) {
		return vector2(Math.ceil(vector.x * scalar), Math.ceil(vector.y * scalar));
};

vector2.areEqual = function (vectorA, vectorB) {
		return vectorA.x == vectorB.x && vectorA.y == vectorB.y;
};
