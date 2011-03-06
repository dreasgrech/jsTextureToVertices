var mouse = function(canvas) {
	var position, moveAction, dragAction, isLeftClicked = false;;
	document.onmousemove = function(e) {
		position = {
			x: e.clientX - canvas.offsetLeft,
			y: e.clientY - canvas.offsetTop
		};
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

	return {
		position: position,
		isLeftClicked: function() {
			return isLeftClicked;
		},
		move: function(action) {
			moveAction = action;
		},
		drag: function(action) {
			dragAction = action;
		}

	};
};

