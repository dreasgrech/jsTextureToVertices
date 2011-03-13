(function() {
	var initialImageFilename = "images/block.png";
	var imageCanvas = document.getElementById('imageCanvas'),
	polygonCanvas = document.getElementById('polygonCanvas'),
	verticesList = document.getElementById('verticesList');

	if (imageCanvas.getContext && polygonCanvas.getContext) {
		var imageContext = imageCanvas.getContext('2d'),
		polygonContext = polygonCanvas.getContext('2d'),
		// TODO: https://github.com/dreasgrech/jsTextureToVertices/issues/2
		maxVertices = 50,
		scaleStep = 0.5,
		xRawFormat = 'x',
		yRawFormat = 'y',
		defaultRawFormat = '(' + xRawFormat + ', ' + yRawFormat + ')';
		t2v(imageCanvas, imageContext, polygonCanvas, polygonContext, vector2(100, 100), initialImageFilename, maxVertices, function(library) {
			//library.scale(2);
			var canvasMouseInput = mouse(polygonCanvas),
			//bodyMouseInput = mouse(document.body),
			bodyMouseInput = mouse(document),
			draggingVertex,
			draggingWidget,
			draggingWidgetMouseOffset,
			dbIntro = "If your browser supports the <a href='http://www.w3.org/TR/FileAPI/' target='blank'>File API</a>, you can drag an image to the existing one to change it.",
			getVerticesPositionsHTML = function(vertices, format) {
				var i = 0,
				j = vertices.length,
				output = [],
				pos;
				for (; i < j; ++i) {
					pos = vector2.divide(vertices[i].position(), library.scale());
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
			displayVerticesSection = db.addSection(displayVerticesSectionWidth, function(content) {
				var output = [],
				i,
				vertex,
				vertices = library.getVertices();

				content.innerHTML = "";
				for (i = 0; i < vertices.length; ++i) {
					vertex = vertices[i].position();

					var container = document.createElement("div");
					container.className = 'marker';
					if (vertices[i].isSelected()) {
						container.className += ' markerSelect';
					}

					container.innerHTML = '(' + vertex.x + ', ' + vertex.y + ')';
					content.appendChild(container);
				}
			});

			canvasMouseInput.click(function(position) {
				var markerAtClickPosition = library.getMarkerAt(position);
				if (markerAtClickPosition) { // A marker was clicked, so select it
					library.setSelectedMarker(markerAtClickPosition);
					return;
				}

				var edge = library.isPointOnEdge(position);
				//console.log(edge);
				if (edge) {
					library.addMarkerBetween(edge[0], edge[1], position);
					return;
				}

				library.addMarker(vector2.divide(position, library.scale()));
				displayVerticesSection.update();
			});

			canvasMouseInput.move(function(pos) {
				xySection.update();
				if (library.getMarkerAt(pos)) { // mouse cursor is currently hovering on top of a marker
					polygonCanvas.style.cursor = 'pointer';
				} else {
					polygonCanvas.style.cursor = 'default';
				}

			});

			bodyMouseInput.dragStart(function(pos) {
				var isCursorOnVerticesWidget;
				isCursorOnVerticesWidgetHeader = rectangle(verticesWidget.position().x, verticesWidget.position().y, verticesWidget.getWidth(), verticesWidget.getheaderHeight()).contains(pos); // TODO: this line probably needs some refactoring
				if (isCursorOnVerticesWidgetHeader) {
					draggingWidget = verticesWidget;
					draggingWidgetMouseOffset = vector2(pos.x - verticesWidget.position().x, pos.y - verticesWidget.position().y);
				}

			});

			bodyMouseInput.drag(function(pos) {
				var widgetNewPosition;

				if (draggingWidget) { // currently dragging a widget
					widgetNewPosition = vector2(pos.x - draggingWidgetMouseOffset.x, pos.y - draggingWidgetMouseOffset.y);
					verticesWidget.moveFromTopLeft(widgetNewPosition);
				}
			});

			bodyMouseInput.dragComplete(function(pos) {
				draggingWidget = null;
			});

			bodyMouseInput.wheelUp(function(delta) {
				library.scale(library.scale() + scaleStep);
				scaleSection.update();
			});

			bodyMouseInput.wheelDown(function(delta) {
				var scale = library.scale();

				// clamp the scale to the scaleStep
				if (scale - scaleStep <= 0) {
					scale = scaleStep;
				} else {
					scale -= scaleStep;
				}

				library.scale(scale);
				scaleSection.update();
			});

			canvasMouseInput.dragStart(function(pos) {
				var marker = library.getMarkerAt(pos);
				if (marker) {
					draggingVertex = marker;
				}
			});

			canvasMouseInput.drag(function(pos) {
				if (draggingVertex) { // currently dragging a vertex
					pos = vector2.divide(pos, library.scale());
					draggingVertex.moveTo(pos);
				}

				displayVerticesSection.update();
			});

			canvasMouseInput.dragComplete(function(pos) {
				draggingVertex = null;
			});

			fileDragDrop(polygonCanvas, function(files) { // Handles the dragging and dropping of files to the cancas
				var image = files[0];
				if (!image.type.match(/image.*/)) { // something that's not an image
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

			db.addTopSection(250, function(content) {
				content.innerHTML = dbIntro;
			});

			setInterval(library.update, 50);
			setInterval(function() {
				displayVerticesSection.update();
			},
			100);
		});
	}
} ());

