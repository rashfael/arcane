/**
 * Object containing the main methods concerning to the config tab.
 */
var configTab = {
	init : function() {
		// Initialize data store
		configurationData.init();

		// Initialize view
		configurationView.init();
	},
	reset : function() {
		// Force re-initialization of data store
		configurationData.reset();

		// Render config tab
		configurationView.reset();
		
		configTab.updateUI();
	},
	
	updateUI : function(){
		configurationView.update();
	}
}

/**
 *	Singleton which represents the datamodel of the configuration tab. 
 */
 var configurationData = {
	
	/**
	 * Initializes the configuration data.
	 */
	init : function(){
		if(jQuery.isEmptyObject(this.getConfigs())==false)
			return;
		var id=new Date().getTime();
		this.addConfig(helpers.STR("strings_main","conf.defaultconf.label"),id);
		this.setCurrentConfigID(id);		
	},
	/**
	 * Resets the config tabs data.
	 */
	reset : function(){
		this._resetData();
		this.init();
	},
	
	/**
	 * The raw data.
	 */
	_data:{
		
		currentConfigID : null,
	
		configs : {}
		
	},
	/**
	 * Resets data.
	 */
	_resetData: function(){
		this._data={
			currentConfigID : null,
			
			configs :{}
		}
	},
	
	/**
	 * Creates and adds one config to the datamodel.
	 * @param {String} configName The name of the configuration which shall be created.
	 * @param {String} id The id of the configuration.
	 */
	addConfig : function(configName,id){
		if(configName==null){
			throw new Error("configName can not be null.");
		}
		if(id==null){
			throw new Error("id can not be null.");
		}
		if(this._data.configs.hasOwnProperty(id)==false){
			this._data.configs[id]=new Config(configName,id);
		}else{
			throw new Error("Can not add config with id "+id+". Reason: config ids have to be unique.");
		}			
	},
	
	/**
	 * Deletes one config.
	 * @param {String} id The id of the config which shall be deleted.
	 */
	deleteConfig : function(id){
		if(id==null){
			throw new Error("id can not be null.");
		}			
		if(this._data.configs.hasOwnProperty(id)==false){
			throw new Error("Can not remove config with id "+id+". Reason: There is no config with the given id.");
		}else{
			delete this._data.configs[id];
		}	
	},
	
	/**
	 * Renames one configuration.
	 * @param {String} id The id of the config.
	 * @param {String} newConfigName The new name of the config.
	 */
	renameConfig : function(id,newConfigName){
		if(id==null){
			throw new Error("configID can not be null.");
		}
		if(newConfigName==null){
			throw new Error("newConfigName can not be null.");
		}
		this.getConfig(id).setName(newConfigName);
	},
	
	/**
	 * Returns the configuration with the passed name.
	 * @param {String} id The id of the configuration.
	 * @return {Config} configs[configName] The configuration identified by the passed name.
	 */
	getConfig : function(id){
		if(id==null){
			throw new Error("id can not be null.");
		}
		if(this._data.configs.hasOwnProperty(id)==false){
			throw new Error("Can not find config with id "+id+". Reason: There is no config with the given id.");
		}
		return this._data.configs[id];
	},
	
	/**
	 * Returns the currently selected configuration.
	 * @return {Config}
	 */
	getCurrentConfig : function(){
		if(this._data.currentConfigID==null)
			return;
		return this.getConfig(this._data.currentConfigID);
	},
	
	/**
	 * Sets the currently selected configuration in the datamodel.
	 * @param {String} id The id of the selected configuration.
	 */
	setCurrentConfigID : function(id){
		this._data.currentConfigID=id;
	},
	
	/**
	 * Returns the id of the currently selected configuration.
	 * @return {String} id The name of the currently selected configuration.
	 */
	getCurrentConfigID : function(){
		return this._data.currentConfigID;
	},
	
	/**
	 * Returns the names of the configuration objects.
	 * @param {[String]} retVal An array containing the names of the configurations.
	 */
	getConfigNames : function(){
		var retVal=new Array();
		jQuery.each(configurationData._data.configs,function(){
			retVal.push(this._name);
		})
		return retVal;
	},
	
	/**
	 * Returns the configs of the configuration tab.
	 * @return {Object} _data.configs Object which contains all Config objects.
	 *
	 */
	getConfigs : function(){
		return helpers.cloneObject(configurationData._data.configs);
	},
	
	/**
	 * Returns the data of the configuration tab. Use this method for saving.
	 * @return {Object} _data The data of the configuration tab.
	 */
	getData : function(){
		
		return helpers.cloneObject(this._data);
	},
	
	/**
	 * Sets the data of the configuration tab. Use this method to reinitialize after loading.
	 * @param {Object} data The new configuration data object. 
	 */
	setData : function(data){
		
		this._data.configs={};
		
		var cmbbx=browser.chrome.$("configCmbbx");
		cmbbx.removeAllItems();
		
		jQuery.each(data.config.configs, 
			function(){
				configurationData.addConfig(this._name,this._id);
				var conf=configurationData.getConfig(this._id);
				cmbbx.appendItem(this._name,this._id);
				$(cmbbx).val(this._id);
				
				// restore list config
				conf._listConfig = new Selector();				
				if (this._listConfig.selectorString != null) {								
					conf._listConfig.setSelector(this._listConfig.selectorString);
				}
								
				// restore magic config
				if (this._magicConfig['SimpleAttributes'] !== undefined) {
					if (this._magicConfig['SimpleAttributes']['includeChildren'] !== undefined) {
						conf.getMagicConfig().setAttr("SimpleAttributes","includeChildren",this._magicConfig['SimpleAttributes']['includeChildren']);
					}
				}
				if (this._magicConfig['CustomSelectors'] !== undefined) {
					if (this._magicConfig['CustomSelectors']['selectors'] instanceof Array) {
						conf.getMagicConfig().setAttr("CustomSelectors","selectors",this._magicConfig['CustomSelectors']['selectors']);
					}
				}
				if (this._magicConfig['SubItems'] !== undefined) {
					if (this._magicConfig['SubItems']['groups'] instanceof Array) {
						conf.getMagicConfig().setAttr("SubItems","groups",this._magicConfig['SubItems']['groups']);
					}
				}
				
				// restore FormFill config
				conf.getFormFillConfig()._fields = this._formfillConfig._fields;
				conf.getFormFillConfig()._datasets = this._formfillConfig._datasets;
				conf.getFormFillConfig().importedJson = this._formfillConfig.importedJson;
				
			}
		);
		this.setCurrentConfigID(data.config.currentConfigID);
		configurationView.reset();
		
		if(activeTab=="configuration"){
			configurationView.update();
		}
	}
	
};

