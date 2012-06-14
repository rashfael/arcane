/**
 * Class to create a table panel object which contains the custom key table.
 */
var CustomKeyTablePanel = (function() {
	
	/**
	 * The constructor.
	 * @param parent 	the node in which the table panel should be added
	 */
	function CustomKeyTablePanel(parent) {
		
		this.parent=parent;
		
		var obj=this;
		
		//Append datasetPanel
		this.customKeyTablePanel=$("<div/>",parent);
		this.customKeyTablePanel.css("height","200px");
		this.customKeyTablePanel.css("padding","0px");
		
		var dtLbl=$('<b>'+helpers.STR("strings_main","conf.mg.cc.label")+'</b>',this.customKeyTablePanel);
		
		this.customKeyTablePanel.append(dtLbl);
		
		
		// Append table div
		this.tableDiv=$("<div style='float:left'/>",this.customKeyTablePanel);
		this.tableDiv.css("height","100%");
		this.tableDiv.css("width","340px");
		
		// Append button div
		this.buttonDiv=$("<div style='float:left'/>",this.customKeyTablePanel);
		this.buttonDiv.css("height","100%");
		this.buttonDiv.css("width","18px");
		
		this.parent.append(this.customKeyTablePanel);
		this.customKeyTablePanel.append(this.tableDiv);
		this.customKeyTablePanel.append(this.buttonDiv);
		
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var model=currentMagicConfig.getCustomKeyTableModel();
		
		//Append customKey table
		var customKeyDiv=this.tableDiv;
		
		this.keyTable=new WedexTable(customKeyDiv,model);
		this.tableDiv=this.keyTable.getOuterDiv();
		this.table=this.keyTable.getTable();
		this.tableDiv.css("width","100%");
		this.tableDiv.css("height","150px");
		
		//Add buttons
		this.addButton = new WedexImageButton(this.buttonDiv,helpers.getImage("plus-button_16.png"), helpers.getImage("plus-button_dis_16.png"),
			function(bttn){
				var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
				var selectors = currentMagicConfig.getAttr('CustomSelectors', 'selectors');
				
				if(selectors == null)
					selectors = new Array();
				
				var selector = new Object();
				selector.key = "";
				selector.selector = "";
				selector.includeChildren = 2;
				selectors.push(selector);
				currentMagicConfig.setAttr('CustomSelectors', 'selectors', selectors);
				obj.getTable().selectLastRow();
				configurationView.magicPanel.update();
				status.info(helpers.STR("strings_main","conf.mg.cc.add.info"));
			},helpers.STR("strings_main","conf.mg.cc.add.tooltip")
		);
		var jqAddBttn=this.addButton.getButton();
		jqAddBttn.width(16);
		jqAddBttn.height(16);
		jqAddBttn.css("marginLeft","5px");
		
		this.delButton = new WedexImageButton(this.buttonDiv,helpers.getImage("minus-button_16.png"), helpers.getImage("minus-button_dis_16.png"),
			function(bttn){
				//Delete entry in data model
				var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
				var selectors = currentMagicConfig.getAttr('CustomSelectors', 'selectors');
				var selRowIndex=obj.getTable().getSelectedRowIndex();
				selectors.splice(selRowIndex,1);
				bttn.disable(!obj.getTable().removeSelectedRow());
				configurationView.magicPanel.update();
				configurationView._drawMagicMarks(0);
			},helpers.STR("strings_main","conf.mg.cc.delete.tooltip")
		);
		var jqDelBttn=this.delButton.getButton();
		jqDelBttn.width(16);
		jqDelBttn.height(16);
		jqDelBttn.css("marginLeft","5px");
		
		//this.keyTable.addRow([""])
		this.updateButtons();
		
	};

	/**
	 * Returns the table
	 * @return the table
	 */
	CustomKeyTablePanel.prototype.getTable = function() {
		return this.keyTable;
	};
	
	/**
	 * Returns the add button
	 * @return the add button
	 */
	CustomKeyTablePanel.prototype.getAddButton = function() {
		return this.addButton;
	};
	
	/**
	 * Returns the delete button
	 * @return the delete button
	 */
	CustomKeyTablePanel.prototype.getDelButton = function() {
		return this.delButton;
	};
	
	/**
	 * Updates the table panel
	 */
	CustomKeyTablePanel.prototype.update = function() {
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var model=currentMagicConfig.getCustomKeyTableModel();	
		this.keyTable.update(model);
		this.updateButtons();		
	};
	
	/**
	 * Updates the buttons
	 */
	CustomKeyTablePanel.prototype.updateButtons = function() {
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var indices=this.keyTable.getSelectedCellIndices();
		
		//Disable deletion button if no row is selected
		this.delButton.disable(indices.row==-1);
		
		//Disable add button if information of rows is not complete
		var selectors = currentMagicConfig.getAttr('CustomSelectors', 'selectors');
		this.addButton.disable(false);
		if(selectors==null)
			return;
		var enableAddBttn=true;
		jQuery.each(selectors,function(){
			if(this==null){
				return;
			}
			var cellComplete=(this.key!=null&&this.key!="")&&(this.selector!=null&&this.selector!="")&&(this.includeChildren!=null&&this.includeChildren!="")
			if(!cellComplete)
				enableAddBttn=false;
		});
		
		this.addButton.disable(!enableAddBttn);

	};
	
	return CustomKeyTablePanel;
})();
