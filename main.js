(function() {
	var imageFilename = "images/block.png";
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

