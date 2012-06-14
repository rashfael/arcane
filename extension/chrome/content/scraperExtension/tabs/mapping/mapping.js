/**
 * extension.mapping.js
 *
 * This javascript file provides methods belonging to the mapping tab.
 */

/**
 *	Singleton which represents the datamodel of the mapping tab. 
 */
var mappingData = {

	/**
	 * Holds the name of the current loaded mapping
	 */
	_loadedMapping : null,

	/**
	 * Boolean which says if mappingData is already initialized
	 */
	_initialized : false,
	
	/**
	 * Saves all mappings. Every entry is a history-object.
	 *
	 * id: Internal Id of the mapping
	 * name: Name of the mapping
	 * page[]: mapping for each page
	 * page[].selector: Selector for inspected elements
	 * page[].data[]: The detected attributes
	 * page[].data[].key: The detected key
	 * page[].data[].dbKey: The database Key
	 * page[].data[].checked: True if key has to be scraped
	 * page[].data[].values[]: Corresponding values
	 */
	_mapping : [],

	/**
	 * Initializes mappingData. Creates default mapping.
	 */
	initialize : function () {
		
		//Create default mapping object		
		if (mappingData._initialized === false) {
		
			mappingData._initialized = true;
			
			mappingData._loadedMapping = helpers.STR("strings_main","map.defaultmapping.label");
			
			var pageObject = {};
			pageObject.selector = new Selector();
			pageObject.data = [];
			pageObject.currentData = [];
			
			var mappingObject = {};
			mappingObject.id = new Date().getTime();
			mappingObject.name = mappingData._loadedMapping;
			mappingObject.page = [];
			mappingObject.page.push(pageObject);

			mappingData._mapping.push(mappingObject);
			mappingHelper.pushMappingsToGraphTab();
		}
	},

	/**
	 * NOT IN USE
	 * Sets the scraper config.
	 * 
	 * @param scraperConfig
	 *            Imported data which has to be loaded into the tab.
	 */
	setScraperConfig : function (scraperConfig) {},

	/**
	 * Returns the scraper config.
	 *
	 * @return All data which has to be safed
	 */
	getScraperConfigPart : function () {
		//Build config file
		var _scraperConfig = {};
		_scraperConfig.mappings = {};
		jQuery.each(mappingData._mapping, function (i, mappingElement) {
			var map = {};
			jQuery.each(mappingElement.page, function (j, pageElement) {
				jQuery.each(pageElement.data, function (k, keyElement) {
					if (keyElement.checked === 'checked') {
						if (keyElement.dbKey) {
							map[keyElement.key] = keyElement.dbKey;
						} else {
							map[keyElement.key] = "";
						}
					} else {
						map[keyElement.key] = false;
					}
				});
			});
			var baseMapping = {};
			baseMapping.map = map;
			_scraperConfig.mappings[mappingElement.id] = baseMapping;
		});
		return _scraperConfig;
	},

	/**
	 * Returns the current page object of the loaded mapping
	 * 
	 * @return Returns the current page object if there's a loaded mapping
	 *         Returns null if there's no loaded mapping
	 */
	getCurrentPageObject : function () {
		if (mappingData._loadedMapping !== 'null') {
			var loadedMapping = jQuery.grep(mappingData._mapping, function (element, index) {return element.name === mappingData._loadedMapping; });
			if (loadedMapping.length == 0) {
				mappingData.initialize();				
				loadedMapping = jQuery.grep(mappingData._mapping, function (element, index) {return element.name === mappingData._loadedMapping; });
			}			
			var currentPage = loadedMapping[0].page[0];
			return currentPage;
		} else {
			return null;
		}
	},

	/**
	 * Returns a object including all data from the mapping tab
	 * 
	 * @return mappingData._mapping, an array including all relevant data
	 */
	getMappingData : function () {
		return mappingData._mapping;
	},

	/**
	 * Sets the mapping tab data
	 *
	 * @param data
     *			An array which includes all relevant data from the mapping tab
	 */
	setMappingData : function (data) {
		mappingData._mapping = data.mappingData;
		mappingData._loadedMapping = mappingData._mapping[0].name;
		if(activeTab=="mapping"){
			mappingView.redraw();
		}
	},
	
	/**
	 * Returns data for key table
	 */
	getKeyTableModel : function() {
		
		//Create model
		var model = {};
		model.cellSelection = false;
		model.columns = [];
		model.rows = [];
		
		//Create columns definition
		var keyColumn = {
			header : {
				element: "span",
				sortable: true,
				text: helpers.STR("strings_main","map.keytable.key.label"),
				tooltip: helpers.STR("strings_main","map.keytable.key.tooltip"),
				width: "100px",
				type: "",
				readonly: true,
				selectAction: function() {
				
				},
				valueChangedAction: function() {
				
				},
			},
			content : {
				element: "span",
				type: "",
				readonly: true,
				selectAction: function() {
					mappingView._wedexValueTable.update(mappingData.getValueTableModel());
				},
				valueChangedAction: function() { },
			},
		};
		
		var databaseKeyColumn = {
			header : {
				element: "span",
				sortable: false,
				text: helpers.STR("strings_main","map.keytable.dbkey.label"),
				tooltip: helpers.STR("strings_main","map.keytable.dbkey.tooltip"),
				width: "100px",
				type: "",
				readonly: true,
				selectAction: function() { },
				valueChangedAction: function() { },
			},
			content : {
				element: "input",
				type: "text",
				readonly: false,
				selectAction: function() {
					mappingView._wedexValueTable.update(mappingData.getValueTableModel());
				},
				valueChangedAction: function(obj, tbl) {					
					Encoder.EncodeType = "numerical";
					var key = Encoder.htmlDecode($(obj).parent().parent().find('span').html());
					mappingActions.onSetDbKey(key, $(obj).val());
				},
			},
		};
		
		var checkboxColumn = {
			header : {
				element: "input",
				sortable: false,
				tooltip: helpers.STR("strings_main","map.keytable.checkbox.tooltip"),
				text: "",
				width: "10px",
				type: "checkbox",
				readonly: false,
				selectAction: function(obj, tbl) { },
				valueChangedAction: function(obj, tbl) {
					
					if($(obj).val() === 'true') {
						$(obj).parents('table')
								.find('tbody input:checkbox')
								.attr('checked', true);
						$(obj).parents('table')
								.find('tbody input:checkbox')
								.val('');
						jQuery.each(mappingData.getCurrentPageObject().data, function (index, element) {
							var map = jQuery.grep(mappingData.getCurrentPageObject().currentData, function(element2, index2) {
								return element.key == element2.key;
							});
							if (map.length > 0)
								element.checked = 'checked';
						});
						
					} else {
						$(obj).parents('table')
								.find('tbody input:checkbox')
								.attr('checked', false)
						$(obj).parents('table')
								.find('tbody input:checkbox')
								.val('checked');
						jQuery.each(mappingData.getCurrentPageObject().data, function (index, element) {
							var map = jQuery.grep(mappingData.getCurrentPageObject().currentData, function(element2, index2) {
								return element.key == element2.key;
							});
							if (map.length > 0)
								element.checked = false;
						});
					}
				},
			},
			content : {
				element: "input",
				type: "checkbox",
				readonly: false,
				selectAction: function(obj, tbl) {
					mappingView._wedexValueTable.update(mappingData.getValueTableModel());
				},
				valueChangedAction: function(obj, tbl) {
					Encoder.EncodeType = "numerical";
					var givenKey = Encoder.htmlDecode($(obj).parent().parent().find('span').html());
					var entry = jQuery.grep(mappingData.getCurrentPageObject().data, function (a) {
						return a.key === givenKey;
					});
					if (entry.length > 0) {
						if ($(obj).val() === 'true') {
							entry[0].checked = 'checked';
							$(obj).val('');
						} else {
							entry[0].checked = false;
							$(obj).val('checked');
						} 
					}
				},
			},
		};
		
		model.columns.push(keyColumn);
		model.columns.push(databaseKeyColumn);
		model.columns.push(checkboxColumn);
		
		//Create rows		
		$.each(mappingData.getCurrentPageObject().data, function(index, element) {			
			if (element.values.length >= mappingView._minValues) {
			
				var row = [];
				var row1 = {
					text : element.key,
					value : 0,
				};
				var row2 = {
					text : "",
					value : element.dbKey,
				};
				var row3 = {
					text : "",
					value : element.checked,
				};
				row.push(row1);
				row.push(row2);
				row.push(row3);
				model.rows.push(row);
			}
		});
		
		return model;
	},
	
	/**
	 * Returns data for value table
	 */
	getValueTableModel : function() {
		
		//Create model
		var model = {};
		model.cellSelection = false;
		model.columns = [];
		model.rows = [];
		
		//Create columns definition
		var valueColumn = {
			header : {
				element: "span",
				sortable: true,
				text: helpers.STR("strings_main","map.valuetable.label"),
				tooltip: helpers.STR("strings_main","map.valuetable.tooltip"),
				
				type: "",
				readonly: true,
				selectAction: function() { },
				valueChangedAction: function() { },
			},
			content : {
				element: "span",
				type: "",
				readonly: true,
				selectAction: function() { },
				valueChangedAction: function() { },
			},
		};
		
		model.columns.push(valueColumn);
		
		//Create rows
		var index = mappingView._wedexKeyTable.getSelectedRowIndex();
		if(index > -1) {
			var selectedRow = mappingView._wedexKeyTable.getRow(index);
			if(selectedRow==null)
				return model;
			Encoder.EncodeType = "numerical";
			var key = Encoder.htmlDecode($(selectedRow).find('span').html());			
			var selectedElement = jQuery.grep(
				mappingData.getCurrentPageObject().data,
				function (entry, index) {
					return key === entry.key; 
				})[0];
			$.each(selectedElement.values, function(index, element) {
				var row = [];
				var row1 = {
					text : element,
					value : "",
				};
				row.push(row1);
				model.rows.push(row);
			});
		}		
		return model;
	}
};

