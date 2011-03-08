var widget = function(position, width, headerText, headerClassName) {
	var pos = position,
	headerHeight = 20,
	container = document.createElement("div"),
	header = document.createElement("div"),
	content = document.createElement("div");

	container.style.position = 'absolute';
	container.style.width = width + 'px';
	container.style.left = pos.x;
	container.style.top = pos.y;
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
		moveTo: function(position) {
			pos = position;
		},
		getWidth: function() {
			return width;
		},
		getheaderHeight: function() {
			return headerHeight;
		}
	};
};

