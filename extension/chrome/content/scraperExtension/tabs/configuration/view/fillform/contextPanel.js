/**
 * Class to create a context panel object  which contains properties for dataset rows.
 */
var ContextPanel = (function() {
	
	/**
	 * The constructor.
	 * @param {jQObject} parent The jQuery Object containing the DOM-Element the ContextPanel should be appended to.
	 */
	function ContextPanel(parent) {
		//Append contextPanel
		this.contextPanel=$("<div/>",parent);
		this.contextPanel.css("width","390px");
		this.contextPanel.css("padding","5px");
		parent.append(this.contextPanel);
	};

	/**
	 * Returns the panel.
	 * @return {jQObject} this.contextPanel The jQuery Object containing the DOM-Element of the context panel.
	 */
	ContextPanel.prototype.getPanel = function() {
		return this.contextPanel;
	};
	
	/**
	 * Updates the panel and its content.
	 */
	ContextPanel.prototype.update = function() {
		//Remove all former child elements
		this.contextPanel.children().remove();
		
		var indices=configurationView.formPanel.getDatasetPanel().getTable().getSelectedCellIndices();

		if(indices.row<0||indices.col<0)
			return;
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		var cellValue = fillFormConfig.getValue(indices.row,indices.col);

		if(cellValue==null)
			return;
		
		//Draw label and seperator
		var cellLbl=$('<b>'+helpers.STR("strings_main","conf.ff.ds.rowprops.label")+'</b>',this.contextPanel);
		var cellHr=$('<hr/>',this.contextPanel);
		this.contextPanel.append(cellLbl);
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.ff.ds.rowprops.help"), "help/wand/gui#IteratorRowProperties", this.contextPanel);
		this.contextPanel.append(cellHr);
		
		//Append two containers for properties
		this.innerPanel=$("<div/>",this.contextPanel);
		this.innerPanel.css("width","50%");

		this.contextPanel.append(this.innerPanel);

		this.indexPanel= new IndexPanel(this.contextPanel,indices);
	};

	return ContextPanel;	
	
})();
