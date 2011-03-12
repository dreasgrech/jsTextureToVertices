var mouse = function(el) {
	var position = {
		x: 0,
		y: 0
	},
	moveAction,
	dragAction,
	dragStartAction,
	dragCompleteAction,
	clickAction,
	isLeftClicked = false,
	isDragging = false;

	var getPosition = function(e) {
		return {
			x: e.clientX - el.offsetLeft,
			y: e.clientY - el.offsetTop
		};
	};

	el.addEventListener("mousemove", function(e) {
		var newPosition = getPosition(e);
		position = newPosition;
		if (isLeftClicked && dragAction) { 
			(!isDragging && dragStartAction) && dragStartAction(position);
			isDragging = true;
			dragAction(position);
		}
		moveAction && moveAction(position);
	},
	false);

	el.addEventListener("mousedown", function(e) {
		isLeftClicked = true;
		return false;
	},
	false);

	el.addEventListener("mouseup", function(e) {
		isLeftClicked = false;
		if (dragCompleteAction && isDragging) {
			isDragging = false;
			dragCompleteAction(getPosition(e));
			return false;
		}

		clickAction && clickAction(getPosition(e));
		return false;
	},
	false);

	return {
		position: function() {
			return position;
		},
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
		},
		dragComplete: function(action) {
			dragCompleteAction = action;
		},
		dragStart: function(action) {
			dragStartAction = action;
		}
	};
};

