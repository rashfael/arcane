/**
 * Object used to transform the internal dataset format into the server specific one.
 */
var datasetFormatter = {
	
	/**
	 * Method to transform datasets into parameters.
	 * @param {FillFormConfig} fillformConfig The fillform config.
	 * @return {Object} params The parameters for the navigation tab and the scraper. (Defined in: http://wedex.iao.fraunhofer.de/projects/wedex/wiki/%22Fill_Form%22_Navigation_Node) 
	 */
	format : function (fillFormConfig) {
		var params = new Array();
		CS.logStringMessage("datasetFormatter: Start formatting...");
		$(fillFormConfig._datasets).each(function (index, dataset){
			CS.logStringMessage("datasetFormatter: processing dataset with index "+index);
			params.push(datasetFormatter._formatDataset(fillFormConfig,dataset,index));
			CS.logStringMessage("datasetFormatter: processed dataset with index "+index);
		});
		CS.logStringMessage("datasetFormatter: checking for reference file");
		if(fillFormConfig.importedJson.file!=null)
			params=datasetFormatter._replaceJsonReferences(helpers.cloneObject(params),fillFormConfig);
		CS.logStringMessage("datasetFormatter: Formatting done.");
		return params;
	},

	/**
	 * Method to transform one dataset into a parameter.
	 * @param {Object} fillFormConfig The fillform config.
	 * @param {Object} dataset One dataset to transform.
	 * @return {Object} param One transformed dataset. (Defined in: http://wedex.iao.fraunhofer.de/projects/wedex/wiki/%22Fill_Form%22_Navigation_Node) 
	 */
	_formatDataset : function (fillFormConfig,dataset,row) {
		var param = new Object();
		var useIterator = false;
		var itCell = null;
		//Iterate through cells of dataset
		for (var key in dataset) {
			
			var cell=dataset[key];
			if(key=="_iterator"){
				useIterator=cell.useIndex;
				itCell=cell;
			}
					
			try{
				var field = fillFormConfig.getField(key);
				var cellType=field.type;

				
				eval("datasetFormatter._format"+cellType+"(param,cell,field)");
			}catch(e){
				// Special case if "_iterator" is a fieldnam
				CS.logStringMessage("datasetFormatter: iterator is also fieldname (datasetkey="+key+")");
			}


		}
		if(jQuery.isEmptyObject(param)==true){
			return;
		}
		//Format and append iterator if index is used.
		if (useIterator == true){
			CS.logStringMessage("datasetFormatter: iterator found");
			datasetFormatter._formatIterator(param,itCell);
		}
		
		
		return param;
	},
	
	/**
	 * Formats a cell of a dataset with TextField as type.
	 * @param {Object} param The variable which will contain the formatted output parameter.
	 * @param {Object} cell The object containing the value of the cell.
	 * @param {Object} field The object containing the cell definition aka field aka column.
	 * @param {String} value The value of the parameter. Currently not in use.
	 */
	_formatTextField : function(param,cell,field,value){
		if(value==null)
			value=cell.value;
		if(field.data.name!="undefined"&&field.data.name!=null&&value!=null&&value.trim()!=""){
			param[field.data.name]= new Object();
			param[field.data.name]['entry'] = [value];
		}
	},
	
	/**
	 * Formats a cell of a dataset with DateGroup as type.
	 * @param {Object} param The variable which will contain the formatted output parameter.
	 * @param {Object} cell The object containing the value of the cell.
	 * @param {Object} field The object containing the cell definition aka field aka column.
	 * @param {String} value The value of the parameter. Currently not in use.
	 */
	_formatDateGroup : function(param,cell,field,value){
		if(value==null)
			value=cell.value;
			
		//For day
		if(field.data.name[0]!="undefined"&&field.data.name[0]!=null&&field.data.name[0].trim()!=""&&value!=null&&value!=""){
			param[field.data.name[0]]=new Object();
			param[field.data.name[0]]['entry'] = [value];
			param[field.data.name[0]]['format'] = field.data.format[0];
		}
		//For month
		if(field.data.name[1]!="undefined"&&field.data.name[1]!=null&&field.data.name[1].trim()!=""&&value!=null&&value!=""){
			param[field.data.name[1]]=new Object();
			param[field.data.name[1]]['entry'] = [value];
			param[field.data.name[1]]['format'] = field.data.format[1];
		}
		//For year
		if(field.data.name[2]!="undefined"&&field.data.name[2]!=null&&field.data.name[2].trim()!=""&&value!=null&&value!=""){
			param[field.data.name[2]]=new Object();
			param[field.data.name[2]]['entry'] = [value];
			param[field.data.name[2]]['format'] = field.data.format[2];
		}
	},

	/**
	 * Formats a cell of a dataset with DateField as type.
	 * @param {Object} param The variable which will contain the formatted output parameter.
	 * @param {Object} cell The object containing the value of the cell.
	 * @param {Object} field The object containing the cell definition aka field aka column.
	 * @param {String} value The value of the parameter. Currently not in use.
	 */	
	_formatDateField : function(param,cell,field,value){
		if(value==null)
			value=cell.value;
		
		if(field.data.name!="undefined"&&field.data.name!=null&&value!=null&&value.trim()!=""){
			param[field.data.name]=new Object();
			param[field.data.name]['entry'] = [value];
			param[field.data.name]['format'] = field.data.format;
		}
	},

	/**
	 * Formats a cell of a dataset with ComboBox as type.
	 * @param {Object} param The variable which will contain the formatted output parameter.
	 * @param {Object} cell The object containing the value of the cell.
	 * @param {Object} field The object containing the cell definition aka field aka column.
	 * @param {String} value The value of the parameter. Currently not in use.
	 */	
	_formatComboBox : function(param,cell,field,value){
		if(value==null)
			value=cell.value;
		if(field.data.name!="undefined"&&field.data.name!=null&&value!=null&&value.trim()!=""){
			param[field.data.name]= new Object();
			param[field.data.name]['entry'] = [value];
		}
	},

	/**
	 * Formats a cell of a dataset with CheckBox as type.
	 * @param {Object} param The variable which will contain the formatted output parameter.
	 * @param {Object} cell The object containing the value of the cell.
	 * @param {Object} field The object containing the cell definition aka field aka column.
	 * @param {String} value The value of the parameter. Currently not in use.
	 */	
	_formatCheckBox : function(param,cell,field,value){
		if(value==null)
			value=cell.value;
		if(field.data.name!="undefined"&&field.data.name!=null&&value==true){
			var val=field.data.value;
			if(param[field.data.name]==null){
				param[field.data.name]= new Object();
				param[field.data.name]['entry'] = [val];
			}else
				param[field.data.name]['entry'].push(val);
				
			
		}
	},

	/**
	 * Formats a cell of a dataset with RadioButton as type.
	 * @param {Object} param The variable which will contain the formatted output parameter.
	 * @param {Object} cell The object containing the value of the cell.
	 * @param {Object} field The object containing the cell definition aka field aka column.
	 * @param {String} value The value of the parameter. Currently not in use.
	 */	
	_formatRadioButton : function(param,cell,field,value){
		if(value==null)
			value=cell.value;
		if(field.data.name!="undefined"&&field.data.name!=null&&value!=null&&value.trim()!=""){
			param[field.data.name]= new Object();
			param[field.data.name]['entry'] = [value];
		}
	},

	/**
	 * Formats a cell of a dataset with Parameter as type.
	 * @param {Object} param The variable which will contain the formatted output parameter.
	 * @param {Object} cell The object containing the value of the cell.
	 * @param {Object} field The object containing the cell definition aka field aka column.
	 * @param {String} value The value of the parameter. Currently not in use.
	 */	
	_formatParameter : function(param,cell,field,value){
		if(value==null)
			value=cell.value;
		if(field.fieldname!="undefined"&&field.fieldname!=null&&value!=null&&value.trim()!=""){
			param[field.fieldname]= new Object();
			param[field.fieldname]['entry'] = [value];
		}
	},

	/**
	 * Formats the iterator of a dataset.
	 * @param {Object} param The variable which will contain the formatted output parameter.
	 * @param {Object} cell The object containing the iterator information of the dataset.
	 */	
	_formatIterator : function(param,cell){
		
		param["_iterator"]=new Object();
		if (cell.distinct == true){
			param["_iterator"]["sequence"] = cell.indexDistVal;
		}else{
			param["_iterator"]["interval"] = [cell.indexFromVal,cell.indexToVal,cell.indexStepSize]
		}
	},
	
	/**
	 * Method to replace the references of the optional json file.
	 * @param {[Object]} params The formatted parameters.
	 * @param {FillFormConfig} fillFormConfig The corresponding fill form configuration.
	 * @return {[Object]} filteredParams The parameters without json references.
	 */
	_replaceJsonReferences : function(params,fillFormConfig){
		CS.logStringMessage("datasetFormatter: dereferencing started");
		var filteredParams=[];
		//iterate through parameters
		jQuery.each(params,function(i1,param){
			CS.logStringMessage("datasetFormatter: searching references in parameter "+i1);
			var hasReference=false;
			//iterate through form elements
			jQuery.each(param,function(i2,form){
				//iterate through entries

				if(form.entry!=null&&i2!="_iterator"){
					CS.logStringMessage("datasetFormatter: found entry attribute");
					jQuery.each(form.entry,function(i3,entry){
							var vals=entry.split(".");
							if(vals!=null&&vals.length!=0&&vals[0]==fillFormConfig.importedJson.name&&fillFormConfig.importedJson.file[0].hasOwnProperty(vals[1])){
								CS.logStringMessage("datasetFormatter: entry has reference");
								hasReference=true;
								return false;
							}
							CS.logStringMessage("datasetFormatter: entry has no reference");
						
						
					});
				}
				if(hasReference==true)
					return false;
			});
			if(hasReference==true)
				datasetFormatter._replaceJsonReference(param,filteredParams,fillFormConfig);
			else
				filteredParams.push(param);
						
		});
		CS.logStringMessage("datasetFormatter: params dereferenced");
		return filteredParams;
	},
	
	/**
	 * Replaces json references of a single parameter.
	 * @param {[Object]} param The formatted parameter.
	 * @param {[Object]} filteredParams The parameters without json references.
	 * @param {FillFormConfig} fillFormConfig The corresponding fill form configuration.
	 */
	_replaceJsonReference : function(param,filteredParams,fillFormConfig){
		jQuery.each(fillFormConfig.importedJson.file,function(i1,dataset){
							
			var newParam=helpers.cloneObject(param);
			jQuery.each(param,function(i2,form){
				//iterate through entries
				if(form.entry!=null&&i2!="_iterator"){
					jQuery.each(form.entry,function(i3,entry){
							
						var vals=entry.split(".");
						CS.logStringMessage("datasetFormatter: try to dereference vals="+vals);
						if(vals!=null&&vals.length!=0&&vals[0]==fillFormConfig.importedJson.name&&dataset.hasOwnProperty(vals[1])){
							newParam[i2].entry=[dataset[vals[1]]];
							CS.logStringMessage("datasetFormatter: "+entry+" of dataset "+i1+" for form element "+i2+" dereferenced");
						}
							
						
					});
				}
				
			});
			filteredParams.push(newParam);
		});
	}

}