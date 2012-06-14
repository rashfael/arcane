/**
 * Class to create a context panel object  which contains properties for sub items rows.
 */
var SubItemsContextPanel = (function() {
	
	/**
	 * The constructor.
	 * @param parent the node in which the context panel should be added
	 */
	function SubItemsContextPanel(parent) {
		//Append customKeyContextPanel
		this.customKeyContextPanel=$("<div/>",parent);
		this.customKeyContextPanel.css("width","348px");
		parent.append(this.customKeyContextPanel);
	};

	/**
	 * Returns the panel.
	 * @return {jQObject} this.contextPanel The jQuery Object containing the DOM-Element of the context panel.
	 */
	SubItemsContextPanel.prototype.getPanel = function() {
		return this.customKeyContextPanel;
	};
	
	/**
	 * Updates the panel and its content.
	 */
	SubItemsContextPanel.prototype.update = function() {
		
		var obj=this;
		
		//Remove all former child elements
		this.customKeyContextPanel.children().remove();
		var indices=configurationView.magicPanel.getTablePanel().getTable().getSelectedCellIndices();

		if(indices.row<0)
			return;
			
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var groups = currentMagicConfig.getAttr('SubItems', 'groups');
		var cellValue=groups[indices.row];

		if(cellValue==null)
			return;
		
		//Draw label and seperator
		var cellLbl=$('<div>'+helpers.STR("strings_main","conf.mg.si.rowprops.label")+'</div>',this.customKeyContextPanel);
		var cellHr=$('<hr/>',this.customKeyContextPanel);
		this.customKeyContextPanel.append(cellLbl);
		this.customKeyContextPanel.append(cellHr);
		
		//Draw controls
		
		var keyLbl=$("<span>"+helpers.STR("strings_main","conf.mg.si.rowprops.key.label")+"</span>",this.customKeyContextPanel);
		keyLbl.css("paddingTop","5px");
		this.customKeyContextPanel.append(keyLbl);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.mg.si.rowprops.key.help"), 'help/wand/gui#configTabMagicSubItemsKey', this.customKeyContextPanel);
		
		var keyTf=$("<input type='text' id='keyInput'/>",this.customKeyContextPanel);
		keyTf.css("width","50%");
		this.customKeyContextPanel.append($('<br />', this.customKeyContextPanel)).append(keyTf);
		
		var selLbl=$("<br /><span>"+helpers.STR("strings_main","conf.mg.si.rowprops.sel.label")+"</span>",this.customKeyContextPanel);
		this.customKeyContextPanel.append(selLbl);
		selLbl.css("paddingTop","5px");
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.mg.si.rowprops.sel.help"), 'help/wand/gui#configTabMagicSubItemsSelector', this.customKeyContextPanel);
		
		var selTf=$("<input type='text' id='siCustomSelectorInput' style='float:left'/>",this.customKeyContextPanel);
		selTf.css("width","50%");
		this.customKeyContextPanel.append($('<br />', this.customKeyContextPanel)).append(selTf);
		
		var inspectBttn=new WedexImageButton(this.customKeyContextPanel,helpers.getImage("Templarian_inspector_16.png"),null,
			function(){	
				configurationContent._mode = 'subItem';
				Firebug.Inspector.toggleInspecting(Firebug.currentContext);			
			},
			helpers.STR("strings_main","conf.mg.si.rowprops.insp.tooltip"));
		inspectBttn.getButton().width(16);
		inspectBttn.getButton().height(16);
		inspectBttn.getButton().css("marginLeft","5px");
		inspectBttn.getButton().css("position","relative");
		inspectBttn.getButton().css("top","1px");
		
		listDectectBttn=new WedexImageButton(this.customKeyContextPanel,helpers.getImage("wand-hat_16.png"),helpers.getImage("wand-hat_16.png"),
			function(){ 
				var sel = new Selector();				
				sel.addDOMNode($($('#siCustomSelectorInput', fbDocument).val(), content.document));
				sel.detectList();
				$('#siCustomSelectorInput', fbDocument).val(sel.getSelector());
				jQuery('#siCustomSelectorInput', fbDocument).trigger('change'); 
				configurationView._drawMagicMarks(1);
			}, 
			helpers.STR("strings_main","conf.view.list.listdet.tooltip"));
		listDectectBttn.getButton().width(16);
		listDectectBttn.getButton().height(16);
		listDectectBttn.getButton().css("marginLeft","5px");
				
		//Set data from datamodel
		keyTf.val(cellValue.key);
		
		selTf.val(cellValue.selector);
				
		//Update on change event
		keyTf.change(function(){
			cellValue.key=keyTf.val();
			currentMagicConfig.setAttr('SubItems', 'groups', groups);
			obj.keyVal();
			configurationView.magicPanel.getTablePanel().update();
		});
		
		selTf.change(function(){		
			cellValue.selector=selTf.val();
			currentMagicConfig.setAttr('SubItems', 'groups', groups);
			obj.selVal();
			configurationView.magicPanel.getTablePanel().update();
			configurationView._drawMagicMarks(1);
		});
		
		keyTf.focus();
		keyTf.focus(function(){obj.validateInputs()});
		selTf.focus(function(){obj.validateInputs()});
		keyTf.focus(function(){obj.validateInputs()});
		inspectBttn.getButton().focus(function(){obj.validateInputs()});

		this.inputs=new Array();
		this.inputs.push(keyTf);
		this.inputs.push(selTf);
		
		this.keyTf=keyTf;
		this.selTf=selTf
		
	};
	
	/**
	 * Sets the focus to the indexed input
	 * @param index the index of the input which should be focused
	 */
	SubItemsContextPanel.prototype.focusInput = function(index) {
		this.inputs[index].focus();
	};
	
	/**
	 * Validates the given key value
	 */
	SubItemsContextPanel.prototype.keyVal = function() {
		var obj=this;
		var indices=configurationView.magicPanel.getTablePanel().getTable().getSelectedCellIndices();
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var selectors = currentMagicConfig.getAttr('SubItems', 'groups');	
		var cellValue=selectors[indices.row];
		
		//Check key duplicates.
		var keyAlreadyGiven = jQuery.grep(selectors, function(element, index) {
				return element.key == cellValue.key;
		});
		//>1 because entry itself already exists in datamodel
		if(keyAlreadyGiven.length>1){
			cellValue.key="";
			obj.keyTf.val("");
			status.error(helpers.STR("strings_main","conf.mg.si.rowprops.keyexists.warning"));
		}
		
		if(cellValue.key==""||cellValue.key==null){
			status.warning(helpers.STR("strings_main","conf.mg.si.rowprops.nokey.warning"));
		}
	};
	
	/**
	 * Validates the given selector value
	 */
	SubItemsContextPanel.prototype.selVal = function() {
		var indices=configurationView.magicPanel.getTablePanel().getTable().getSelectedCellIndices();
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var selectors = currentMagicConfig.getAttr('SubItems', 'groups');	
		var cellValue=selectors[indices.row];

		if(cellValue.selector==""||cellValue.selector==null){
			status.warning(helpers.STR("strings_main","conf.mg.si.rowprops.nosel.warning"));
		}
	};
	
	/**
	 * Validates all given inputs
	 */
	SubItemsContextPanel.prototype.validateInputs = function() {
		this.keyVal();
		this.selVal();
	};
	
	return SubItemsContextPanel;	
	
})();
