var widget = function(position, headerText, headerClassName) {
	var pos = position,
	container = document.createElement("div"),
	header = document.createElement("div"),
	content = document.createElement("div");

	container.style.position = 'absolute';
	container.style.left = pos.x;
	container.style.top = pos.y;
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
		}
	};
};

