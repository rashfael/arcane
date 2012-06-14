/**
 * Some configuration stuff for the graph tab.
 */
var graphConfig = {
	/**
	 * Some constants.
	 */
	nodeIdPrefix : "nav",
	baseNodeIdPrefix : "base",
	propCssIdPrefix : "prop",
	noneMappingName : null,
	noneNodeConfigName : null,

	/**
	 * Init model and view.
	 */
	init : function() {
		graphConfig.noneMappingName=helpers.STR("strings_main","graph.select.none");
		graphConfig.noneNodeConfigName=helpers.STR("strings_main","graph.select.none");
		graphNodeModels.modelStart.name=helpers.STR("strings_main","graph.node.ep.label");
		graphNodeModels.modelWalkthroughLinks.name=helpers.STR("strings_main","graph.node.wtl.label");
		graphNodeModels.modelWalkthroughItems.name=helpers.STR("strings_main","graph.node.wti.label");
		graphNodeModels.modelPager.name=helpers.STR("strings_main","graph.node.wtp.label");
		graphNodeModels.modelFillForm.name=helpers.STR("strings_main","graph.node.ff.label");
		graphNodeModels.modelMagic.name=helpers.STR("strings_main","graph.node.mg.label");
		graphNodeModels.modelCollect.name=helpers.STR("strings_main","graph.node.cd.label");
		graphNodeModels.modelFollowLink.name=helpers.STR("strings_main","graph.node.fl.label");
		
		// Initialize data store
		graphData.init();

		// Initialize view
		graphView.init();
	},

	/**
	 * Reset model and view.
	 */
	reset : function() {
		// Force re-initialization of data store
		graphData.forceInit();

		// Render graph
		graphView.renderGraph();
	}
}

/**
 * The node models including the default properties.
 */
