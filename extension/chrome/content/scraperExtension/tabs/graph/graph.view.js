/**
 * The view of the graph tab.
 */
var graphView = {

	/**
	 * This is the undo stack.
	 */
	_undoStack : [],

	/**
	 * This is the redo stack.
	 */
	_redoStack : [],
	
	/**
	 * The current scraper config.
	 */
	_localScraperConfig : null,
	
	/**
	 * Returns the local scraper config.
	 */
	 getLocalScraperConfig : function(){
		return this._localScraperConfig;
	 },

	/**
	 * Initializes the graph view.
	 */
	init : function() {
		// Resize event for graph tab
		var adjustGraphPropsPanelWidth = function() {
			jQuery("#pergament", fbDocument).width(jQuery(fbDocument).width() - 250);
		}
				
		adjustGraphPropsPanelWidth();

		jQuery('#fbContentBox', document).resize(adjustGraphPropsPanelWidth);

		// Set title of buttons
		jQuery.each(graphNodeModels.getAllModels(), function(modelPropName, model) {
			jQuery("#actionItem_graph" + model.type, document).attr("label", model.name);
		});

		// Render graph
		this.renderGraph();
	},
	
	/**
	 * Generates undo/redo commands out of the passed configs.
	 *
	 * @param {ScraperConfig} oldConf The configuration before the changes.
	 * @param {ScraperConfig} newConf The configuration after the changes.
	 */
	createAndPushCmd : function(oldConf, newConf) {
		this._localScraperConfig=helpers.cloneObject(newConf);
		this._redoStack.length = 0;
		
		var undoPatch = patcher.computePatch(newConf, oldConf);
		
		if (undoPatch === null) {
			return;
		}
		
		this._undoStack.push(undoPatch);
	},

	/**
	 * Looks up the recently pushed command of the undo stack.
	 *
	 * @return {ScraperConfig} The current undo config.
	 */
	peekUndo : function() {
		var ret = this._undoStack.pop();
		if (typeof ret === 'undefined')
			return;
		this._undoStack.push(ret);
		return ret;
	},

	/**
	 * Pops the last command from the undo stack.
	 * 
	 * @return {Command} The last command.
	 */
	popUndo : function() {
		return this._undoStack.pop();
	},

	/**
	 * Pushs the command into the redo stack.
	 *
	 * @param {Command} cmd The command.
	 */
	pushRedo : function(cmd) {
		this._redoStack.push(cmd);
	},

	/**
	 * Pushs the command into the undo stack.
	 *
	 * @param {Command} cmd The command.
	 */
	pushUndo : function(cmd) {
		this._undoStack.push(cmd);
	},
	
	/**
	 * Looks up the recently pushed command of the redo stack.
	 * 
	 * @return {Command} The last command.
	 */
	peekRedo : function() {
		var ret = this._redoStack.pop();
		if (typeof ret === 'undefined')
			return;
		this._redoStack.push(ret);
		return ret;
	},

	/**
	 * Pop command from the redo stack.
	 * 
	 * @return {Command} The last command.
	 */
	popRedo : function() {
		return this._redoStack.pop();
	},

	/**
	 * Updates the graph panel.
	 */
	update : function() {
		this._updateControl("graphUndo","arrow-curve-180-left_dis_16.png","arrow-curve-180-left_16.png");
		this._updateControl("graphRedo","arrow-curve_dis_16.png","arrow-curve_16.png");
		
		this._updateControl("graphStart");
		this._updateControl("graphWalkthroughLinks");
		this._updateControl("graphWalkthroughItems");
		this._updateControl("graphPager");
		this._updateControl("graphFollowLink");
		this._updateControl("graphFillForm");
		this._updateControl("graphMagic");
		this._updateControl("graphCollect");

		this._updateControl("graphRemoveNode","node-delete_dis_16.png","node-delete_16.png");
		
		this._updateControl("graphAddEdge","edge-add_dis_16.png","edge-add_16.png");
		this._updateControl("graphRemoveEdge","edge-remove_dis_16.png","edge-remove_16.png");
	},

	/**
	 * Updates the undo redo buttons.
	 */
	_updateControl : function(id,disImageName,enImageName) {
		var control = document.getElementById("actionItem_" + id);
		var state = graphValidators[id]();
		var disImage=helpers.getImage(disImageName);
		var enImage=helpers.getImage(enImageName);
		
		var command=document.getElementById(control.command);
		if(command!=null)
			command.disabled=!state;
		control.disabled=!state;
		
		if(state && (typeof enImageName != 'undefined'))
			control.image = enImage;
		else if(typeof disImageName != 'undefined')
			control.image = disImage;
	},

	/**
	 * Default function to render a node in the graph tab.
	 *
	 * @return {string} HTML snippet which represents the node.
	 */
	defaultRenderNode : function(title, icon, style, tooltip) {
		return '<div style="' + style + '" title="' + tooltip + '"><img src="'
				+ icon + '" title="' + tooltip + '" /><br />' + title
				+ '</div>';
	},

	/**
	 * Renders the graph using pergament.
	 */
	renderGraph : function() {
		var graphWidth = jQuery("#graph", fbDocument).width();

		// Check if graph container has been initialized already
		if (graphWidth === 0) {
			setTimeout(graphView.renderGraph, 50);
		} else {
			graphPropsPanel.showMessageNoNodeSelected();

			pergament.render(graphData.getScraperConfigPart(), fbDocument);
		}
	}
}

