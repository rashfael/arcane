/**
 * Class to create a context panel object which contains properties for custom key rows.
 */
var CustomKeyContextPanel = (function() {
	
	/**
	 * The constructor.
	 * @param parent the node in which the context panel should be added
	 */
	function CustomKeyContextPanel(parent) {
		//Append customKeyContextPanel
		this.customKeyContextPanel=$("<div/>",parent);
		this.customKeyContextPanel.css("width","348px");
		parent.append(this.customKeyContextPanel);
	};

	/**
	 * Returns the panel.
	 * @return {jQObject} this.contextPanel The jQuery Object containing the DOM-Element of the context panel.
	 */
	CustomKeyContextPanel.prototype.getPanel = function() {
		return this.customKeyContextPanel;
	};
	
	/**
	 * Updates the panel and its content.
	 */
	CustomKeyContextPanel.prototype.update = function() {
		var obj=this;
		
		//Remove all former child elements
		this.customKeyContextPanel.children().remove();
		var indices=configurationView.magicPanel.getTablePanel().getTable().getSelectedCellIndices();

		if(indices.row<0)
			return;
			
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var selectors = currentMagicConfig.getAttr('CustomSelectors', 'selectors');
		var cellValue=selectors[indices.row];

		if(cellValue==null)
			return;
		
		//Draw label and seperator
		var cellLbl=$('<div>'+helpers.STR("strings_main","conf.mg.cc.rowprops.label")+'</div>',this.customKeyContextPanel);
		var cellHr=$('<hr/>',this.customKeyContextPanel);
		this.customKeyContextPanel.append(cellLbl);
		this.customKeyContextPanel.append(cellHr);
		
		//Draw controls
				
		var keyLbl=$("<span>"+helpers.STR("strings_main","conf.mg.cc.rowprops.key.label")+"</span>",this.customKeyContextPanel);
		keyLbl.css("paddingTop","5px");
		this.customKeyContextPanel.append(keyLbl);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.mg.cc.rowprops.key.help"), 'help/wand/gui#configTabMagicCustomKeysKey', this.customKeyContextPanel);
		
		var keyTf=$("<input type='text'/>",this.customKeyContextPanel);
		keyTf.css("width","50%");
		this.customKeyContextPanel.append($('<br />', this.customKeyContextPanel)).append(keyTf);
		
		var selLbl=$("<span>"+helpers.STR("strings_main","conf.mg.cc.rowprops.sel.label")+"</span>",this.customKeyContextPanel);
		this.customKeyContextPanel.append($('<br />', this.customKeyContextPanel)).append(selLbl);
		selLbl.css("paddingTop","5px");
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.mg.cc.rowprops.sel.help"), 'help/wand/gui#configTabMagicCustomKeysSelector', this.customKeyContextPanel);
		
		var selTf=$("<input type='text' id='customSelectorInput' />",this.customKeyContextPanel);
		selTf.css("width","50%");
		this.customKeyContextPanel.append($('<br />', this.customKeyContextPanel)).append(selTf);
		
		var inspectBttn=new WedexImageButton(this.customKeyContextPanel,helpers.getImage("Templarian_inspector_16.png"),null,function(){	
			configurationContent._mode = 'customKey';
			Firebug.Inspector.toggleInspecting(Firebug.currentContext);
		},helpers.STR("strings_main","conf.mg.cc.rowprops.insp.tooltip"));
		inspectBttn.getButton().width(16);
		inspectBttn.getButton().height(16);
		inspectBttn.getButton().css("marginLeft","5px");
		
		var childLbl=$("<span>"+helpers.STR("strings_main","conf.mg.cc.rowprops.incc.label")+"</span>",this.customKeyContextPanel);
		this.customKeyContextPanel.append($('<br />', this.customKeyContextPanel)).append(childLbl);
		childLbl.css("paddingTop","5px");
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.mg.cc.rowprops.incc.help"), 'help/wand/gui#configTabMagicCustomKeysNumberOfIncludedChildren', this.customKeyContextPanel);
		
		var childTf=$("<input type='text'/>",this.customKeyContextPanel);
		childTf.css("width","50%");
		this.customKeyContextPanel.append($('<br />', this.customKeyContextPanel)).append(childTf);
		
		
		//Set data from datamodel
		keyTf.val(cellValue.key);
		
		selTf.val(cellValue.selector);
		
		childTf.val(cellValue.includeChildren);
		
		//Update on change event
		keyTf.change(function(){
			cellValue.key=keyTf.val();
			currentMagicConfig.setAttr('CustomSelectors', 'selectors', selectors);
			obj.keyVal();
			configurationView.magicPanel.getTablePanel().update();
		});		
		
		selTf.change(function(){
			cellValue.selector=selTf.val();
			currentMagicConfig.setAttr('CustomSelectors', 'selectors', selectors);
			obj.selVal();
			configurationView.magicPanel.getTablePanel().update();
			configurationView._drawMagicMarks(0);			
		});
				
		childTf.change(function(){
			cellValue.includeChildren=childTf.val();
			currentMagicConfig.setAttr('CustomSelectors', 'selectors', selectors);
			obj.childVal();
			configurationView.magicPanel.getTablePanel().update();
		});
		
		keyTf.focus();
		
		keyTf.focus(function(){obj.validateInputs()});
		selTf.focus(function(){obj.validateInputs()});
		keyTf.focus(function(){obj.validateInputs()});
		inspectBttn.getButton().focus(function(){obj.validateInputs()});

		this.inputs=new Array();
		this.inputs.push(keyTf);
		this.inputs.push(selTf);
		this.inputs.push(childTf);
		
		this.keyTf=keyTf;
		this.selTf=selTf
		this.childTf=childTf		
	};
	
	/**
	 * Sets the focus to the indexed input
	 * @param index the index of the input which should be focused
	 */
	CustomKeyContextPanel.prototype.focusInput = function(index) {
		this.inputs[index].focus();
	};
	
	/**
	 * Validates the given key value
	 */
	CustomKeyContextPanel.prototype.keyVal = function() {
		var obj=this;
		var indices=configurationView.magicPanel.getTablePanel().getTable().getSelectedCellIndices();
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var selectors = currentMagicConfig.getAttr('CustomSelectors', 'selectors');	
		var cellValue=selectors[indices.row];
		
		//Check key duplicates.
		var keyAlreadyGiven = jQuery.grep(selectors, function(element, index) {
				return element.key == cellValue.key;
		});
		//>1 because entry itself already exists in datamodel
		if(keyAlreadyGiven.length>1){
			cellValue.key="";
			obj.keyTf.val("");
			status.error(helpers.STR("strings_main","conf.mg.cc.rowprops.keyexists.warning"));
		}
		
		if(cellValue.key==""||cellValue.key==null){
			status.warning(helpers.STR("strings_main","conf.mg.cc.rowprops.nokey.warning"));
		}
	};
	
	/**
	 * Validates the given selector value
	 */
	CustomKeyContextPanel.prototype.selVal = function() {
		var indices=configurationView.magicPanel.getTablePanel().getTable().getSelectedCellIndices();
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var selectors = currentMagicConfig.getAttr('CustomSelectors', 'selectors');	
		var cellValue=selectors[indices.row];

		if(cellValue.selector==""||cellValue.selector==null){
			status.warning("No selector entered.");
		}
	};
	
	/**
	 * Validates the given child depth value
	 */
	CustomKeyContextPanel.prototype.childVal = function() {
		var obj=this;
		var indices=configurationView.magicPanel.getTablePanel().getTable().getSelectedCellIndices();
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var selectors = currentMagicConfig.getAttr('CustomSelectors', 'selectors');	
		var cellValue=selectors[indices.row];

		if(typeof(cellValue.includeChildren)!='number'&&parseInt(cellValue.includeChildren)!=cellValue.includeChildren||cellValue.includeChildren==null||cellValue.includeChildren==""||parseInt(cellValue.includeChildren)<0){
			status.warning(helpers.STR("strings_main","conf.mg.cc.rowprops.notanumb.warning"));
			cellValue.includeChildren="0";
			obj.childTf.val("0");
		}
	};
	
	/**
	 * Validates all given inputs
	 */
	CustomKeyContextPanel.prototype.validateInputs = function() {
		this.keyVal();
		this.selVal();
		this.childVal();
	};
	
	return CustomKeyContextPanel;	
	
})();
