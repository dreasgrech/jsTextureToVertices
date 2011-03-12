(function() {
	var imageFilename = "images/block.png";
	var imageCanvas = document.getElementById('imageCanvas'),
	polygonCanvas = document.getElementById('polygonCanvas'),
	verticesList = document.getElementById('verticesList');

	if (imageCanvas.getContext && polygonCanvas.getContext) {
		var imageContext = imageCanvas.getContext('2d'),
		polygonContext = polygonCanvas.getContext('2d'),
		maxVertices = 50, // https://github.com/dreasgrech/jsTextureToVertices/issues/2
		xyShower = document.getElementById('mouse');
		t2v(imageCanvas, imageContext, polygonCanvas, polygonContext, imageFilename, maxVertices, function(library) {
			var mouseInput = mouse(document.body),
			draggingVertex,
			draggingWidget,
			draggingWidgetMouseOffset
			getVerticesPositionsHTML = function(vertices) {
				var i = 0,
				j = vertices.length,
				output = [];
				for (; i < j; ++i) {
					output.push("(" + vertices[i].position().x + ", " + vertices[i].position().y + ")");
				}
				return output.join("<br/>");
			},
			openVerticesWindow = function(vertices) {
				var html = getVerticesPositionsHTML(vertices),
				win = window.open("", "newwin", "height=250, width=250,toolbar=no,menubar=no");
				win.location = 'about:blank'; // clears the window's content
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
			displayVerticesSection = db.addSection(100, function(content) {
				var output = [],
				i,
				vertex,
				xyShow,
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

				xyShow = document.createElement("div");
				var pos = mouseInput.position();
				xyShow.innerHTML = 'X: ' + pos.x + ', Y: ' + pos.y;
				content.appendChild(xyShow);
			}),
			updateMouseCoordinatesDisplay = function(position) {

			};

			mouseInput.click(function(position) {
				var markerAtClickPosition = library.getMarkerAt(position);
				if (markerAtClickPosition) { // A marker was clicked, so select it
					library.setSelectedMarker(markerAtClickPosition);
					return;
				}

				var edge = library.isPointOnEdge(position);
				if (edge) {
					library.addMarkerBetween(edge[0], edge[1], position);
					return;
				}

				library.addMarker(position);
				displayVerticesSection.update();
			});

			mouseInput.move(function(pos) {
				xyShower.innerHTML = 'X: ' + pos.x + ', Y: ' + pos.y;
				if (library.getMarkerAt(pos)) { // mouse cursor is currently hovering on top of a marker
					polygonCanvas.style.cursor = 'pointer';
				} else {
					polygonCanvas.style.cursor = 'default';
				}

			});

			mouseInput.dragStart(function(pos) {
				var marker = library.getMarkerAt(pos),
				isCursorOnVerticesWidget;
				if (marker) {
					draggingVertex = marker;
				}

				isCursorOnVerticesWidgetHeader = rectangle(verticesWidget.position().x, verticesWidget.position().y, verticesWidget.getWidth(), verticesWidget.getheaderHeight()).contains(pos); // TODO: this line probably needs some refactoring
				if (isCursorOnVerticesWidgetHeader) {
					draggingWidget = verticesWidget;
					draggingWidgetMouseOffset = vector2(pos.x - verticesWidget.position().x, pos.y - verticesWidget.position().y);
				}
			});

			mouseInput.dragComplete(function(pos) {
				draggingVertex = draggingWidget = null;
			});

			mouseInput.drag(function(pos) {
				var widgetNewPosition;
				if (draggingVertex) { // currently dragging a vertex
					draggingVertex.moveTo(pos);
				}

				displayVerticesSection.update();

				if (draggingWidget) { // currently dragging a widget
					verticesWidget.moveFromTopLeft(vector2(pos.x - draggingWidgetMouseOffset.x, pos.y - draggingWidgetMouseOffset.y));
				}
			});

			fileDragDrop(polygonCanvas, function(files) {
				var image = files[0];
				if (!image.type.match(/image.*/)) { // something that's not an image
					alert('Wtf is that?');
					return;
				}
				library.loadNewImage(image);

			});

			(function () {
			 var link = document.createElement('a');
			 link.href = "#";
			 link.innerHTML = "Raw format";
			 link.onclick = function () {
				openVerticesWindow(library.getMarkers());
			 };

			db.addSection(100, function(content) {
				content.innerHTML = "";
				content.appendChild(link);
			});
			}());

			setInterval(library.update, 50);
			setInterval(function() {
				displayVerticesSection.update();
			},
			100);
		});
	}
} ());