/**
 *	Singleton which holds the actions of the mapping tab. 
 */
var mappingActions = {

	/**
	 * Searches for key-value pairs
	 */
	onInspect : function () {
	
		Selector.unmarkAll();
		
		//Define local used variables
		var currentPage = mappingData.getCurrentPageObject();
		var selectedElements;
		
		if(isNaN(parseInt(browser.chrome.$("configMenuList").selectedItem.value)) == false) {
			//Get mapping configuration
			var configId = (browser.chrome.$("configMenuList").selectedItem.value);
			var extConfig = configurationData.getConfig(configId);
			var tempMagicConfig = extConfig.getMagicConfig();
			currentPage.selector = extConfig.getListConfig().getSelector().toString();			
		} else {
			var tempMagicConfig = null;
			currentPage.selector = browser.chrome.$("configMenuList").selectedItem.value;			
		}
		
		//Setup magic
		var magicLib = require('./magic');
		window.jQuery = $;
		var magic = new magicLib(window);
		
		
		//Build magicConfig
		var magicConfig = {
			SimpleAttributes: {
				includeChildren: 0
			},
			ImageAltTags: {
				keyGen: 'fancy'
			},
			SimpleTable: {
				wurbl: 'durbl'
			},
			CustomSelectors: {
				selectors: []
			},
			SubItems: {
				groups: []
			},		
		};
		
		if(tempMagicConfig != null) {
			if (tempMagicConfig.getAttr('SimpleAttributes', 'includeChildren') != null)
				magicConfig.SimpleAttributes.includeChildren = tempMagicConfig.getAttr('SimpleAttributes', 'includeChildren');
			if (tempMagicConfig.getAttr('CustomSelectors', 'selectors') != null)
				magicConfig.CustomSelectors.selectors = tempMagicConfig.getAttr('CustomSelectors', 'selectors');
			if (tempMagicConfig.getAttr('SubItems', 'groups') != null)
				magicConfig.SubItems.groups = tempMagicConfig.getAttr('SubItems', 'groups');
		}
				
		//Find elements
		selectedElements = $(currentPage.selector, content.document);		
				
		//Find keys and values of given elements
		var detectedKeys = [];
		jQuery(selectedElements).each(function (index, value) {
			jQuery.merge(detectedKeys, magic.attributes.findAttributes(value, magicConfig));
		});
		
		//Join values if keys already exist
		currentPage.currentData = mappingHelper.joinMagicKeys(detectedKeys);
		jQuery.each(currentPage.data, function (index, element) {
			var map = jQuery.grep(currentPage.currentData, function (value, index2) {
				return value.key === element.key;
			});
			if (map.length > 0) {
				map[0].dbKey = element.dbKey;
				map[0].checked = element.checked;
			}
		});
		
		//Add new keys to data
		jQuery.each(currentPage.currentData, function (index, element) {
			var map = jQuery.grep(currentPage.data, function (value, index2) {
				return value.key === element.key;
			});
			if (map.length < 1)
				currentPage.data.push(element);
		});
		
		//Update UI
		mappingView.redraw();
	},

	/**
	 * Loads data of mapping which should be edited
	 */
	onChooseMapping : function () {
		Selector.unmarkAll()
		//Update loaded mapping	
		mappingData._loadedMapping = browser.chrome.$("mappingMenuList").selectedItem.label;
		mappingView.redraw();
	},

	/**
	 * Deletes currently selected mapping
	 */
	onDeleteMapping : function () {
		if (browser.chrome.$("mappingMenuList").itemCount > 1) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
			var result = prompts.confirm(null, helpers.STR("strings_main","map.dialog.delete.title"), helpers.STR("strings_main","map.dialog.delete.description"));
			
			if (result === true) {
				
				//Clear mapping tab
				jQuery(".inspectedElement", content.document).css('backgroundColor', '');
				jQuery(".inspectedElement", content.document).removeClass("inspectedElement");
				//Delete data
				mappingData._mapping = jQuery.grep(mappingData._mapping, function (element, index) {
					return element.name !== mappingData._loadedMapping;
				});
				mappingData._loadedMapping = 'null';
				//Delete comboBox item
				browser.chrome.$("mappingMenuList").removeItemAt(browser.chrome.$("mappingMenuList").selectedIndex);
				browser.chrome.$("mappingMenuList").selectedIndex = 0;
				//Redraw
				mappingData._loadedMapping = browser.chrome.$("mappingMenuList").selectedItem.label;
				mappingView.redraw();
			}
		} else {
			status.error(helpers.STR("strings_main","map.delete.error"));
		}
	},

	/**
	 * Renames currently selected mapping
	 */
	onRenameMapping : function () {
		
		var myPrompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var check = {value: false};
		var input = {value: ""};
		var result = myPrompt.prompt(null,  helpers.STR("strings_main","map.dialog.rename.title"), helpers.STR("strings_main","map.dialog.rename.description"), input, null, check);

		if (result === true) {
			var existingMapping = jQuery.grep(mappingData._mapping, function (element, index) {
				return element.name == input.value;
			});
			if (existingMapping.length < 1) {
				var mapping = jQuery.grep(mappingData._mapping, function (element, index) {
					return element.name == mappingData._loadedMapping;
				});
				mapping[0].name = input.value;
				browser.chrome.$("mappingMenuList").selectedItem.label = input.value;
				mappingData._loadedMapping = input.value;
				mappingView.redraw();
			} else {
				status.error(helpers.STR("strings_main","map.rename.error"));
				mappingActions.onRenameMapping();
			}
		}
	},

	/**
	 * Creates a new mapping
	 */
	onNewMapping : function () {
		
		var myPrompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var check = {value: false};
		var input = {value: "mapping"};
		var result = myPrompt.prompt(null, helpers.STR("strings_main","map.dialog.new.title"), helpers.STR("strings_main","map.dialog.new.description"), input, null, {});
		
		if (result === true) {

			var e = jQuery.grep(mappingData._mapping, function (element, index) {
				return input.value === element.name;
			});
			if (e.length < 1) {
				
				//Set new mapping
				browser.chrome.$("mappingMenuList").selectedItem = browser.chrome.$("mappingMenuList").appendItem(input.value);
				mappingData._loadedMapping = input.value;
				//Create new mapping object			
				var pageObject = {};
				pageObject.data = [];
				pageObject.selector = '';
				var mappingObject = {};
				mappingObject.id = new Date().getTime();
				mappingObject.name = input.value;
				mappingObject.page = [];
				mappingObject.page.push(pageObject);
				mappingData._mapping.push(mappingObject);
				mappingHelper.pushMappingsToGraphTab();
				mappingView.redraw();
			} else {
				//If mapping name is already available
				status.error(helpers.STR("strings_main","map.dialog.new.error"));
				mappingActions.onNewMapping();
			}
		}
	},

	/**
	 * Loads attributes when a key is selected
	 *
	 * @param element
	 *            The selected key element
	 */
	onSelectKey : function (element) {
		
		jQuery(".markedKey", fbDocument).css("backgroundColor", "#fafaff");
		jQuery(".markedKey", fbDocument).removeClass(".markedKey");
		jQuery(element).addClass("markedKey");
		jQuery(element).css("backgroundColor", "lightgrey");
		jQuery(".dynamicValue", fbDocument).remove();

		var selectedElement = jQuery.grep(mappingData.getCurrentPageObject().data, function (entry, index) { return element.innerHTML === entry.key; })[0];

		jQuery.each(selectedElement.values, function (index, entry) {
			//create table-entry
			var tr = fbDocument.createElement('tr');
			var newTd = fbDocument.createElement('td');
			jQuery(tr).addClass("dynamicValue");
			jQuery(newTd).html(entry);
			jQuery(tr).append(newTd);
			jQuery("#valueTable", fbDocument).append(tr);
		});
		jQuery("#valueTable", fbDocument).trigger("update");
	},

	/**
	 * Saves a DbKey when its inserted
	 * 
	 * @param key
	 *            	The key which corresponds to the given dbKey
	 * @param dbKey
	 *				The dbKey which should set for the key
	 */
	onSetDbKey : function (key, dbKey) {
		var entry = jQuery.grep(mappingData.getCurrentPageObject().data, function (element) {
			return element.key === key;
		});
		if (entry.length > 0)
			entry[0].dbKey = dbKey;
	}
};

