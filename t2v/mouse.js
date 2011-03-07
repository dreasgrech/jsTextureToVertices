var mouse = function(el) {
	var position, moveAction, dragAction, dragStartAction, dragCompleteAction, clickAction, isLeftClicked = false,
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
			if (!isDragging && dragStartAction) { // starting a drag
				dragStartAction(position);
			}
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
		isLeftClicked = false;
		if (dragCompleteAction && isDragging) {
			isDragging = false;
			dragCompleteAction(getPosition(e));
			return false;
		}

		if (clickAction) {
			clickAction(getPosition(e));
		}
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
		},
		dragComplete: function(action) {
			dragCompleteAction = action;
		},
		dragStart: function(action) {
			dragStartAction = action;
		}
	};
};

