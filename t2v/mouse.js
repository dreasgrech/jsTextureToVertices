var mouse = function(el) {
	var position, moveAction, dragAction, clickAction, isLeftClicked = false;

	var getPosition = function(e) {
		return {
			x: e.clientX - el.offsetLeft,
			y: e.clientY - el.offsetTop
		};
	};

	el.addEventListener("mousemove", function(e) {
		position = getPosition(e);
		if (dragAction) {
			if (isLeftClicked) {
				dragAction(position);
			}

		}
		if (moveAction) {
			moveAction(position);
		}
	}, false);

	el.addEventListener("mousedown", function(e) {
		isLeftClicked = true;
		return false;
	}, false);

	el.addEventListener("mouseup", function(e) {
		isLeftClicked = false;
		return false;
	}, false);

	el.addEventListener("click", function(e) {
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