/**
 * Actions belonging to the configuration tab.
 */
var configurationActions = {
	
	/**
	 * Updates the ui.
	 */
	updateUI: function(){
		configTab.updateUI();
	},
	
	/**
	 * Invoked when one menuitem is selected.
	 */
	configSelected : function(element){
		configurationData.setCurrentConfigID(element.value);
		configurationView.formPanel.getDatasetPanel().getTable().resetSelection();
		this.updateUI();
	},
	
	/**
	 * Creates a new configuration.
	 */
	newConfig : function(){
		var cmbbx=browser.chrome.$("configCmbbx");
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var io ={value : ""}
		var dialogTitle=helpers.STR("strings_main","conf.dialog.new.title");
		var dialogDesc=helpers.STR("strings_main","conf.dialog.new.description");
		var confirmed = prompts.prompt(null, dialogTitle, dialogDesc, io, null, {});
		
		if(confirmed == true) {
			try{
				var id=new Date().getTime();
				configurationData.addConfig(io.value,id);
				cmbbx.appendItem(io.value,id);
				cmbbx.selectedIndex=cmbbx.itemCount-1;
				configurationData.setCurrentConfigID(id);
				configurationView.formPanel.getDatasetPanel().getTable().resetSelection();
				configurationView.magicPanel.getTablePanel().getTable().resetSelection();
				this.updateUI();
			}catch(e){
				console.error(e);
				status.error(helpers.STR("strings_main","conf.new.error"));
			}
		}
	},
	
	/**
	 * Renames the currently selected configuration.
	 */
	renameConfig : function(){
		var cmbbx=browser.chrome.$("configCmbbx");
		var currentConfigName=cmbbx.selectedItem.label;
		var currentConfigID=cmbbx.selectedItem.value;
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var io ={value : ""}
		var dialogTitle=helpers.STR("strings_main","conf.dialog.rename.title");
		var dialogDesc=helpers.STRF("strings_main","conf.dialog.rename.description",[currentConfigName]);
		var confirmed = prompts.prompt(null, dialogTitle, dialogDesc, io, null, {});
		
		if(confirmed == true) {
			try{
				configurationData.renameConfig(currentConfigID,io.value);
				cmbbx.getItemAtIndex(cmbbx.selectedIndex).label=io.value;
				this.updateUI();
			}catch(e){
				console.error(e);
				status.error(helpers.STR("strings_main","conf.rename.error"));
			}
		}
	},
	
	/**
	 * Delets the currently selected configuration.
	 */
	deleteConfig : function(){
		var cmbbx=browser.chrome.$("configCmbbx");
		var currentConfigName=cmbbx.selectedItem.label;
		var currentConfigID=cmbbx.selectedItem.value;
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var dialogTitle=helpers.STR("strings_main","conf.dialog.delete.title");
		var dialogDesc=helpers.STRF("strings_main","conf.dialog.delete.description",[currentConfigName]);
		var confirmed = prompts.confirm(null, dialogTitle, dialogDesc);
		
		if(confirmed == true) {
			try{
				configurationData.deleteConfig(currentConfigID);
				cmbbx.removeItemAt(cmbbx.selectedIndex);
				cmbbx.selectedIndex=0;
				configurationData.setCurrentConfigID(cmbbx.selectedItem.value);
				if(cmbbx.itemCount==0){
					cmbbx.removeAllItems();
				}
				configurationView.formPanel.getDatasetPanel().getTable().resetSelection();
				configurationView.magicPanel.getTablePanel().getTable().resetSelection();
				this.updateUI();
			}catch(e){
				console.error(e);
				status.error(helpsers.STR("strings_main","conf.delete.error"));
			}
		}
	},
	
	/**
	 * Start detecting the list items using the checked inspected items.
	 */
	detectList : function(){
		currentListConfig=configurationData.getCurrentConfig().getListConfig().detectList();
		this.updateUI();
	}
};

