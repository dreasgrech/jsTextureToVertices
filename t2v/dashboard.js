/*
 * Dependencies: widget.js
 */

var dashboard = (function() {
	var dashboardItem = function(width, render, cssFloat) {
		var item = document.createElement('div');
		item.style.width = width + 'px';
		if (cssFloat) {
			item.style.cssFloat = cssFloat;
		}

		return {
			element: item,
			update: function() {
				render(item);
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

		var topSection = dashboardItem(100, function () {});
		addElementToDashboard(topSection.element);

		return {
			getWidget: function() {
				return widg;
			},
			addTopSection: function(width, render) {
					       // TODO: continue working here after burger
					       topSection.style.width = width + "px";
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
