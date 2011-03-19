// TODO: Implement a couple of more gestures, like horizontalDrag and verticalDrag
var mouse = function(el) {
	var position = {
		x: 0,
		y: 0
	},
    	lastPosition = position,
	moveAction = [],

	freeDragAction = [],
	freeDragStartAction = [],
	freeDragCompleteAction = [],

	wheelChangeAction = [],
	wheelUpAction = [],
	wheelDownAction = [],

	clickAction = [],
	isLeftClicked,
	isDragging;

	var getPosition = function(e) {
		var x = e.clientX,
		y = e.clientY;
		if (typeof el.offsetTop !== "undefined" && typeof el.offsetLeft !== "undefined") {
			x -= el.offsetLeft;
			y -= el.offsetTop;
		}

		return {
			x: x,
			y: y
		};
	}, executeCallbacks = function (/* list, args...*/) {
		var args = [].slice.apply(arguments), list = args.shift(), i = 0, listLength = list.length;
		for (; i < listLength; ++i) {
			list[i].apply(this, args);
		}
	};

	el.addEventListener("mousemove", function(e) {
		var newPosition = getPosition(e);
		if (isLeftClicked && freeDragAction.length) { 
			!isDragging && executeCallbacks(freeDragStartAction, newPosition);
			isDragging = true;
			executeCallbacks(freeDragAction, newPosition);
		}

		moveAction.length && executeCallbacks(moveAction, newPosition);

		lastPosition = position;
		position = newPosition;
	},
	false);

	el.addEventListener("mousedown", function(e) {
		isLeftClicked = true;
		return false;
	},
	false);

	el.addEventListener("mouseup", function(e) {
		isLeftClicked = false;
		if (freeDragCompleteAction.length && isDragging) {
			isDragging = false;
			executeCallbacks(freeDragCompleteAction,getPosition(e));
			return false;
		}

		clickAction.length && executeCallbacks(clickAction,getPosition(e)); // It would probably be better if this was moved to the click event rather than trigger on mouse up, because it can be confusing to the client if click fired at mouseup rather than click.
		return false;
	},
	false);

	el.addEventListener("DOMMouseScroll", function(e) {
		// Delta details from: http://adomas.org/javascript-mouse-wheel/
		if (!wheelChangeAction.length && ! wheelUpAction.length && ! wheelDownAction.length) {
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

		if (wheelUpAction.length && delta > 0) {
			executeCallbacks(wheelUpAction);
		}

		if (wheelDownAction.length && delta < 0) {
			executeCallbacks(wheelDownAction);
		}

		wheelChangeAction.length && executeCallbacks(wheelChangeAction);

		e.preventDefault && e.preventDefault();

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
			clickAction.push(action);
		},
		move: function(action) {
			moveAction.push(action);
		},
		freeDrag: function(action) {
			freeDragAction.push(action);
		},
		freeDragComplete: function(action) {
			freeDragCompleteAction.push(action);
		},
		freeDragStart: function(action) {
			freeDragStartAction.push(action);
		},
		wheelChange: function(action) {
			wheelChangeAction.push(action);
		},
		wheelUp: function(action) {
			wheelUpAction.push(action);
		},
		wheelDown: function(action) {
			wheelDownAction.push(action);
		}
	};
};