var graphNodeModels = {
	/**
	 * Private properties and functions.
	 */
	_modelMemberNamePrefix : "model",
	_renderDivStyle : "margin: auto; padding: 10px; width: auto; height: 100%;"
			+ "font-weight: bold; text-align: center; cursor: pointer;",
	_modelsList : null,
	_onNodeDeselect : function() {
		graphPropsPanel.showMessageNoNodeSelected();
		graphView.update();
	},
	_onNodeMultiSelect : function() {
		graphPropsPanel.showMessageMultiNodesSelected();
		graphView.update();
	},

	/**
	 * Returns the model of the given type.
	 * 
	 * @param {string} type The model's type.
	 * @return {Model} The model.
	 */
	getModel : function(type) {
		return graphNodeModels[this._modelMemberNamePrefix + type];
	},

	/**
	 * Returns all the models.
	 * 
	 * @return {array} The list of all models.
	 */
	getAllModels : function() {
		if (this._modelsList === null) {
			this._modelsList = [];

			jQuery.each(graphNodeModels, function(propName, object) {
				if (helpers.startsWith(propName,
						graphNodeModels._modelMemberNamePrefix)) {
					graphNodeModels._modelsList.push(object);
				}
			});
		}

		return this._modelsList;
	},

	/**
	 * Creates a new node and returns the node object.
	 * 
	 * @param {string} type The node's type.
	 * @return {Node} The node.
	 */
	newNode : function(type) {
		var node = helpers.cloneObject(this.getModel(type));

		return node;
	},

	/**
	 * Refreshes the given node by re-registering the event functions.
	 * This is necessary in case of loading a node from JSON.
	 * 
	 * @param {Node} node The node.
	 */
	refreshNode : function(node) {
		var nodeModel = this.getModel(node.type);

		// Register functions
		jQuery.each(nodeModel, function(objName, obj) {
			if (typeof obj === 'function') {
				node[objName] = obj;
			}
		});
	},

	/**
	 * The model for an Entry Point node.
	 */
	modelStart : {
		name : null,
		type : "Start",

		config : {
			request : {
				url : ""
			}
		},
		id : graphConfig.baseNodeIdPrefix,
		render : function() {
			var title = this.name;
			var icon = "chrome://scraperExtension/skin/images/node-insert_16.png";
			var style = graphNodeModels._renderDivStyle;
			var tooltip = helpers.STR("strings_main","graph.node.nodeid") + this.id + "\n\n"+helpers.STR("strings_main","graph.node.url") + this.config.request.url + "\n"+helpers.STR("strings_main","graph.node.mapping")
					+ graphData.getMappingName(this.id);

			return graphView.defaultRenderNode(title, icon, style, tooltip);
		},
		onSingleSelect : function() {
			graphPropsPanel.init(this.id);

			graphPropsPanel.addMappingSelect(graphData.getMappingId(this.id), "wand/gui#Entry-point");

			graphPropsPanel.addNodeConfigSelect(graphData.getNodeConfigId(this.id), null, "wand/gui#Entry-point");

			var updateAction = function() {
				var url = graphPropsPanel.getValue("requestUrl");

				if (url === null) {
					url = "";
				}

				graphData.getNode(graphPropsPanel.getNodeId()).config.request.url = url;
			};

			graphPropsPanel.addProperty("urlInput", "requestUrl",
					this.config.request.url, updateAction, {
						label : helpers.STR("strings_main","graph.node.prop.url.label"),
						tooltip : helpers.STR("strings_main","graph.node.prop.url.tooltip"),
						helpRef : "wand/gui#Entry-point"
					});

			graphPropsPanel.addEncodingInput(this.encoding, "wand/gui#Entry-point");

			graphPropsPanel.render();

			graphView.update();
			graphPropsPanel.markSelector();
		},
		onDeselect : function() {
			graphNodeModels._onNodeDeselect();
		},
		onMultiSelect : function() {
			graphNodeModels._onNodeMultiSelect();
		},

		next : []
	},

	/**
	 * The model for a Walk Through Links node.
	 */
	modelWalkthroughLinks : {
		name : null,
		type : "WalkthroughLinks",

		config : {
		// areaSelector : "..."
		// selector : "..."
		},
		_getSelector : function() {
			var sel = null;

			if (typeof this.config.areaSelector !== 'undefined') {
				sel = this.config.areaSelector;

				sel = Selector.arrToString(sel);

				return {
					id : "areaSelector",
					value : sel,
					label : helpers.STR("strings_main","graph.node.prop.as.label")
				};
			} else if (typeof this.config.selector !== 'undefined') {
				sel = this.config.selector;

				sel = Selector.arrToString(sel);

				return {
					id : "selector",
					value : sel,
					label : helpers.STR("strings_main","graph.node.wti.ds.label")
				};
			}

			return null;
		},
		render : function() {
			var title = this.name;
			var icon = "chrome://scraperExtension/skin/images/ui-label-links_16.png";
			var style = graphNodeModels._renderDivStyle;
			var tooltip = helpers.STR("strings_main","graph.node.nodeid") + this.id + "\n\n"+helpers.STR("strings_main","graph.node.mapping")+ graphData.getMappingName(this.id);

			var selector = this._getSelector();
			if (selector !== null) {
				tooltip = selector.label + ": " + this.config[selector.id]
						+ "\n" + tooltip
			}

			return graphView.defaultRenderNode(title, icon, style, tooltip);
		},
		onSingleSelect : function() {
			graphPropsPanel.init(this.id);

			graphPropsPanel.addMappingSelect(graphData.getMappingId(this.id), "wand/gui#Walk-through-links");

			graphPropsPanel.addNodeConfigSelect(graphData.getNodeConfigId(this.id), "selector", "wand/gui#Walk-through-links");

			var updateAction = function() {
				var nodeConfig = graphData.getNode(graphPropsPanel.getNodeId()).config;

				// Remove non-custom selectors
				delete nodeConfig.areaSelector;
				delete nodeConfig.selector;

				var propValue = graphPropsPanel.getValue("selector");

				if (propValue !== null) {
					propValue.selectorValue = Selector.stringToArr(propValue.selectorValue);

					// Remove custom selector
					delete nodeConfig.customSelector;

					nodeConfig[propValue.selectorKey] = propValue.selectorValue;
				}
			};

			graphPropsPanel.addProperty("jqSelectorInput", "selector", this
					._getSelector(), updateAction, {
				label : helpers.STR("strings_main","graph.node.prop.sel.label"),
				selectorTypes : [
						{
							id : "selector",
							label : helpers.STR("strings_main","graph.node.prop.direct.label"),
							tooltip : helpers.STR("strings_main","graph.node.prop.direct.tooltip"),
							disabled : true
						},
						{
							id : "areaSelector",
							label : helpers.STR("strings_main","graph.node.prop.area.label"),
							tooltip : helpers.STR("strings_main","graph.node.prop.area.tooltip")
						} ],
				helpRef : "wand/gui#Walk-through-links"
			});

			graphPropsPanel.addEncodingInput(this.encoding, "wand/gui#Walk-through-links");

			graphPropsPanel.render();

			graphView.update();
			graphPropsPanel.markSelector("nodeConfig", "selector");
		},
		onDeselect : function() {
			graphNodeModels._onNodeDeselect();
		},
		onMultiSelect : function() {
			graphNodeModels._onNodeMultiSelect();
		},

		next : []
	},

	/**
	 * The model for a Walk Through Items node.
	 */
	modelWalkthroughItems : {
		name : null,
		type : "WalkthroughItems",

		config : {
		// itemSelector : "..."
		// selector : "..."
		},
		_getSelector : function() {
			var sel = null;

			if (typeof this.config.itemSelector !== 'undefined') {
				sel = this.config.itemSelector;

				sel = Selector.arrToString(sel);

				return {
					id : "itemSelector",
					value : sel,
					label : helpers.STR("strings_main","graph.node.prop.is.label")
				};
			} else if (typeof this.config.customSelector !== 'undefined') {
				sel = this.config.customSelector;

				sel = Selector.arrToString(sel);

				return {
					id : "customSelector",
					value : sel,
					label : helpers.STR("strings_main","graph.node.prop.cs.label")
				};
			}

			return null;
		},
		render : function() {
			var title = this.name;
			var icon = "chrome://scraperExtension/skin/images/ui-menu-blue_16.png";
			var style = graphNodeModels._renderDivStyle;
			var tooltip = helpers.STR("strings_main","graph.node.nodeid") + this.id + "\n\n"+helpers.STR("strings_main","graph.node.mapping") + graphData.getMappingName(this.id);

			var selector = this._getSelector();
			if (selector !== null) {
				tooltip = selector.label + ": " + this.config[selector.id]
						+ "\n" + tooltip
			}

			return graphView.defaultRenderNode(title, icon, style, tooltip);
		},
		onSingleSelect : function() {
			graphPropsPanel.init(this.id);

			graphPropsPanel.addMappingSelect(graphData.getMappingId(this.id), "wand/gui#Walk-through-items");

			graphPropsPanel.addNodeConfigSelect(graphData.getNodeConfigId(this.id), "selector", "wand/gui#Walk-through-items");

			var updateAction = function() {
				var nodeConfig = graphData.getNode(graphPropsPanel.getNodeId()).config;

				// Remove non-custom selectors
				delete nodeConfig.itemSelector;
				delete nodeConfig.selector;

				var propValue = graphPropsPanel.getValue("selector");

				if (propValue !== null) {
					propValue.selectorValue = Selector.stringToArr(propValue.selectorValue);

					// Remove custom selector
					delete nodeConfig.customSelector;

					nodeConfig[propValue.selectorKey] = propValue.selectorValue;
				}
			};

			graphPropsPanel.addProperty("jqSelectorInput", "selector", this
					._getSelector(), updateAction, {
				label : helpers.STR("strings_main","graph.node.prop.sel.label"),
				selectorTypes : [ {
					id : "itemSelector",
					label : helpers.STR("strings_main","graph.node.prop.item.label"),
					tooltip : helpers.STR("strings_main","graph.node.prop.item.tooltip")
				}, {
					id : "customSelector",
					label : helpers.STR("strings_main","graph.node.prop.custom.label"),
					tooltip : helpers.STR("strings_main","graph.node.prop.cs.tooltip")
				} ],
				helpRef : "wand/gui#Walk-through-items"
			});

			graphPropsPanel.addEncodingInput(this.encoding, "wand/gui#Walk-through-items");

			graphPropsPanel.render();

			graphView.update();
			graphPropsPanel.markSelector("nodeConfig", "selector");
		},
		onDeselect : function() {
			graphNodeModels._onNodeDeselect();
		},
		onMultiSelect : function() {
			graphNodeModels._onNodeMultiSelect();
		},

		next : []
	},

	/**
	 * The model for a Pager node.
	 */
	modelPager : {
		name : null,
		type : "Pager",

		config : {
			pagerSelector : ""
		},
		render : function() {
			var title = this.name;
			var icon = "chrome://scraperExtension/skin/images/ui-paginator_16.png";
			var style = graphNodeModels._renderDivStyle;
			var tooltip = helpers.STR("strings_main","graph.node.nodeid") + this.id + "\n\n"+helpers.STR("strings_main","graph.node.pagersel") + this.config.pagerSelector + "\n" +
					helpers.STR("strings_main","graph.node.mapping") + graphData.getMappingName(this.id);

			return graphView.defaultRenderNode(title, icon, style, tooltip);
		},
		onSingleSelect : function() {
			graphPropsPanel.init(this.id);

			graphPropsPanel.addMappingSelect(graphData.getMappingId(this.id), "wand/gui#Walk-through-pager");

			graphPropsPanel.addNodeConfigSelect(graphData.getNodeConfigId(this.id), "selector", "wand/gui#Walk-through-pager");

			// Build attributes
			var attrs = {
				label : helpers.STR("strings_main","graph.node.prop.ps.label"),
				helpRef : "wand/gui#Walk-through-pager"
			};

			var updateAction = function() {
				var sel = graphPropsPanel.getValue("pagerSelector").selectorValue;

				sel = Selector.stringToArr(sel);

				graphData.getNode(graphPropsPanel.getNodeId()).config.pagerSelector = sel;
			};

			var sel = this.config.pagerSelector;

			sel = Selector.arrToString(sel);

			graphPropsPanel.addProperty("jqSelectorInput", "pagerSelector", {
				id : "pagerSelector",
				value : sel,
			}, updateAction, attrs);

			graphPropsPanel.addEncodingInput(this.encoding, "wand/gui#Walk-through-pager");

			graphPropsPanel.render();

			graphView.update();
			graphPropsPanel.markSelector("nodeConfig", "pagerSelector");
		},
		onDeselect : function() {
			graphNodeModels._onNodeDeselect();
		},
		onMultiSelect : function() {
			graphNodeModels._onNodeMultiSelect();
		},

		next : []
	},

	/**
	 * The model for a Follow Link node.
	 */
	modelFollowLink : {
		name : null,
		type : "FollowLink",

		config : {
			linkSelector : ""
		},
		render : function() {
			var title = this.name;
			var icon = "chrome://scraperExtension/skin/images/ui-label-link_16.png";
			var style = graphNodeModels._renderDivStyle;
			var tooltip = helpers.STR("strings_main","graph.node.nodeid") + this.id + "\n\n"+helpers.STR("strings_main","graph.node.linksel") + this.config.linkSelector
					+ "\n"+helpers.STR("strings_main","graph.node.mapping") + graphData.getMappingName(this.id);

			return graphView.defaultRenderNode(title, icon, style, tooltip);
		},
		onSingleSelect : function() {
			graphPropsPanel.init(this.id);

			graphPropsPanel.addMappingSelect(graphData.getMappingId(this.id), "wand/gui#Follow-link");

			graphPropsPanel.addNodeConfigSelect(graphData.getNodeConfigId(this.id), null, "wand/gui#Follow-link");

			// Build attributes
			var attrs = {
				label : helpers.STR("strings_main","graph.node.prop.ls.label"),
				helpRef : "wand/gui#Follow-link"
			};

			// Determine parent node
			var predecNodes = graphData.getPredecessorNodes(this.id);

			if (predecNodes.length > 0) {
				var parentNode = predecNodes[0];

				if (typeof parentNode.config.selector !== 'undefined'
						&& parentNode.config.selector !== null) {
					attrs.parentSelector = parentNode.config.selector;
				} else if (typeof parentNode.config.itemSelector !== 'undefined'
						&& parentNode.config.itemSelector !== null) {
					attrs.parentItemSelector = parentNode.config.itemSelector;
				} else if (typeof parentNode.config.customSelector !== 'undefined'
						&& parentNode.config.customSelector !== null) {
					attrs.parentCustomSelector = parentNode.config.customSelector;
				}
			}

			var updateAction = function() {
				var sel = graphPropsPanel.getValue("selector");

				if (sel !== null) {
					sel = Selector.stringToArr(sel.selectorValue);

					var nodeConfig = graphData.getNode(graphPropsPanel.getNodeId()).config;

					// Remove custom selector
					delete nodeConfig.customSelector;

					nodeConfig.linkSelector = sel;
				}
			};

			var linkSel = this.config.linkSelector;

			linkSel = Selector.arrToString(linkSel);

			graphPropsPanel.addProperty("jqSelectorInput", "selector", {
				id : "linkSelector",
				value : linkSel
			}, updateAction, attrs);

			graphPropsPanel.addEncodingInput(this.encoding, "wand/gui#Follow-link");

			graphPropsPanel.render();

			graphView.update();
			graphPropsPanel.markSelector("nodeConfig","selector");
		},
		onDeselect : function() {
			graphNodeModels._onNodeDeselect();
		},
		onMultiSelect : function() {
			graphNodeModels._onNodeMultiSelect();
		},

		next : []
	},

	/**
	 * The model for a Fill Form node.
	 */
	modelFillForm : {
		name : null,
		type : "FillForm",

		config : {
			formSelector : "", // absolute jQuery selector pointing to the form
			// element
			url : "", // specify an URL (has to fit to the form submit url)
			method : "", // 'post', 'get' or 'put'
			parameters : []
		},
		render : function() {
			var title = this.name;
			var icon = "chrome://scraperExtension/skin/images/application-form_16.png";
			var style = graphNodeModels._renderDivStyle;
			var tooltip = helpers.STR("strings_main","graph.node.nodeid") + this.id + "\n\n"+helpers.STR("strings_main","graph.node.formsel") + this.config.formSelector
					+ "\n"+helpers.STR("strings_main","graph.node.url") + this.config.url + "\n"+helpers.STR("strings_main","graph.node.submeth")
					+ this.config.method;

			return graphView.defaultRenderNode(title, icon, style, tooltip);
		},
		onSingleSelect : function() {
			graphPropsPanel.init(this.id);

			graphPropsPanel.addMappingSelect(graphData.getMappingId(this.id), "wand/gui#Fill-form");

			graphPropsPanel.addNodeConfigSelect(graphData.getNodeConfigId(this.id), null, "wand/gui#Fill-form");

			var updateActionSelector = function() {
				var navNode = graphData.getNode(graphPropsPanel.getNodeId());

				var selectorVal = graphPropsPanel.getValue("formSelector").selectorValue;

				var domNode = jQuery(selectorVal, content.document);

				if (domNode.length === 0) {
					status.error(helpers.STR("strings_main","graph.node.ff.sel.error"));

					return;
				} else if (!domNode.is("form")) {
					var autoCorrect = confirm(helpers.STR("strings_main","graph.node.ff.dialog.noForm.description"));

					if (autoCorrect) {
						domNode = domNode.closest("form");

						if (typeof domNode !== 'undefined') {
							var selObj = new Selector();
							selObj.addDOMNode(domNode.get(0));

							selectorVal = selObj.getSelector();

							if (typeof selectorVal !== 'undefined') {
								selectorVal = selectorVal.selectorArr;

								status.info(helpers.STR("strings_main","graph.node.ff.autocorrect.status"));
							} else {
								selectorVal = "";

								status.error(helpers.STR("strings_main","graph.node.ff.selinv.error"));
							}
						}
					}
				}

				if (navNode.config.url === "" && selectorVal !== "") {
					graphPropsPanel.overrideValueFunction("url", function() {
						var actionURL = domNode.prop("action");

						if (typeof actionURL === 'undefined' || actionURL === null) {
							actionURL = window.content.location.protocol + "//"
									+ window.content.location.host;
						} else if (!helpers.startsWith(actionURL, "http")) {
							actionURL = window.content.location.protocol + "//"
									+ window.content.location.host + "/"
									+ actionURL;
						}

						return actionURL;
					});
				}

				if (navNode.config.method === "" && selectorVal !== "") {
					var formMethod = domNode.prop("method");

					if (typeof formMethod !== 'undefined' && formMethod !== null) {
						graphPropsPanel.overrideValueFunction("method", function() {
							return formMethod;
						});
					}
				}

				selectorVal = Selector.stringToArr(selectorVal);

				graphData.getNode(graphPropsPanel.getNodeId()).config.formSelector = selectorVal;
			};

			var formSel = this.config.formSelector;

			formSel = Selector.arrToString(formSel);

			graphPropsPanel.addProperty("jqSelectorInput", "formSelector", {
				id : "formSelector",
				value : formSel
			}, updateActionSelector, {
				label : helpers.STR("strings_main","graph.node.prop.fs.label"),
				helpRef : "wand/gui#Fill-form"
			});

			var updateActionUrl = function() {
				var actionUrl = graphPropsPanel.getValue("url");

				if (actionUrl === null) {
					actionUrl = "";
				}

				graphData.getNode(graphPropsPanel.getNodeId()).config.url = actionUrl;
			};

			graphPropsPanel.addProperty("textBox", "url", graphData
					.getNode(graphPropsPanel.getNodeId()).config.url,
					updateActionUrl, {
						label : helpers.STR("strings_main","graph.node.prop.su.label"),
						tooltip : helpers.STR("strings_main","graph.node.prop.su.tooltip"),
						helpRef : "wand/gui#Fill-form"
					});

			var updateActionMethod = function() {
				var actionMethod = graphPropsPanel.getValue("method");

				if (actionMethod === null) {
					actionMethod = "";
				}

				graphData.getNode(graphPropsPanel.getNodeId()).config.method = actionMethod;
			};

			graphPropsPanel.addProperty("textBox", "method", graphData
					.getNode(graphPropsPanel.getNodeId()).config.method,
					updateActionMethod, {
						label : helpers.STR("strings_main","graph.node.prop.sm.label"),
						tooltip : helpers.STR("strings_main","graph.node.prop.sm.tooltip"),
						helpRef : "wand/gui#Fill-form"
					});

			graphPropsPanel.addEncodingInput(this.encoding, "wand/gui#Fill-form");

			graphPropsPanel.render();

			graphView.update();
			graphPropsPanel.markSelector("nodeConfig", "formSelector");
		},
		onDeselect : function() {
			graphNodeModels._onNodeDeselect();
		},
		onMultiSelect : function() {
			graphNodeModels._onNodeMultiSelect();
		},

		next : []
	},

	/**
	 * The model for a Magic node.
	 */
	modelMagic : {
		name : null,
		type : "Magic",

		config : {
			itemSelector : ""
		},
		render : function() {
			var title = this.name;
			var icon = "chrome://scraperExtension/skin/images/wand_16.png";
			var style = graphNodeModels._renderDivStyle;
			var tooltip = helpers.STR("strings_main","graph.node.nodeid") + this.id + "\n\n"+helpers.STR("strings_main","graph.node.itemsel") + this.config.itemSelector;

			return graphView.defaultRenderNode(title, icon, style, tooltip);
		},
		onSingleSelect : function() {
			graphPropsPanel.init(this.id);

			graphPropsPanel.addNodeConfigSelect(graphData.getNodeConfigId(this.id), null, "wand/gui#Magic");

			var updateAction = function() {
				var sel = graphPropsPanel.getValue("selector");

				if (sel !== null) {
					sel = Selector.stringToArr(sel.selectorValue);

					var nodeConfig = graphData.getNode(graphPropsPanel.getNodeId()).config;

					// Remove custom selector
					delete nodeConfig.customSelector;

					nodeConfig.itemSelector = sel;
				}
			};

			var sel = this.config.itemSelector;

			sel = Selector.arrToString(sel);

			graphPropsPanel.addProperty("jqSelectorInput", "selector", {
				id : "itemSelector",
				value : sel
			}, updateAction, {
				label : helpers.STR("strings_main","graph.node.prop.is.label"),
				helpRef : "wand/gui#Magic"
			});

			graphPropsPanel.addEncodingInput(this.encoding, "wand/gui#Magic");

			graphPropsPanel.render();

			graphView.update();
			graphPropsPanel.markSelector("nodeConfig", "selector");
		},
		onDeselect : function() {
			graphNodeModels._onNodeDeselect();
		},
		onMultiSelect : function() {
			graphNodeModels._onNodeMultiSelect();
		},

		next : []
	},

	/**
	 * The model for a Collect node.
	 */
	modelCollect : {
		name : null,
		type : "Collect",

		config : {
		// collection : ""
		},
		render : function() {
			var title = this.name;
			var icon = "chrome://scraperExtension/skin/images/property-import_16.png";
			var style = graphNodeModels._renderDivStyle;
			var tooltip = helpers.STR("strings_main","graph.node.nodeid") + this.id + "\n\n"+helpers.STR("strings_main","graph.node.coll") + this.config.collection
					+ "\n"+helpers.STR("strings_main","graph.node.mapping") + graphData.getMappingName(this.id);

			return graphView.defaultRenderNode(title, icon, style, tooltip);
		},
		onSingleSelect : function() {
			graphPropsPanel.init(this.id);

			graphPropsPanel.addMappingSelect(graphData.getMappingId(this.id), "wand/gui#Collect");

			// graphPropsPanel.addNodeConfigSelect(graphData
			// .getNodeConfigId(this.id));
			// TODO Workaround
			graphPropsPanel.overrideValueFunction("nodeConfig", function() {
			});

			var collection = graphData.getNode(graphPropsPanel.getNodeId()).config.collection;

			if (typeof collection === 'undefined') {
				collection = "";
			}

			var updateAction = function() {
				var collName = graphPropsPanel.getValue("collection");

				if (collName === null || jQuery.trim(collName) === "") {
					delete graphData.getNode(graphPropsPanel.getNodeId()).config.collection;
				} else {
					graphData.getNode(graphPropsPanel.getNodeId()).config.collection = collName;
				}
			};

			graphPropsPanel.addProperty("textBox", "collection", collection,
					updateAction, {
						label : helpers.STR("strings_main","graph.node.cd.collname.label"),
						tooltip : helpers.STR("strings_main","graph.node.cd.collname.tooltip"),
						helpRef : "wand/gui#Collect"
					});

			graphPropsPanel.addEncodingInput(this.encoding, "wand/gui#Collect");

			graphPropsPanel.render();

			graphView.update();

			graphPropsPanel.markSelector();
		},
		onDeselect : function() {
			graphNodeModels._onNodeDeselect();
		},
		onMultiSelect : function() {
			graphNodeModels._onNodeMultiSelect();
		},

		next : []
	}
}

