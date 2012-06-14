/**
 * The MagicConfig class representing the configuration of magic.
 */
var MagicConfig = (function() {

	/**
	 * The constructor.
	 */
	function MagicConfig() {

	}

	/**
	 * Returns the method with the given name.
	 *
	 * @param {String} methName The name of the method.
	 * @return {Object} [methName] The method object.
	 */
	MagicConfig.prototype.getMethod = function(methName) {
		return this[methName];
	};
	
	/**
	 * Returns the attribute of the method with the given names.
	 *
	 * @param {String} methName The name of the method.
	 * @param {String} attrName The name of the attribute.
	 * @return {Object} [methName][attrName] The attribute object.
	 */
	MagicConfig.prototype.getAttr = function(methName, attrName) {
		if(this[methName] == null)
			return null;	
		return this[methName][attrName];
	};	
	
	/**
	 * Returns the attribute of the method with the given names.
	 *
	 * @param {String} methName The name of the method.
	 * @param {String} attrName The name of the attribute.
	 * @return {void}
	 */
	MagicConfig.prototype.setAttr = function(methName, attrName, value) {
		if(this[methName] == null)
			this[methName] = new Object();
		this[methName][attrName] = value;
	};
	
	/**
	 * Returns the datamodel for the custom Key WedexTable.
	 *
	 * @return {Object} datamodel The datamodel.
	 */
	MagicConfig.prototype.getCustomKeyTableModel = function() {
		
		var datamodel = {
			cellSelection:false,
			columns: [
				{
					//The columns header definition 
					header :{
						sortable: true,
						text: helpers.STR("strings_main","conf.mg.cctbl.key.label"),
						tooltip: helpers.STR("strings_main","conf.mg.cctbl.key.tooltip"),
						width: "115px",
					},
					//The columns data cell definition 
					content: {
						selectAction:function(td, obj){
							configurationView.magicPanel.getTablePanel().updateButtons();
							configurationView.magicPanel.getContextPanel().update();
							configurationView.magicPanel.getContextPanel().focusInput(0);
						},
					}
				},
				{
					//The columns header definition 
					header :{
						text: helpers.STR("strings_main","conf.mg.cctbl.sel.label"),
						tooltip: helpers.STR("strings_main","conf.mg.cctbl.sel.tooltip"),
						width: "115px",
					},
					//The columns data cell definition 
					content: {
						element: "span",
						selectAction:function(td, obj){
							configurationView.magicPanel.getTablePanel().updateButtons();
							configurationView.magicPanel.getContextPanel().update();
							configurationView.magicPanel.getContextPanel().focusInput(1);
						},
					}
				},
				{
					//The columns header definition 
					header :{
						text: helpers.STR("strings_main","conf.mg.cctbl.incc.label"),
						tooltip: helpers.STR("strings_main","conf.mg.cctbl.incc.tooltip"),
						width: "80px",
					},
					//The columns data cell definition 
					content: {
						selectAction:function(td, obj){
							configurationView.magicPanel.getTablePanel().updateButtons();
							configurationView.magicPanel.getContextPanel().update();
							configurationView.magicPanel.getContextPanel().focusInput(2);
						},
					}
				},
  			],
  			rows:[]
			
		};
		
		var selectors = this.getAttr('CustomSelectors', 'selectors');
		$(selectors).each(function(index, element) {
			var row=new Array();
			var firstCell, secondCell, thirdCell;
			firstCell=new Object();
			secondCell=new Object();
			thirdCell=new Object();
			firstCell["text"]=element.key;
			firstCell["value"]=element.key;
			row.push(firstCell);
			secondCell["text"]=element.selector;
			secondCell["value"]=element.selector;
			row.push(secondCell);
			thirdCell["text"]=element.includeChildren;
			thirdCell["value"]=element.includeChildren;
			row.push(thirdCell);
			datamodel.rows.push(row);
		});
		return datamodel;
	};
	
	/**
	 * Returns the datamodel for the sub items WedexTable.
	 *
	 * @return {Object} datamodel The datamodel.
	 */
	MagicConfig.prototype.getSubItemsTableModel = function() {
		
		var datamodel = {
			cellSelection:false,
			columns: [
				{
					//The columns header definition 
					header :{
						sortable: true,
						text: helpers.STR("strings_main","conf.mg.sitbl.key.label"),
						tooltip: helpers.STR("strings_main","conf.mg.sitbl.key.tooltip"),
						width: "155px",
					},
					//The columns data cell definition 
					content: {
						selectAction:function(td, obj){
							configurationView.magicPanel.getTablePanel().updateButtons();
							configurationView.magicPanel.getContextPanel().update();
							configurationView.magicPanel.getContextPanel().focusInput(0);
						},
					}
				},
				{
					//The columns header definition 
					header :{
						text: helpers.STR("strings_main","conf.mg.sitbl.sel.label"),
						tooltip: helpers.STR("strings_main","conf.mg.sitbl.sel.tooltip"),
						width: "155px",
					},
					//The columns data cell definition 
					content: {
						element: "span",
						selectAction:function(td, obj){
							configurationView.magicPanel.getTablePanel().updateButtons();
							configurationView.magicPanel.getContextPanel().update();
							configurationView.magicPanel.getContextPanel().focusInput(1);
						},
					}
				},				
  			],
  			rows:[]
			
		};
		
		var groups = this.getAttr('SubItems', 'groups');
		$(groups).each(function(index, element) {
			var row=new Array();
			var firstCell, secondCell;
			firstCell=new Object();
			secondCell=new Object();
			// thirdCell=new Object();
			firstCell["text"]=element.key;
			firstCell["value"]=element.key;
			row.push(firstCell);
			secondCell["text"]=element.selector;
			secondCell["value"]=element.selector;
			row.push(secondCell);			
			datamodel.rows.push(row);
		});		
		
		return datamodel;
	};
	
	return MagicConfig;

})();