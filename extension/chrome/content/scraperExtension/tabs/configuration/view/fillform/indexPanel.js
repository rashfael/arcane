/**
 * Class to create an index panel object which represents the iterator.
 */
var IndexPanel = (function() {
	
	/**
	 * The constructor.
	 * @param {jQObject} parent The jQuery Object containing the DOM-Element the IndexPanel should be appended to.

	 */
	function IndexPanel(parent,indices) {
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		var obj=this;
		this.parent=parent;
		this.cellData=fillFormConfig.getValue(indices.row,indices.col);
		this.dataset=fillFormConfig.getDataset(indices.row);
		this.id=idGenerator.getID();
		this.indices=indices;
		
		//Define and append the panel itself.
		this.panel=$('<div id="'+this.id+'indexPanel" class="indexPanel"/>',parent);
		this.panel.css("clear","left");
		this.parent.append(this.panel);
		
		//Define and append checkbox for usage of running index.
		this.indexChckbx=$('<input type="checkbox" id="useIndex" name="useIndex"/>',parent);
		if(this.dataset._iterator.useIndex==true||this.dataset._iterator.useIndex==null){
			this.indexChckbx.attr("checked","checked");
		}
		this.indexChckbx.click(function(){
			var dataset=fillFormConfig.getDataset(indices.row);
			dataset._iterator.useIndex=!dataset._iterator.useIndex;
			fillFormConfig.setDataset(indices.row,dataset);
			obj.update();
		});
		this.indexLbl=$('<label for="useIndex" title="'+helpers.STR("strings_main","conf.ff.ds.rowprops.index.tooltip")+'">'+helpers.STR("strings_main","conf.ff.ds.rowprops.index.label")+'</label>',parent);
		this.panel.append(this.indexChckbx);
		this.panel.append(this.indexLbl);
		
		//Define and append div for index definition.
		this.indexDiv=$('<div id="'+this.id+'indexDiv" class="indexDiv"></div>',parent);
		this.indexDiv.css('paddingLeft','15px');
		this.panel.append(this.indexDiv);
		
		/* Dinstinct values part */
		
		//Define and append radio button for distinct values
		this.distValRdBttn=$('<input type="radio" id="'+this.id+'distinct" name="indexType" value="distinct"/>',parent);
		if(this.dataset._iterator.distinct==true||this.dataset._iterator.distinct==null)
			this.distValRdBttn.attr("checked","checked");
		this.distValRdBttn.click(function(){
			var newVal=obj.distValRdBttn.attr("checked")=="checked";
			var dataset=fillFormConfig.getDataset(indices.row);
			dataset._iterator.distinct=newVal;
			fillFormConfig.setDataset(indices.row,dataset);
			obj.update();
		});
		this.distValLbl=$('<label for="'+this.id+'distinct" title="'+helpers.STR("strings_main","conf.ff.ds.rowprops.dist.tooltip")+'"> '+helpers.STR("strings_main","conf.ff.ds.rowprops.dist.label")+' </label>',parent);
		this.indexDiv.append(this.distValRdBttn);
		this.indexDiv.append(this.distValLbl);
		
		this.indexDiv.append(jQuery("<br/>",parent));
		
		
		//Define and append textfield for distinct values
		this.distValTxtfld=$('<input type="text"/>',parent);
		this.distValTxtfld.css('marginLeft','28px');
		this.distValTxtfld.css('width','153px');
		if(this.dataset._iterator.indexDistVal!=null){
			this.distValTxtfld.val(this.dataset._iterator.indexDistVal.join(";"));
		}
		this.distValTxtfld.change(function(){
			var newValArray=obj.distValTxtfld.val().split(";");
			var newValues=new Array();
			var invalid=false;
			var dataset=fillFormConfig.getDataset(indices.row);
			jQuery.each(newValArray,function(){
				if($.isNumeric(this)==false){
					status.error(helpers.STR("strings_main","conf.ff.ds.rowprops.val.notanum.error"));
					obj.distValTxtfld.val("");
					invalid=true;
					return;
				}else{
					var newVal=Number(this);
					newValues.push(newVal);
				}
			});
			if(!invalid){
				dataset._iterator.indexDistVal=newValues;
				fillFormConfig.setDataset(indices.row,dataset);
				obj.update();
			}
		});
		this.indexDiv.append(this.distValTxtfld);
		this.indexDiv.append(jQuery("<br/>",parent));
		
		/* Incremented values part */
		
		//Define and append radio button for incremented values
		this.incrValRdBttn=$('<input type="radio" id="'+this.id+'increment" name="indexType" value="increment"/>',parent);
		if(this.dataset._iterator.distinct==false)
			this.incrValRdBttn.attr("checked","checked");
		this.incrValRdBttn.click(function(){
			var newVal=obj.incrValRdBttn.attr("checked")=="checked";
			var dataset=fillFormConfig.getDataset(indices.row);
			dataset._iterator.distinct=!newVal;
			fillFormConfig.setDataset(indices.row,dataset);
			obj.update();
		});
		this.incrValLbl=$('<label for="'+this.id+'increment" title="'+helpers.STR("strings_main","conf.ff.ds.rowprops.inc.tooltip")+'"> '+helpers.STR("strings_main","conf.ff.ds.rowprops.inc.label")+'</label>',parent);
		this.indexDiv.append(this.incrValRdBttn);
		this.indexDiv.append(this.incrValLbl);
		
		this.indexDiv.append(jQuery("<br/>",parent));
		
		
		//Define and append textfield for incremented values
		this.incrFromValTxtfld=$('<input type="text"/>',parent);
		this.incrFromValTxtfld.css('marginLeft','28px');
		this.incrFromValTxtfld.css('width','35px');
		if(this.dataset._iterator.indexFromVal!=null)
			this.incrFromValTxtfld.val(this.dataset._iterator.indexFromVal);
		this.incrFromValTxtfld.change(function(){
			var invalid=false;
			var newVal=null;
			var dataset=fillFormConfig.getDataset(indices.row);
			if($.isNumeric(obj.incrFromValTxtfld.val())==false){
				status.error(helpers.STR("strings_main","conf.ff.ds.rowprops.val.notanum.error"));
				obj.incrFromValTxtfld.val("");
				invalid=true;
			}else{
				newVal=Number(obj.incrFromValTxtfld.val());
				dataset._iterator.indexFromVal=newVal;
				fillFormConfig.setDataset(indices.row,dataset);
				obj.update();
			}
		});
		this.indexDiv.append(this.incrFromValTxtfld);
		
		this.indexDiv.append(jQuery("<b> "+helpers.STR("strings_main","conf.ff.ds.rowprops.incand.label")+" </b>",parent));
			
		this.incrToValTxtfld=$('<input type="text"/>',parent);
		this.incrToValTxtfld.css('width','35px');
		if(this.dataset._iterator.indexToVal!=null)
			this.incrToValTxtfld.val(this.dataset._iterator.indexToVal);
		this.incrToValTxtfld.change(function(){
			var invalid=false;
			var newVal=null;
			var dataset=fillFormConfig.getDataset(indices.row);
			if($.isNumeric(obj.incrToValTxtfld.val())==false){
				status.error(helpers.STR("strings_main","conf.ff.ds.rowprops.val.notanum.error"));
				obj.incrToValTxtfld.val("");
			}else{
				newVal=Number(obj.incrToValTxtfld.val());
				dataset._iterator.indexToVal=newVal;
				fillFormConfig.setDataset(indices.row,dataset);
				obj.update();
			}
			
		});
		this.indexDiv.append(this.incrToValTxtfld);
		
		this.indexDiv.append(jQuery("<b> "+helpers.STR("strings_main","conf.ff.ds.rowprops.incby.label")+" </b>",parent));
		
		this.incrStepSizeTxtfld=$('<input type="text"/>',parent);
		this.incrStepSizeTxtfld.css('width','15px');
		if(this.dataset._iterator.indexStepSize!=null)
			this.incrStepSizeTxtfld.val(this.dataset._iterator.indexStepSize);
		this.incrStepSizeTxtfld.change(function(){
			var invalid=false;
			var newVal=null;
			var dataset=fillFormConfig.getDataset(indices.row);
			if($.isNumeric(obj.incrStepSizeTxtfld.val())==false){
				status.error(helpers.STR("strings_main","conf.ff.ds.rowprops.val.notanum.error"));
				obj.incrStepSizeTxtfld.val("");
			}else{
				newVal=Number(obj.incrStepSizeTxtfld.val());
				dataset._iterator.indexStepSize=newVal;
				fillFormConfig.setDataset(indices.row,dataset);
				obj.update();
			}
		});
		this.indexDiv.append(this.incrStepSizeTxtfld);
		this.indexDiv.append(jQuery("<br/>",parent));
		
		this.update();
		
	};

	/**
	 * Returns the panel.
	 * @return {jQObject} this.panel The jQuery Object containing the DOM-Element of the index panel.
	 */
	IndexPanel.prototype.getPanel = function() {
		return this.panel;
	};

	/**
	 * Updates the panel and its content.
	 */	
	IndexPanel.prototype.update = function() {
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		this.cellData=fillFormConfig.getValue(this.indices.row,this.indices.col);
		
		var useIndex=this.dataset._iterator.useIndex;
		var distinct=this.dataset._iterator.distinct;
		
		this.indexChckbx.removeAttr("disabled");
		this.distValRdBttn.removeAttr("disabled");
		this.incrValRdBttn.removeAttr("disabled");
		this.distValTxtfld.removeAttr("disabled");
		this.incrToValTxtfld.removeAttr("disabled");
		
		this.distValRdBttn.attr("disabled",!useIndex);
		this.distValTxtfld.attr("disabled",!useIndex||!distinct);
		
		this.incrValRdBttn.attr("disabled",!useIndex);
		this.incrFromValTxtfld.attr("disabled",!useIndex||distinct);
		this.incrToValTxtfld.attr("disabled",!useIndex||distinct);
		this.incrStepSizeTxtfld.attr("disabled",!useIndex||distinct);
			
	};

	return IndexPanel;	
	
})();
