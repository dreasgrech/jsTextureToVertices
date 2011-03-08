(function() {
	var imageFilename = "images/dragDrop.png";
	var imageCanvas = document.getElementById('imageCanvas'),
	polygonCanvas = document.getElementById('polygonCanvas'),
	verticesList = document.getElementById('vertices');

	if (imageCanvas.getContext && polygonCanvas.getContext) {
		var imageContext = imageCanvas.getContext('2d'),
		polygonContext = polygonCanvas.getContext('2d');

		var maxVertices = 50;
		t2v(imageCanvas, imageContext, polygonCanvas, polygonContext, imageFilename, maxVertices, function(library) {
			var mouseInput = mouse(polygonCanvas);

			mouseInput.click(function(position) {
				var markerAtClickPosition = library.getMarkerAt(position);
				if (!markerAtClickPosition) {
					library.addMarker(position);
					displayVertices(library.getVertices());
				}
			});

			mouseInput.move(function(pos) {
				library.update();
				if (library.getMarkerAt(pos)) {
					polygonCanvas.style.cursor = 'pointer';
				} else {
					polygonCanvas.style.cursor = 'default';
				}
			});

			var draggingVertex;

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

			var loadNewImage = function (clientImage) {
				if (!clientImage.type.match(/image.*/)) { // something that's not an image
					alert('Wtf is that?');
					return;
				}
				library.loadNewImage(clientImage);
			};
		});

		var displayVertices = function(vertices) {
			var output = [],
			i,
			vertex;
			for (i = 0; i < vertices.length; ++i) {
				vertex = vertices[i];
				output.push('(' + vertex.x + ', ' + vertex.y + ')');
			}
			verticesList.innerHTML = output.join('<br/>');
		};
	}
} ());

