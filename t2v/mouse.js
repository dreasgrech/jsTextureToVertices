var mouse = function(el) {
	var position, moveAction, dragAction, clickAction, isLeftClicked = false,
	isDragging = false;

	var getPosition = function(e) {
		return {
			x: e.clientX - el.offsetLeft,
			y: e.clientY - el.offsetTop
		};
	};

	el.addEventListener("mousemove", function(e) {
		position = getPosition(e);
		if (isLeftClicked && dragAction) {
			isDragging = true;
			dragAction(position);
		}
		if (moveAction) {
			moveAction(position);
		}
	},
	false);

	el.addEventListener("mousedown", function(e) {
		isLeftClicked = true;
		return false;
	},
	false);

	el.addEventListener("mouseup", function(e) {
			//console.log(isDragging);
		if (!isDragging && clickAction) {
			clickAction(getPosition(e));
		}
		isDragging = false;
		isLeftClicked = false;
		return false;
	},
	false);

	/*el.addEventListener("click", function(e) {
		if (clickAction) {
			clickAction(getPosition(e));
		}
	},
	false);*/

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