/**
 * Actions belonging to the Fill Form part of the configuration tab
 */
var formFillActions = {
	
	/**
	 * Add an input element
	 *
	 * @param fieldName 	The name of the element
	 * @param type			The type of the element
	 * @param selector		The selector of the element
	 */
	addElement : function (fieldName, type, selector) {
		if (fieldName.length < 1) {
			status.error(helpers.STR("strings_main","conf.ff.addel.noname.error"));	
			return null;
		}
		try
		{
			var field = { 
				fieldName : $('#inputNameInput', fbDocument).val(),
				type : $('#inputTypeInput :selected', fbDocument).text(),
				data : {},
			};
			
			var selector = $('#inputSelectorInput', fbDocument).val();
			var el = $(selector, content.document);
			var name = $(selector, content.document).attr("name");
			var value = $(selector, content.document).val();
			switch(field.type) {
				
				case 'DateField':					
					if (el.attr("type") == "text") {
						field.data.selector = selector;
						field.data.format = "DD.MM.YYYY";
						field.data.name = name;
					} else {
						status.warning(helpers.STR("strings_main","conf.ff.addel.noin.error"));
						return;
					}
					break;
					
				case 'DateGroup':
					field.data.selector = ["", "", ""];
					field.data.format = ["", "", ""];
					field.data.name = ["", "", ""];
					break;
					
				case 'RadioButton':					
					if (el.attr("type") == "radio") {
						field.data.selector = selector;
						field.data.name = name;
						var children = el.parent().find('input[name="'+name+'"]');
						field.data.value = [];
						jQuery.each(children, function(){
							var value = new Object();
							var child=$(this,content.document);
							if(child.text() != null && child.text() != "")
								value["text"] = child.text();
							else
								value["text"] = child.val();
							value["value"] = child.val();
							field.data.value.push(value);
						});
					} else {
						status.warning(helpers.STR("strings_main","conf.ff.addel.nord.error"));
						return;
					}
					break;
					
				case 'CheckBox':
					if (el.attr("type") == "checkbox") {
						field.data.selector = selector;
						field.data.name = name;
						field.data.value = value;
					} else {
						status.warning(helpers.STR("strings_main","conf.ff.addel.nocb.error"));
						return;
					}
					break;
					
				case 'ComboBox':
					if (el.is("select")) {
						field.data.selector = selector;
						field.data.name = name;
						var children = el.find("option");
						field.data.value = [];
						jQuery.each(children, function() {
							var value = new Object();
							var child = $(this, content.document);
							value["text"] = child.text();
							value["value"] = child.val();
							field.data.value.push(value);
						});
					} else {
						status.warning(helpers.STR("strings_main","conf.ff.addel.nocobo.error"));
						return;
					}
					break;
					
				case 'Parameter':
					break;
				
				default:
					if (el.attr("type") == "text") {
						field.data.selector = selector;
						field.data.name = name;
						field.data.value = value;
					} else {
						status.warning(helpers.STR("strings_main","conf.ff.addel.noin.error"));
						return;
					}
					break;
			}
			
			//Add entry to data
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
			fillFormConfig.addField(field.fieldName, field.type, field.data);
			
			//Draw entry
			configurationView._renderFormCont_tableEntry($('#formConfDiv', fbDocument).toArray()[0], field);
			$('#inputNameInput', fbDocument).val('').focus();
			$('#inputSelectorInput', fbDocument).val('');
			
			//Update formpanel
			configurationView.formPanel.update();
		}
		catch(err)
		{
			status.warning(helpers.STR("strings_main","conf.ff.addel.nameex.error"));
		}
	},
	
	/**
	 * Delete an input element
	 * 
	 * @param element 	The jQuery element containing all needed information
	 */
	deleteElement : function (element) {
		//Delete entry
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		fillFormConfig.removeField($(element).parent().parent().find('.nameDiv').val());
		//Update GUI
		if($('#' + $(element).parent().parent().find('.nameDiv').val(), fbDocument).toArray().length > 0)
			$('#' + $(element).parent().parent().find('.nameDiv').val(), fbDocument).remove();
		$(element).parent().parent().remove();
		configurationView.formPanel.getDatasetPanel().getTable().cellRemoved();
		//Update formpanel
		configurationView.formPanel.update();
	},
	
	/**
	 * Sort an input element up
	 * 
	 * @param element 	The jQuery element containing all needed information
	 */
	sortUpElement : function (element) {
		//Sort entry one step "up" in GUI
		var row = $(element).parent().parent().parent();
		if(row.prev().attr('id') !== 'inputItemHeader') {
			if(row.prev().hasClass('inputExpandItem') === false)
				row.insertBefore(row.prev());
			else
				row.insertBefore(row.prev().prev());
			$('#' + row.find('.nameDiv').val(), fbDocument).insertAfter(row);
		}
		//Sort entry one step "up" in data
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		fillFormConfig.fieldSortUp(row.find('.nameDiv').val());
		
		//Update formpanel
		configurationView.formPanel.update();
	},
	
	/**
	 * Sort an input element down
	 * 
	 * @param element 	The jQuery element containing all needed information
	 */
	sortDownElement : function (element) {
		//Sort entry one step "down" in GUI
		var row = $(element).parent().parent().parent();
		if(row.next().hasClass('inputItem') === true) {
			if(row.next().next().hasClass('inputExpandItem') === false)
				row.insertAfter(row.next());
			else
				row.insertAfter(row.next().next());
			$('#' + row.find('.nameDiv').val(), fbDocument).insertAfter(row);
		} else if (row.next().next().hasClass('inputItem') === true) {
			if(row.next().next().next().hasClass('inputExpandItem') === false)
				row.insertAfter(row.next().next());
			else
				row.insertAfter(row.next().next().next());
			$('#' + row.find('.nameDiv').val(), fbDocument).insertAfter(row);
		}
		//Sort entry one step "down" in data
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		fillFormConfig.fieldSortDown(row.find('.nameDiv').val());
		
		//Update formpanel
		configurationView.formPanel.update();
	},
	
	/**
	 * Expand an input element
	 * 
	 * @param element 	The jQuery element containing all needed information
	 */
	expandElement : function (element) {
		if($('#' + $(element).parent().parent().find('.nameDiv').val(), fbDocument).toArray().length < 1) {
			$(element).attr('src', helpers.getImage("minus_16.png"));
			configurationView._renderFormCont_tableEntryExpandArea($(element).parent().parent());
			
		} else {
			$(element).attr('src', helpers.getImage("plus_16.png"));
			$('#' + $(element).parent().parent().find('.nameDiv').val(), fbDocument).remove();
		}
	},
		
	/**
	 * Inspect to create a selector for an input element
	 * 
	 * @param element 	The jQuery element containing all needed information
	 */
	inspect : function (element) {
		configurationContent._mode = 'formInput';
		Firebug.Inspector.toggleInspecting(Firebug.currentContext);
	},
};