/**
 *	Singleton which represents the view of the mapping tab. 
 */
var mappingView = {

	_wedexKeyTable : null,
	
	_wedexValueTable : null,

	/**
	 * Draws the Key Table initially
	 */
	drawKeyTable : function() {
		var wedexKeyTable = new WedexTable($('#mappingTableDiv', fbDocument), mappingData.getKeyTableModel());
		mappingView._wedexKeyTable = wedexKeyTable;
		var keyTableDiv = wedexKeyTable.getOuterDiv(); 
		keyTableDiv.css("float","left");
		keyTableDiv.css("margin","0px");
		keyTableDiv.css("margin-left","0px");
		keyTableDiv.css("margin-top","3px");
		keyTableDiv.css("width","590px"); 
		keyTableDiv.css("height","90%");
		//wedexKeyTable.initializeSorter();
	},
	
	/**
	 * Draws the Value Table initially
	 */
	drawValueTable : function() {
		var wedexValueTable = new WedexTable($('#mappingTableDiv', fbDocument), mappingData.getValueTableModel());
		
		mappingView._wedexValueTable = wedexValueTable;
		var keyTableDiv = wedexValueTable.getOuterDiv(); 
		keyTableDiv.css("margin-right","0px");
		keyTableDiv.addClass("valueTableOuterDiv");
		keyTableDiv.css("width","50px"); 
		keyTableDiv.css("height","90%");
		wedexValueTable.initializeSorter();
	},

	/**
	 * The minimum amount of values for a key to be drawn / Value Count
	 */
	_minValues : 1,

	/**
	 * Initializes the view
	 */
	initialize : function () {
		$('#mappingTableDiv', fbDocument).empty();
		mappingView.drawKeyTable();
		mappingView.drawValueTable();
		mappingView.setTableSizes();
	},

	/**
	 * Redraws/updates the mapping view
	 */
	redraw : function () {
		
		Selector.unmarkAll();
		
		mappingView._wedexKeyTable.update(mappingData.getKeyTableModel());
		mappingView._wedexValueTable.update(mappingData.getValueTableModel());

		//Update configuration list		
		var index = browser.chrome.$("configMenuList").selectedIndex;
		browser.chrome.$("configMenuList").removeAllItems();
		jQuery.each(configurationData.getConfigs(), function (index, element) {
			browser.chrome.$("configMenuList").appendItem(element.getName(), element.getID(), "Config");
		});
		jQuery.each(graphData.getMagicSelectors(), function (index, element) {		
						
			var pieces = element.split(" ");
			var label = "";
			var i = 1;
			while(label.length < 15 && (pieces.length - i) >= 0) {
				label = pieces[pieces.length - i] + " " + label;
				i++;
			}
			if((i-1) < pieces.length)
				label = "..." + label;				
			
			browser.chrome.$("configMenuList").appendItem(label
			, element, "Selector");
		});
		if (index < browser.chrome.$("configMenuList").itemCount && index >= 0) {
			browser.chrome.$("configMenuList").selectedIndex = index;
		} else {
			browser.chrome.$("configMenuList").selectedIndex = 0;
		}
		
		//Update marks		
		if (mappingData.getCurrentPageObject().selector.length > 0) {
			var selectorObject = new Selector();
			selectorObject.addDOMNode($(mappingData.getCurrentPageObject().selector, content.document));
			selectorObject.mark();
		}
		
		//Update mapping combo box
		browser.chrome.$("mappingMenuList").removeAllItems();
		$.each(mappingData._mapping, function (index, element) {			
			browser.chrome.$("mappingMenuList").appendItem(element.name);
			if (element.name == mappingData._loadedMapping)
				browser.chrome.$("mappingMenuList").selectedIndex = index;
		});
	},

	/**
	 * Sets the sizes of the mapping tables
	 */
	setTableSizes : function () {
		var height = (jQuery("#fbMainFrame", document).attr("height") - 90);
		if (height < 0) {
			height = 200;
		}
		$('#mappingTableDiv', fbDocument).css("height", height + "px");
		$('#mappingTableDiv', fbDocument).children().css("height", (height - 45) + "px");
		$('.valueTableOuterDiv', fbDocument).css("top", (0 - height + 13) + "px");
	},
	
	/**
	 * Sets the minValues variable when it was adjusted in UI
	 */
	setMinValues : function () {
		mappingView._minValues = jQuery('#minValues', document)[0].value;
		mappingView.redraw();
	}
};

