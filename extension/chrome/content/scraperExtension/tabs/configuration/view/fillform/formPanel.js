/**
 * Class to create a form panel object which contains a constant dataset part and a context sensitive part.
 */
var FormPanel = (function() {
	
	/**
	 * The constructor.
	 * @param {jQObject} parent The jQuery Object containing the DOM-Element the FormPanel should be appended to.
	 */
	function FormPanel(parent) {
		this.parent=parent;
		this.panel=$('<div id="formPanel" class="contextPanel"></div>',parent);
		this.panel.addClass('ui-state-default');
		this.panel.addClass('ui-corner-top');
		
		this.parent.append(this.panel);
		
		this.datasetPanel= new DatasetPanel(this.panel);
		this.contextPanel= new ContextPanel(this.panel);


	};

	/**
	 * Returns the dataset panel.
	 * @return {DatasetPanel} this.datasetPanel The dataset panel object.
	 */
	FormPanel.prototype.getDatasetPanel = function() {
		return this.datasetPanel;
	};

	/**
	 * Returns the context panel.
	 * @return {ContextPanel} this.contextPanel The context panel object.
	 */	
	FormPanel.prototype.getContextPanel = function() {
		return this.contextPanel;
	};
	
	/**
	 * Updates the form panel and its content.
	 */
	FormPanel.prototype.update = function() {
		this.datasetPanel.update();
		this.contextPanel.update();
	};
	
	return FormPanel;	
	
})();
