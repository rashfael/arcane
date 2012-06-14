/**
 * This is the pergament library. Please use only public methods and public members.
 */
var pergament= {

	/*
	 * The configuration to render.
	 */
	_config : null,
	
	/*
	 * The context.
	 */
	_context : document,

	/*
	 * The divs' jQuery objects described by the config file.
	 */
	_divs : [],
	
	/*
	 * The names of the divs described by the config file.
	 */
	_divNames : [],
	
	
	/*
	 * Stores the names of the divs that are currently selected.
	 */
	_selectedDivs : [],
	
	/*
	 * Is set to true while the CTRL-Key is pressed down.
	 */
	_ctrlDown : false,
	
	/*
	 * The size of the raster cells
	 */
	_cellWidthBig : 185,
	_cellHeightBig : 70,
	_cellWidthSmall: 35,
	_cellHeightSmall: 30,
	
	/*
	 * The connections between the divs. Array consists of connection objects.
	 * i.e. con1.parent for the parent div and con1.child for the child div. 
	 */
	_connections : [],
	
	/*
	 * The right border of the canvas.
	 */
	_rightCanvasBorder: 0,
	
	/*
	 * The bottom border of the canvas.
	 */
	_bottomCanvasBorder: 0,
	
	/**
	 * Method which renders a passed configuration.
	 * 
	 * @param {JSON} config The configuration to get rendered.
	 * @param {CONTEXT} context The context the library works in.
	 * @return {void}
	 */
	render : function (config,context){
	
		// Set the context.
		if(context!=null){
			this._context=context;
		}
		
		//Set the config file
		this._config=config;
		
		//Flatten navigation node structure
		jQuery.each(this._config.navigation[graphConfig.baseNodeIdPrefix], function(index, baseNode) {
			pergament._config.navigation[baseNode.id] = baseNode;
		});
		
		delete this._config.navigation[graphConfig.baseNodeIdPrefix];
		
		//reset data
		this._resetData();
		
		//Layout the divs
		this._autoLayout();
		
		//Draw the connections
		this._drawConnections();
		
	},
	
	/**
	 * Resets pergament.
	 * 
	 * @return {void}
	 */
	_resetData : function(){
		this._connections=[];
		this._divNames=[];
		this._divs=[];

	},
	
	/**
	 * Filters the divs (and connections) out of the config file and layouts them.
	 *
	 * @return {void}
	 */
	_autoLayout : function(){		
		// get the pergament layer
		var pergamentDiv=jQuery('#pergament-boxes',this._context);
		// remove all items
		var divs=jQuery('.pergament-box',pergamentDiv);
		divs.remove();
		// draw the nodes down from the base nodes
		var startRow = 0;
		jQuery.each(this._config.navigation, function(nodeId, node) {
			if (node.type === "Start") {
				returnObj = pergament._drawNode(nodeId,startRow,0,pergamentDiv);
				startRow += returnObj.rowOffset + 1;
			}
		});
		// check if there are divs saved as selected which are no longer existent
		this._clearSelectedDivs();
		this.showSelections();
		// register key handlers for CTRL key
		pergamentDiv.parent().keydown(function(event){
			if (event.keyCode == 17) {
				pergament._ctrlDown = true;
			}
		});
		pergamentDiv.parent().keyup(function(event){
			if (event.keyCode == 17) {
				pergament._ctrlDown = false;
			}
		});
	},
	
	/**
	 * Gets a start node and recursively draws it and all its subnodes
	 *
	 * @param {String} nodeName The node name
	 * @param {int} currentRow The row where the start node shall be drawn
	 * @param {int} currentCol The column where the start node shall be drawn
	 * @param {Object} pergamentDiv The jQuery object of the div to draw the graph on
	 * @return {Object} Object with properties: 
	 * 						newDiv The created div for the start node
	 * 						rowOffset Number of rows that have been used by this subgraph
	 */
	_drawNode : function(nodeName,currentRow,currentCol,pergamentDiv) {
		var node = this._config.navigation[nodeName];
		// create div
		var newDiv = jQuery('<div class="pergament-box">'+((node.render) ? node.render() : 'unknown type')+'</div>',this._context);
		// set position and size
		var nodeStyle = Firebug.getPref(Firebug.prefDomain,"scraperExtension.nodeStyle");
		// if only the icon is shown, draw smaller boxes
		var cellWidth = (nodeStyle=="Image") ? this._cellWidthSmall : this._cellWidthBig;
		var cellHeight = (nodeStyle=="Image") ? this._cellHeightSmall : this._cellHeightBig;
		var nodeSpacing = Firebug.getPref(Firebug.prefDomain,"scraperExtension.nodeSpacing");
		newDiv.css('width',cellWidth+'px');
		newDiv.css('height',cellHeight+'px');
		newDiv.css('left',currentCol*(cellWidth+nodeSpacing)+5+'px');
		newDiv.css('top',currentRow*(cellHeight+nodeSpacing)+5+'px');
		// add selection handlers
		newDiv.onSingleSelect = function() { node.onSingleSelect(); };
		newDiv.onDeselect = function() { node.onDeselect(); };
		newDiv.onMultiSelect = function() { node.onMultiSelect(); };
		// add click handler
		newDiv.click(function(){			
			pergament._onDivClicked(newDiv);			
		});
		// resize canvas if necessary
		var maxWidth = (currentCol+1)*(cellWidth+nodeSpacing)+5;
		var maxHeight = (currentRow+1)*(cellHeight+nodeSpacing)+5;
		if (maxWidth > this._rightCanvasBorder) {
			this._rightCanvasBorder = maxWidth;
			pergamentDiv.width(maxWidth);
		}
		if (maxHeight > this._bottomCanvasBorder) {
			this._bottomCanvasBorder = maxHeight;
			pergamentDiv.width(maxWidth);
		}
		
		// draw div
		pergamentDiv.append(newDiv);
		// update the div lists
		this._divNames.push(nodeName);
		this._divs.push(newDiv);
		// the offset values are there to tell the parent node how many rows and cols have been allocated by this node and its children
		var rowOffset = 0;
		// draw children if not drawn yet and set connections
		if (node.next) {			
			jQuery.each(node.next,function(index){
				var existingPos = jQuery.inArray(node.next[index],pergament._divNames);
				var childDiv;
				if (existingPos == -1) {
					var returnObj = pergament._drawNode(node.next[index],currentRow+index+rowOffset,currentCol+1,pergamentDiv);
					childDiv = returnObj.newDiv;
					rowOffset += returnObj.rowOffset;
				}else{
					childDiv = pergament._divs[existingPos];
				}
				pergament._connections.push([newDiv,childDiv]);
			});
			if (node.next.length > 0) rowOffset += node.next.length-1;
		}
		return {newDiv: newDiv, rowOffset: rowOffset};		
	},

	/**
	 * Draws the connections between the divs.
	 *
	 * @return {void}
	 */
	_drawConnections : function(){
		var canvas=jQuery('#pergament-canvas',this._context);
		var g = canvas[0].getContext('2d');
		// clear the canvas
		g.clearRect(0,0,g.canvas.width,g.canvas.height);
		// resize the canvas.
		g.canvas.width=this._rightCanvasBorder;
		g.canvas.height=this._bottomCanvasBorder;

		jQuery.each(this._connections,function(index){
			pergament._drawLine(this[0],this[1],g);
		});
	},
	
	/**
	 * Draws a single line between two boxes in a given context.
	 *
	 * @param {HTMLElement} box1 The parent box.
	 * @param {HTMLElement} box2 The child box.
	 * @param {Canvas.Context} drawContext The 2dcontext of a canvas.
	 * @return {void}
	 */
	_drawLine: function(box1, box2, drawContext) {
		
		drawContext.beginPath();
		var line = {};
		//calculate rectangle corner (line has to point to center)
		line.x1 = box1.position().left + box1.outerWidth();
		line.y1 = box1.position().top + box1.outerHeight() / 2;
		
		line.x2 = line.x1+(box2.position().left -(line.x1))/2;
		line.y2 = line.y1;
		
		line.x3 = line.x2;
		line.y3 = box2.position().top + box2.outerHeight() / 2;
		
		line.x4 = box2.position().left;
		line.y4 = line.y3;
	
		drawContext.lineTo(line.x1, line.y1);
		drawContext.lineTo(line.x2, line.y2);
		drawContext.lineTo(line.x3, line.y3);
		drawContext.lineTo(line.x4, line.y4);
		drawContext.stroke();
		//draw "arrow"
		drawContext.beginPath();
		drawContext.arc(line.x4, line.y4, 5, 0, 10);
		drawContext.fill();
	},
	
	/**
	 * Event handler which is invoked when a div has been clicked.
	 * Decides whether to select (or multiselect) or deselect the div.
	 *
	 * @param {Object} div The jQuery object of the div
	 * @return {void}
	 */
	_onDivClicked : function(div) {
		// get the index of the div to be able to get the div name
		var divIndex = jQuery.inArray(div,this._divs);
		// in case the div does not exist, just stop
		if (divIndex == -1) return;
		var divName = this._divNames[divIndex];	
		
		var isSelected = (jQuery.inArray(divName,this._selectedDivs) > -1);
		if (isSelected && this._ctrlDown) {
			this.deselectDiv(divName);
		}else{
			if (!this._ctrlDown) {
				this.deselectAll();
			}	
			this.markDivSelected(divName);
		}
		this.showSelections();
	},
	
	/*
	 * Removes the items of _selectedDivs that do no longer exist.
	 *
	 * @return {void}
	 */
	_clearSelectedDivs : function() {
		jQuery.each(this._selectedDivs,function(index){
			if (jQuery.inArray(pergament._selectedDivs[index],pergament._divNames) == -1) {
				pergament._selectedDivs = jQuery.grep(pergament._selectedDivs,function(value){
					return value != pergament._selectedDivs[index];
				});
			}
		});
	},
	
	/*
	 * Makes the selections specified in _selectedDivs visible 
	 * and triggers the SingleSelect or MultiSelect events.
	 *
	 * @return {void}
	 */
	showSelections : function() {
		// remove all selections
		jQuery('.pergament-selected',this._context).removeClass('pergament-selected');
		// apply new selections
		jQuery.each(this._selectedDivs,function(index){
			var divIndex = jQuery.inArray(pergament._selectedDivs[index],pergament._divNames);
			var div = pergament._divs[divIndex];
			
			div.addClass('pergament-selected');
		});
		// trigger events
		if (this._selectedDivs.length == 1) {
			var divIndex = jQuery.inArray(this._selectedDivs[0],this._divNames);
			this._divs[divIndex].onSingleSelect();
		}
		if (this._selectedDivs.length > 1) {
			jQuery.each(this._selectedDivs,function(index){
				var divIndex = jQuery.inArray(pergament._selectedDivs[index],pergament._divNames);
				pergament._divs[divIndex].onMultiSelect();
			});
		}
	},
	
	/*
	 * Marks a div as selected.
	 * 
	 * @param {String} divName The name of the div in _divNames
	 * @return {void}
	 */ 
	markDivSelected : function(divName) {
		// get the index of the div to be able to get the div name
		var divIndex = jQuery.inArray(divName,this._divNames);
		// in case the div does not exist, just stop
		if (divIndex == -1) return;		
		
		if (jQuery.inArray(divName,this._selectedDivs) == -1) {
			this._selectedDivs.push(divName);
		}
	},
	
	/*
	 * Deselects a div by its name.
	 *
	 * @param {String} divName The name of the div.
	 * @return {void}
	 */
	deselectDiv : function(divName) {
		// get the index of the div to be able to get the div name
		var divIndex = jQuery.inArray(divName,this._divNames);
		// in case the div does not exist, just stop
		if (divIndex == -1)	return;
		var div = this._divs[divIndex];
		
		this._selectedDivs = jQuery.grep(this._selectedDivs,function(value){
			return value != divName;
		});
		div.onDeselect();
	},
	
	/*
	 * Deselects all selected divs.
	 *
	 * @return {void}
	 */
	deselectAll : function() {
		jQuery.each(this._selectedDivs,function(index){
			pergament.deselectDiv(pergament._selectedDivs[0]);			
		});
	},
	
	/*
	 * Returns the names of all currently selected items.
	 *
	 * @return {void}
	 */
	getSelectedDivIds : function() {
		return helpers.cloneObject(this._selectedDivs);
	}

}