/**
 *	Singleton which provides some helper-methods for the mapping tab.
 */
var mappingHelper = {

	/**
	 * Pushes all mappings to the graph tab
	 */
	pushMappingsToGraphTab : function () {
		//Update mappings in graph tab
		var graphMapping = [];
		jQuery.each(mappingData._mapping, function (i, element) {
			var mappingWithoutData = {};
			mappingWithoutData.name = element.name;
			mappingWithoutData.id = element.id;
			graphMapping.push(mappingWithoutData);
		});
		graphData.updateMappings(graphMapping);
	},

	/**
	 * Calls all initialization methods
	 */
	initialize : function () {		
		mappingView.initialize();
		mappingData.initialize();
	},

	/**
	 * Returns a union over the .key-attribute of the given array with elements found by magic
	 * @param keys
	 *				The array with magic elements which should be joined
	 */
	joinMagicKeys : function (keys) {
		var union = [];
		jQuery.each(keys, function (index, element) {
			
			//Filter some bad elements
			if (element.key === null)
				return true;
			else if (typeof element.key === 'undefined')
				return true;
			else if (element.key === '')
				return true;
			if (element.value === null)
				return true;
			else if (typeof element.value === 'undefined')
				return true;
			else if (element.value === '')
				return true;
			
			//Check if key is already known
			var keyInUnion = jQuery.grep(union,
				function (unionElement, unionIndex) {
					return element.key === unionElement.key;
				}
			);			
			if (keyInUnion.length < 1) {
				var newEntry = {};
				newEntry.key = element.key;
				newEntry.dbKey = null;
				newEntry.checked = false;
				newEntry.values = [];
				if (typeof(element.value) == 'object') {
					if (element.value.length) {
						$.each(element.value, function(index, element) {
							newEntry.values.push(element);
						});
					}
				}
				newEntry.values.push(element.value);
				union.push(newEntry);
			} else {
				//Check if value is already known
				var valueInUnion = jQuery.grep(keyInUnion[0].values,
					function (unionElement, unionIndex) {
						return element.value === unionElement;
					}
				);
				if(valueInUnion.length < 1) {
					keyInUnion[0].values.push(element.value);
				}
			}
		});
		return union;
	},
	
	/**
	 * Reset complete tab
	 */
	reset : function () {
		mappingData._mapping = [];
		mappingData._initialized = false;
		mappingData.initialize();
		mappingView.redraw();
		var itemCount = browser.chrome.$("mappingMenuList").itemCount - 1;
		for (itemCount; itemCount > 0; itemCount--)
			browser.chrome.$("mappingMenuList").removeItemAt(itemCount);
		browser.chrome.$("mappingMenuList").selectedIndex = 0;
	}
};