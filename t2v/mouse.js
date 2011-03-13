var mouse = function(el) {
	var position = {
		x: 0,
		y: 0
	},
	moveAction,

	dragAction,
	dragStartAction,
	dragCompleteAction,

	wheelChangeAction,
	wheelUpAction,
	wheelDownAction,

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
		if (isLeftClicked && dragAction) { (!isDragging && dragStartAction) && dragStartAction(position);
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

	el.addEventListener("DOMMouseScroll", function(e) {
		// Code from: http://adomas.org/javascript-mouse-wheel/
		if (!wheelChangeAction && ! wheelUpAction && ! wheelDownAction) {
			return;
		}

		var delta = 0;
		if (e.wheelDelta) {
			delta = e.wheelDelta / 120;
			if (window.opera) {
				delta = - delta;
			}
		} else if (e.detail) {
			delta = - e.detail / 3;
		}

		if (wheelUpAction && delta > 0) {
			wheelUpAction();
		}

		if (wheelDownAction && delta < 0) {
			wheelDownAction();
		}

		wheelChangeAction && wheelChangeAction();

		if (e.preventDefault) {
			e.preventDefault();
		}

		e.returnValue = false;
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
		},
		wheelChange: function(action) {
			wheelChangeAction = action;
		},
		wheelUp: function(action) {
			wheelUpAction = action;
		},
		wheelDown: function(action) {
			wheelDownAction = action;
		}
	};
};
