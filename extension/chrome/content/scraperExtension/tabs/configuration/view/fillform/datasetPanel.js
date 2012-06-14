/**
 * Class to create a context panel object  which contains properties for dataset rows.
 */
var DatasetPanel = (function() {
	
	/**
	 * The constructor.
	 * @param {jQObject} parent The jQuery Object containing the DOM-Element the DatasetPanel should be appended to.
	 */
	function DatasetPanel(parent) {
		
		var obj=this;
		
		//Append datasetPanel
		this.datasetPanel=$("<div/>",parent);
		this.datasetPanel.css("height","200px");
		this.datasetPanel.css("padding","5px");
		
		var dtLbl=$('<b>'+helpers.STR("strings_main","conf.ff.ds.label")+'</b>',this.datasetPanel);
		
		this.datasetPanel.append(dtLbl);
		
		this.datasetsHelpButton=new WedexHelpButton(helpers.STR("strings_main","conf.ff.ds.help"),"help/wand/gui#Datasets",this.datasetPanel);

		/* Append table div*/
		this.datasetTableDiv=$("<div style='float:left'/>",this.datasetPanel);
		this.datasetTableDiv.css("height","100%");
		this.datasetTableDiv.css("width","372px");
		
		/* Append button div*/
		this.datasetButtonDiv=$("<div style='float:left'/>",this.datasetPanel);
		this.datasetButtonDiv.css("height","100%");
		this.datasetButtonDiv.css("width","18px");

		parent.append(this.datasetPanel);
		this.datasetPanel.append(this.datasetTableDiv);
		this.datasetPanel.append(this.datasetButtonDiv);
		

		var model=configurationData.getCurrentConfig().getFormFillConfig().getTableDataModel();
		
		//Append dataset table
		var datasetDiv=this.datasetTableDiv;
		
		this.datasetTable=new WedexTable(datasetDiv,model);
		this.tableDiv=this.datasetTable.getOuterDiv();
		this.table=this.datasetTable.getTable();
		this.tableDiv.css("width","100%");
		this.tableDiv.css("height","150px");
		
		//Add buttons
		this.addButton = new WedexImageButton(this.datasetButtonDiv,helpers.getImage("plus-button_16.png"), helpers.getImage("plus-button_dis_16.png"),
			function(bttn){
				var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
				fillFormConfig.createDataset();
				obj.getTable().selectLastRow();
				configurationView.formPanel.update();				
			},helpers.STR("strings_main","conf.ff.ds.add.tooltip")
		);
		var jqAddBttn=this.addButton.getButton();
		jqAddBttn.width(16);
		jqAddBttn.height(16);
		jqAddBttn.css("marginLeft","5px");
		
		this.delButton = new WedexImageButton(this.datasetButtonDiv,helpers.getImage("minus-button_16.png"), helpers.getImage("minus-button_dis_16.png"),
			function(bttn){
				var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
				var selRowIndex=obj.getTable().getSelectedRowIndex();
				fillFormConfig.removeDataset(selRowIndex);
				bttn.disable(!obj.getTable().removeSelectedRow());
				configurationView.formPanel.update();
			},helpers.STR("strings_main","conf.ff.ds.delete.tooltip")
		);
		var jqDelBttn=this.delButton.getButton();
		jqDelBttn.width(16);
		jqDelBttn.height(16);
		jqDelBttn.css("marginLeft","5px");

	};
	
	/**
	 * Returns the dataset table.
	 * @return {jQObject} this.datasetTable The jQuery Object containing the DOM-Element of the dataset table.
	 */
	DatasetPanel.prototype.getTable = function() {
		return this.datasetTable;
	};

	/**
	 * Returns the add dataset button.
	 * @return {jQObject} this.addButton The jQuery Object containing the DOM-Element of the add dataset button.
	 */	
	DatasetPanel.prototype.getAddButton = function() {
		return this.addButton;
	};

	/**
	 * Returns the remove dataset button.
	 * @return {jQObject} this.addButton The jQuery Object containing the DOM-Element of the remove dataset button.
	 */		
	DatasetPanel.prototype.getDelButton = function() {
		return this.delButton;
	};
	
	/**
	 * Updates the panel and its content.
	 */
	DatasetPanel.prototype.update = function() {
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		var tableModel= fillFormConfig.getTableDataModel();		
		
		this.datasetTable.update(tableModel);
		
		this.updateButtons();
		
		
	};
	
	/**
	 * Updates the buttons of the panel by disabeling or enabling them.
	 */
	DatasetPanel.prototype.updateButtons = function() {
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		var indices=this.datasetTable.getSelectedCellIndices();
		
		//Disable deletion button if no row is selected
		this.delButton.disable(indices.row==-1);

		//Disable add button if no columns are given.
		this.addButton.disable(fillFormConfig.getNumberOfFields()==0);


		
	};
	
	return DatasetPanel;	
	
})();
