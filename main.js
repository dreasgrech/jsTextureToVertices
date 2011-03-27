(function() {
	// TODO: Create the canvas dynamically, instead of getting references to them
	var initialImageFilename = "images/block.png";
	var imageCanvas = document.getElementById('imageCanvas'),
	polygonCanvas = document.getElementById('polygonCanvas'),
	verticesList = document.getElementById('verticesList');

	if (imageCanvas.getContext && polygonCanvas.getContext) {
		var imageContext = imageCanvas.getContext('2d'),
		polygonContext = polygonCanvas.getContext('2d'),
		// TODO: https://github.com/dreasgrech/jsTextureToVertices/issues/2
		maxVertices = 500,
		scaleStep = 0.5,
		xRawFormat = 'x',
		yRawFormat = 'y',
		defaultRawFormat = '(' + xRawFormat + ', ' + yRawFormat + ')';
		t2v(imageCanvas, imageContext, polygonCanvas, polygonContext, vector2(100, 100), initialImageFilename, maxVertices, function(library) {
			var canvasMouseInput = mouse(polygonCanvas),
			//bodyMouseInput = mouse(document.body),
			bodyMouseInput = mouse(document),
			draggingWidget,
			draggingWidgetMouseOffset,
			getVerticesPositionsHTML = function(vertices, format) {
				var i = 0,
				j = vertices.length,
				output = [],
				pos;
				for (; i < j; ++i) {
					pos = vertices[i].position();
					output.push(format.replace(xRawFormat, pos.x).replace(yRawFormat, pos.y));
				}
				return output.join("<br/>");
			},
			openVerticesWindow = function(vertices, format) {
				if (vertices.length === 0) {
					return;
				}

				format = format || defaultRawFormat;
				var html = getVerticesPositionsHTML(vertices, format),
				win = window.open("", "newwin", "height=250, width=250,toolbar=no,menubar=no");
				win.location = 'about:blank'; // clears the window's HTML
				win.document.write(html);
			},
			loadNewImage = function(clientImage) {
				if (!clientImage.type.match(/image.*/)) { // something that's not an image
					alert('Wtf is that?');
					return;
				}
				library.loadNewImage(clientImage);
			},
			db = dashboard({
				x: 900,
				y: 200
			},
			'Dashboard', 'dashboard', 'verticesHeader'),
			verticesWidget = db.getWidget(),
			displayVerticesSectionWidth = 100,
			round = function(value, decimalPlaces) {
				var n = 10 * decimalPlaces;
				return Math.round(value * n) / n;
			},
			displayVerticesSection = (function() {
				//var addVertexDisplay = function (
				return db.addSection(displayVerticesSectionWidth, function(content) {
					var output = [],
					i,
					vertex,
					vertices = library.getVertices();

					content.innerHTML = "";
					for (i = 0; i < vertices.length; ++i) { (function(n) {
							vertex = vertices[n].position();

							var container = document.createElement("div");
							container.className = 'marker';
							if (vertices[n].isSelected()) {
								container.className += ' markerSelect';
							}

							container.onclick = function() {
								alert(container.innerHTML);
							}

							container.innerHTML = '(' + vertex.x + ', ' + vertex.y + ')';
							content.appendChild(container);
						} (i));
					}
				});
			} ());

			canvasMouseInput.click(function(position) {
				var markerAtClickPosition = library.getMarkerAt(position);
				if (markerAtClickPosition) { // A marker was clicked, so select it
					library.setSelectedMarker(markerAtClickPosition);
					return;
				}

				if (library.getMarkerCount() > 2) { //no point in trying to add a marker "between one point"
					var edge = library.isPointOnEdge(position);
					if (edge) { // clicked on a polygon edge
						library.addMarkerBetween(edge[0], edge[1], position);
						return;
					}
				}

				library.addMarker(vector2.divide(position, library.scale()));
				displayVerticesSection.update();
			});

			canvasMouseInput.move(function(pos) {
				var edge;

				xySection.update();
				if (library.getMarkerAt(pos)) { // mouse cursor is currently hovering on top of a marker
					polygonCanvas.style.cursor = 'pointer';
					library.hideGhostMarker();
				} else {
					if (library.getMarkerCount() > 1 && (edge = library.isPointOnEdge(pos))) { // mouse pointer is hovering on a polygon edge
						library.showGhostMarker(vector2.divide(pos, library.scale()));
					} else {
						library.hideGhostMarker();
					}
					polygonCanvas.style.cursor = 'default';
				}

			});

			bodyMouseInput.freeDragStart(function(pos) {
				var widgetHeaderBoundingBox = rectangle(verticesWidget.position().x, verticesWidget.position().y, verticesWidget.getWidth(), verticesWidget.getheaderHeight()),
				isCursorOnDashboardHeader = widgetHeaderBoundingBox.contains(pos);
				if (isCursorOnDashboardHeader) {
					draggingWidget = verticesWidget;
					draggingWidgetMouseOffset = vector2(pos.x - verticesWidget.position().x, pos.y - verticesWidget.position().y);
				}

			});

			bodyMouseInput.freeDrag(function(pos) {
				var widgetNewPosition;

				if (draggingWidget) { // currently dragging a widget
					widgetNewPosition = vector2(pos.x - draggingWidgetMouseOffset.x, pos.y - draggingWidgetMouseOffset.y);
					verticesWidget.moveFromTopLeft(widgetNewPosition);
				}
			});

			bodyMouseInput.freeDragComplete(function(pos) {
				draggingWidget = null;
			});

			bodyMouseInput.wheelUp(function(delta) {
				var newScale = round(library.scale() + scaleStep, 2);
				library.scale(newScale);
				scaleSection.update();
			});

			bodyMouseInput.wheelDown(function(delta) {
				var scale = library.scale();

				// clamp the scale to the scaleStep
				scale = (scale - scaleStep <= 0) ? scaleStep: scale - scaleStep;

				library.scale(round(scale, 2));
				scaleSection.update();
			});

			canvasMouseInput.freeDragStart(function(pos) {
				var marker = library.getMarkerAt(pos);
				if (marker) {
					library.startMarkerDrag(marker);
				}
			});

			canvasMouseInput.freeDrag(function(pos) {
				library.markerDrag(pos);

				displayVerticesSection.update();
			});

			canvasMouseInput.freeDragComplete(function(pos) {
				library.completeMarkerDrag();
			});

			fileDragDrop(polygonCanvas, function(files) { // Handles the dragging and dropping of files to the canvas
				var image = files[0];
				if (!image.type.match(/image.*/)) { // something that's not an image (should probably encapsulate this form of checking to the fileDragDrop function
					alert('Wtf is that?');
					return;
				}
				library.loadNewImage(image);
			});

			(function() { // The Raw Format Dashboard Section
				var link = document.createElement('a'),
				formatBox = document.createElement('input');

				link.href = "#";
				link.innerHTML = "Raw format";
				link.onclick = function() {
					var format = formatBox.value;
					openVerticesWindow(library.getMarkers(), format);
				};

				formatBox.id = 'formatBox';
				formatBox.type = 'text';
				formatBox.value = defaultRawFormat;

				db.addSection(100, function(content) {
					content.innerHTML = "";
					content.appendChild(formatBox);
					content.appendChild(link);
				});
			} ());

			var scaleSection = db.addSection(100, function(content) {
				content.innerHTML = "Scale: " + library.scale();
			});

			var xySection = db.addSection(100, function(content) {
				var pos = vector2(canvasMouseInput.position());
				pos = vector2.divide(pos, library.scale()); // Adjust the position from the mouse according to scale
				content.innerHTML = 'X: ' + pos.x + ', Y: ' + pos.y;
			});

			db.addSection(100, function(content) {
				var clearLink = document.createElement('a');
				clearLink.href = "#";
				//clearLink.alt = "Remove all vertices"; // TODO: check for the tooltip
				clearLink.innerHTML = "Clear";
				clearLink.onclick = function() {
					if (library.getMarkerCount() && confirm("Are you sure you want to remove all vertices?")) {
						library.clearMarkers();
					}
				};
				content.appendChild(clearLink);

			});

			var getToggleOption = function(label, changeHandler, checked) {
				// TODO: label is currently unused; use it!
				if (typeof checked === "undefined") {
					checked = true;
				}

				var option = document.createElement('input');
				option.type = "checkbox";
				option.checked = checked;
				option.onchange = changeHandler;
				return option;
			},
			getButtonOption = function(value, clickHandler) {
				var button = document.createElement('input');
				button.type = 'button';
				button.value = value;
				button.onclick = clickHandler;
				return button;
			};

			db.addSection(200, function(content) {
				var polygonDisplayToggle = getToggleOption("Toggle polygon", library.togglePolygonDisplay, true),
				verticesDisplayToggle = getToggleOption("Toggle vertices", library.toggleVerticesDisplay, true);

				content.appendChild(polygonDisplayToggle);
				content.appendChild(verticesDisplayToggle);
				content.appendChild(getButtonOption('Undo', library.undo));
				content.appendChild(getButtonOption('Redo', library.redo));
				content.appendChild(getButtonOption('Delete', function () {
						var selectedMarker = library.getSelectedMarker();
						if (selectedMarker) {
							library.deleteMarker(selectedMarker);
							return;
						}

						alert('You must first select a marker before you can delete it!');
				}));
			});

			(function(introContainerID) {
				var introContainer = document.getElementById(introContainerID),
				introText = introContainer.innerHTML;

				document.body.removeChild(introContainer);
				db.addTopSection(250, function(content) {
					content.innerHTML = introText;
				});
			} ('introduction'));

			setInterval(library.update, 100);
			setInterval(displayVerticesSection.update, 100);
		});
	}
} ());

