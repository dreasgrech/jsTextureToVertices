var t2v = function(imageCanvas, imageContext, polygonCanvas, polygonContext, position, image, maxVertices, callback) {
	var markerRadius = 1.5,
	markerHeight = markerRadius,
	defaultMarkerColor = 'rgba(255, 0, 0, 1)',
	defaultGhostMarkerColor = 'rgba(255, 0, 0, 0.3)',
	defaultFirstMarkerColor = 'rgb(255, 249, 4)',
	defaultLastMarkerColor = '#002EB8',
	defaultFillColor = 'rgba(0, 0, 200, 0.5)',
	showPolygon = true,
	// a friendly reminder: changing this to false means you should also uncheck the option checkbox from the dashboard
	showVertices = true,
	scale = 1,
	logs = logger(),
	library,
	width,
	height,
	markers = [],
	markerUndoStack = [],
	clearCanvas = function() {
		polygonContext.clearRect(0, 0, width, height);
	},
	scaleCookieName = 'scale',
	scaleCookie = cookies.read(scaleCookieName) || cookies.create(scaleCookieName, ''),
	verticesCookieName = 'vertices',
	verticesCookie = cookies.read(verticesCookieName) || cookies.create(verticesCookieName, ''),
	clearMarkers = function() {
		markers.length = 0;
		verticesCookie.value('');
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

		//library = initializer();
		//library.drawImage(im, vector2.zero(), width, height);
		console.log(imageContext, im, width, height, vector2.zero());
			imageContext.drawImage(im, vector2.zero(), width, height);
		loopStarted = true;
	},
	drawMainImage = function(callback) {
		var im = document.createElement("img");
		im.onload = function() {
			drawLoadedImage(im);
			callback(library);
		};
		im.src = image;
	},
	ghostMarker = marker(polygonContext, vector2.zero, markerRadius, markerHeight, scale, defaultGhostMarkerColor),
	isShowingGhostMarker,
	verticesCookieSeperator = '#',
	update = function() {
		if (loopStarted) {
			clearCanvas();
			drawPolygonFill();
			drawMarkers();
			if (isShowingGhostMarker) {
				ghostMarker.scale(scale);
				ghostMarker.draw();
			}
		}
	},
	action = function(fn) { // TODO: it would be good to encapsulate action items along with their undo actions
		return {
			undo: fn
		};
	},
	undoActions = {
		'newMarker': action(function() {
			var lastMarker = markers.pop();
			markerUndoStack.push(lastMarker);
		}),
		'dragMarker': action(function() {
			if (draggingMarker) {
				draggingMarker.moveTo(draggingMarkerInitialPosition);
				draggingMarker = null;
			}
		})
	},
	// the undo stack contains undoActions
	undoStack = [],
	loopStarted = false,
	// used because of the cookie setting; a couple of usage searches is all it takes to find out more...
	addMarkerToCollection = (function() {
		markers.push = function() {
			throw "lulz";
		};
		return function(value, index) {
			if (typeof index === "undefined") { // if not given, add it at the last
				index = markers.length;
			}

			markers.splice(index, 0, value);

			//markerUndoStack.length = 1;
			//markerUndoStack.push(value);
		};
	} ()),
	addMarker = function(position, color, collectionIndex) {
		if (typeof collectionIndex === "undefined") { // collectionIndex index was not given, thus add the new marker to the last of the list
			collectionIndex = markers.length;
		}

		if (markers.length + 1 > maxVertices) {
			return;
		}

		if (loopStarted) {
			verticesCookie.append(position + verticesCookieSeperator);
		}

		color = color || defaultMarkerColor;
		var newMarker = marker(polygonContext, position, markerRadius, markerHeight, scale, color);
		//markers.splice(collectionIndex, 0, newMarker);
		addMarkerToCollection(newMarker, collectionIndex);
		undoStack.push(undoActions.newMarker);
		update();
	};

	(function() { // Load vertices from cookies, if they exist.
		var verticesFromCookie = verticesCookie.value(),
		parts,
		i,
		numVertices,
		xY,
		x,
		y;

		if (verticesFromCookie) {
			verticesFromCookie = verticesFromCookie.split(verticesCookieSeperator);
			for (i = 0, numVertices = verticesFromCookie.length - 1; i < numVertices; ++i) {
				xY = verticesFromCookie[i].split(',');
				x = xY[0];
				y = xY[1];
				addMarker(vector2(x, y));
			}
		}
	} ());

	var initializer = function() {
		/*var drawImage = function(image, position, width, height) {
			imageContext.drawImage(image, position.x, position.y, width, height);
		},
		*/
		var drawPolygonFill = function(color) {
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
			if (!showVertices) {
				return;
			}

			iterateMarkers(function(marker, i) {
				if (i == 0) { // first marker
					marker.draw(defaultFirstMarkerColor);
				}
				else if (i === markers.length - 1) { // last marker
					marker.draw(defaultLastMarkerColor);
				} else {
					marker.draw();
				}
			});
		},
		getVertices = function() {
			return markers;
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
		},
		draggingMarker,
		draggingMarkerInitialPosition,
		setScale = function(newScale) {
			if (typeof newScale !== "undefined") {
				if (newScale === scale) {
					return;
				}

				iterateMarkers(function(marker) {
					marker.scale(newScale);
				});
				scale = newScale;
				if (loopStarted) {
					scaleCookie.value(scale);
				}
				drawLoadedImage(currentImage);
				return;
			}
			return scale;
		};

		/*
		(function() { //set the scale from the cookies, if it exists there.
			var scaleFromCookie = scaleCookie.value();
			if (scaleFromCookie) {
				setScale(+scaleFromCookie); // TODO: causing a double entrance, wtf?
			}
		} ());
		*/

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
			scale: setScale,
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
			moveMarker: function(marker, newUnscaledPosition) { // currently unused
				var pos = vector2.divide(newUnscaledPosition, scale);
				marker.moveTo(pos);
				undoStack.push(undoActions.dragMarker);
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
						clearMarkers();
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
			clearMarkers: clearMarkers,
			togglePolygonDisplay: function() {
				showPolygon = ! showPolygon;
			},
			toggleVerticesDisplay: function() {
				showVertices = ! showVertices;
			},
			undo: function() { // undo whatever action was last committed
				var lastAction;
				if (undoStack.length) {
					lastAction = undoStack.pop();
					lastAction.undo();
				}
			},
			redo: function() { // redo whatever action was "undoed" (is that even a word?)
				//TODO: implementation
				alert('Currently non functional');
			},
			redoMarker: function() {
				if (markerUndoStack.length) {
					addMarkerToCollection(markerUndoStack.pop());
				}
			},
			startMarkerDrag: function(m) {
				draggingMarker = m;
				draggingMarkerInitialPosition = vector2(draggingMarker.position());
				undoStack.push(undoActions.dragMarker);
			},
			markerDrag: function(p) {
				if (draggingMarker) {
					p = vector2.divide(p, scale);
					draggingMarker.moveTo(p);
				}
			},
			completeMarkerDrag: function() { // currently redundant
			}
		};
	};

	drawMainImage(callback);
};

