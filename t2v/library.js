var t2v = function(imageCanvas, imageContext, polygonCanvas, polygonContext, image, maxVertices, callback) {
	var markerWidth = 10,
	markerHeight = markerWidth,
	defaultMarkerColor = '#FF0000',
	defaultFillColor = 'rgba(0, 0, 200, 0.5)',
	scale = 1,
	library, width, height, markers = [];

	var clearCanvas = function() {
		polygonContext.clearRect(0, 0, width, height);
	};

	var drawMainImage = function(callback) {
		var im = new Image();
		im.onload = function() {
			width = im.width * scale;
			height = im.height * scale;

			imageCanvas.width = width;
			imageCanvas.height = height;
			polygonCanvas.width = width;
			polygonCanvas.height = height;

			library = initializer();
			library.drawImage(im, {
				x: 0,
				y: 0
			},
			width, height);
			callback(library);
		};
		im.src = image;
	},
	initializer = function() {
		var drawImage = function(image, position, width, height) {
			imageContext.drawImage(image, position.x, position.y, width, height);
		},
		addMarker = function(position, color) {
			if (markers.length + 1 > maxVertices) {
				return;
			}
			color = color || defaultMarkerColor;
			var newMarker = marker(markers.length, polygonContext, position, markerWidth, markerHeight, defaultMarkerColor);
			markers.push(newMarker);
		},
		drawPolygonFill = function(color) {
			if (markers.length == 0) {
				return;
			}
			color = color || defaultFillColor;
			var i;
			polygonContext.fillStyle = color;
			polygonContext.beginPath();
			polygonContext.moveTo(markers[0].position().x, markers[0].position().y);
			for (i = 1; i < markers.length; ++i) {
				polygonContext.lineTo(markers[i].position().x, markers[i].position().y);
			}
			polygonContext.closePath();
			polygonContext.fill();
		},
		drawMarkers = function() {
			var i;
			for (i = 0; i < markers.length; ++i) {
				markers[i].draw();
			}

		},
		getVertices = function() {
			var i, vertices = [];
			for (i = 0; i < markers.length; ++i) {
				vertices.push({
					x: markers[i].position().x * scale,
					y: markers[i].position().y * scale
				});
			}
			return vertices;
		};

		return {
			width: width,
			height: height,
			drawImage: drawImage,
			addMarker: addMarker,
			getVertices: getVertices,
			getMarkerAt: function(position) {
				var i;
				for (i = 0; i < markers.length; ++i) {
					if (markers[i].isPointOn(position)) {
						return markers[i];
					}
				}
			},
			update: function() {
				clearCanvas();
				drawPolygonFill();
				drawMarkers();
			},
			moveMarker: function(marker, position) {
				markers[marker.index].moveTo(position);
			}
		};
	};

	drawMainImage(callback);
};

