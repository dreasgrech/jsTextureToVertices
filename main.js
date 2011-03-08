(function() {
	var imageFilename = "images/dragDrop.png";
	var imageCanvas = document.getElementById('imageCanvas'),
	polygonCanvas = document.getElementById('polygonCanvas'),
	verticesList = document.getElementById('verticesList');

	if (imageCanvas.getContext && polygonCanvas.getContext) {
		var imageContext = imageCanvas.getContext('2d'),
		polygonContext = polygonCanvas.getContext('2d'),
		maxVertices = 50; // https://github.com/dreasgrech/jsTextureToVertices/issues/2
		t2v(imageCanvas, imageContext, polygonCanvas, polygonContext, imageFilename, maxVertices, function(library) {
			var mouseInput = mouse(polygonCanvas),
			draggingVertex;

			mouseInput.click(function(position) {
				var markerAtClickPosition = library.getMarkerAt(position);
				if (markerAtClickPosition) {
					library.setSelectedMarker(markerAtClickPosition);
					return;
				}

				library.addMarker(position);
				displayVertices(library.getVertices());
			});

			mouseInput.move(function(pos) {
				if (library.getMarkerAt(pos)) {
					polygonCanvas.style.cursor = 'pointer';
				} else {
					polygonCanvas.style.cursor = 'default';
				}
			});

			mouseInput.dragStart(function(pos) {
				var marker = library.getMarkerAt(pos);
				if (marker) {
					draggingVertex = marker;
				}
			});

			mouseInput.dragComplete(function(pos) {
				draggingVertex = null;
			});

			mouseInput.drag(function(pos) {
				if (draggingVertex) {
					library.moveMarker(draggingVertex, pos);
				}
				displayVertices(library.getVertices());
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

			var verticesShower = widget({
				x: 200,
				y: 200
			},
			'YEAAAA', 'verticesHeader');

			var displayVertices = function(vertices) {
				var output = [],
				i,
				vertex;
				var list = verticesShower.getContentContainer();
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

