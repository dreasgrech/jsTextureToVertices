var fileDragDrop = function(el, dropCallback) {
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