/**
 * Validators for the graph view.
 */
var graphValidators = {

	/**
	 * Returns whether the UndoBttn should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */	
	graphUndo : function(){
		return (graphView.peekUndo() != null);
	},
	
	/**
	 * Returns whether the RedoBttn should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */		
	graphRedo : function(){
		return (graphView.peekRedo() != null);
	},
	/**
	 * Returns whether the EntryPoint MenuItem should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphStart : function(){
		return true;
	},
	
	/**
	 * Returns whether the WalkthroughLinks  MenuItem should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphWalkthroughLinks : function(){
		var selectedNodes = pergament.getSelectedDivIds();
		var isEmpty=jQuery.isEmptyObject(selectedNodes);
		return (!isEmpty);
	},
	
	/**
	 * Returns whether the WalkThroughItems MenuItem should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphWalkthroughItems : function(){
		var selectedNodes = pergament.getSelectedDivIds();
		var isEmpty=jQuery.isEmptyObject(selectedNodes);
		return (!isEmpty);
	},
	
	/**
	 * Returns whether the Pager MenuItem should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphPager : function(){
		var selectedNodes = pergament.getSelectedDivIds();
		var isEmpty=jQuery.isEmptyObject(selectedNodes);
		return (!isEmpty);
	},
	
	/**
	 * Returns whether the followLinkItems MenuItem should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphFollowLink : function(){
		var selectedNodes = pergament.getSelectedDivIds();
		var isEmpty=jQuery.isEmptyObject(selectedNodes);
		return (!isEmpty);
	},
	
	/**
	 * Returns whether the FetchDetailsFromTargetItems MenuItem should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphCollect : function(){
		var selectedNodes = pergament.getSelectedDivIds();
		var isEmpty=jQuery.isEmptyObject(selectedNodes);
		return (!isEmpty);
	},

	/**
	 * Returns whether the Magic MenuItem should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphMagic : function(){
		var selectedNodes = pergament.getSelectedDivIds();
		var isEmpty=jQuery.isEmptyObject(selectedNodes);
		return (!isEmpty);
	},

	/**
	 * Returns whether the FillForm MenuItem should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphFillForm : function(){
			var selectedNodes = pergament.getSelectedDivIds();
			var isEmpty=jQuery.isEmptyObject(selectedNodes);
			return (!isEmpty);
	},
	
	/**
	 * Returns whether the RemoveNode button should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphRemoveNode : function(){
		var selectedNodes = pergament.getSelectedDivIds();
		var isEmpty=jQuery.isEmptyObject(selectedNodes);
		return (!isEmpty);
	},
	
	/**
	 * Returns whether the AddEdge button should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphAddEdge : function(){
		var selectedNodes = pergament.getSelectedDivIds();

		if(!jQuery.isEmptyObject(selectedNodes)) {
			var counter = 0;
			
			var theOneNodeId = null;
			var theOtherNodeId = null;

			jQuery.each(selectedNodes, function(index, nodeId) {
				counter++;
				
				if (theOneNodeId === null) {
					theOneNodeId = nodeId;
				} else {
					theOtherNodeId = nodeId;
				}
			});

			// Assertion: exactly two nodes selected
			if (counter === 2) {
				// Assertion: the nodes aren't connected already
				if (jQuery.inArray(theOtherNodeId, graphData.getNode(theOneNodeId).next) !== -1) {
					return false;
				} else if (jQuery.inArray(theOneNodeId, graphData.getNode(theOtherNodeId).next) !== -1) {
					return false;
				}
				
				return true;
			}
		}

		return false;
	},
	
	/**
	 * Returns whether the RemoveEdge button should be enabled or not.
	 *
	 * @return {boolean} True if it should be enabled, false else.
	 */
	graphRemoveEdge : function(){
		var selectedNodes = pergament.getSelectedDivIds();

		if(!jQuery.isEmptyObject(selectedNodes)) {
			var counter = 0;
			
			var predecNodes = [];
			
			var theOneNodeId = null;
			var theOtherNodeId = null;

			jQuery.each(selectedNodes, function(index, nodeId) {
				counter++;
				
				if (theOneNodeId === null) {
					theOneNodeId = nodeId;
				} else {
					theOtherNodeId = nodeId;
				}
				
				// Store node IDs of predecessor nodes
				predecNodes[nodeId] = graphData.getPredecessorNodes(nodeId);
			});

			// Assertion: exactly two nodes selected
			if (counter === 2) {
				// Assertion: target node has to be connected
				// to another predecessor node
				var sourceNodeId = null;
				var targetNodeId = null;
				
				if (jQuery.inArray(theOtherNodeId, graphData.getNode(theOneNodeId).next) !== -1) {
					sourceNodeId = theOneNodeId;
					targetNodeId = theOtherNodeId;
				} else {
					sourceNodeId = theOtherNodeId;
					targetNodeId = theOneNodeId;
				}
				
				if (predecNodes[targetNodeId].length >= 2) {
					return true;
				}
			}
		}

		return false;
	}
}
