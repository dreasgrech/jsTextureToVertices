var t2v = function(imageCanvas, imageContext, polygonCanvas, polygonContext, position, image, maxVertices, callback) {
	var markerRadius = 2,
	markerHeight = markerRadius,
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
		var im = document.createElement("img"); 
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
		addMarker = function(position, color, collectionIndex) {
			if (typeof collectionIndex === "undefined") { // collectionIndex index was not given, thus add the new marker to the last of the list
				collectionIndex = markers.length;
			}

			if (markers.length + 1 > maxVertices) {
				return;
			}

			color = color || defaultMarkerColor;
			var newMarker = marker(polygonContext, position, markerRadius, markerHeight, scale, color);
			markers.splice(collectionIndex, 0, newMarker);
			update();
		},
		drawPolygonFill = function(color) {
			if (markers.length == 0) {
				return;
			}

			color = color || defaultFillColor;
			polygonContext.fillStyle = color;
			polygonContext.beginPath();
			polygonContext.moveTo(markers[0].position().x, markers[0].position().y);
			iterateMarkers(function(marker) {
				polygonContext.lineTo(marker.position().x, marker.position().y);
			});
			polygonContext.closePath();
			polygonContext.fill();
		},
		drawMarkers = function() {
			iterateMarkers(function(marker, i) {
				if (i == markers.length - 1) { // last marker
					marker.draw(defaultLastMarkerColor);
				} else {
					marker.draw();
				}
			});
		},
		getVertices = function() {
			return markers;
		},
		update = function() {
			clearCanvas();
			drawPolygonFill();
			drawMarkers();
		},
		iterateMarkers = function(action) {
			var i = 0,
			j = markers.length,
			stop;
			for (; i < j; ++i) {
				if (stop = action(markers[i], i)) {
					return stop;
				}
			}
		},
		iterateEdges = function(action) {
			var i = 0,
			j = markers.length,
			nextVertex, stop;

			return iterateMarkers(function(marker, index) {
				nextVertex = (index + 1) % j;
				if (stop = action(markers[index], markers[nextVertex])) {
					return stop;
				}

			});
		},
		getMarkerIndex = function(marker) {
			return iterateMarkers(function(m, index) {
				if (m === marker) return index;
			});
		};

		imageCanvas.style.left = position.x + 'px';
		imageCanvas.style.top = position.y + 'px';
		polygonCanvas.style.left = position.x + 'px';
		polygonCanvas.style.top = position.y + 'px';

		return {
			getWidth: function() {
				return width;
			},
			getHeight: function() {
				return height;
			},
			scale: function(newScale) {
				if (typeof newScale !== "undefined") {
					scale = newScale;
					return;
				}
				return scale;
			},
			drawImage: drawImage,
			addMarker: addMarker,
			addMarkerBetween: function(marker1, marker2, position) {
				var marker1Index = getMarkerIndex(marker1), marker2Index = getMarkerIndex(marker2);
				addMarker(position, '', Math.min(marker1Index, marker2Index) + 1);
			},
			getVertices: getVertices,
			getMarkerAt: function(position) {
				return iterateMarkers(function(marker) {
					if (marker.isPointOn(position)) {
						return marker;
					}
				});
			},
			update: update,
			setSelectedMarker: function(marker) {
				iterateMarkers(function(m) {
					if (m == marker) {
						m.select();
						return;
					}
					m.unselect();
				});
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
			},
			isPointOnEdge: function(point) {
				point = vector2(point);
				return iterateEdges(function(vertex1, vertex2) {
					if (point.isOnLine([vertex1.position(), vertex2.position()])) {
						return [vertex1, vertex2];
					}
				});
			}
		};
	};

	drawMainImage(callback);
};

