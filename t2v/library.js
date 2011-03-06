var t2v = function(canvas, context, image, callback) {
	var markerFilename = "marker.png",
	markerWidth = 6,
	markerHeight = markerWidth,
	defaultMarkerColor = '#FF0000',
	defaultFillColor = 'rgba(0, 0, 200, 0.5)',
	scale = 1,
	library, width, height, markers = [];


	var clearCanvas = function() {
		context.clearRect(0, 0, width, height);
	};

	var drawMainImage = function(callback) {
		var im = new Image();
		im.onload = function() {
			width = im.width * scale;
			height = im.height * scale;

			canvas.width = width;
			canvas.height = height;

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
			context.drawImage(image, position.x, position.y, width, height);
		},
		addMarker = function(position, color) {
			color = color || defaultMarkerColor;
			var newMarker = marker(position, markerWidth, markerHeight, defaultMarkerColor);
			markers.push(newMarker);
			clearCanvas();
			drawMainImage(function(l) {
				drawPolygonFill();
				drawMarkers();
			});
		},
		drawPolygonFill = function(color) {
			color = color || defaultFillColor;
			var i;
			context.fillStyle = color;
			context.beginPath();
			context.moveTo(markers[0].position.x, markers[0].position.y);
			for (i = 1; i < markers.length; ++i) {
				context.lineTo(markers[i].position.x, markers[i].position.y);
			}
			context.closePath();
			context.fill();
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
					x: markers[i].position.x * scale,
					y: markers[i].position.y * scale
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
					//position = {x: position.x + mar
					if (markers[i].isPointOn(position)) {
						//console.log(markers[i].boundingBox());
						return markers[i];
					}
				}
			}
		};
	};

	drawMainImage(callback);
};

