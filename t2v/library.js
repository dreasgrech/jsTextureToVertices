var t2v = function(imageCanvas, imageContext, polygonCanvas, polygonContext, image, maxVertices, callback) {
	var markerWidth = 3,
	markerHeight = markerWidth,
	defaultMarkerColor = '#FF0000',
	defaultLastMarkerColor = '#002EB8',
	defaultFillColor = 'rgba(0, 0, 200, 0.5)',
	scale = 1,
	library, width, height, markers = [],
	clearCanvas = function() {
		polygonContext.clearRect(0, 0, width, height);
	},
	clearMarkers = function(markers) {
		markers.length = 0;
	},
	drawLoadedImage = function(im) {
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
	},
	drawMainImage = function(callback) {
		var im = document.createElement("img"); // like calling new Image();
		im.onload = function() {
			drawLoadedImage(im);
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
			var newMarker = marker(markers.length, polygonContext, position, markerWidth, markerHeight, color);
			markers.push(newMarker);
			update();
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
				if (i == markers.length - 1) { // last marker
					markers[i].draw(defaultLastMarkerColor);
				} else {
					markers[i].draw();
				}
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
		},
		update = function() {
			clearCanvas();
			drawPolygonFill();
			drawMarkers();
		};

		return {
			getWidth: function() {
				return width;
			},
			getHeight: function () {
				return height;
		   	},
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
			update: update,
			moveMarker: function(marker, position) {
				markers[marker.index].moveTo(position);
			},
setSelectedMarker: function (marker) {
			   for (var i = 0; i < markers.length; ++i) {
				   if (markers[i] == marker) {
					   markers[i].select();
					   continue;
				   }
					   markers[i].unselect();
			   }

		   },
			clearMarkers: clearMarkers,
			getMarkers: function() {
				return markers;
			},
			loadNewImage: function(clientImage) {
				if (!clientImage.toString().indexOf("File]")) { 
					throw "loadNewImage expectes the object that resides <dropEventArgs>.dataTransfer.files[0]";
				}

				var img = document.createElement("img"),
				reader;
				img.id = "pic";
				img.file = clientImage;

				reader = new FileReader();
				reader.onload = function(e) {
					img.onload = function() {
						drawLoadedImage(img);
						clearMarkers(markers);
					};
					img.src = e.target.result;
				};
				reader.readAsDataURL(clientImage);
			}
		};
	};

	drawMainImage(callback);
};