/**
 * Data model for the nodes of the graph.
 */
var graphData = {

	/**
	 * The scraper config.
	 */
	_scraperConfig : null,

	/**
	 * The ID counter.
	 */
	_idCounter : 0,

	/**
	 * Indicates whether the data store has been initialized or not.
	 */
	_initialized : false,

	/**
	 * Sets the scraper config.
	 *
	 * @param {ScraperConfig} scraperConfig The scraper config.
	 */
	setScraperConfig : function(scraperConfig) {
		var newScraperConfig = {};

		newScraperConfig.mappings = helpers.cloneObject(scraperConfig.mappings);
		newScraperConfig.navigation = helpers
				.cloneObject(scraperConfig.navigation);

		// For backward compatibility: convert base node object to array
		var baseNodeArray = newScraperConfig.navigation[graphConfig.baseNodeIdPrefix];

		if (Object.prototype.toString.apply(baseNodeArray) !== '[object Array]') {
			newScraperConfig.navigation[graphConfig.baseNodeIdPrefix] = [ baseNodeArray ];
		}

		// TODO ??? implement! call updateMappings()!

		this._scraperConfig = newScraperConfig;

		this.update();
	},

	/**
	 * Sets the scraper config from JSON.
	 *
	 * @param {ScraperConfig} scraperConfig The scraper config.
	 */
	setScraperConfigFromJSON : function(scraperConfig) {
		this.setScraperConfig(scraperConfig);

		// Register methods for all node objects
		jQuery.each(this.getAllNodes(), function(nodeId, node) {
			graphNodeModels.refreshNode(node);
		});
	},

	/**
	 * Returns the graph-specific part of the scraper config (cloned).
	 *
	 * @return {ScraperConfig} The graph-specific part of the scraper config.
	 */
	getScraperConfigPart : function() {
		graphData.update();

		return helpers.cloneObject(this._scraperConfig);
	},

	/**
	 * Method to update the mappings in the graph tab.
	 * 
	 * @param {array}
	 *            mappings The array of mappings. A mapping is a JS object
	 *            with an name and an id attribute. Expected format: [ {
	 *            name: "Mapping name", id: "mapping-id" }, ...]
	 */
	updateMappings : function(mappings) {
		// remove unused mappings
		var newMappings = {};
		jQuery
				.each(
						mappings,
						function() {
							if (graphData._scraperConfig.mappings
									.hasOwnProperty(this.id) == true) {
								newMappings[this.id] = graphData._scraperConfig.mappings[this.id];
							}
						});
		graphData._scraperConfig.mappings = newMappings;

		// add new mappings or modify existing ones
		jQuery
				.each(
						mappings,
						function() {

							// insert mapping if it's new
							if (graphData._scraperConfig.mappings
									.hasOwnProperty(this.id) == false) {
								graphData._scraperConfig.mappings[this.id] = {
									name : this.name,
									validFor : [],
									map : {}
								}
							}
							// modify mapping
							else {
								graphData._scraperConfig.mappings[this.id].name = this.name;
							}

						});
	},

	/**
	 * Updates the data model of the navigation tab.
	 */
	update : function() {
		// Update node configurations (list & magic)
		var configs = configurationData.getConfigs();

		var updateNode = function(node) {
			if (typeof node.nodeConfigId !== 'undefined') {
				if (typeof configs[node.nodeConfigId] !== 'undefined') {
					var predecNodes = graphData.getPredecessorNodes(node.id);

					var predecWalkthroughItemsExists = false;

					jQuery.each(predecNodes, function(index, node) {
						if (node.type === "WalkthroughItems") {
							predecWalkthroughItemsExists = true;
						}
					});

					if (!predecWalkthroughItemsExists) {
						var customSelector = configs[node.nodeConfigId].getListConfig().getSelector().toString();

						customSelector = Selector.stringToArr(customSelector);

						node.config.customSelector = customSelector;
					}

					node.config.magic = configs[node.nodeConfigId].getMagicConfig();

					if (node.type === "FillForm") {
						delete node.config.customSelector;

						var formFillConfig = configs[node.nodeConfigId].getFormFillConfig();

						if (typeof formFillConfig !== 'undefined' && formFillConfig !== null) {
							var datasets = formFillConfig.getDatasets();

							node.config.parameters = datasets;
						}
					}
				} else {
					delete node.nodeConfigId;
					delete node.config.magic;

					if (node.type === "FillForm") {
						node.config.parameters = [];
					}
				}
			} else {
				delete node.config.magic;

				if (node.type === "FillForm") {
					node.config.parameters = [];
				}
			}
		};

		jQuery.each(this.getAllNodes(), function(nodeId, node) {
			updateNode(node);
		});
	},

	/**
	 * Initializes the data store.
	 */
	init : function() {
		if (!this._initialized) {
			this._idCounter = new Date().getTime();

			var baseNode = graphNodeModels.newNode("Start");
			baseNode.id = graphConfig.nodeIdPrefix + this._idCounter;

			this._idCounter++;

			this._scraperConfig = {
				mappings : {},
				navigation : {}
			};

			this._scraperConfig.navigation[graphConfig.baseNodeIdPrefix] = [ baseNode ];

			this._initialized = true;
		}
	},

	/**
	 * Force initialization of data store.
	 */
	forceInit : function() {
		this._initialized = false;

		this.init();
	},

	/**
	 * Creates a new node.
	 * 
	 * @param {string} type
	 *            The node type.
	 * @param {array} selectedNodes
	 *            An array which contains the currently selected nodes.
	 * @return {Node} The newly created node with its ID.
	 */
	newNode : function(type, selectedNodes) {
		var node = graphNodeModels.newNode(type);
		node.id = graphConfig.nodeIdPrefix + this._idCounter;

		this._idCounter++;

		if (type === "Start") {
			this._scraperConfig.navigation[graphConfig.baseNodeIdPrefix]
					.push(node);
		} else {
			if (typeof selectedNodes !== 'undefined' && selectedNodes !== null) {
				jQuery.each(selectedNodes, function(index, id) {
					var nodeNext = graphData.getNode(id).next;

					if (jQuery.inArray(node.id, nodeNext) === -1) {
						nodeNext.push(node.id);
					}
				});
			}

			this._scraperConfig.navigation[node.id] = node;
		}

		return node;
	},

	/**
	 * Sets the mapping for the given node.
	 * 
	 * @param {string} nodeId
	 *            The node's ID.
	 * @param {string} mappingId
	 *            The mapping's ID.
	 */
	setMapping : function(nodeId, mappingId) {
		// Remove mapping if there is one existing.
		jQuery.each(this._scraperConfig.mappings, function(key, mapping) {
			var nodeIds = jQuery.map(mapping.validFor, function(entry) {
				return entry !== nodeId ? entry : null;
			});

			if (nodeIds === null) {
				nodeIds = [];
			}

			mapping.validFor = nodeIds;
		});

		// Add mapping.
		if (mappingId !== null && jQuery.trim(mappingId) !== "") {
			this._scraperConfig.mappings[mappingId].validFor.push(nodeId);
		}
	},

	/**
	 * Returns the mapping ID for the given node.
	 * 
	 * @param {string} nodeId
	 *            The node's ID.
	 * @return {string} The mapping's ID.
	 */
	getMappingId : function(nodeId) {
		var mapping = null;

		jQuery.each(this._scraperConfig.mappings, function(key, confMapping) {
			jQuery.each(confMapping.validFor, function(index, id) {
				if (nodeId === id) {
					mapping = key;
				}
			});
		});

		return mapping;
	},

	/**
	 * Returns the mapping name for the given node.
	 * 
	 * @param {string} nodeId
	 *            The node's ID.
	 * @return {string} The mapping's name.
	 */
	getMappingName : function(nodeId) {
		var mappingId = this.getMappingId(nodeId);

		if (mappingId === null) {
			return graphConfig.noneMappingName;
		} else {
			return this._scraperConfig.mappings[mappingId].name;
		}
	},

	/**
	 * Returns all mappings which are currently available.
	 * 
	 * @return {array} The list of mappings: [{id: "mappingId", name: "Mapping Name"}, ...]
	 */
	getAllMappings : function() {
		var mappings = [];

		jQuery.each(this._scraperConfig.mappings, function(key, mapping) {
			mappings.push({
				id : key,
				name : mapping.name
			});
		});

		return mappings;
	},

	/**
	 * Sets the config for the given node.
	 * 
	 * @param {string} nodeId
	 *            The node's ID.
	 * @param {string} nodeConfigId
	 *            The node config's ID.
	 */
	setNodeConfig : function(nodeId, nodeConfigId) {
		var node = this.getNode(nodeId);

		if (nodeConfigId === null) {
			delete node.nodeConfigId;
		} else {
			node.nodeConfigId = nodeConfigId;
		}
	},

	/**
	 * Returns the node config for the given node.
	 * 
	 * @param {string} nodeId
	 *            The node's ID.
	 * @return {NodeConfig} The node config.
	 */
	getNodeConfig : function(nodeId) {
		var node = this.getNode(nodeId);

		if (typeof node === 'undefined'
				|| typeof node.nodeConfigId === 'undefined') {
			return null;
		}

		return configurationData.getConfig(node.nodeConfigId);
	},

	/**
	 * Returns the node config's ID for the given node.
	 * 
	 * @param {string} nodeId
	 *            The node's ID.
	 * @return {string} The node config's ID.
	 */
	getNodeConfigId : function(nodeId) {
		var nodeConfig = this.getNodeConfig(nodeId);

		var nodeConfigId = null;

		if (nodeConfig !== null) {
			nodeConfigId = nodeConfig.getID();
		}

		return nodeConfigId;
	},

	/**
	 * Returns the predecessors of the given node.
	 * 
	 * @param {string} currNodeId
	 *            The current node's ID.
	 * @return {array} The predecessor nodes.
	 */
	getPredecessorNodes : function(currNodeId) {
		var predecNodes = [];

		jQuery.each(this.getAllNodes(), function(nodeId, node) {
			if (jQuery.inArray(currNodeId, node.next) !== -1) {
				predecNodes.push(node);
			}
		});

		return predecNodes;
	},

	/**
	 * Returns the requested node using its ID.
	 * 
	 * @param {string} nodeId
	 *            The node's ID.
	 */
	getNode : function(nodeId) {
		var node = this._scraperConfig.navigation[nodeId];

		if (typeof node === 'undefined') {
			node = null;

			jQuery
					.each(
							this._scraperConfig.navigation[graphConfig.baseNodeIdPrefix],
							function(index, baseNode) {
								if (baseNode.id === nodeId) {
									node = baseNode;
								}
							});
		}

		return node;
	},

	/**
	 * Returns all nodes.
	 * 
	 * @return {array} List of all nodes.
	 */
	getAllNodes : function() {
		var nodes = {};

		jQuery.each(this._scraperConfig.navigation, function(nodeId, node) {
			nodes[nodeId] = node;
		});

		jQuery.each(nodes[graphConfig.baseNodeIdPrefix], function(index,
				baseNode) {
			nodes[baseNode.id] = baseNode;
		});

		delete nodes[graphConfig.baseNodeIdPrefix];

		return nodes;
	},

	/**
	 * Removes the given node.
	 * 
	 * @param {string} nodeId
	 *            The node's ID.
	 */
	removeNode : function(nodeId) {
		var isBaseNode = false;

		// Check if node is existing
		if (typeof this._scraperConfig.navigation[nodeId] === 'undefined') {
			jQuery
					.each(
							this._scraperConfig.navigation[graphConfig.baseNodeIdPrefix],
							function(index, baseNode) {
								if (baseNode.id === nodeId) {
									isBaseNode = true;
								}
							});

			// Cannot delete last base node
			if (isBaseNode
					&& this._scraperConfig.navigation[graphConfig.baseNodeIdPrefix].length === 1) {
				return;
			}

			// If the node cannot be found it can obviously not be removed :)
			if (!isBaseNode) {
				return;
			}
		}

		// Clear mapping of node
		this.setMapping(nodeId, null);

		// Remove all pointers to the given node
		jQuery.each(this.getAllNodes(), function(navNodeId, navNode) {
			navNode.next = jQuery.grep(navNode.next, function(value) {
				return value != nodeId;
			});
		});

		// Remove all successor nodes
		jQuery.each(this.getNode(nodeId).next, function(index, navNodeId) {
			graphData.removeNode(navNodeId);
		});

		// Finally delete the node
		if (isBaseNode) {
			var baseNodeArray = [];

			jQuery
					.each(
							this._scraperConfig.navigation[graphConfig.baseNodeIdPrefix],
							function(index, baseNode) {
								if (baseNode.id !== nodeId) {
									baseNodeArray.push(baseNode);
								}
							});

			this._scraperConfig.navigation[graphConfig.baseNodeIdPrefix] = baseNodeArray;
		} else {
			delete this._scraperConfig.navigation[nodeId];
		}
	},

	/**
	 * Returns all directly inserted selectors in Magic nodes.
	 * 
	 * @return {array} List of all selectors.
	 */
	getMagicSelectors : function() {
		var selectors = [];
		jQuery.each(this.getAllNodes(), function(index, element) {
			if (element.type === 'Magic' || element.type === 'WalkthroughItems') {
				if (element.config.itemSelector != null) {
					if (element.config.itemSelector != "") {
						selectors.push(element.config.itemSelector);
					}
				} else if (element.config.customSelector != null) {
					if (element.config.customSelector != "") {
						selectors.push(element.config.customSelector);
					}
				}
			}
		});
		return selectors;
	}
}

