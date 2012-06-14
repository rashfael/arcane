// # jqselector
// Library to generate useful jQuery selectors for DOM Elements.
//
// ## TODOs
//
// - Documentation
//
var selector = {
	
	// Creates a jQuery selector for a given DOM Node
	domNodeToSelector: function(domNode, document) {
		if (this.uniqueElementSelector(domNode, document) !== "") {
			return this.uniqueElementSelector(domNode, document);
		}
		
		return this.fullPath(domNode, document);
	},
	
	domNodeToSelectorPart: function(parentNode, el, document) {
		if (!(el instanceof Element)) return;
		var path = [];
		var end = false;
		
		while (el.nodeType === Node.ELEMENT_NODE && el !== parentNode) {
			var selector = el.nodeName.toLowerCase();
			if (el.id) {
				selector += '#' + el.id;
			} else if (el.nodeName.toLowerCase() !== "html" && el.nodeName.toLowerCase() !== "body") {
				var sib = el, nth = 0; 
			
				while (sib !== null) {
					if (sib.nodeType === Node.ELEMENT_NODE) {
						nth++;
					}

					sib = sib.previousSibling;
				}
				
				if (nth == 1) {
					selector += ":first";
				} else {
					selector += ":nth-child("+nth+")";
				}
			}
			path.unshift(selector);
			el = el.parentNode;
		}
		
		return path.join(" > ");
	},
	
	fullPath: function(el, document) {
		if (!(el instanceof Element)) return;
		var path = [];
		var end = false;

		while (el.nodeType === Node.ELEMENT_NODE && !end) {
			var uSelector = this.uniqueElementSelector(el, document);
			if (uSelector !== "") {
				end = true;
				path.unshift(uSelector);
			} else {
				var selector = el.nodeName.toLowerCase();
				if (el.id) {
					selector += '#' + el.id;
				} else if (el.nodeName.toLowerCase() !== "html" && el.nodeName.toLowerCase() !== "body") {
					var sib = el, nth = 0; 
				
					while (sib !== null) {
						if (sib.nodeType === Node.ELEMENT_NODE) {
							nth++;
						}

						sib = sib.previousSibling;
					}
					
					if (nth == 1) {
						selector += ":first";
					} else {
						selector += ":nth-child("+nth+")";
					}
				}
				path.unshift(selector);
				el = el.parentNode;
			}
		}

		return path.join(" > ");
	},

	uniqueElementSelector: function(domNode, document) {
		if (domNode.id) {
			if ($("#" + domNode.id, document).length == 1) {
				return "#" + domNode.id;
			} else if ($(domNode.nodeName.toLowerCase() + "#" + domNode.id, document).length == 1) {
				return domNode.nodeName.toLowerCase() + "#" + domNode.id;
			}
		}
		if (domNode.className !== "") {
			if ($("." + domNode.className, document).length == 1) {
				return "." + domNode.className;
			} else if ($(domNode.nodeName.toLowerCase() + "." + domNode.className, document).length == 1) {
				return domNode.nodeName.toLowerCase() + "." + domNode.className;
			}
		}
		return "";
	}
};