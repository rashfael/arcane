/**
 * Singleton which concerns the view of the configuration tab.
 */
var configurationView = {
	
	//Configuration view variables
	
	/**
	 * The FormPanel object.
	 */
	formPanel : null,
	
	/**
	 * The MagicPanel object.
	 */
	magicPanel: null,

	/**
	 * The selected accordion entry index.
	 */
	_selectedAccordion : 0,
	
	/**
	 * The list selector
	 */
	listMarks : null,
	
	customKeyMarks : null,
	
	subItemMarks : null,
	
	formMarks : null,
	
	/**
	 * The item radio button as jQuery Object.
	 */
	_itemRB: null,
	
	/**
	 * The siblings radio button as jQuery Object.
	 */
	_siblingsRB: null,
	
	/**
	 * The selector textfield as jQuery Object.
	 */
	_selectorTxtfld: null,	
	
	//Configuration view organizing methods
	
	/**
	 * Initializes the configuration view.
	 */
	init : function(){
		var alreadyInitialized=$("#accordion",fbDocument).length>0;
		if(alreadyInitialized==true)
			return;
			
		var cmbbx=browser.chrome.$("configCmbbx");
		var selItem=null;
		cmbbx.removeAllItems();
		jQuery.each(configurationData.getConfigs(),
			function(){
				var element=cmbbx.appendItem(this._name,this._id);
				if(this._id==configurationData.getCurrentConfigID())
					selItem=element;
			}
		);
		
		cmbbx.selectedIndex=cmbbx.getIndexOfItem(selItem);
		
		//Remove all elements from panel
		this._getPanel().children().remove();
		
		this._renderAccordion();
		
		this._renderListPanel();
		this.magicPanel=new MagicPanel(this._getPanel());
		this.formPanel=new FormPanel(this._getPanel());
		
		$('#listPanel',fbDocument).css('display','block');
		$('#magicPanel',fbDocument).css('display','none');
		$('#formPanel',fbDocument).css('display','none');
		
		this.listMarks = new Selector();
		this.customKeyMarks = new Selector();
		this.subItemMarks = new Selector();
		this.formMarks = new Selector();
		
		//Selects the radio button and sets the inspection strategy therby.
		fbDocument.getElementById('itemRB').click();
		configurationView.resize();
	},
	
	/**
	 * Resets the view of the config tab.
	 */
	reset : function(){
		this._getPanel().children().remove();
		this.init();
	},
	
	/**
	 * Updates the view of the configuration tab.
	 */
	update : function(){
				
		var cmbbx=browser.chrome.$("configCmbbx");
		var addBttn=browser.chrome.$("addMagicConfBttn");
		var renBttn=browser.chrome.$("renameMagicConfBttn");
		var delBttn=browser.chrome.$("deleteMagicConfBttn");
		renBttn.disabled=false;
		renBttn.image=helpers.getImage("wand--pencil_16.png");
		delBttn.disabled=false;
		delBttn.image=helpers.getImage("wand--minus_16.png");
			
		if(cmbbx.selectedIndex==-1||cmbbx.itemCount==1){
			delBttn.disabled=true;
			delBttn.image=helpers.getImage("wand--minus_dis_16.png");
		}
		if(cmbbx.selectedIndex==-1){
			renBttn.disabled=true;
			renBttn.image=helpers.getImage("wand--pencil_dis_16.png");
		}
		var currentConfig, listConfig, magicConfig;
		currentConfig=configurationData.getCurrentConfig();
		if(currentConfig==null)
			return;
		listConfig=currentConfig.getListConfig();
		magicConfig=currentConfig.getMagicConfig();		
				
		this._selectorTxtfld.val(listConfig.getSelector().toString() || "");		
		this._renderMagicCont();
		this._renderFormCont();
				
		//Display the correct Panel and hide the others
		switch($("#accordion", fbDocument).accordion( "option", "active" )) {
			case 0:
				$('#listPanel',fbDocument).css('display','block');
				$('#magicPanel',fbDocument).css('display','none');
				$('#formPanel',fbDocument).css('display','none');
				break;
			case 1:
				$('#listPanel',fbDocument).css('display','none');
				$('#magicPanel',fbDocument).css('display','block');
				$('#formPanel',fbDocument).css('display','none');				
				break;
			case 2:
				$('#listPanel',fbDocument).css('display','none');
				$('#magicPanel',fbDocument).css('display','none');
				$('#formPanel',fbDocument).css('display','block');				
				break;
		}		
		this.magicPanel.update();
		this.formPanel.update();
		this._drawMarks();		
	},
	
	/**
	 * Resizes the accordion and the context sensitive panel
	 */
	resize : function(){
		var height = (jQuery("#fbMainFrame", document).attr("height") - 100);
		if (height < 0) {
			height = 200;
		}
		
		$(".contextPanel", fbDocument).css("height", height + "px");
		$("#accordion", fbDocument).css("height", height + "px");
		jQuery("#customKeyTableDiv", fbDocument).css("height", (height - 93) + "px");
		
		var listCont=$("#listCont", fbDocument);
		var magicCont=$("#magicCont", fbDocument);
		var formCont = $('#formCont', fbDocument);
		
		var listHeader=$("#listHeader", fbDocument);
		var magicHeader=$("#magicHeader", fbDocument);
		var formHeader = $('#formHeader', fbDocument);

		var magicHeaderHeight=listHeader.height();
		var listHeaderHeight=magicHeader.height();
		var formHeaderHeight = formHeader.height();
		
		var newHeight=height-(magicHeaderHeight+listHeaderHeight+formHeaderHeight+74); 
		listCont.css("height", newHeight + "px");
		magicCont.css("height", newHeight + "px");
		formCont.css('height', newHeight + 'px');		
	},
	
	// Getter & setter
	
	/**
	 *	Returns the config panel.
	 */
	_getPanel : function() {
		return $("#configuration", fbDocument);
	},
	
	/**
	 * Method to set the single item strategy inside the configurationContent.
	 */		
	_setSingleItemStrat : function(){
		var inspectSingleNodeStrat=function(node){return node};
		configurationContent.setIStrategy(inspectSingleNodeStrat);
	},
	
	/**
	 * Method to set the siblings strategy inside the configurationContent.
	 */
	_setSiblingsStrat : function(){
		var inspectSiblingsStrat=function(node){return jQuery(node).parent().children();};
		configurationContent.setIStrategy(inspectSiblingsStrat);
	},
	
	/**
	 * Render Accordion contents (list panel isn't used)
	 */
	_renderAccordion : function(){
				
		var listHeader,listCont,magicHeader,magicCont,ac;
		
		ac=$('<div id="accordion" style="float:left;"/>',fbDocument);
		ac.css('width',400);
		ac.css('height',400);
		
		listHeader=$('<h3></h3>',fbDocument);
		listHeaderLink=$('<a href="#" id="listHeader" >'+helpers.STR("strings_main","conf.acc.list.label")+'</a>',fbDocument);
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.acc.list.help"), "help/wand/gui#configTabListConfig", listHeaderLink);
		listHeader.append(listHeaderLink);
		listCont=$('<div id="listCont"/>',fbDocument);
		listHeader.click(function(){
			$('#listPanel',fbDocument).css('display','block');
			$('#magicPanel',fbDocument).css('display','none');
			$('#formPanel',fbDocument).css('display','none');
			try {			
				configurationView._drawMarks(0);
			} catch (err) {}
		});
				
		magicHeader=$('<h3></h3>',fbDocument);
		magicHeaderLink=$('<a href="#" id="magicHeader" >'+helpers.STR("strings_main","conf.acc.mg.label")+'</a>',fbDocument);
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.acc.mg.help"), 'help/wand/gui#configTabMagicOverview', magicHeaderLink);
		magicHeader.append(magicHeaderLink);
		magicCont=$('<div id="magicCont"/>',fbDocument);
		magicHeader.click(function(){
			$('#listPanel',fbDocument).css('display','none');
			$('#magicPanel',fbDocument).css('display','block');
			$('#formPanel',fbDocument).css('display','none');
			configurationView.magicPanel.update();
			try {
				configurationView._drawMarks(1);
			} catch (err) {}
		});
		
		formHeader=$('<h3></h3>',fbDocument);
		formHeaderLink=$('<a href="#" id="formHeader" >'+helpers.STR("strings_main","conf.acc.ff.label")+'</a>',fbDocument);
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.acc.ff.help"), "help/wand/gui#ConfigFF", formHeaderLink);
		formHeader.append(formHeaderLink);
		formCont=$('<div id="formCont"/>',fbDocument);
		formHeader.click(function(){
			$('#listPanel',fbDocument).css('display','none');
			$('#magicPanel',fbDocument).css('display','none');
			$('#formPanel',fbDocument).css('display','block');
			configurationView.formPanel.update();
			try {
				configurationView._drawMarks(2);
			} catch (err) {}
		});
				
		ac.append(listHeader);
		ac.append(listCont);
		ac.append(magicHeader);
		ac.append(magicCont);
		ac.append(formHeader);
		ac.append(formCont);
		
		this._getPanel().append(ac);
		$("#accordion",fbDocument).accordion();
		
		this._renderListCont();
		this._renderMagicCont();
		this._renderFormCont();
	},
		
	/**
	 * Renders the content of the list entry inside the accordion
	 */
	_renderListCont : function() {
		
		var currentConfig, listConfig, magicConfig;
		currentConfig=configurationData.getCurrentConfig();
		if(currentConfig==null)
			return;
		listConfig=currentConfig.getListConfig();
		magicConfig=currentConfig.getMagicConfig();
		
		var listCont=$('#listCont',fbDocument);
		
		var form=$('<div id="listConfDiv" />',fbDocument);

		var strategyLbl=$('<br/><br/><b>'+helpers.STR("strings_main","conf.view.list.strat.label")+'</b>',fbDocument);
		
		this._itemRB=$('<input>',fbDocument);
		this._itemRB.attr('id','itemRB');
		this._itemRB.attr('type','radio');
		this._itemRB.attr('name','inspectStrategy');		
		this._itemRB.click(this._setSingleItemStrat);
		
		var itemLbl=$('<label>'+helpers.STR("strings_main","conf.view.list.selit.label")+'</label><br/>',fbDocument);
		itemLbl.attr('id','selectorLbl');
		itemLbl.attr('for','itemRB');
		itemLbl.attr('title',helpers.STR("strings_main","conf.view.list.selit.tooltip"));
		
		
		this._siblingsRB=$('<input>',fbDocument);
		this._siblingsRB.attr('id','siblingsRB');
		this._siblingsRB.attr('type','radio');
		this._siblingsRB.attr('name','inspectStrategy');
		this._siblingsRB.click(this._setSiblingsStrat);
		
		var siblingsLbl=$('<label>'+helpers.STR("strings_main","conf.view.list.sibs.label")+'</label><br/><br/>',fbDocument);
		siblingsLbl.attr('id','siblingsLbl');
		siblingsLbl.attr('for','siblingsRB');
		siblingsLbl.attr('title',helpers.STR("strings_main","conf.view.list.sibs.tooltip"));
		
		var selectorLbl=$('<b>'+helpers.STR("strings_main","conf.view.list.selector.label")+'</b>',fbDocument);
		
		this._selectorTxtfld=$('<input style="float:left">',fbDocument);
		this._selectorTxtfld.attr('id','selectorTxtfld');
		this._selectorTxtfld.change(function(){			
			var marks = new Selector();
			marks.setSelector(configurationView._selectorTxtfld.val());
			marks.selector = configurationView._selectorTxtfld.val();
			configurationView._setListMarks(marks);
			configurationView._drawMarks();
		});
		
		form.append(strategyLbl);
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.list.strat.help"), "help/wand/gui#configTabListConfig", form);
		form.append($('<br/>', form));
		form.append(this._itemRB);
		form.append(itemLbl);		
		form.append(this._siblingsRB);
		form.append(siblingsLbl);
		form.append(selectorLbl);
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.list.sel.help"), "help/wand/gui#configTabListConfig", form);
		
		
		form.append("<br/>");
		form.append(this._selectorTxtfld);
		
		this.listInspectBttn=new WedexImageButton(form,helpers.getImage("Templarian_inspector_16.png"),helpers.getImage("Templarian_inspector_dis_16.png"),
			function(){
				configurationContent._mode = 'null';
				Firebug.Inspector.toggleInspecting(Firebug.currentContext);
			}, helpers.STR("strings_main","conf.view.list.insp.tooltip"));
			
		this.listDectectBttn=new WedexImageButton(form,helpers.getImage("wand-hat_16.png"),helpers.getImage("wand-hat_16.png"),
			function(){configurationActions.detectList()},  helpers.STR("strings_main","conf.view.list.listdet.tooltip"));
		
		this.listInspectBttn.getButton().css('margin-left', '5px');
		this.listInspectBttn.getButton().css('top', '2px');
		this.listInspectBttn.getButton().css('position', 'relative');
		this.listDectectBttn.getButton().css('margin-left', '5px');
		this.listDectectBttn.getButton().css('top', '1px');
		this.listDectectBttn.getButton().css('position', 'relative');
		listCont.append(form);		
	},
	
	/**
	 * Renders the content of the magic entry inside the accordion
	 */
	_renderMagicCont : function(){
		
		var magicPanel = this.magicPanel;
		var panel = this._getPanel();
		
		$('#magicConfDiv', fbDocument).remove();
		
		var magicCont=$('#magicCont',fbDocument);
		var form=$('<div id="magicConfDiv" />',fbDocument);		
		
		//Draw Include children
		var attributeLabel1=$('<b>'+helpers.STR("strings_main","conf.view.mg.incc.label")+'</b>',fbDocument);
		var attributeInput1=$('<br /><input style="width: 57%; left: 0px; position: relative;" value="0">',fbDocument);
		attributeInput1.attr('id','magicAtrributeChildCount');
		attributeInput1.change(function(){
			var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();
			currentMagicConfig.setAttr('SimpleAttributes', 'includeChildren', this.value);
		});
		
		//Read from data
		var currentMagicConfig = configurationData.getCurrentConfig().getMagicConfig();			
		var value = currentMagicConfig.getAttr('SimpleAttributes', 'includeChildren');
		if (value != null)
			attributeInput1.val(value);		
		
		form.append(attributeLabel1);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.mg.incc.help"), 'help/wand/gui#configTabMagicIncludeChildren', form);
		form.append(attributeInput1);
				
		magicCont.append(form);
	},
		
	/**
	 * Renders the list panel
	 */
	_renderListPanel : function () {
		var lp;
		
		lp=$('<div id="listPanel" class="contextPanel"/>',fbDocument);
		lp.addClass('ui-state-default');
		lp.addClass('ui-corner-top');		
		
		this._getPanel().append(lp);
	},
		
	//Render Accordions Form Content
	
	/**
	 * Renders the content of the form entry inside the accordion
	 */
	_renderFormCont : function () {
		
		$('#formConfDiv', fbDocument).remove();
		
		var formCont = $('#formCont', fbDocument);
		var form = $('<div id="formConfDiv" />', fbDocument);
		
		this._renderFormCont_JsonImport(form);		
				
		//Draw Form Elements Menu
		this._renderFormCont_formElementsMenu(form);
		
		formCont.append(form);		
	},
	
	/**
	 * Renders the json import part.	 
	 *
	 * @param {jqObject} parent The jQuery Object the content should be added to.
	 */
	_renderFormCont_JsonImport : function (parent) {
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
				
		
		var importLabel = $('<b>'+helpers.STR("strings_main","conf.view.ff.json.label")+'</b>', fbDocument);
		parent.append(importLabel);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.ff.json.help"), "help/wand/gui#ConfigFFJsonFile", parent);
		
		var nameLabel = $('<br><label style="width: 90px; float:left">'+helpers.STR("strings_main","conf.view.ff.json.name.label")+'</label>', fbDocument);		
		var fileNameLabel = $('<label>'+helpers.STR("strings_main","conf.view.ff.json.fn.label")+'</label>', fbDocument);		
		
		parent.append(nameLabel);
		parent.append(fileNameLabel);
		var fileInput = new WedexImageButton(parent,helpers.getImage("load_16.png"),helpers.getImage("load_16.png"),
			function(bttn){
					
				io.importJsonFile(function(file,name){
					if(file!=null){
						fillFormConfig.importedJson.file=file;
						fillFormConfig.importedJson.fileName=name;
						fileNameValue.text(name);
					}
					
				});
			
			}, helpers.STR("strings_main","conf.view.ff.json.tooltip"));

		var fileBttn=fileInput.getButton();
		fileBttn.css("position","relative");
		fileBttn.css("top","2px");
		fileBttn.css("left","5px");
		
		parent.append("</br>");
		
		var nameInput = $('<input style="width: 80px;">', fbDocument);
		nameInput.change(function(){
			fillFormConfig.importedJson.name=nameInput.val();
		});
		parent.append(nameInput);		
		var fileNameValue = $('<label/>', fbDocument);	
		fileNameValue.css("marginLeft","5px");	
		parent.append(fileNameValue);		

		parent.append("<br/>");
		parent.append("<br/>");
		
		if (fillFormConfig.importedJson) {
			//Set custom file name
			if(fillFormConfig.importedJson.name!=null)
				nameInput.val(fillFormConfig.importedJson.name);
			//Set filesystem file name	
			if(fillFormConfig.importedJson.fileName!=null)
				fileNameValue.text(fillFormConfig.importedJson.fileName);
		}
	},
	
	/**
	 * Renders the form elements menu in FormCont
	 *
	 * @param {jqObject} parent The jQuery Object the content should be added to.
	 */
	_renderFormCont_formElementsMenu : function (parent) {
		//Draw menus
		this._renderFormCont_addNewEntryMenu(parent);
		this._renderFormCont_tableHeader(parent);
		
		//Draw a table row for every given entry
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();		
		$.each(fillFormConfig.getFields(), function(index, element) {
			var data = {
					fieldName : element.fieldname,
					type : element.type,
					data : element.data,
			};
			configurationView._renderFormCont_tableEntry(parent, data);
		});
	},
	
	/**
	 * Renders the add-new-entry - menu un FormCont
	 *
	 * @param {jqObject} parent The jQuery Object the content should be added to.
	 */
	_renderFormCont_addNewEntryMenu : function (parent) {
		
		//Draw add-new-entry row
		var addElementsHeader = $('<b>'+helpers.STR("strings_main","conf.view.ff.fe.label")+'</b>', fbDocument);		
		var nameHeader = $('<br><label style="width: 80px; left: 0px; position: relative;">'+helpers.STR("strings_main","conf.view.ff.fe.name.label")+'</label>', fbDocument);		
		var nameInput = $('</br><input id="inputNameInput" style="width: 80px; position: relative;">', fbDocument);		
		var selectorHeader = $('<label style="width: 80px; left: 59px; position: relative;">'+helpers.STR("strings_main","conf.view.ff.fe.sel.label")+'</label>', fbDocument);		
		var selectorInput = $('<input id="inputSelectorInput" class="selectorDiv" style="width: 80px; position: relative; margin-left: 5px">', fbDocument);
		selectorInput.change(function() {
			configurationView._drawFormMarks();
		});
		var typeHeader = $('<label style="width: 80px; left: 117px; position: relative;">'+helpers.STR("strings_main","conf.view.ff.he.type.label")+'</label>', fbDocument);		
		
		//Outer inspect button
		var inspectButton = $('<input type="image" style="margin-left: 3px; position: relative; top: 2px" title="'+helpers.STR("strings_main","conf.view.ff.fe.insp.tooltip")+'" src="'+helpers.getImage("Templarian_inspector_16.png")+'"/>', fbDocument);
		inspectButton.click(function() {
			$('.fillFormSelectorField', fbDocument).removeClass('fillFormSelectorField');
			$('#inputSelectorInput', fbDocument).addClass('fillFormSelectorField');
			formFillActions.inspect(this);
		});
		inspectButton.hover(
			function () { 
				helpers.hoverinHelper(inspectButton);			 
			}, 
			function () { 
				helpers.hoveroutHelper(inspectButton);
			}
		);
		
		//Draw a select box for choosing the type
		var typeInput = $('<select id="inputTypeInput" name="type" style="width: 80px; margin-left: 5px; position: relative;"></select>', fbDocument);
		var typeOption = $('<option value="0">TextField</option>', fbDocument);
		typeInput.append(typeOption);
		typeOption = $('<option value="1">DateField</option>', fbDocument);
		typeInput.append(typeOption);
		typeOption = $('<option value="2">CheckBox</option>', fbDocument);
		typeInput.append(typeOption);
		typeOption = $('<option value="3">RadioButton</option>', fbDocument);
		typeInput.append(typeOption);
		typeOption = $('<option value="5">ComboBox</option>', fbDocument);
		typeInput.append(typeOption);
		typeOption = $('<option value="6">DateGroup</option>', fbDocument);
		typeInput.append(typeOption);
		typeOption = $('<option value="6">Parameter</option>', fbDocument);
		typeInput.append(typeOption);
		
		//Add Button
		var addButton=$('<input style="margin-left: 3px; position: relative; top: 2px" type="image" alt="Add" title="'+helpers.STR("strings_main","conf.view.ff.fe.add.tooltip")+'">',fbDocument);
		addButton.attr('src', helpers.getImage("plus-button_16.png"));
		addButton.click(function() {			
			formFillActions.addElement(
				$('#inputNameInput', fbDocument).val(),
				$('#inputTypeInput :selected', fbDocument).text(),
				$('#inputSelectorInput', fbDocument).val());
			//configurationView._drawFormMarks();
		});
		addButton.hover(
			function () { 
				helpers.hoverinHelper(addButton);			 
			}, 
			function () { 
				helpers.hoveroutHelper(addButton);
			}
		);
		
		$(parent).append(addElementsHeader);
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.ff.fe.help"), 'help/wand/gui#ConfigFillFormFormElementsOverview', parent);
		$(parent).append(nameHeader);
		$(parent).append(selectorHeader);
		$(parent).append(typeHeader);
		$(parent).append(nameInput);
		$(parent).append(selectorInput);
		$(parent).append(inspectButton);
		$(parent).append(typeInput);
		$(parent).append(addButton);		
	},
	
	/**
	 * Renders the table header in FormCont
	 *
	 * @param {jqObject} parent The jQuery Object the content should be added to.
	 */
	_renderFormCont_tableHeader : function (parent) {
		
		//Draw InputItemHeader / TableHeader		
		var inputItemHeader='<div id="inputItemHeader">';
		inputItemHeader+='<div style="width:87px;float:left" class="inputNameColumn">';
		inputItemHeader+='<p style="float:left;width:auto;text-align:center;" title="'+helpers.STR("strings_main","conf.view.ff.he.name.tooltip")+'" class="inputName">'+helpers.STR("strings_main","conf.view.ff.he.name.label")+'</p>';
		inputItemHeader+='</div>';
		
		inputItemHeader+='<div style="width:87px;float:left" class="selectorsColumn">';
		inputItemHeader+='<p style="float:left;width:auto;text-align:center;" title="'+helpers.STR("strings_main","conf.view.ff.he.sel.tooltip")+'" class="selectors">'+helpers.STR("strings_main","conf.view.ff.he.sel.label")+'</p>';
		inputItemHeader+='</div>';
		
		inputItemHeader+='<div style="width:87px;float:left" class="typeColumn">';
		inputItemHeader+='<p style="float:left;width:auto;text-align:center;" title="'+helpers.STR("strings_main","conf.view.ff.he.type.tooltip")+'" class="type">'+helpers.STR("strings_main","conf.view.ff.he.type.label")+'</p>';
		inputItemHeader+='</div>';
		
		inputItemHeader+='<div style="width:20px;float:left" class="deleteColumn">';
		inputItemHeader+='<p style="float:left;width:auto;text-align:center;" class="type"> </p>';
		inputItemHeader+='</div>';
		
		inputItemHeader+='<div style="width:10px;float:left" class="navColumn">';
		inputItemHeader+='<p style="float:left;width:auto;text-align:center;" class="type"> </p>';
		inputItemHeader+='</div>';
		
		inputItemHeader+='<div style="width:10px;float:left" class="navColumn">';
		inputItemHeader+='<p style="float:left;width:auto;text-align:center;" class="type"> </p>';
		inputItemHeader+='</div>';
		
		inputItemHeader+='</div>';
		
		$(parent).append(inputItemHeader);
	},
	
	/**
	 * Renders a new table entry in FormCont 
	 *
	 * @param {jqObject} parent 	The jQuery Object the content should be added to.
	 * @param field					The field which should be added
	 *   Beispiel
	 *   {
	 *	    fieldName : "Ein Name",
	 *      type : "Ein Typ",
	 *		data : "Die Daten",
	 *   }
	 */
	_renderFormCont_tableEntry : function (parent, field) {
		
				//Add Name column entry
		var newRow = $('<div class="inputItem"></div>', fbDocument);
		var nameInput = $('<input class="inputItemInnerDiv nameDiv" style="top: -2px;"></input>', fbDocument);
		nameInput.val(field.fieldName);
		nameInput.attr('name', field.fieldName);
		nameInput.change(function() {
			var el=this;
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
				fillFormConfig.setFieldAttribute(
					$(el).attr('name'),
					['fieldname'],
					$(el).val());
			
			//Update datasets
			var datasets = fillFormConfig._datasets;
			jQuery.each(datasets,function(i,ds){
				ds[$(el).val()]=ds[$(el).attr('name')];
				ds[$(el).val()].fieldname=$(el).val();
				delete ds[$(el).attr('name')];
			});
			
			$(el).attr('name', $(el).val());
			wedexDebug.nav.logObj("datasets",datasets);
			//Update formpanel
			configurationView.formPanel.update();
		});
		newRow.append(nameInput);
		
		//Add selector column entry
		var selectorInput = $('<input class="inputItemInnerDiv selectorDiv" style="width: 78px; top:-2px; "></input>', fbDocument);
		if (field.type != 'DateGroup') {
			selectorInput.val(field.data.selector);
			selectorInput.change(function() {
				var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
				fillFormConfig.setFieldAttribute(
					$(this).parents('.inputItem').find('.nameDiv').val(),
					['data', 'selector'],
					$(this).val());
				fillFormConfig.setFieldAttribute(
					$(this).parents('.inputItem').find('.nameDiv').val(),
					['name'],
					$($(this).parents('.inputItem').find('.selectorDiv').val(), content.document).attr('name'));
					
				selected = $("#accordion", fbDocument).accordion("option", "active");
				if (selected === 2)
					configurationView._drawFormMarks();
			});			
		}
		selectorInput.attr('disabled', true);
		newRow.append(selectorInput);
		$(selectorInput).change();
						
		//Add Type column entry
		newRow.append($('<div class="inputItemInnerDiv typeDiv" style="position:relative; left:3px"></div>', fbDocument).html(field.type));
		
		//Add Delete Button
		var deleteButton = $('<input type="image" alt="Delete" title="'+helpers.STR("strings_main","conf.view.ff.delbttn.tooltip")+'">', fbDocument);
		deleteButton.attr('src', helpers.getImage("minus-button_16.png"));
		deleteButton.click( function() {
			formFillActions.deleteElement(this);
			configurationView._drawFormMarks();
		});
		deleteButton.hover(
			function () { 
				helpers.hoverinHelper(deleteButton);			 
			}, 
			function () { 
				helpers.hoveroutHelper(deleteButton);
			}
		);
		newRow.append($('<div class="inputItemInnerDiv" style="width:20px"></div>', fbDocument).html(deleteButton));		
				
		//Add Up and Down Button
		var upButton = $('<input type="image" style="heigt:16px; width:16px;" alt="Up" title="'+helpers.STR("strings_main","conf.view.ff.upbttn.tooltip")+'">', fbDocument);
		upButton.attr('src', helpers.getImage("Up Arrow.png"));
		upButton.click( function() {
			formFillActions.sortUpElement(this);
		});
		upButton.hover(
			function () { 
				helpers.hoverinHelper(upButton);			 
			}, 
			function () { 
				helpers.hoveroutHelper(upButton);
			}
		);
		var upButtonDiv = $('<div class="inputItemInnerDiv" style="top: 7px; width:20px, height:10px;"></div>', fbDocument).html(upButton);
				
		var downButton = $('<input type="image" style="heigt:16px; width:16px;" alt="Down" title="'+helpers.STR("strings_main","conf.view.ff.downbttn.tooltip")+'">', fbDocument);
		downButton.attr('src', helpers.getImage("Down Arrow.png"));
		downButton.click( function() {
			formFillActions.sortDownElement(this);
		});
		downButton.hover(
			function () { 
				helpers.hoverinHelper(downButton);			 
			}, 
			function () { 
				helpers.hoveroutHelper(downButton);
			}
		);
		var downButtonDiv = $('<div class="inputItemInnerDiv" style="top: -6px; width:10px; height:10px;"></div>', fbDocument).html(downButton);
		
		
		var upAndDownButtonDiv = $('<div class="inputItemInnerDiv" style="top: -18px; width:16px"></div>', fbDocument);
		upAndDownButtonDiv.append(upButtonDiv).append(downButtonDiv);			
		newRow.append(upAndDownButtonDiv);
		
		//TODO Remove RB & CB from if, when they are ready
		if (field.type != 'TextField' && 
			field.type != 'RadioButton' &&  
			field.type != 'ComboBox' &&  
			field.type != 'CheckBox' &&  
			field.type != 'Button') {
			//Add expand button
			var expandButton = $('<input type="image" alt="Expand" title="'+helpers.STR("strings_main","conf.view.ff.expbttn.tooltip")+'">', fbDocument);
			expandButton.attr('src', helpers.getImage("plus_16.png"));
			expandButton.click(function() {
				formFillActions.expandElement(this);
				configurationView._drawFormMarks();
			});
			expandButton.hover(
				function () { 
					helpers.hoverinHelper(expandButton);			 
				}, 
				function () { 
					helpers.hoveroutHelper(expandButton);
				}
			);
			newRow.append($('<div class="inputItemInnerDiv" style="width:20px; margin-left:5px; "></div>', fbDocument).html(expandButton));
		}			
		$(parent).append(newRow);
	},
	
	/**
	 * Renders the expand area of a table entry in FormCont
	 *
	 * @param {jqObject} row 	The jQuery Object holding the row which should be expanded
	 */
	_renderFormCont_tableEntryExpandArea : function (row) {
		
		var type;
		if($(row).find('.typeDiv').length > 0) {
			if($(row).find('.typeDiv')[0].tagName == 'DIV')
				type = $(row).find('.typeDiv').html();
			else if($(row).find('.typeDiv')[0].tagName == 'SELECT')
				type = $(row).find('.typeDiv :selected').text();
		}
		if (row.hasClass('inputItem') == true) {
			var expandDiv = $('<div class="inputExpandItem"></div>', fbDocument);
			
		} else if (row.hasClass('inherentInputItem') == true) {
			var expandDiv = $('<div class="inherentInputExpandItem"></div>', fbDocument);
		}
		expandDiv.attr('id', $(row).find('.nameDiv').val());
		
		expandDiv.insertAfter(row);
		
		switch (type) {
			case "DateField":
				this._renderFormCont_tableEntryExpandArea_DateField(expandDiv);
				break;
			case "DateGroup":
				this._renderFormCont_tableEntryExpandArea_DateGroup(expandDiv);
				break;
			case "Parameter":
				this._renderFormCont_tableEntryExpandArea_Parameter(expandDiv);
				break;
			default:
				break;
		}
	},
	
	/**
	 * Renders the expandArea of a datefield table entry
	 *
	 * @param {jqObject} parent 	The jQuery Object the content should be added to.
	 */
	_renderFormCont_tableEntryExpandArea_DateField : function (parent) {		
		var formatLabel = $('<label style="position: relative; top: 3px; left:5px">'+helpers.STR("strings_main","conf.view.ff.df.format.label")+'</label>', fbDocument);
		parent.append(formatLabel);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.ff.df.help"), 'help/wand/gui#ConfigFillFormFormElementsDateFieldFormat', parent);
		var button = help.getButton();
		button.css('left', '5px');
		button.css('top', '3px');
		button.css('position', 'relative');
		
		var formatLabel = $('<label style="position: relative; top: 3px; left:93px">'+helpers.STR("strings_main","conf.view.ff.df.presel.label")+'</label>', fbDocument);
		parent.append(formatLabel);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.ff.df.presel.help"), 'help/wand/gui#ConfigFillFormFormElementsDateFieldPreselection', parent);
		var button = help.getButton();
		button.css('left', '92px');
		button.css('top', '3px');
		button.css('position', 'relative');
		
		var customFormatInput = $('<input class="customFormatInput" style="position: relative; left: 5px; width: 134px; top: 3px" value="DD-MM-YYYY"></input>', fbDocument);
		customFormatInput.change(function () {
			
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
			var attrKey;
			if ($(this).parents('.inherentInputExpandItem').toArray().length > 0) {
				if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate')
					attrKey = ['data', 'start', 'data', 'format'];
				else if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate')
					attrKey = ['data', 'end', 'data', 'format'];
			} else {
				attrKey = ['data', 'format'];
			}			
			
			fillFormConfig.setFieldAttribute(
					$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
					attrKey,
					$(this).val());
		});
		
		parent.append('<br />').append(customFormatInput);
		
		var formatInput = $('<select class="inputFormatInput" name="format" style="width: 140px; heigth:20px; left: 10px; position: relative; top: 3px"></select>', fbDocument);
		var formatOption = $('<option value="6"> </option>', fbDocument);
		formatInput.append(formatOption);
		formatOption = $('<option value="0">01.12.2012</option>', fbDocument);
		formatInput.append(formatOption);
		formatOption = $('<option value="1">25.01.12</option>', fbDocument);
		formatInput.append(formatOption);
		formatOption = $('<option value="2">25/01/2012</option>', fbDocument);
		formatInput.append(formatOption);
		formatOption = $('<option value="3">01/25/2012</option>', fbDocument);
		formatInput.append(formatOption);
		formatOption = $('<option value="4">25. Januar 2012</option>', fbDocument);
		formatInput.append(formatOption);
		formatOption = $('<option value="5">2012-01-25</option>', fbDocument);
		formatInput.append(formatOption);
		
		formatInput.change(function () {
			var format;
			switch($(this).parent().find('.inputFormatInput :selected').text()) {
				case "01.12.2012":
					format = "DD.MM.YYYY";
					break;
				case "25.01.12":
					format = "DD.MM.YY";
					break;
				case "25/01/2012":
					format = "DD/MM/YYYY";
					break;
				case "01/25/2012":
					format = "MM/DD/YYYY";
					break;
				case "25. Januar 2012":
					format = "DD. MMMM YYYY";
					break;
				case "2012-01-25":
					format = "YYYY-MM-DD";
					break;
				default:
					format = "DD.MM.YYYY";
					break;
			}
			$(this).parent().find('.customFormatInput').val(format);
			$($(this).parent().find('.customFormatInput')).change();			
		});	
		
		parent.append(formatInput);
		$(formatInput).parent().find(".inputFormatInput option[value='6']").attr('selected', true);
						
		
		
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		var attrKey;
		if ($(customFormatInput).parents('.inherentInputExpandItem').toArray().length > 0) {
			if ($(customFormatInput).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate')
				attrKey = ['data', 'start', 'data', 'format'];
			else if ($(customFormatInput).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate')
				attrKey = ['data', 'end', 'data', 'format'];
		} else {
			attrKey = ['data', 'format'];
		}
		
		customFormatInput.val(
			fillFormConfig.getFieldAttribute(
				$(customFormatInput).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrKey
			)
		);
		
		$(parent).css('height', '50px');
	},
	
	/**
	 * Renders the expandArea of a dategroup table entry
	 *
	 * @param {jqObject} parent 	The jQuery Object the content should be added to.
	 */
	_renderFormCont_tableEntryExpandArea_DateGroup : function (parent) {
		
		//FIELD 1
		
		var parDiv = $('<div></div>', fbDocument);
		
		var selectorLabel = $('<label style="position: relative; top: 5px; left: 5px">'+helpers.STR("strings_main","conf.view.ff.dg.sel.label")+'</label>', fbDocument);
		var formatLabel = $('<label style="position: relative; top: 5px; left: 115px">'+helpers.STR("strings_main","conf.view.ff.dg.format.label")+'</label>', fbDocument);
		parDiv.append(selectorLabel);
		parDiv.append(formatLabel);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.ff.dg.format.help"), 'help/wand/gui#ConfigFillFormFormElementsDateGroupFormat', parDiv);
		var button = help.getButton();
		button.css('left', '115px');
		button.css('top', '5px');
		button.css('position', 'relative');
		
		var selectorInput = $('<br /><input class="selectorDiv" type="text" name="format" style="width: 130px; position: relative; top: 5px; left: 5px"></input>', fbDocument);
		selectorInput.change(function() {			
			var attrSelKey;
			var attrNameKey;
			if ($(this).parents('.inherentInputExpandItem').toArray().length > 0) {
				if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate') {
					attrSelKey = ['data', 'start', 'data', 'selector', 0];
					attrNameKey = ['data', 'start', 'data', 'name', 0];
				} else if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate') {
					attrSelKey = ['data', 'end', 'data', 'selector', 0];
					attrNameKey = ['data', 'end', 'data', 'name', 0];
				}
			} else {
				attrSelKey = ['data', 'selector', 0];
				attrNameKey = ['data', 'name', 0];
			}
			
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();			
			fillFormConfig.setFieldAttribute(
				$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrSelKey,
				$(this).val());
			fillFormConfig.setFieldAttribute(
				$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrNameKey,
				$($(this).val(), content.document).attr('name'));
			configurationView._drawFormMarks();
		});	
				
		var innerInspectButton1 = $('<input type="image"  style="position: relative; width: 16px; top:5px; left: 5px" title="'+helpers.STR("strings_main","conf.view.ff.dg.insp.tooltip")+'" src="'+helpers.getImage("Templarian_inspector_16.png")+'"/>',fbDocument);
		innerInspectButton1.click(function() {
			$('.fillFormSelectorField', fbDocument).removeClass('fillFormSelectorField');
			$(this).parent().find('.selectorDiv').addClass('fillFormSelectorField');
			formFillActions.inspect(this);
		});
		innerInspectButton1.hover(
			function () { 
				helpers.hoverinHelper(innerInspectButton1);			 
			}, 
			function () { 
				helpers.hoveroutHelper(innerInspectButton1);
			}
		);
		
		parDiv.append(selectorInput);
		parDiv.append(innerInspectButton1);		
		
		var customFormatInput = $('<input class="customFormatInput" style="position: relative; left: 10px; width: 144px; top: 5px" value="DD"></input>', fbDocument);
		customFormatInput.change(function() {
			var attrSelKey;
			if ($(this).parents('.inherentInputExpandItem').toArray().length > 0) {
				if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate') {
					attrSelKey = ['data', 'start', 'data', 'format', 0];					
				} else if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate') {
					attrSelKey = ['data', 'end', 'data', 'format', 0];
				}
			} else {
				attrSelKey = ['data', 'format', 0];
			}
			
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();			
			fillFormConfig.setFieldAttribute(
				$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrSelKey,
				$(this).val());
		});
		parDiv.append(customFormatInput).append($('<br />', fbDocument));
		parent.append(parDiv);
				
		var attrSelKey;
		var attrForKey;
		if ($(customFormatInput).parents('.inherentInputExpandItem').toArray().length > 0) {
			if ($(customFormatInput).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate') {
				attrSelKey = ['data', 'start', 'data', 'selector', 0];
				attrForKey = ['data', 'start', 'data', 'format', 0];
			}
			else if ($(customFormatInput).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate') {
				attrSelKey = ['data', 'end', 'data', 'selector', 0];
				attrForKey = ['data', 'end', 'data', 'format', 0];
			}
		} else {
			attrSelKey = ['data', 'selector', 0];
			attrForKey = ['data', 'format', 0];			
		}
		
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();		
		selectorInput.val(
			fillFormConfig.getFieldAttribute(
				$(customFormatInput).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrSelKey));
		customFormatInput.val(
			fillFormConfig.getFieldAttribute(
				$(customFormatInput).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrForKey));
		
		
		//FIELD 2
		
		var parDiv = $('<div></div>', fbDocument);
		
		var selectorLabel = $('<label style="position: relative; top: 5px; left: 5px">'+helpers.STR("strings_main","conf.view.ff.dg.sel.label")+'</label>', fbDocument);
		var formatLabel = $('<label style="position: relative; top: 5px; left: 115px">'+helpers.STR("strings_main","conf.view.ff.dg.format.label")+'</label>', fbDocument);
		parDiv.append(selectorLabel);
		parDiv.append(formatLabel);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.ff.dg.format.help"), 'help/wand/gui#ConfigFillFormFormElementsDateGroupFormat', parDiv);
		var button = help.getButton();
		button.css('left', '115px');
		button.css('top', '5px');
		button.css('position', 'relative');
		
		var selectorInput = $('<br /><input class="selectorDiv" type="text" name="format" style="width: 130px; position: relative; top: 5px; left: 5px"></input>', fbDocument);
		selectorInput.change(function() {
			var attrSelKey;
			var attrNameKey;
			if ($(this).parents('.inherentInputExpandItem').toArray().length > 0) {
				if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate') {
					attrSelKey = ['data', 'start', 'data', 'selector', 1];
					attrNameKey = ['data', 'start', 'data', 'name', 1];
				} else if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate') {
					attrSelKey = ['data', 'end', 'data', 'selector', 1];
					attrNameKey = ['data', 'end', 'data', 'name', 1];
				}
			} else {
				attrSelKey = ['data', 'selector', 1];
				attrNameKey = ['data', 'name', 1];
			}
			
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();			
			fillFormConfig.setFieldAttribute(
				$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrSelKey,
				$(this).val());
			fillFormConfig.setFieldAttribute(
				$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrNameKey,
				$($(this).val(), content.document).attr('name'));
			configurationView._drawFormMarks();
		});
		var innerInspectButton2 = $('<input type="image"  style="position: relative; width: 16px; top:5px; left: 5px" title="'+helpers.STR("strings_main","conf.view.ff.dg.insp.tooltip")+'" src="'+helpers.getImage("Templarian_inspector_16.png")+'"/>',fbDocument);
		innerInspectButton2.click(function() {
			$('.fillFormSelectorField', fbDocument).removeClass('fillFormSelectorField');
			$(this).parent().find('.selectorDiv').addClass('fillFormSelectorField');
			formFillActions.inspect(this);
		});
		innerInspectButton2.hover(
			function () { 
				helpers.hoverinHelper(innerInspectButton2);			 
			}, 
			function () { 
				helpers.hoveroutHelper(innerInspectButton2);
			}
		);
		
		parDiv.append(selectorInput);
		parDiv.append(innerInspectButton2);
						
		var customFormatInput = $('<input class="customFormatInput" style="position: relative; left: 10px; width: 144px; top: 5px" value="MM"></input>', fbDocument);
		customFormatInput.change(function() {					
			var attrSelKey;
			if ($(this).parents('.inherentInputExpandItem').toArray().length > 0) {
				if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate') {
					attrSelKey = ['data', 'start', 'data', 'format', 1];					
				} else if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate') {
					attrSelKey = ['data', 'end', 'data', 'format', 1];
				}
			} else {
				attrSelKey = ['data', 'format', 1];
			}
			
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();			
			fillFormConfig.setFieldAttribute(
				$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrSelKey,
				$(this).val());
		});
		parDiv.append(customFormatInput).append($('<br />', fbDocument));
		parent.append(parDiv);
		
		var parDiv = $('<div></div>', fbDocument);
		
		var attrSelKey;
		var attrForKey;
		if ($(customFormatInput).parents('.inherentInputExpandItem').toArray().length > 0) {
			if ($(customFormatInput).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate') {
				attrSelKey = ['data', 'start', 'data', 'selector', 1];
				attrForKey = ['data', 'start', 'data', 'format', 1];
			}
			else if ($(customFormatInput).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate') {
				attrSelKey = ['data', 'end', 'data', 'selector', 1];
				attrForKey = ['data', 'end', 'data', 'format', 1];
			}
		} else {
			attrSelKey = ['data', 'selector', 1];
			attrForKey = ['data', 'format', 1];			
		}
		
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();		
		selectorInput.val(
			fillFormConfig.getFieldAttribute(
				$(customFormatInput).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrSelKey));
		customFormatInput.val(
			fillFormConfig.getFieldAttribute(
				$(customFormatInput).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrForKey));
		
		//FIELD 3
		
		var selectorLabel = $('<label style="position: relative; top: 5px; left: 5px">'+helpers.STR("strings_main","conf.view.ff.dg.sel.label")+'</label>', fbDocument);
		var formatLabel = $('<label style="position: relative; top: 5px; left: 115px">'+helpers.STR("strings_main","conf.view.ff.dg.format.label")+'</label>', fbDocument);
		parDiv.append(selectorLabel);
		parDiv.append(formatLabel);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.ff.dg.format.help"), 'help/wand/gui#ConfigFillFormFormElementsDateGroupFormat', parDiv);
		var button = help.getButton();
		button.css('left', '115px');
		button.css('top', '5px');
		button.css('position', 'relative');
		
		var selectorInput = $('<br /><input class="selectorDiv" type="text" name="format" style="width: 130px; position: relative; top: 5px; left: 5px"></input>', fbDocument);
		selectorInput.change(function() {
			var attrSelKey;
			var attrNameKey;
			if ($(this).parents('.inherentInputExpandItem').toArray().length > 0) {
				if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate') {
					attrSelKey = ['data', 'start', 'data', 'selector', 2];
					attrNameKey = ['data', 'start', 'data', 'name', 2];
				} else if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate') {
					attrSelKey = ['data', 'end', 'data', 'selector', 2];
					attrNameKey = ['data', 'end', 'data', 'name', 2];
				}
			} else {
				attrSelKey = ['data', 'selector', 2];
				attrNameKey = ['data', 'name', 2];
			}
			
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();			
			fillFormConfig.setFieldAttribute(
				$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrSelKey,
				$(this).val());
			fillFormConfig.setFieldAttribute(
				$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrNameKey,
				$($(this).val(), content.document).attr('name'));
			configurationView._drawFormMarks();
		});
		var innerInspectButton3 = $('<input type="image"  style="position: relative; width: 16px; top:5px; left: 5px" title="'+helpers.STR("strings_main","conf.view.ff.dg.insp.tooltip")+'" src="'+helpers.getImage("Templarian_inspector_16.png")+'"/>',fbDocument);
		innerInspectButton3.click(function() {
			$('.fillFormSelectorField', fbDocument).removeClass('fillFormSelectorField');
			$(this).parent().find('.selectorDiv').addClass('fillFormSelectorField');
			formFillActions.inspect(this);
		});
		innerInspectButton3.hover(
			function () { 
				helpers.hoverinHelper(innerInspectButton3);			 
			}, 
			function () { 
				helpers.hoveroutHelper(innerInspectButton3);
			}
		);
		
		parDiv.append(selectorInput);
		parDiv.append(innerInspectButton3);
				
		var customFormatInput = $('<input class="customFormatInput" style="position: relative; left: 10px; width: 144px; top: 5px" value="YYYY"></input>', fbDocument);
		customFormatInput.change(function() {					
			var attrSelKey;
			if ($(this).parents('.inherentInputExpandItem').toArray().length > 0) {
				if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate') {
					attrSelKey = ['data', 'start', 'data', 'format', 2];					
				} else if ($(this).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate') {
					attrSelKey = ['data', 'end', 'data', 'format', 2];
				}
			} else {
				attrSelKey = ['data', 'format', 2];
			}
			
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();			
			fillFormConfig.setFieldAttribute(
				$(this).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrSelKey,
				$(this).val());
		});
		parDiv.append(customFormatInput).append($('<br />', fbDocument));
		parent.append(parDiv);

		var attrSelKey;
		var attrForKey;
		if ($(customFormatInput).parents('.inherentInputExpandItem').toArray().length > 0) {
			if ($(customFormatInput).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'StartDate') {
				attrSelKey = ['data', 'start', 'data', 'selector', 2];
				attrForKey = ['data', 'start', 'data', 'format', 2];
			}
			else if ($(customFormatInput).parents('.inherentInputExpandItem').prev().find('.nameDiv').val() == 'EndDate') {
				attrSelKey = ['data', 'end', 'data', 'selector', 2];
				attrForKey = ['data', 'end', 'data', 'format', 2];
			}
		} else {
			attrSelKey = ['data', 'selector', 2];
			attrForKey = ['data', 'format', 2];			
		}
		
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();		
		selectorInput.val(
			fillFormConfig.getFieldAttribute(
				$(customFormatInput).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrSelKey));
		customFormatInput.val(
			fillFormConfig.getFieldAttribute(
				$(customFormatInput).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrForKey));
		
		$(parent).css('height', '135px');
	},
	
	/**
	 * Renders the expandArea of a Hidden Field table entry
	 *
	 * @param {jqObject} parent 	The jQuery Object the content should be added to.
	 */
	_renderFormCont_tableEntryExpandArea_Parameter : function (parent) {
		var formatLabel = $('<label style="position:relative; top:3px; left:5px;">Value</label>', fbDocument);
		parent.append(formatLabel);
		
		var help = new WedexHelpButton(helpers.STR("strings_main","conf.view.ff.hf.val.help"), 'help/wand/gui#ConfigFillFormFormElementsParameterValue', parent);
		var button = help.getButton();
		button.css('left', '5px');
		button.css('top', '3px');
		button.css('position', 'relative');
								
		var valueInput = $('<input class="valueInput" style="position: relative; left: 5px; width: 146px; top: 3px" ></input>', fbDocument);
		
		//Write value
		valueInput.change(function () {			
			var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
			var attrKey = ['data', 'customValue'];
			var fldName=$(this).parents('.inputExpandItem').prev().find('.nameDiv').val();
			var newVal=$(this).val();
			fillFormConfig.setFieldAttribute(
					fldName,
					attrKey,
					newVal
			);	
					
			//Update all Datasets
			jQuery.each(fillFormConfig._datasets,function(){
				this[fldName].value=newVal;
			});
			//Update formpanel
			configurationView.formPanel.update();		
		});		
		parent.append('<br />').append(valueInput);		
		
		//Read value
		var fillFormConfig = configurationData.getCurrentConfig().getFormFillConfig();
		var attrKey = ['data', 'customValue'];				
		valueInput.val(
			fillFormConfig.getFieldAttribute(
				$(valueInput).parents('.inputExpandItem').prev().find('.nameDiv').val(),
				attrKey
			)
		);
		
		$(parent).css('height', '50px');
	},
	
	//Marker handling
	
	/**
	 * Get the selector object containing the list selector
	 *
	 * @return a selector object
	 */
	_getListMarks : function () {
		return configurationData.getCurrentConfig().getListConfig();
	},
	
	/**
	 * Get the selector object containing the custom key selectors
	 *
	 * @return a selector object
	 */
	_getCustomKeyMarks : function () {
		return this.customKeyMarks;
	},
	
	/**
	 * Get the selector object containing the sub items selectors
	 *
	 * @return a selector object
	 */
	_getSubItemMarks : function () {
		return this.subItemMarks;
	},
	
	/**
	 * Get the selector object containing the form inputs selectors
	 *
	 * @return a selector object
	 */
	_getFormMarks : function () {
		return this.formMarks;
	},
	
	/**
	 * Set the selector object containing the list selectors
	 *
	 * @param val a selector object
	 */
	_setListMarks : function (val) {
		configurationData.getCurrentConfig()._listConfig = val;
	},
	
	/**
	 * Set the selector object containing the list selectors
	 *
	 * @param val a selector object
	 */
	_setCustomKeyMarks : function (val) {
		this.customKeyMarks = val;
	},
	
	/**
	 * Set the selector object containing the sub items selectors
	 *
	 * @param val a selector object
	 */
	_setSubItemMarks : function (val) {
		this.subItemMarks = val;
	},
	
	/**
	 * Set the selector object containing the form selectors
	 *
	 * @param val a selector object
	 */
	_setFormMarks : function (val) {
		this.formMarks = val;
	},
	
	/**
	 * Update the form marks
	 */
	_updateFormMarks : function () {
		var marks = new Selector();
		$('.selectorDiv', fbDocument).each(function(index, element) {
			if ($($(element).val(), content.document).length > 0)
				marks.addDOMNode($($(element).val(), content.document).toArray());
		});
		configurationView._setFormMarks(marks);
	},

	/**
	 * Draw the form marks
	 */
	_drawFormMarks : function () {
		Selector.unmarkAll();
		this._updateFormMarks();
		(this._getFormMarks()).mark();
	},

	/**
	 * Draw the list marks
	 */
	_drawListMarks : function () {
		Selector.unmarkAll();
		try {
			this._getListMarks().mark(true);
		} catch (e) { }		
	},

	/**
	 * Draw the magic marks
	 *
	 * @param val 0 if customkey-tab is opened 1 if sub items tab, if = null function is checking opened tab by itself
	 */
	_drawMagicMarks : function (val) {
		
		Selector.unmarkAll();
		var marks = new Selector();
		var magicConfig = configurationData.getCurrentConfig().getMagicConfig();		
		
		var selected;
		if (val != null)
			selected = val;
		else
			selected = $('#tabs', fbDocument).tabs('option', 'selected');
				
		if (selected == 0) {
			var listConf = configurationData.getCurrentConfig().getListConfig();
			marks = new Selector(listConf);
			var sels = magicConfig.getAttr('CustomSelectors', 'selectors');		
			if (sels != null) {
				$.each(sels, function(index, element) {
					if ($(element.selector, content.document).length > 0)
						marks.addDOMNode($(element.selector, content.document));
				});
			}
			if (listConf.getSelectedNodes().length > 0) {				
				var secmarks = new Selector();
				$.each(marks.getSelectedNodes(), function (index, element) {					
					if (listConf.getSelectedNodes().has(element).length > 0)
						secmarks.addDOMNode(element);					
				});
				marks = secmarks;
			}
			configurationView._setCustomKeyMarks(marks);
		}
		
		else if (selected == 1) {
			var sels = magicConfig.getAttr('SubItems', 'groups');		
			if (sels != null) {
				$.each(sels, function(index, element) {
					if ($(element.selector, content.document).length > 0)
						marks.addDOMNode($(element.selector, content.document));
				});
			}			
			configurationView._setSubItemMarks(marks);
		}
		try {
			marks.mark();
		} catch (err) {}
	},

	/**
	 * Draw marks considerung the currently opened accordion entry
	 *
	 * @param val 0 if list conf is opened 1 if magic conf, ... if = null function is checking opened tab by itself
	 */
	_drawMarks : function (val) {
		
		var selected;
		if (val != null)
			selected = val;
		else
			selected = $("#accordion", fbDocument).accordion("option", "active");
		
		switch (selected) {
			case 0:
				this._drawListMarks();
				break;
			case 1:
				this._drawMagicMarks();			
				break;
			case 2:
				this._drawFormMarks();				
				break;
		}
	},
}
