(function() {
	var imageFilename = "images/dragDrop.png";
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
			draggingWidget, draggingWidgetMouseOffset;

			mouseInput.click(function(position) {
					//verticesWidget.moveFromCentroid(vector2(position.x, position.y)); //used only for debug
				var markerAtClickPosition = library.getMarkerAt(position);
				if (markerAtClickPosition) {
					library.setSelectedMarker(markerAtClickPosition);
					return;
				}

				library.addMarker(position);
				displayVertices(library.getVertices());
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

				isCursorOnVerticesWidgetHeader = rectangle(verticesWidget.position().x, verticesWidget.position().y, verticesWidget.getWidth(), verticesWidget.getheaderHeight()).contains(pos);
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
				if (draggingVertex) {
					library.moveMarker(draggingVertex, pos);
				}
				displayVertices(library.getVertices());

				if (draggingWidget) {
					verticesWidget.moveFromTopLeft(vector2(pos.x - draggingWidgetMouseOffset.x, pos.y - draggingWidgetMouseOffset.y));
				}
			});

			polygonCanvas.addEventListener("dragover", function(e) {
				e.preventDefault();
			},
			true);

			polygonCanvas.addEventListener("drop", function(e) {
				e.preventDefault();
				var im = e.dataTransfer.files[0];
				loadNewImage(im);
			},
			true);

			var loadNewImage = function(clientImage) {
				if (!clientImage.type.match(/image.*/)) { // something that's not an image
					alert('Wtf is that?');
					return;
				}
				library.loadNewImage(clientImage);
			};

			var verticesWidget = widget({
				x: 600,
				y: 200
			},
			100, 'Vertices', 'verticesHeader');

			var displayVertices = function(vertices) {
				var output = [],
				i,
				vertex;
				var list = verticesWidget.getContentContainer();
				list.innerHTML = "";
				for (i = 0; i < vertices.length; ++i) {
					vertex = vertices[i].position();
					var container = document.createElement("div");
					container.className = 'marker';
					if (vertices[i].isSelected()) {
						container.className += ' markerSelect';
					}
					container.innerHTML = '(' + vertex.x + ', ' + vertex.y + ')';

					list.appendChild(container);
				}
			};

			setInterval(library.update, 50);
			setInterval(function() {
				displayVertices(library.getVertices());
			},
			100);
		});
	}
} ());

