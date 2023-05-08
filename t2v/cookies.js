var cookies = (function() {
	//TODO: currently not functioning in Chrome

	var defaultDurationdays = 7,
	cookie = function(name, value, days) {
		var date = new Date(),
		expires = '',
		val = value,
		write = function() {
			document.cookie = name + "=" + val + expires + "; path=/";
		},
		value = function(v) {
			if (typeof v !== "undefined") { // set
				val = v;
				write();
			}

			return val;

		};

		if (days) {
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();
		}

		return {
			write: write,
			value: value,
			append: function(v) {
				value(val + v);
			}
		};
	};

	return {
		create: function(name, value, days) {
			var newCookie = cookie(name, value, days || defaultDurationdays);
			newCookie.write();
			return newCookie;
		},
		read: function(name) {
			var parts = document.cookie.split(';'),
			i = 0,
			partsLength = parts.length,
			item,
			key;

			for (; i < partsLength; ++i) {
				item = parts[i].split('=');
				key = item[0];
				if (key[0] === ' ') {
					key = key.substring(1);
				}

				if (key === name) {
					return cookie(key, item[1]);
				}
			}
		},
		remove: function(name) {
			cookie(name, '', - 1);
		}
	};
} ());