/**
 * The Config class.
 */
var Config = (function() {
	
	/**
	 * Creates one config object containing one ListConfig object and one MagicConfig object.
	 * @param {String} configName The name of the configuration. Not null!
	 */
	function Config(configName,id) {
		if (configName == null)
			throw new Error("Configuration name must not be null!");
		if (id == null)
			throw new Error("Configuration id must not be null!");
		this._name = configName;
		this._id = id;
		// list config can be just a Selector object
		this._listConfig=new Selector();
		this._magicConfig=new MagicConfig();
		this._formfillConfig = new FormFillConfig();
	}

	/**
	 * Sets the name of the config object.
	 * @param {String} configName The new name of the config.
	 */
	Config.prototype.setName = function(configName) {
		if (configName == null)
			throw new Error("Configuration name must not be null!");
		this._name = configName;
	};
	
	/**
	 * Returns the name of the config object.
	 * @return {String} _name The name of the config object.
	 */
	Config.prototype.getName = function() {
		return this._name;
	};
	
	/**
	 * Returns the id of the config object.
	 * @return {String} _id The id of the config object.
	 */
	Config.prototype.getID = function() {
		return this._id;
	};
	
	/**
	 * Returns the ListConfig object.
	 */
	Config.prototype.getListConfig = function() {
		return this._listConfig;
	};
	
	/**
	 * Returns the MagicConfig object.
	 */
	Config.prototype.getMagicConfig = function() {
		return this._magicConfig;
	};
	
	/**
	 * Returns the FormFillConfig object.
	 */
	Config.prototype.getFormFillConfig = function() {
		return this._formfillConfig;
	};
		
	return Config;

})();