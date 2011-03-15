var fileDragDrop = function(el, dropCallback) {
	/* Used to capture HTML's file drag and drop support */

	el.addEventListener("dragover", function(e) {
		e.preventDefault();
	},
	true);

	el.addEventListener("drop", function(e) {
		e.preventDefault();
		dropCallback && dropCallback(e.dataTransfer.files);
	},
	true);
};

