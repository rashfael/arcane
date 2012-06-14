/**
 * selector.js
 *
 * Provides the Selector class which represents a jQuery selector
 * for the wedex extension tabs.
 */
 
var Selector = (function() {

	Selector._instances = new Array();
	
	/**
	 * Constructor
	 *
	 * @param {Selector} parent The selector object to relate this selector to.
	 */
	function Selector(parent) {
		// initialize class attributes
		this._reset();
		if (parent) {
			if(!(parent instanceof Selector)) {
				throw new Error("Selector: parent must be an instance of Selector, " + parent.constructor.toString() + " given.");
			}
			this._parent = parent;
		}
		Selector._instances.push(this);
	}
	
	/**
	 * Adds the given DOM-node object(s) to this Selector object.
	 * They will be used to generate the selectors.
	 *
	 * @param {Element or Array of Elements} The DOM-node(s) to add.
	 */
	Selector.prototype.addDOMNode = function(node) {
		var _this = this;
		if (node instanceof Element) { // add the node
			var context = _this._getNodeContext(node);
			if (_this._contexts.length > 0) {
				if (!context.isSameNode(_this.getSelectedNodesContext())) {
					throw new Error("Cannot add DOM-node to Selector: "+
										"Given node is in another context than the nodes before.");
				}
			}else{
				if (!context.isSameNode(content.document)) { 
					var frameElement = _this._getFrameElement(node);
					while (!_this._getNodeContext(frameElement).isSameNode(content.document)) {
						_this._contexts.unshift(_this._getNodeSelector(frameElement));
						frameElement = _this._getFrameElement(frameElement);
					}
				}
			}
			_this._DOMnodes.push(_this._getNodeSelector(node));
		}else	if (typeof node == "object" && node.length && !(node instanceof Array)) { // split jQuery result set
			_this.addDOMNode(node.toArray());
		}else if (node instanceof Array) { // split Array
			$(node).each(function(i,el){
				_this.addDOMNode(el);
			});
		}else{ // given argument is not a node
			throw new Error("Cannot add DOM-node to Selector: "+
								"Given node is not an instance of \"Element\" (but "+((node) ? node.constructor.toString() : "undefined")+")");
		}
		_this.selectorString = _this.getSelector().toString();
	}
	
	/**
	 * Excludes the given DOM-node or string selector from the
	 * list detection result.
	 *
	 * @param {String, Element or Array of Elements} The DOM-node(s) or selector to exclude.
	 */
	Selector.prototype.excludeDOMNode = function(exclude) {
		var _this = this;
		if (typeof exclude == "string") {
			_this._excludes.push(exclude);
		}else	if (typeof exclude == "object" && exclude.length) { 
			// add the single nodes
			$(exclude).each(function(i,el) {
				_this.excludeDOMNode(el);
			});
		}else if (exclude instanceof Element) {
			// add the node selector
			_this._excludes.push(_this._getNodeSelector(exclude));
		}else{ 
			// given argument is not a node or selector
			throw new Error("Cannot exclude DOM-node from Selector: " +
								"Given node is not an instance of \"Element\" (but "+exclude.constructor.toString()+")");
		}
		_this.selectorString = _this.getSelector().toString();
	}
	
	/**
	 * Creates a selector out of the given DOM-nodes, trying to also cover
	 * similar nodes, meaning to select a whole list of items altogether.
	 */
	Selector.prototype.detectList = function() {
		var _this = this;
			
		var sharedParents = new Array();
		
		jQuery.each(_this._DOMnodes,function(i,sel){

			// get all the parents of every node
			var parents = $(sel,_this.getSelectedNodesContext()).parents();
			// build intersection with shared parents
			if (sharedParents.length > 0) {
				var newSharedParents = new Array();
				sharedParents.each(function(sharedIndex,sharedParent){
					parents.each(function(parentIndex,parent){
						if (sharedParent == parent) {
							newSharedParents.push(sharedParent);
						}
					});
				});
			}else{
				newSharedParents = parents;
			}
			sharedParents = $(newSharedParents);
			
		});		
		// get the selector for the first node which is parent to all selected nodes
		// the globalParentSelector is the base for every other selector we will find now
		globalParentSelector = _this._getNodeSelector(sharedParents[0]);
				
		var selectors = new Array();
		var classes = {};
		// look for common classes
		$(_this._DOMnodes).each(function(index,nodeSel){
			var node = $(nodeSel,_this.getSelectedNodesContext())[0];
			if (node.className && node.className != "") {
				var nodeClasses = node.className.split(" ");
				$(nodeClasses).each(function(index,nodeClass){
					if (classes[nodeClass]) {
						classes[nodeClass] = classes[nodeClass] + 1;
					}else{
						classes[nodeClass] = 1;
					}
				});
			}
		});
		
		// create selector for the most common class
		var max = 0;
		var mostCommonClassName;
		for (var className in classes) {
			if (classes[className] > max) {
				max = classes[className];
				mostCommonClassName = className;
			}
		}
		if (mostCommonClassName != undefined) {
			selectors.push(globalParentSelector + " ." + mostCommonClassName);
		}
		
		// look for common tagnames if there were no common classes
		var tagnames = {};
		$(_this._DOMnodes).each(function(index,nodeSel){
			var node = $(nodeSel,_this.getSelectedNodesContext())[0];
			// only go on if there was no common class for this node
		   // take care of multiclass elements
		   var nodeClasses = node.className.split(" ");
		   for (var i=0;i<nodeClasses.length;i++) {
		   	if (classes[nodeClasses[i]] > 1) return;
		   }
			var tagName = node.nodeName.toLowerCase();
			if (tagnames[tagName]) {
				tagnames[tagName]["count"] = tagnames[tagName]["count"] + 1;
			}else{
			   tagnames[tagName] = {};
				tagnames[tagName]["count"] = 1;
				tagnames[tagName]["node"] = node;
			}
		});
		
		// create selector for every common tag name
		for (var tagName in tagnames) {
			if (tagnames[tagName]["count"] > 1) {
				var innerSelector = _this._getNodeSelector(tagnames[tagName]["node"].parentNode,false,sharedParents[0]);
				if (innerSelector && innerSelector.length > 0) {
					innerSelector += " > ";
				}
				selectors.push(globalParentSelector + " > " + 
					innerSelector + tagName);
			}
		}
		
		// if no strategy has matched until here, just get the siblings of the node
		$(_this._DOMnodes).each(function(index,nodeSel){
			var node = $(nodeSel,_this.getSelectedNodesContext())[0];
			var tagName = node.nodeName.toLowerCase();
			// take care of multiclass elements
		   var nodeClasses = node.className.split(" ");
		   for (var i=0;i<nodeClasses.length;i++) {
		   	if (classes[nodeClasses[i]] > 1) return;
		   }
			if (tagnames[tagName]["count"] > 1) return;
			if (node.className && nodeClasses.length > 0) {
				selectors.push(globalParentSelector + " ."+ nodeClasses[0] + ":parent > " + tagName);
				return;
			}
			if (!node.className && node.id) {
				selectors.push(globalParentSelector + " #"+ node.id + ":parent > " + tagName);
				return;
			}
			selectors.push(globalParentSelector + " " + tagName + ":parent > *");			
		});		

		_this._listSelectorArr = selectors;
		_this.selectorString = _this.getSelector().toString();
	}
	
	/**
	 * Resets the list selector of this Selector object.
	 * getSelector will then return the extact selector for the
	 * added DOM-nodes again.
	 */
	Selector.prototype.resetList = function() {
		this._listSelectorArr = new Array();
		this.selectorString = this.getSelector().toString();
	}
	
	/**
	 * Returns the selector represented by this Selector object.
	 * This can be a list or an exact selector for the given DOM-nodes,
	 * depending on whether detectList() has been called before or not.
	 *
	 * If the selected DOM-nodes are in a different context than the
	 * global site context or the parent Selector context, the selectors
	 * for the contexts to navigate to the correct context are either prepended
	 * to the String, delimited by | (pipe) (in case you call toString()) or
	 * given as an array, having the real selector as the last item (toArray())
	 *
	 * @return {Object} An object with the methods toString() and toArray()
	 */
	Selector.prototype.getSelector = function() {
		var _this = this;
		// the object to return at the end
		var resultObj = {
			selectorArr: new Array(),
			toString: function() {
				return Selector.arrToString(this.selectorArr);
			},
			toArray: function() {
				return this.selectorArr;
			}
		}
		// build selector chain for the correct context
		var contextSelectors = _this._getContextSelectors();
		// get selector for the nodes in their correct context
		var nodeSelectors = new Array();
		if (_this._listSelectorArr.length > 0) {
			nodeSelectors = _this._listSelectorArr;
		}else{			
			nodeSelectors = _this._DOMnodes;
		}
		// handle excludes
		if (_this._excludes.length > 0) {
			var excludes = _this._excludes.join(",");
			var temp = new Array();
			$(nodeSelectors).each(function(i,sel){
				temp.push(sel + ":not("+excludes+")");
			});
			nodeSelectors = temp;
		}
		// add the joined node selectors as the last item to the context selectors
		contextSelectors.push(nodeSelectors.join(","));
		resultObj.selectorArr = contextSelectors;
		return Selector.optimize(resultObj);
	}
	
	/**
	 * Adds every DOM-node covered by the given selector to this Selector object.
	 * Selectors for the context trace can be prepended to the string delimited by | (pipe)
	 * or be given as an array, having the correct context as the last item.
	 *
	 * @param {Object, String or Array} The selector. Can be an object as getSelector() returns it, a string or an array.
	 */	 
	Selector.prototype.setSelector = function(selector) {
		var _this = this;

		// handle empty input
		if (!selector || selector == "") {
			_this._reset();
			return;
		}
		
		var selectorArr = undefined;
		// get the array representation of the selector
		if ((selector instanceof Object) && selector.length && !(selector instanceof Array)) {
			selectorArr = selector.toArray();
		}else if (selector instanceof Array) {
			selectorArr = selector;
		}else if (typeof selector == "string") {
			var res = Selector.stringToArr(selector);
			selectorArr = (res instanceof Array) ? res : [res];
		}else{
			throw new Error("setSelector: Invalid input type: "+selector.constructor.toString());
		}
		
		// extract the node selector from the frame selectors
		var nodeSelector = selectorArr.pop();
		// apply context selectors
		_this._contexts = selectorArr;
		
		_this._listSelectorArr = nodeSelector.split(",");
		_this.selectorString = _this.getSelector().toString();
	}
	
	/**
	 * Returns the context the selected DOM-nodes are in.
	 * 
	 * @return {DocumentElement} The correct context of the selected DOM-nodes.
	 */
	Selector.prototype.getSelectedNodesContext = function() {
		var _this = this;
		if (_this.contexts && _this.contexts.length > 0) {
			var context = content.document;
			$(_this.contexts).each(function(i,c){
				var context = _this._getNodeContext($(c,context)[0]);
			});
			return context;
		}else{
			return content.document;
		}
	}
	
	/**
	 * Returns the jQuery result set for the current selector.
	 *
	 * @return {jQuery result set}
	 */
	Selector.prototype.getSelectedNodes = function() {
		if (this._parent) {
			return this._parent.getSelectedNodes().find(this.getSelector().toString());
		}else{
			return $(this.getSelector().toString(),this.getSelectedNodesContext());
		}
	}
		
	/**
	 * Marks the DOM-nodes that are covered by the current selector.
	 *
	 * @param {boolean} showDeleteButton If true, the user can unselect a DOM-node by clicking a button. Defaults to false.
	 * @param {String} color The CSS color of the marks. Defaults to "red".
	 * @param {Number} opacity The CSS opacity of the marks. Defaults to 1/2.
	 */
	Selector.prototype.mark = function(showDeleteButton,color,opacity) {
		var _this = this;
		
		_this.unmark();
		
		var color = Firebug.getPref(Firebug.prefDomain, "scraperExtension.markColor");
		var opac = Firebug.getPref(Firebug.prefDomain, "scraperExtension.markOpac")/100;
		
		var doc = _this.getSelectedNodesContext();
		var elements = _this.getSelectedNodes();
		
		elements.each(function(i,node){
			var el = $(node,doc);
			var shouldBeMarked = el.css("display") != "none";
			if (shouldBeMarked) {
				var overlay = $('<div class="marker-overlay"></div>',doc);
				var offset = el.offset();
				offset.top -= parseInt(el.css("margin-top"),10);
				offset.left -= parseInt(el.css("margin-left"),10);
				overlay.offset(offset);
				overlay.css("padding-top",el.css("padding-top"));
				overlay.css("padding-right",el.css("padding-right"));
				overlay.css("padding-bottom",el.css("padding-bottom"));
				overlay.css("padding-left",el.css("padding-left"));
				overlay.css("z-index",999);
				overlay.height(el.height());
				overlay.width(el.width());
				overlay.css("position","absolute");
				overlay.css("background-color",color);
				overlay.attr("style",overlay.attr("style")+";opacity:"+opac);
				$("body",doc).append(overlay);
				if (showDeleteButton==true) {			
					var deleteButton = $('<div>x</div>',doc);
					
					deleteButton.css("position","absolute");
					deleteButton.css("top","5px");
					deleteButton.css("left","5px");
					deleteButton.css("width","8px");
					deleteButton.css("height","10px");
					deleteButton.css("padding","2px");
					deleteButton.css("line-height","11px");
					deleteButton.css("font-size","11px");
					deleteButton.css("cursor","pointer");
					deleteButton.css("border","1px solid black");
					deleteButton.css("font-family","Arial");
					deleteButton.css("color","black");
					deleteButton.css("background-color","silver");
					deleteButton.css("z-index","1000");
			
					deleteButton.click(function(e){
						_this.excludeDOMNode(el);
						_this.mark(true);
						configurationView.update();
					});
			
					$(overlay).append(deleteButton);			
					
				}
				_this._marks.push(overlay);
			}
		});
	}
	
	/**
	 * Removes all marks that have been created by this Selector object.
	 */
	Selector.prototype.unmark = function() {
		var _this = this;
		var doc = _this.getSelectedNodesContext();
		$(_this._marks,doc).each(function(i,mark){
			$(mark,doc).remove();
		});
	}
	
	// ##### private methods #####
	
	/**
    * Resets this object to the state after it was created.
    *
    * @return {void}
    */
	Selector.prototype._reset = function() {
		this._DOMnodes = new Array();
		this._contexts = new Array();
		this._excludes = new Array();
		this._listSelectorArr = new Array();
		this._marks = new Array();
	}
	
	/**
	 * Returns the extact selector for the given DOM-node.
	 *
	 * @param {Element} node The DOM-node.
	 * @param {Boolean} exact True, if the selector should cover exactly the given node, false if siblings may be covered, too. Defaults to true.
	 * @return {String} The selector.
	 */
	Selector.prototype._getNodeSelector = function(node,exact,parentNode) {
		var _this = this;
		if (!node) throw new Error("_getNodeSelector: No node given");
		// default value for exact
		if (exact === undefined) {
			exact = true;
		}
		
		var doc = _this.getSelectedNodesContext();
		var selector = undefined;
		// first figure out if the node has some unique identifier like an id or a unique class
		selector = _this._getUniqueSelector(node);
		
		// get the nodes of the parent selector if it exists
		var parentNodes = new Array();
		if (!parentNode) {
			if (_this._parent) {
				parentNodes = _this._parent.getSelectedNodes();
			}
		}else{
			parentNodes.push(parentNode);
		}
		
		if (!selector) {
			// no unique selector found, so we have to prepend the parent nodes
			var path = new Array();
			while (node.nodeType === Node.ELEMENT_NODE && $.inArray(node,parentNodes) == -1) {
				var nodeSel = node.nodeName.toLowerCase();
				if (exact && nodeSel != "html" && nodeSel != "body") {
					var sib = node,nth = 0;
					while (sib !== null) {
						if (sib.nodeType === Node.ELEMENT_NODE) {
							nth++;
						}
						sib = sib.previousSibling;
					}
					nodeSel += (nth == 1) ? ":first-child" : ":nth-child("+nth+")";
				}
				path.unshift(nodeSel);
				
				var parentUnique = _this._getUniqueSelector(node.parentNode);
				if (parentUnique) {
					path.unshift(parentUnique);
					break;
				}
				
				node = node.parentNode;
			}
			selector = path.join(" > ");
		}
		
		return Selector.optimize(selector);
	}
	
	/**
	 * Tries to find an id or unique class of the given DOM-node and create a simple selector of it.
	 * Returns undefined if no unique identifier was found for the node.
	 *
	 * @param {Element} node The DOM-node.
	 * @return {String or undefined} A unique selector for the node or undefined.
	 */
	Selector.prototype._getUniqueSelector = function(node) {
		var doc = this.getSelectedNodesContext();
		var selector = undefined;
		if (node.id) {
			var trySel = node.nodeName.toLowerCase()+'#'+node.id;
			if ($(trySel,doc).length == 1) {
				selector = trySel;
			}
		}
		if (node.className) {
			var classNames = node.className.split(" ");
			$(classNames).each(function(i,className){
				var trySel = node.nodeName.toLowerCase()+'.'+className;
				if ($(trySel,doc).length == 1) {
					selector = trySel;
				}
			});
		}
		return selector;
	}
	
	/**
	 * Returns the document element of the given DOM-node.
	 *
	 * @param {Element} The DOM-node.
	 * @return {DocumentElement} The document context of the DOM-node.
	 */
	Selector.prototype._getNodeContext = function(node) {
		if (node instanceof HTMLDocument) return node;
		if (!(node instanceof Element)) {
			throw new Error("Cannot determine the context of the node: "+
								"Given argument is not a DOM-node (" + ((node) ? node.constructor.toString() : "undefined") + " given).");
		}
		var res;
		if (node.ownerDocument) {
			res = node.ownerDocument;
		}else{
			if (node.parentNode) {
				res = this._getNodeContext(node.parentNode);
			}else{
				throw new Error("Cannot determine the context of the node: "+
									"Given argument has no parent node and no ownerDocument.");
			}
		}
		return res;
	}
	
	/**
	 * Returns an array of string selectors which select the frames in the path
	 * to reach the correct context of the DOM-nodes this Selector object represents.
	 *
	 * @return {Array} The array of frame element selectors.
	 */
	Selector.prototype._getContextSelectors = function() {
		var _this = this;
		var contextSelectors = new Array();
		$(_this._contexts).each(function(i,context){
			if (i != _this._contexts.length-1) {
				var frameSelector = _this._getNodeSelector(_this._getFrameElement(context));
				contextSelectors.push(frameSelector);
			}
		});
		return contextSelectors;
	}
	
	/**
	 * Returns the frame Element for the given node, 
	 * while the node can be a usual DOM-node or its document node.
	 *
	 * @param {Element} The DOM-node to get the frameElement for.
	 * @return {Element} The DOM-node of the frame.
	 */
	Selector.prototype._getFrameElement = function(node) {
		var document = this._getNodeContext(node);
		var result;
		jQuery.each(content.frames,function(index,frame){
			if (frame.location == document.location) result = frame.frameElement;
		});
		return result;
	}
	
	/**
	 * Returns the frame node the given node belongs to.
	 *
	 * @param {Element} The DOM-node to get the frame of.
	 * @return {DocumentElement} The frame node or undefined, if the given node is not in a frame.
	 */
	Selector.prototype._getFrame = function(node) {
		var _this = this;
		var res;
		jQuery.each(content.frames,function(index,frame){
			if (frame.location == _this._getNodeContext(node).location) {
				res = frame;
			}
		});
		return res;
	}
	
	// ##### static helper functions #####
	
	Selector.stringToArr = function(sel) {
		var res = sel;
		if (typeof sel === "string" && sel !== null && sel.indexOf(" | ") > -1) {
			res = sel.split(" | ");
		}
		return res;
	}
	
	Selector.arrToString = function(sel) {
		var res = sel;
		if (typeof sel === "object" && sel !== null && sel.length) {
			res = sel.join(" | ");
		}
		return res;
	}
	
	/**
	 * Invokes a few optimiziations to the given selector, e.g. removes tbody elements from it.
	 *
	 * @param {Object, Array or String} sel Can be an object as getSelector returns it, an Array or a String
	 */
	Selector.optimize = function(sel) {
		// handle case "object"
		if (sel.selectorArr) {
			sel.selectorArr = Selector.optimize(sel.toArray());
			return sel;
		}
		
		// transform sel into array representation if it contains frame selectors
		sel = Selector.stringToArr(sel);
		// handle case "array"	
		if (typeof sel == "object" && sel.length) {
			newSel = new Array();
			$(sel).each(function(i,s){
				newSel.push(Selector.optimize(s));
			});
			return newSel;
		// handle case "string"
		}else{
			var arrSels = sel.split(",");
			var arrNewSels = new Array();
			$(arrSels).each(function(i,s){
				var newSel;
				// actual optimization goes here
				// remove tbody elements between other elements
				newSel = s.replace(/[\s]+>[\s]+tbody(?:\:[a-z0-9\-\(\)]+)*[\s]+>[\s]+/ig," ");
				// remove tbody elements at the beginning
				newSel = newSel.replace(/^[\s]*tbody(?:\:[a-z0-9\-\(\)]+)*[\s]+>[\s]+/ig,"");
				// remove tbody elements at the end
				newSel = newSel.replace(/[\s]+>[\s]+tbody(?:\:[a-z0-9\-\(\)]+)*[\s]*$/ig,"");
				arrNewSels.push(newSel);
			});
			return arrNewSels.join(",");
		}
	}
	
	/**
	 * Unmarks every Selector object that has been created so far.
	 * @return {void}
	 */
	Selector.unmarkAll = function() {
		$(Selector._instances).each(function(i,sel){
			sel.unmark();
		});
	}
	
	return Selector;
	
})()
