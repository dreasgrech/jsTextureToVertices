/*
 * Dependencies: widget.js
 */

var dashboard = (function() {
	var dashboardItem = function(width, render) {
		var item = document.createElement('div');
		item.style.cssFloat = 'left';
		item.style.width = width + 'px';

		return {
			element: item,
			update: function() {
				render(item);
			}
		};
	};

	return function(initialPosition, headerText, cssClass, headerClassName) {
		var sections = [],
		widg = widget(initialPosition, 0, headerText, headerClassName);
		var content = widg.getContentContainer(),
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
		sections.push(clearDiv);
		addElementToDashboard(clearDiv);

		return {
			getWidget: function() {
				return widg;

			},
			addSection: function(width, render) {
				if (typeof render !== "function") {
					return;
				}

				widg.setWidth(widg.getWidth() + width);
				var item = dashboardItem(width, render);
				//sections.push(item);
				//sections.splice(sections.length - 1, 0, item);
				addElementToDashboard(item.element);
				item.update();

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

