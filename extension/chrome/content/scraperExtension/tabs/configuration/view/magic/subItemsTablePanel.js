/**
 * Class to create a table panel object which contains the sub items table.
 */
var SubItemsTablePanel = (function() {
	
	/**
	 * The constructor.
	 * @param parent 	the node in which the table panel should be added
	 */
	function SubItemsTablePanel(parent) {
		
		this.parent=parent;
		
		var obj=this;
		
		//Append datasetPanel
		this.customKeyTablePanel=$("<div/>",parent);
		this.customKeyTablePanel.css("height","200px");
		this.customKeyTablePanel.css("padding","0px");
		
		var dtLbl=$('<b>'+helpers.STR("strings_main","conf.mg.si.label")+'</b>',this.customKeyTablePanel);
		
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
		var model=currentMagicConfig.getSubItemsTableModel();
		
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
				var groups = currentMagicConfig.getAttr('SubItems', 'groups');
				
				if(groups == null)
					groups = new Array();
				
				var group = new Object();
				group.key = "";
				group.selector = "";
				
				groups.push(group);
				currentMagicConfig.setAttr('SubItems', 'groups', groups);
				obj.getTable().selectLastRow();
				configurationView.magicPanel.update();
				status.info(helpers.STR("strings_main","conf.mg.si.add.info"));
			},helpers.STR("strings_main","conf.mg.si.add.tooltip")
		);
		var jqAddBttn=this.addButton.getButton();
		jqAddBttn.width(16);
		jqAddBttn.height(16);
		jqAddBttn.css("marginLeft","5px");
		
		this.delButton = new WedexImageButton(this.buttonDiv,helpers.getImage("minus-button_16.png"), helpers.getImage("minus-button_dis_16.png"),
			function(bttn){
				//Delete entry in data model
				var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
				var groups = currentMagicConfig.getAttr('SubItems', 'groups');
				var selRowIndex=obj.getTable().getSelectedRowIndex();
				groups.splice(selRowIndex,1);
				bttn.disable(!obj.getTable().removeSelectedRow());
				configurationView.magicPanel.update();
				
				configurationView._drawMagicMarks(1);
			},helpers.STR("strings_main","conf.mg.si.delete.tooltip")
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
	SubItemsTablePanel.prototype.getTable = function() {
		return this.keyTable;
	};
	
	/**
	 * Returns the add button
	 * @return the add button
	 */
	SubItemsTablePanel.prototype.getAddButton = function() {
		return this.addButton;
	};
	
	/**
	 * Returns the delete button
	 * @return the delete button
	 */
	SubItemsTablePanel.prototype.getDelButton = function() {
		return this.delButton;
	};
	
	/**
	 * Updates the table panel
	 */
	SubItemsTablePanel.prototype.update = function() {
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var model=currentMagicConfig.getSubItemsTableModel();	
		
		this.keyTable.update(model);
		
		this.updateButtons();
	};
	
	/**
	 * Updates the buttons
	 */
	SubItemsTablePanel.prototype.updateButtons = function() {
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
		var indices=this.keyTable.getSelectedCellIndices();
		
		//Disable deletion button if no row is selected
		this.delButton.disable(indices.row==-1);
		
		//Disable add button if information of rows is not complete
		var groups = currentMagicConfig.getAttr('SubItems', 'groups');
		this.addButton.disable(false);
		if(groups==null)
			return;
		var enableAddBttn=true;
		jQuery.each(groups,function(){
			if(this==null){
				return;
			}
			var cellComplete=(this.key!=null&&this.key!="")&&(this.selector!=null&&this.selector!="")
			if(!cellComplete)
				enableAddBttn=false;
		});
		
		this.addButton.disable(!enableAddBttn);

	};
	
	return SubItemsTablePanel;	
})();
