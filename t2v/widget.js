var widget = function(initialPosition, width, headerText, headerClassName) {
	var pos = initialPosition,
	headerHeight = 20,
	container = document.createElement("div"),
	header = document.createElement("div"),
	content = document.createElement("div"),
	setNewPosition = function(newPosition) {
		pos = newPosition;
		container.style.left = newPosition.x;
		container.style.top = newPosition.y;
	},
	moveFromTopLeft = function(position) {
		setNewPosition(position);
	};

	container.style.position = 'absolute';
	container.style.width = width + 'px';
	setNewPosition(pos);
	header.style.height = headerHeight + 'px';
	container.appendChild(header);
	container.appendChild(content);
	document.body.appendChild(container);

	header.className = headerClassName;
	header.innerHTML = headerText;

	return {
		getContentContainer: function() {
			return content;
		},
		position: function() {
			return pos;
		},
		moveFromTopLeft: moveFromTopLeft,
		getWidth: function() {
			return width;
		},
		getheaderHeight: function() {
			return headerHeight;
		}
	};
};

