var t2v = function(imageCanvas, imageContext, polygonCanvas, polygonContext, position, image, maxVertices, callback) {
	var markerRadius = 2,
	markerHeight = markerRadius,
	defaultMarkerColor = 'rgba(255, 0, 0, 1)',
	defaultGhostMarkerColor = 'rgba(255, 0, 0, 0.3)',
	defaultLastMarkerColor = '#002EB8',
	defaultFillColor = 'rgba(0, 0, 200, 0.5)',
	showPolygon = true, // a friendly reminder: changing this to false means you should also uncheck the option checkbox from the dashboard
	scale = 1,
	library, width, height, markers = [],
	clearCanvas = function() {
		polygonContext.clearRect(0, 0, width, height);
	},
	clearMarkers = function(markers) {
		markers.length = 0;
	},
	currentImage,
	drawLoadedImage = function(im) {
		currentImage = im;
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
	ghostMarker = marker(polygonContext, {
		x: 0,
		y: 0
	},
	markerRadius, markerHeight, scale, defaultGhostMarkerColor),
	isShowingGhostMarker,
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
			if (!showPolygon || markers.length === 0) {
				return;
			}

			color = color || defaultFillColor;
			polygonContext.fillStyle = color;
			polygonContext.beginPath();
			polygonContext.moveTo(markers[0].scaledPosition().x, markers[0].scaledPosition().y);
			iterateMarkers(function(marker) {
				polygonContext.lineTo(marker.scaledPosition().x, marker.scaledPosition().y);
			});
			polygonContext.closePath();
			polygonContext.fill();
		},
		drawMarkers = function() {
			iterateMarkers(function(marker, i) {
				if (i === markers.length - 1) { // last marker
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
			if (isShowingGhostMarker) {
				ghostMarker.scale(scale);
				ghostMarker.draw();
			}
		},
		iterateMarkers = function(action) {
			var i = 0,
			j = markers.length,
			stop;
			for (; i < j; ++i) {
				stop = action(markers[i], i)
				if (typeof stop !== "undefined") {
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
			var num = iterateMarkers(function(m, index) {
				if (vector2.areEqual(m.position(), marker.position())) {
					return index;
				}
			});

			if (typeof num === "undefined") {
				throw "Something went wrong; a marker should always have an index";
			}

			return num;
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
					if (newScale === scale) {
						return;
					}

					iterateMarkers(function(marker) {
						marker.scale(newScale);
					});
					scale = newScale;
					update();
					drawLoadedImage(currentImage);
					return;
				}
				return scale;
			},
			drawImage: drawImage,
			addMarker: addMarker,
			addMarkerBetween: function(marker1, marker2, position) {
				var marker1Index = getMarkerIndex(marker1),
				marker2Index = getMarkerIndex(marker2);
				collectionIndex = Math.max(marker1Index, marker2Index);
				if (Math.max(marker1Index, marker2Index) === markers.length - 1 && ! Math.min(marker1Index, marker2Index)) {
					collectionIndex++;
				}

				addMarker(vector2.divide(position, scale), null, collectionIndex); // null to use the default color
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
					if (m === marker) {
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
			getMarkerCount: function() {
				return markers.length;
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
					if (point.isOnLine([vertex1.scaledPosition(), vertex2.scaledPosition()])) {
						return [vertex1, vertex2];
					}
				});
			},
			showGhostMarker: function(position) {
				isShowingGhostMarker = true;
				ghostMarker.moveTo(position);
			},
			hideGhostMarker: function() {
				isShowingGhostMarker = false;
			},
			clearPolygons: function() {
				markers.length = 0;
			}, togglePolygonDisplay: function () {
				showPolygon = !showPolygon; 
			}
		};
	};

	drawMainImage(callback);
};

