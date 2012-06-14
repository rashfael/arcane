/**
 * Class to create a magic panel object which contains two tabs an tables for custom keys and sub items.
 */
var MagicPanel = (function() {
		
	/**
	 * The constructor.
	 */
	function MagicPanel(parent) {
		
		this.parent=parent;
		this.panel=$('<div id="magicPanel" class="contextPanel"></div>',parent);
		this.panel.addClass('ui-state-default');
		this.panel.addClass('ui-corner-top');
		this.parent.append(this.panel);
		
		//Create tabs
		var outerDiv = $('<div id="tabs"></div>', fbDocument);
		
		var tabHeaders = $('<ul></ul>', fbDocument);
		
		var tabHeader1 = $('<li></li>', fbDocument);
		tabHeaderLink1=$('<a href="#tabs-1">'+helpers.STR("strings_main","conf.mg.cc.label")+'</a>', fbDocument);
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.mg.cc.help"), 'help/wand/gui#configTabMagicCustomKeysOverview', tabHeaderLink1);
		tabHeader1.append(tabHeaderLink1);
		
		var tabHeader2 = $('<li></li>', fbDocument);
		tabHeaderLink2=$('<a href="#tabs-2">'+helpers.STR("strings_main","conf.mg.si.label")+'</a>', fbDocument);
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.mg.si.help"), 'help/wand/gui#configTabMagicSubItemsOverview', tabHeaderLink2);
		tabHeader2.append(tabHeaderLink2);
		
		tabHeaders.append(tabHeader1).append(tabHeader2);
		
		var customKeyContent = $('<div id="tabs-1"></div>', fbDocument);
		var subItemContent = $('<div id="tabs-2"></div>', fbDocument);
		
		outerDiv.append(tabHeaders).append(customKeyContent).append(subItemContent);		
		this.panel.append(outerDiv);		
		$('#tabs', fbDocument).tabs();
		
		this.customKeyTablePanel = new CustomKeyTablePanel(customKeyContent);
		this.customKeyContextPanel = new CustomKeyContextPanel(customKeyContent);
		this.subItemsTablePanel = new SubItemsTablePanel(subItemContent);
		this.subItemsContextPanel = new SubItemsContextPanel(subItemContent);
		this.tablePanel = this.customKeyTablePanel;
		this.contextPanel = this.customKeyContextPanel;
		
		$("#tabs", fbDocument).bind("tabsselect", function(event, ui) {
			var selected;
			Selector.unmarkAll();
			if ($('#tabs', fbDocument).tabs('option', 'selected') == 0)
				selected = 1;
			else if ($('#tabs', fbDocument).tabs('option', 'selected') == 1)
				selected = 0;
			
			configurationView.magicPanel.setTablePanel(selected);
			configurationView.magicPanel.setContextPanel(selected);
			configurationView._drawMagicMarks(selected);			
		});
		
		configurationView.resize();
	};
	
	/**
	 * Returns the currently used table panel
	 * @return the table panel
	 */
	MagicPanel.prototype.getTablePanel = function() {
		return this.tablePanel;
	};
	
	/**
	 * Returns the currently used context panel
	 * @return the context panel
	 */
	MagicPanel.prototype.getContextPanel = function() {
		return this.contextPanel;
	};
	
	/**
	 * Sets the currently used table panel
	 * @param selected 0 = customKey, 1 = subItems
	 */
	MagicPanel.prototype.setTablePanel = function(selected) {
		if (selected == 0)
			this.tablePanel = this.customKeyTablePanel;
		else if (selected == 1)
			this.tablePanel = this.subItemsTablePanel;
	};
	
	/**
	 * Sets the currently used context panel
	 * @param selected 0 = customKey, 1 = subItems
	 */
	MagicPanel.prototype.setContextPanel = function(selected) {
		if (selected == 0)
			this.contextPanel = this.customKeyContextPanel;
		else if (selected == 1)
			this.contextPanel = this.subItemsContextPanel;
	};
	
	/**
	 * Updates the magic Panek when data changed or so
	 */
	MagicPanel.prototype.update = function() {
		configurationView.magicPanel.setTablePanel(0);
		configurationView.magicPanel.setContextPanel(0);
		this.tablePanel.update();
		this.contextPanel.update();
		configurationView.magicPanel.setTablePanel(1);
		configurationView.magicPanel.setContextPanel(1);
		this.tablePanel.update();
		this.contextPanel.update();
		var selected = $('#tabs', fbDocument).tabs('option', 'selected');
		configurationView.magicPanel.setTablePanel(selected);
		configurationView.magicPanel.setContextPanel(selected);
	};
	
	return MagicPanel;	
})();
