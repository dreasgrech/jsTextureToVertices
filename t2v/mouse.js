var mouse = function(canvas) {
	var position, moveAction, dragAction, clickAction, isLeftClicked = false;

	var getPosition = function(e) {
		return {
			x: e.clientX - canvas.offsetLeft,
			y: e.clientY - canvas.offsetTop
		};
	};

	document.onmousemove = function(e) {
		position = getPosition(e);
		if (dragAction) {
			if (isLeftClicked) {
				dragAction(position);
			}

		}
		if (moveAction) {
			moveAction(position);
		}
	};

	document.onmousedown = function(e) {
		isLeftClicked = true;
		return false;
	};

	document.onmouseup = function(e) {
		isLeftClicked = false;
		return false;
	};

	canvas.addEventListener("click", function(e) {
		if (clickAction) {
			clickAction(getPosition(e));
		}
	}, false);

	return {
		position: position,
		isLeftClicked: function() {
			return isLeftClicked;
		},
		click: function(action) {
			clickAction = action;
		},
		move: function(action) {
			moveAction = action;
		},
		drag: function(action) {
			dragAction = action;
		}

	};
};

