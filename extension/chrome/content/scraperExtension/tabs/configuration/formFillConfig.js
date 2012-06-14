/**
 * The data object for the FormFill part.
 */
var FormFillConfig = (function() {
	

	
	/* This more or less works like a JTableModel in Java Swing (at least the dataset part).
	 * Because every table cell must be editable on its own, we can't just add 
	 * whole datasets but have to be able to set any single property of any dataset.
	 * To make the view component independent from dynamic field names, 
	 * the row and column indizes are used to identify the table cells.
	 */
	 
	/* A Field is given by 3 properties: fieldname = Name of the given field, type = a string from "validTypes",
	 * and data. Data has different properties depending on the type:
	 * data : {
	 *	 selector : "",				//Checkbox, Button, Textfield
     *-----------------------------------------------------------------------
	 *	 selector : "",				//Datefield
	 *	 format : "",
     *-----------------------------------------------------------------------
	 *	 selector : ["", "", ""],	//Dategroup
	 *	 format : ["", "", ""],
     *-----------------------------------------------------------------------
	 *	 selector : "",				//RadioButton, ComboBox
	 *	 entries : ["", "", ...],
	 *-----------------------------------------------------------------------
	 * The last property "name" holds the html name-attribute of the element
	 */
	 
	FormFillConfig.validTypes = ['TextField', 'DateField', 'CheckBox',
								 'RadioButton', 'Button', 'ComboBox',
								 'DateGroup', 'Parameter'];

	/**
	 * Constructor
	 */
	function FormFillConfig() {
		this.resetFields();
		this.resetDatasets();
		this.importedJson={
			name:null,
			file:null,
			fileName:null,
		}
	}
	
	/* ##### Fields ######################################################### */
	
	/**
	 * Adds a new field to the config.
	 * @param {String} fieldname 	The name of the field. Has to be the actual name in the website form.
	 * @param {String} type	 		The jQuery selector for the DOM-node on the website.
	 * @param {object} data 		The type of the field. 
	 * 								Possible values: Textfield, Datefield, Checkbox,
	 *								Radio Button, Button, Combobox, Dategroup.
	 */
	FormFillConfig.prototype.addField = function (fieldname, type, data) {
		
		// check for invalid type
		if (jQuery.inArray(type, FormFillConfig.validTypes) == -1) throw new Error("Type "+type+" is not a valid field type.");
		
		// check for duplicate fieldnames
		if (jQuery.grep(this._fields,function(val){
			return val.fieldname == fieldname;
		}).length > 0) throw new Error("Fieldname " + fieldname + " already exists.");
		
		// add new field
		var newField = new Object();
		newField.fieldname = fieldname;		
		newField.type = type;
		newField.data = data;
		this._fields.push(newField);
		
		//Add data to datasets
		
		jQuery.each(this._datasets, function () {			
			var cellData = {
					fieldname : fieldname
			};
			
			switch(type) {
			case 'CheckBox':
				cellData["value"]=true;
				break;
			case 'RadioButton':
				if(data.value.length>0)
					cellData["value"]=data.value[0].value;
				else
					cellData["value"]="";
				break;
			case 'ComboBox':
				if(data.value.length>0)
					cellData["value"]=data.value[0].value;
				else
					cellData["value"]="";
				break;
			case 'Parameter':
				cellData["value"]=data.customValue;
				break;
			default:
				cellData["value"]="";
				break;
			}
			
			// Check if field already exist. This should only be the case if the user enters "_iterator" as fieldname. This if-condition handels exactly that case. This workaround is needed because of the degenerated datamodel.
			if(this[fieldname]==null)
				this[fieldname] = cellData;
			else
				this[fieldname].value = cellData.value;		
		});		
	}
	
	/**
	 * Updates a specific attribute of one field.
	 * @param {String} fieldname The name of the field
	 * @param {String} attr The name of the attribute (selector,format,type)
	 * @param {String} value The value to set the attribute to.
	 */
	FormFillConfig.prototype.editField = function (fieldname, attr, value) {
		
		// check for invalid type
		if (attr == "type" && jQuery.inArray(value,FormFillConfig.validTypes) == -1) throw new Error("Type " + type + " is not a valid field type.");
		
		// check for duplicate fieldname
		if (attr == "fieldname") {
			jQuery.each(this._fields, function (i, field) {
				if (field.fieldname == value) {
					throw new Error("Fieldname " + value + " already exists.");
				}
			});
		}		
		
		// edit field
		jQuery.each(this._fields, function (i, field) {
			if (field.fieldname == fieldname) {
				if (field[attr] != null)
					field[attr] = value;
				else if (field.data[attr] != null)
					field.data[attr] = value;
			}
		});
		
		if(attr == "fieldname"){
			// edit datasets
			jQuery.each(this._datasets, function (i, ds) {
				if(ds[fieldname] == null)
					return;
				ds[value] = ds[fieldname];
				ds[value].fieldname=value;
				delete ds[fieldname];
			});
		}
	}
	
	/**
	 *
	 */
	FormFillConfig.prototype.getFieldData = function (fieldname) {
		var data;
		jQuery.each(this._fields, function (index, field) {
			if (field.fieldname == fieldname) {
				data = field.data;
				return false;
			}
		});
		return data;
	}
	
	/**
	 *
	 */
	FormFillConfig.prototype.setFieldData = function (fieldname, data) {
		jQuery.each(this._fields, function (index, field) {
			if (field.fieldname == fieldname) {
				field.data = data;
			}
		});
	}
	
	/**
	 * Removes the specified field from this config.
	 * @param {String} fieldname The name of the field.
	 */
	FormFillConfig.prototype.removeField = function (fieldname) {
		
		this._fields = jQuery.grep(this._fields, function (val) {
			return val.fieldname != fieldname;
		});
		
		//Remove data from datasets
		jQuery.each(this._datasets, function () {
			delete this[fieldname];
		});
		
		//Clear datasets if this was last column
		if (this._fields.length == 0)
			this._datasets = new Array();
	}
	
	/**
	 * Removes all fields from this config.
	 */
	FormFillConfig.prototype.resetFields = function () {
		this._fields = new Array();
	}
	
	/**
	 * Returns an array of field objects.
	 * Field objects have the following attributes: fieldname,selector,type.
	 */
	FormFillConfig.prototype.getFields = function () {
		return this._fields;
	}
	
	/**
	 * Returns the number of fields that are currently defined in this config.
	 */
	FormFillConfig.prototype.getNumberOfFields = function () {
		return this._fields.length;
	}
	
	/**
	 * Returns the field with the given identifier, which can either be its index or its name.
	 * @param {int or String} id The index or the name of the field
	 */
	FormFillConfig.prototype.getField = function (id) {
		var index = -1;
		if (typeof(id) == 'number') {
			if (id >= this._fields.length) {
				throw new Error("Field with index "+id+" does not exist. There are only "+this._fields.length+" fields.");
			}
			index = id;	
		} else {			
			index = this.getFieldIndex(id);		
		}
		return this._fields[index];
	}
	
	/**
	 * Returns the index of the field with the given name.
	 * @param {String} fieldname The name of the field to look for.
	 */
	FormFillConfig.prototype.getFieldIndex = function (fieldname) {
		var index = -1;
		jQuery.each(this._fields, function (i, field) {
			if (this.fieldname == fieldname) {
				index = i;
			}
		});
		if (index == -1) throw new Error("Field "+fieldname+" does not exist.");
		return index;
	}
	
	/**
	 * Moves the field with the given name by the given difference of positions in the array.
	 * Works in both directions.
	 * @param {string} fieldname The name of the field to move
	 * @param {int} difference The number of positions to move the field. Can be negative.
	 */
	FormFillConfig.prototype.fieldSortRelative = function (fieldname, difference) {
		var index = this.getFieldIndex(fieldname);		
		this._fields.splice(index + difference, 0, this._fields.splice(index, 1)[0]);
	}
	
	/**
	 * Moves the field with the given name to the given new index in the array.
	 * @param {string} fieldname The name of the field to move
	 * @param {int} newindex The index the field shall be moved to.
	 */
	FormFillConfig.prototype.fieldSortAbsolute = function (fieldname, newindex) {
		var index = this.getFieldIndex(fieldname);
		this._fields.splice(newindex, 0, this._fields.splice(index, 1)[0]);
	}
	
	/**
	 * Moves the field with the given name one position up the table, means backwards the array.
	 */
	FormFillConfig.prototype.fieldSortUp = function (fieldname) {		
		this.fieldSortRelative(fieldname, -1);
	}
	
	/**
	 * Moves the field with the given name one position down the table, means forwards the array.
	 */
	FormFillConfig.prototype.fieldSortDown = function (fieldname) {
		this.fieldSortRelative(fieldname, 1);
	}
	
	/** 
	 * Moves the field with the given name to index 0 in the array.
	 */
	FormFillConfig.prototype.fieldSortTop = function (fieldname) {
		this.fieldSortAbsolute(fieldname, 0);
	}
	
	/**
	 * Moves the field with the given name to the last index in the array.
	 */
	FormFillConfig.prototype.fieldSortBottom = function (fieldname) {
		this.fieldSortAbsolute(fieldname, this._fields.length - 1);
	}
	
	/**
	 * Returns the field with the given identifier, which can either be its index or its name.
	 * @param {int or String} id The index or the name of the field
	 * @param ['attr', 'attr', ...] attrKey Array of keys / hierarchy which leads to the attribute
	 *										which should be returned
	 */
	FormFillConfig.prototype.getFieldAttribute = function (fieldName, attrKey) {
		var id = this.getFieldIndex(fieldName);
		var ret = this.getField(id);
		
		$(attrKey).each(function(index, element) {
			ret = ret[element];
		});
		return ret;
	}
	
	/**
	 * Returns the field with the given identifier, which can either be its index or its name.
	 * @param {int or String} id The index or the name of the field
	 * @param ['attr', 'attr', ...] attrKey Array of keys / hierarchy which leads to the attribute
	 *										which should be returned
	 * @param {int or String} value The value which should be set to the adressed key
	 */
	FormFillConfig.prototype.setFieldAttribute = function (fieldName, attrKey, value) {
		
		var id = this.getFieldIndex(fieldName);
		var ret = this.getField(id);
		
		$(attrKey).each(function(index, element) {
			if (index >= attrKey.length - 1)
				return false;
			ret = ret[element];
		});
		ret[attrKey[attrKey.length - 1]] = value;
	}
	
	/* ##### Datasets ####################################################### */	
	
	/**
	 * Adds a new dataset to this config.
	 * @param dataset {object} Contains the values for the fields (key = field name, value = field value)
	 */
	FormFillConfig.prototype.addDataset = function (dataset) {
		var filtDs=new Object();
		var errorOccured=false;
		jQuery.each(this._fields,function(index,fld){
			var cellData = {
				fieldname : fld.fieldname
			};
			if(dataset.hasOwnProperty(fld.fieldname)==true){
				if(fld.type!="CheckBox"&&fld.type!="RadioButton"){			
					cellData["value"]=dataset[fld.fieldname];
					filtDs[fld.fieldname] = cellData;
				}else{
					errorOccured=true;
				}

			}else{
	
				switch(fld.type) {
				case 'CheckBox':
					cellData["value"]=true;
					break;
				case 'RadioButton':
					if(fld.data.value.length>0)
						cellData["value"]=fld.data.value[0].value;
					else
						cellData["value"]="";
					break;
				case 'ComboBox':
					if(fld.data.value.length>0)
						cellData["value"]=fld.data.value[0].value;
					else
						cellData["value"]="";
					break;
				case 'Parameter':
					cellData["value"]=fld.data.customValue;
					break;
				default:
					cellData["value"]="";
					break;
				}
				filtDs[fld.fieldname] = cellData;

			}
			
		});
		var iterator= {};
		iterator["useIndex"] = false;
		iterator["distinct"] = true;
		iterator["indexFromVal"] = null;
		iterator["indexToVal"] = null;
		iterator["indexDistVal"] = [];
		iterator["indexStepSize"] = null;
		
		if(jQuery.isEmptyObject(filtDs))
			return false;
		
		filtDs["_iterator"]=iterator;
		this._datasets.push(filtDs);
		return true;
	}
	
	/**
	 * Creates a new dataset and adds it to this config.
	 */
	FormFillConfig.prototype.createDataset = function () {
		var dataset = {};
		var flds = this.getFields();

		jQuery.each(flds,			
			function (index, fld) {				
				var cellData = {
					fieldname : fld.fieldname
				};
				
						
				switch(this.type) {
				case 'CheckBox':
					cellData["value"]=true;
					break;
				case 'RadioButton':
					if(fld.data.value.length>0)
						cellData["value"]=fld.data.value[0].value;
					else
						cellData["value"]="";
					break;
				case 'ComboBox':
					if(fld.data.value.length>0)
						cellData["value"]=fld.data.value[0].value;
					else
						cellData["value"]="";
					break;
				case 'Parameter':
					cellData["value"]=fld.data.customValue;
					break;
				default:
					cellData["value"]="";
					break;
				}

				dataset[fld.fieldname] = cellData;				
			}
		);
		var iterator= {};
		iterator["useIndex"] = false;
		iterator["distinct"] = true;
		iterator["indexFromVal"] = null;
		iterator["indexToVal"] = null;
		iterator["indexDistVal"] = [];
		iterator["indexStepSize"] = null;
		dataset["_iterator"]=iterator;
		this._datasets.push(dataset);
	}
	
	/**
	 * Sets the value for the table cell in the given row and column.
	 * The value is being type checked for the field type.
	 * @param {Integer} row The index of the dataset you want to set the value to
	 * @param {Integer} col The index of the field you want to set the value to
	 * @param {mixed} value The value you want to set for the cell
	 */
	FormFillConfig.prototype.setValue = function (row, col, value) {
		var fieldname = this._fields[col].fieldname;
		var dataset = this._datasets[row];
		// TODO value type check
		dataset[fieldname] = value;
	}
	
	/**
	 * Sets one attribute of the value for the table cell in the given row and column.
	 * The value is being type checked for the field type.
	 * @param {Integer} row The index of the dataset you want to set the value to
	 * @param {Integer} col The index of the field you want to set the value to
	 * @param {String} attr The name of the attribute
	 * @param {mixed} value The value you want to set for the cell
	 */
	FormFillConfig.prototype.setValueAttr = function (row, col, attr, value) {
		var fieldname = this._fields[col].fieldname;
		var dataset = this._datasets[row];
		// TODO value type check
		dataset[fieldname][attr] = value;
	}
	
	/**
	 * Returns the value for the table cell in the given row and column.
	 * @param {Integer} row The index of the dataset you want to get the value from
	 * @param {Integer} col The index of the field you want to get the value from
	 * @return {object} 
	 * 			content: The value as it was given by setValue()
	 * 			type: The type of the field
	 * 			format: The format of the field
	 */
	FormFillConfig.prototype.getValue = function (row, col) {
		var field = this._fields[col];
		var dataset = this._datasets[row];
		return {
			content : dataset[field.fieldname],
			type : field.type,
			format : field.format,
			fieldname : field.fieldname
		};
	}
	
	/**
	 * Returns the attribute of the value for the table cell in the given row and column.
	 * @param {Integer} row The index of the dataset you want to get the value from
	 * @param {Integer} col The index of the field you want to get the value from
	 * @param {String} attr The name of the attribute.
	 * @return {object} The attribute identified by its name. 
	 */
	FormFillConfig.prototype.getValueAttr = function (row, col, attr) {
		var field = this._fields[col];
		var dataset = this._datasets[row];
		return 	dataset[field.fieldname][attr];
	}

	/**
	 * Returns all datasets
	 * @return {array} of datasets
	 */
	FormFillConfig.prototype.getDatasets = function () {
		return datasetFormatter.format(this);
	}
	
	/**
	 * Replaces the fataset with the index.
	 * @param {Integer} rowIndex The index of the dataset
	 * @param {Object} newDataset The new dataset.
	 */
	FormFillConfig.prototype.setDataset = function (rowIndex,newDataset) {
		this._datasets[rowIndex]=newDataset;
	}
	
	/**
	 * Returns the dataset with the given row index.
	 * @return {Object} the dataset.
	 */
	FormFillConfig.prototype.getDataset = function (rowIndex) {
		return this._datasets[rowIndex];
	}
	
	/**
	 * Returns the number of datasets in this config.
	 * @return {int}
	 */
	FormFillConfig.prototype.getNumberOfDatasets = function () {
		return this._datasets.length;
	}
	
	/**
	 * Removes the dataset at the given index from this config.
	 * @param {int} index The position of the dataset in the array.
	 */
	FormFillConfig.prototype.removeDataset = function (index) {
		this._datasets = this._datasets.filter(function (val,i){
			return i != index;
		});
	}
	
	/**
	 * Removes all datasets from this config.
	 */
	FormFillConfig.prototype.resetDatasets = function () {
		this._datasets = new Array();
	}
	
	/**
	 * Moves the dataset at the given index to the given new index.
	 */
	FormFillConfig.prototype.datasetMoveTo = function (index, newindex) {
		this._datasets.splice(newindex, 0, this._datasets.splice(index, 1)[0]);
	}
	
	/**
	 * Data set sorting functions
	 */
	FormFillConfig.prototype.datasetSortUp = function (index) {
		this.datasetMoveTo(index, index - 1);
	}
	
	/**
	 * Data set sorting functions
	 */
	FormFillConfig.prototype.datasetSortDown = function (index) {
		this.datasetMoveTo(index, index + 1);
	}
	
	/**
	 * Data set sorting functions
	 */
	FormFillConfig.prototype.datasetSortTop = function (index) {
		this.datasetMoveTo(index, this._datasets.length - 1);
	}
	
	/**
	 * Data set sorting functions
	 */
	FormFillConfig.prototype.datasetSortBottom = function (index) {
		this.datasetMoveTo(index, 0);
	}
	
	/**
	 * Get dataset table datamodel.
	 */
	FormFillConfig.prototype.getTableDataModel = function () {
		var ths=this;
		var dataModel = new Object();
		dataModel.cellSelection = true;
		dataModel.columns = new Array();

		// Define columns of table
		jQuery.each(this._fields,
			function (index, element) {				
				var col = { 
					header : {
						element : "span",
						sortable : true,
						text : this.fieldname,
					}, 
					content : {
						selectAction : function (td, obj) {
							configurationView.formPanel.getDatasetPanel().updateButtons();
							configurationView.formPanel.getContextPanel().update();
						},
					}
				};
				
				switch(this.type) {
				case 'CheckBox':
					col.content.element="input";
					col.content.type="checkbox";
					col.content.valueChangedAction = function (content, obj){
						var indices=obj.getSelectedCellIndices();
						ths.setValueAttr(indices.row,indices.col,"value" ,eval(content.val()));
					}
					break;
				case 'RadioButton':
					col.content.element="select";
					col.content.value=this.data.value;
					col.content.valueChangedAction = function (content, obj){
						var indices=obj.getSelectedCellIndices();
						ths.setValueAttr(indices.row,indices.col,"value" ,content.val());
					}
					break;
				case 'ComboBox':
					col.content.element="select";
					col.content.value=this.data.value;
					col.content.valueChangedAction = function (content, obj){
						var indices=obj.getSelectedCellIndices();
						ths.setValueAttr(indices.row,indices.col,"value" ,content.val());
					}
					break;
				case 'Parameter':
					col.content.element="input";
					col.content.type="text";
					col.content.valueChangedAction = function (content, obj){
						var indices=obj.getSelectedCellIndices();
						ths.setValueAttr(indices.row,indices.col,"value" ,content.val());
					}
					break;
				default:
					col.content.element="input";
					col.content.type="text";
					col.content.valueChangedAction = function (content, obj){
						var indices = obj.getSelectedCellIndices();
						try{
							parser.parse(content.val());
						}catch(e){
							content.val("");
							status.error(helpers.STR("strings_main","conf.ff.tbl.parse.error"));
						}
						
						ths.setValueAttr(indices.row,indices.col,"text" ,content.val());
						ths.setValueAttr(indices.row,indices.col,"value" ,content.val());
					}
					break;
				}
				
				dataModel.columns.push(col);				
			}
		);
		
		dataModel.rows = new Array();
		var flds = this.getFields();
		
		// Define rows of table
		jQuery.each(this._datasets,
			function (rowIndex, ds) {
				var row = new Array();
				jQuery.each(flds,
					function (colIndex, fld) {						
						if (ds[fld.fieldname] != null)
							row.push(ds[fld.fieldname]);						
					}
				);
				dataModel.rows.push(row);
			}
		);		
		return dataModel;
	}
	
	return FormFillConfig;
	
})();