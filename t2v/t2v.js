var t2v = function(imageCanvas, imageContext, polygonCanvas, polygonContext, position, image, maxVertices, callback) {
	var markerRadius = 1.5,
	markerHeight = markerRadius,
	defaultMarkerColor = 'rgba(255, 0, 0, 1)',
	defaultGhostMarkerColor = 'rgba(255, 0, 0, 0.3)',
	defaultFirstMarkerColor = 'rgb(255, 249, 4)',
	defaultLastMarkerColor = '#002EB8',
	defaultFillColor = 'rgba(0, 0, 200, 0.5)',
	// a friendly reminder: changing these show<Something> variables to false means you should also uncheck the option checkboxes from the dashboard
	showPolygon = true,
	showVertices = true,
	scale = 1,
	logs = logger(),
	width,
	height,
	markers = [],
	sequentialMarkers = [],
	// sequentialMarkers contains the same objects found in markers[] but ordered by time of insertion; used for undoing
	sequentialDeletedMarkers = [],
	clearCanvas = function() {
		polygonContext.clearRect(0, 0, width, height);
	},
	verticesCookieSeperator = '#',
	scaleCookieName = 'scale',
	verticesCookieName = 'vertices-list',
	scaleCookie = cookies.read(scaleCookieName) || cookies.create(scaleCookieName, ''),
	verticesCookie = cookies.read(verticesCookieName) || cookies.create(verticesCookieName, ''),
	clearMarkers = function() {
		markers.length = 0;
		verticesCookie.value('');
	},
	drawImage = function(image, position, width, height) {
		imageContext.drawImage(image, position.x, position.y, width, height);
	},
	drawLoadedImage = function() {
		width = imageHolder.width * scale;
		height = imageHolder.height * scale;

		imageCanvas.width = width;
		imageCanvas.height = height;
		polygonCanvas.width = width;
		polygonCanvas.height = height;

		imageCanvas.style.left = position.x + 'px';
		imageCanvas.style.top = position.y + 'px';
		polygonCanvas.style.left = position.x + 'px';
		polygonCanvas.style.top = position.y + 'px';

		drawImage(imageHolder, vector2.zero(), width, height);
	},
	imageHolder = document.createElement("img"),
	ghostMarker = marker(polygonContext, vector2.zero, markerRadius, markerHeight, scale, defaultGhostMarkerColor),
	// ghostMarker is that semi invisible marker that appears whenever the mouse is hovering on an edge
	isShowingGhostMarker,
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
	update = function() {
		if (!loopStarted) {
			return;
		}

		clearCanvas();
		drawPolygonFill();
		drawMarkers();
		if (isShowingGhostMarker) {
			ghostMarker.scale(scale);
			ghostMarker.draw();
		}
	},
	action = function(fn, name) { // TODO: it would be good to encapsulate action items along with their undo actions
		return {
			undo: fn,
			      toString: function () {
				     return name; 
			      }
		};
	},
	draggingMarker,
	lastMarkerDragged,
	draggingMarkerInitialPosition,
	deleteMarker = function(marker) {
		iterateMarkers(function(m, i) {
			if (m === marker) {
			if (currentlySelectedMarker == m) {
				currentlySelectedMarker = null; 
			}
				markers = markers.slice(0, i).concat(markers.slice(i + 1, markers.length)); // no internet atm so I forgot how to properly delete from an array :(  came up with this sloppy solution instead
				sequentialDeletedMarkers.push({marker: m, index: i});
			}
		});

		markerUndoStack.push(marker);
		writeMarkersToCookie();
	},
	undoActions = {
		'newMarker': action(function() {
			var lastAddedMarker = sequentialMarkers.pop();
			deleteMarker(lastAddedMarker);
		}, 'new'),
		'deleteMarker': action(function() {
			console.log('undoing a delete');
			var lastDeletedMarker = sequentialDeletedMarkers.pop();
			addMarker(lastDeletedMarker.marker.position(), '', lastDeletedMarker.index, false);
			console.log(lastDeletedMarker);
		}, 'delete'),
		'dragMarker': action(function() {
			if (lastMarkerDragged) {
				lastMarkerDragged.moveTo(draggingMarkerInitialPosition);
				lastMarkerDragged = null;
			}
		}, 'drag')
	},
	// the undo stack contains undoActions
	undoStack = [],
	// the markerUndoStack contains the markers that were "undoed" (or something like that)
	markerUndoStack = [],
	loopStarted = false,
	// loopStarted is needed because of the cookie setting; a couple of usage searches is all it takes to find out more...
	addMarkerToCollection = (function() {
		markers.push = function() {
			throw "lulz";
		};
		return function(value, index) {
			if (typeof index === "undefined") { // if not given, add it at the last
				index = markers.length;
			}

			markers.splice(index, 0, value);
			sequentialMarkers.push(value);
		};
	} ()),
	writeMarkersToCookie = function() {
		var cookieValue = [];
		iterateMarkers(function(m) {
			cookieValue.push(m.position());
		});

		verticesCookie.value(cookieValue.join(verticesCookieSeperator));
	},
	addMarker = function(position, color, collectionIndex, enableUndo) {
		if (markers.length + 1 > maxVertices) { // currently at the limit of the number of vertices that can be added
			return;
		}

		if (typeof collectionIndex === "undefined") { // collectionIndex index was not given, thus add the new marker to the last of the list
			collectionIndex = markers.length;
		}

		var newMarker = marker(polygonContext, position, markerRadius, markerHeight, scale, color || defaultMarkerColor);
		addMarkerToCollection(newMarker, collectionIndex);
		if (loopStarted) {
			writeMarkersToCookie();
			if (enableUndo) {
				undoStack.push(undoActions.newMarker);
				console.log('enabling undo');
			}
		}

		update();
	},
	addMarkerBetween = function(marker1, marker2, position) {
		var marker1Index = getMarkerIndex(marker1),
		marker2Index = getMarkerIndex(marker2);

		collectionIndex = Math.max(marker1Index, marker2Index);
		if (collectionIndex === markers.length - 1 && ! Math.min(marker1Index, marker2Index)) {
			collectionIndex++;
		}

		addMarker(vector2.divide(position, scale), null, collectionIndex, true); // null to use the default color
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
	getVertices = function() {
		return markers;
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
	currentlySelectedMarker,
	library = { // this object contains the functions that are exposed to the outside
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
				if (loopStarted) {
					scaleCookie.value(scale);
					drawLoadedImage();
				}

				return;
			}
			return scale;
		},
		addMarker: function (position, color, collectionIndex) {
				   addMarker(position, color, collectionIndex, true);
			   },
		addMarkerBetween: addMarkerBetween,
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
		getSelectedMarker: function() {
			return currentlySelectedMarker;
		},
		setSelectedMarker: function(marker) {
			iterateMarkers(function(m) {
				if (m === marker) {
					m.select();
					currentlySelectedMarker = m;
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

			// The example I got this from used this line (<>.file = <>), but it still works (on my machine) when it's commented out; TODO: hmm, needs further research
			//imageHolder.file = clientImage; 

			var reader = new FileReader();
			reader.onload = function(e) {
				// changing the src property will cause imageHolder.onload to trigger
				imageHolder.src = e.target.result;
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
				console.log(lastAction.toString());
				lastAction.undo();
			}
		},
		redo: function() { // redo whatever action was "undoed" (is that even a word?)
			//TODO: implementation
			alert('Currently non functional');
		},
		/*redoMarker: function() {
			if (markerUndoStack.length) {
				addMarkerToCollection(markerUndoStack.pop());
			}
		},*/
		startMarkerDrag: function(m) {
			draggingMarker = lastMarkerDragged = m;
			draggingMarkerInitialPosition = vector2(draggingMarker.position());
			undoStack.push(undoActions.dragMarker);
		},
		markerDrag: function(p) {
			if (draggingMarker) {
				p = vector2.divide(p, scale);
				draggingMarker.moveTo(p);
			}
		},
		completeMarkerDrag: function() {
			draggingMarker = null;
			writeMarkersToCookie();
		},
		deleteMarker: function (m) {
			deleteMarker(m);
			undoStack.push(undoActions.deleteMarker);
	        } 
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
			for (i = 0, numVertices = verticesFromCookie.length; i < numVertices; ++i) {
				if (!verticesFromCookie[i]) {
					continue;
				}
				xY = verticesFromCookie[i].split(',');
				x = xY[0];
				y = xY[1];
				addMarker(vector2(x, y), '', undefined, false); // TODO: gaah, this is invocation is messy.  Fix!
			}
		}
	} ());

	(function() { //set the scale from the cookies, if it exists there.
		var scaleFromCookie = scaleCookie.value();
		if (scaleFromCookie) {
			library.scale( + scaleFromCookie);
		}
	} ());

	imageHolder.onload = function() {
		drawLoadedImage();
		imageHolder.onload = function() {

			/* overwriting the handler because I want the markers to be cleared after a new image has been loaded ONLY.
			 * If I didn't do this, then the cookie markers would be deleted after the main image loads.
			 * What I could also do is draw the main image (and clear markers always) before adding the cookie markers...
			 */

			drawLoadedImage();
			clearMarkers();
		};
	};

	imageHolder.src = image;

	callback(library);

	loopStarted = true;
};