/**
 * Actions of the graph tab.
 */
var graphActions = {

	/**
	 * Remove node.
	 */
	removeNode : function() {
		var oldConf = graphData.getScraperConfigPart();

		var selectedNodes = pergament.getSelectedDivIds();

		if (selectedNodes !== null) {
			jQuery.each(selectedNodes, function(index, nodeId) {
				graphData.removeNode(nodeId);
			});
		}
		var newConf = graphData.getScraperConfigPart();

		graphView.createAndPushCmd(oldConf, newConf);

		graphView.renderGraph();

		graphView.update();
	},

	/**
	 * Add node.
	 */
	addNode : function(type) {
		var prevConf = graphData.getScraperConfigPart();

		// Get selected nodes
		var selNodes = pergament.getSelectedDivIds();
		var selNodesWithoutDups = [];

		if (selNodes !== null) {
			jQuery.each(selNodes, function(index, id) {
				if (jQuery.inArray(id, selNodesWithoutDups) === -1) {
					selNodesWithoutDups.push(id);
				}
			});
		}

		var node = graphData.newNode(type, selNodesWithoutDups);

		var currConf = graphData.getScraperConfigPart();

		graphView.createAndPushCmd(prevConf, currConf);

		graphView.renderGraph();

		graphView.update();
	},

	/**
	 * Remove edge.
	 */
	removeEdge : function() {
		var prevConf = graphData.getScraperConfigPart();

		var selectedNodeIds = pergament.getSelectedDivIds();

		var firstNodeId = selectedNodeIds["0"];
		var secondNodeId = selectedNodeIds["1"];

		var firstNode = graphData.getNode(firstNodeId);
		var secondNode = graphData.getNode(secondNodeId);

		var firstNodeNext = [];
		var secondNodeNext = [];

		jQuery.each(firstNode.next, function(index, nodeId) {
			if (firstNodeId !== nodeId && secondNodeId !== nodeId) {
				firstNodeNext.push(nodeId);
			}
		});

		jQuery.each(secondNode.next, function(index, nodeId) {
			if (firstNodeId !== nodeId && secondNodeId !== nodeId) {
				secondNodeNext.push(nodeId);
			}
		});

		firstNode.next = firstNodeNext;
		secondNode.next = secondNodeNext;

		var currConf = graphData.getScraperConfigPart();

		graphView.createAndPushCmd(prevConf, currConf);

		graphView.renderGraph();

		graphView.update();
	},

	/**
	 * Add edge.
	 */
	addEdge : function() {
		var prevConf = graphData.getScraperConfigPart();

		var selectedNodeIds = pergament.getSelectedDivIds();

		graphData.getNode(selectedNodeIds["0"]).next.push(selectedNodeIds["1"]);

		var currConf = graphData.getScraperConfigPart();

		graphView.createAndPushCmd(prevConf, currConf);

		graphView.renderGraph();

		graphView.update();
	},

	/**
	 * Undo action
	 */
	undo : function() {
		var undoPatch = graphView.popUndo();
		var confBeforeUndo = helpers.cloneObject(graphView
				.getLocalScraperConfig());
		patcher.applyPatch(graphView.getLocalScraperConfig(), helpers
				.cloneObject(undoPatch));
		graphView.pushRedo(patcher.computePatch(graphView
				.getLocalScraperConfig(), confBeforeUndo));
		graphData.setScraperConfig(graphView.getLocalScraperConfig());
		graphView.renderGraph();
		graphView.update();
	},

	/**
	 * Redo action
	 */
	redo : function() {
		var redoPatch = graphView.popRedo();
		var confBeforeRedo = helpers.cloneObject(graphView
				.getLocalScraperConfig());
		patcher.applyPatch(graphView.getLocalScraperConfig(), helpers
				.cloneObject(redoPatch));
		graphView.pushUndo(patcher.computePatch(graphView
				.getLocalScraperConfig(), confBeforeRedo));
		graphData.setScraperConfig(graphView.getLocalScraperConfig());
		graphView.renderGraph();
		graphView.update();
	},

	/**
	 * Toggles the capture mode.
	 */
	toggleCaptureMode : function() {
		var captBttn = browser.chrome.$("actionItem_graphToggleCapture");

		var isCapture = captBttn.checked;

		if (isCapture == true) {
			captBttn.image = helpers.getImage("eye_16.png");
		} else {
			captBttn.image = helpers.getImage("eye-close_16.png");
		}
	}
}
