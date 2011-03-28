/*
 * Dependencies: widget.js
 */

var dashboard = (function() {
	var dashboardItem = function(width, render, cssFloat) {
		var item = document.createElement('div'),
		updateWidth = function(newWidth) {
			item.style.width = newWidth + 'px';
			itemWidth = newWidth;
		};

			itemWidth = width;

		if (cssFloat) {
			item.style.cssFloat = cssFloat;
		}

		updateWidth(itemWidth);

		return {
			element: item,
			setRender: function(newRender) {
				render = newRender;
			},
			update: function() {
				render(item);
			},
			width: function(newWidth) {
				if (typeof newWidth !== "undefined") {
					updateWidth(newWidth);
					return;
				}
				return itemWidth;
			}
		};
	};

	return function(initialPosition, headerText, cssClass, headerClassName) {
		var sections = [],
		widg = widget(initialPosition, 0, headerText, headerClassName),
		content = widg.getContentContainer(),
		addElementToDashboard = function(item) {
			if (content.lastChild) {
				content.insertBefore(item, content.lastChild);
				return;
			};
			content.appendChild(item);
		};

		content.className = cssClass;

		var clearDiv = document.createElement('div');
		clearDiv.style.clear = "both";
		addElementToDashboard(clearDiv);

		var topSection = dashboardItem(100, function() {});
		addElementToDashboard(topSection.element);
		topSection.element.style.paddingBottom = "10px";

		return {
			getWidget: function() {
				return widg;
			},
			addTopSection: function(width, render) {
				widg.setWidth(Math.max(widg.getWidth(), width));
				topSection.setRender(render);
				topSection.update();
			},
			addSection: function(width, render) {
				if (typeof render !== "function") {
					return;
				}

				widg.setWidth(widg.getWidth() + width);
				var item = dashboardItem(width, render, 'left');
				sections.push(item);
				addElementToDashboard(item.element);
				item.update();
				topSection.width(Math.max(topSection.width(), widg.getWidth()));

				return item;
			},
			update: function() {
				var i = 0,
				j = sections.length;

				for (; i < j; ++i) {
					sections[i].update();
				}
			}
		};
	}
} ());

