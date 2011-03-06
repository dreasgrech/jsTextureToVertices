var t2v = function (canvas, context, image, callback) {
	var markerFilename = "marker.png", defaultMarkerColor = '#FF0000', defaultFillColor = 'rgba(0, 0, 200, 0.5)', scale = 2,
	    library, width, height, markers = [];

	var marker = function (position) {
		var pos = position;
		return {
image: markerFilename, 
	       position: pos, 
	       draw: function (color) {
		       context.fillStyle = color || defaultMarkerColor;
		       context.fillRect(pos.x - 1, pos.y - 1, 2, 2);
	       }
		};
	};

	var clearCanvas = function () {
		context.clearRect(0, 0, width, height);
	};

	var drawMainImage = function (callback) {
		var im = new Image();
		im.onload = function () {
			width = im.width * scale;
			height = im.height * scale;

			canvas.width = width;
			canvas.height = height;

			library = initializer();
			library.drawImage(im, {x: 0, y: 0}, width, height);
			callback(library);
		};
		im.src = image;
	}, initializer = function () {
		var drawImage = function (image, position, width, height) {
			context.drawImage(image, position.x, position.y, width, height);
		}, addMarker = function (position, color) {
			color = color || defaultMarkerColor;
			var newMarker = marker(position);
			markers.push(newMarker);
			clearCanvas();
			drawMainImage(function (l) {
					drawPolygonFill();
					drawMarkers();
					});
		}, drawPolygonFill = function (color) {
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
		}, drawMarkers = function () {
			var i;
			for (i = 0; i < markers.length; ++i) {
				markers[i].draw();
			}

		},
		getVertices= function () {
		     var i, vertices = [];
		     for (i = 0; i < markers.length; ++i) {
			     vertices.push({x: markers[i].position.x * scale, y: markers[i].position.y * scale});
		     }
		     return vertices;
	     };

		return {width: width, height: height, 
			drawImage: drawImage,
			addMarker: addMarker,
			getVertices:getVertices
		};
	};

	drawMainImage(callback);
};
