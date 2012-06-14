/**
 * The properties panel in the graph tab.
 */
var graphPropsPanel = {
	/**
	 * Some constants and private properties.
	 */
	_inspectFunction : null,
	_startContent : '<div style="margin: 5px;">',
	_endContent : '</div>',
	_defaultDivStyle : "margin-bottom: 15px;",
	_defaultElementStyle : "width: 95%;",
	_panelContent : null,
	_nodeId : null,
	_values : {}, // { "configId": function() {//return value}, ... }
	_updateActions : [], // [ function() {//update graphData}, ... ]
	_postRenderActions : [], // [ function() {//update graphData}, ... ]
	_clickListeners : {}, // { "cssId": function() {//handle event}, ... }
	_saveOnChange : [], // [ "cssId", "cssId", ... ]

	/**
	 * Returns the panel.
	 *
	 * @return {DOMNode} The props panel.
	 */
	_getPanel : function() {
		return jQuery("#graphPropsPanel", fbDocument);
	},

	/**
	 * Returns the CSS ID for the given element.
	 *
	 * @param {string} configId The node config's ID.
	 * @param {string} suffix The suffix.
	 * @return {string} The CSS ID.
	 */
	_getCssId : function(configId, suffix) {
		var idSuffix = "";

		if (typeof suffix !== 'undefined') {
			idSuffix = suffix;
		}

		return graphConfig.propCssIdPrefix + configId + idSuffix;
	},

	/**
	 * Returns the corresponding DOM element.
	 *
	 * @param {string} configId The node config's ID.
	 * @param {string} suffix The suffix.
	 * @return {DOMNode} The DOM element.
	 */
	_getDomElement : function(configId, suffix) {
		return jQuery("#" + this._getCssId(configId, suffix), fbDocument);
	},

	/**
	 * Returns the inspect function.
	 *
	 * @return {function} The inspect function.
	 */
	getInspectFunction : function() {
		return this._inspectFunction;
	},

	/**
	 * Shows the given message.
	 *
	 * @param {string} message The message.
	 */
	showMessage : function(message) {
		this.clear();

		this._panelContent = this._startContent;

		this._panelContent += '<div style="color: gray; font-style: italic;">'
				+ message + '</div>';

		this._panelContent += this._endContent;

		this._getPanel().html(this._panelContent);
	},

	/**
	 * Shows a message when more than one node is selected.
	 */
	showMessageMultiNodesSelected : function() {
		this
				.showMessage(helpers.STR("strings_main","graph.pp.multinode.message"));
	},

	/**
	 * Shows a message when no node is selected.
	 */
	showMessageNoNodeSelected : function() {
		this
				.showMessage(helpers.STR("strings_main","graph.pp.nonode.message"));
	},

	/**
	 * Shows a message when the aren't any properties for the selected node.
	 */
	showMessageNoProperties : function() {
		this
				.showMessage(helpers.STR("strings_main","graph.pp.noprops.message"));
	},

	/**
	 * Clears the props panel.
	 */
	clear : function() {
		this._getPanel().empty();

		this._values = {};
		this._updateActions = [];
		this._clickListeners = {};
		this._saveOnChange = [];
		this._nodeId = null;
		this._panelContent = null;
	},

	/**
	 * Init the props panel.
	 */
	init : function(nodeId) {
		this.clear();

		this._nodeId = nodeId;

		this._panelContent = this._startContent;
		this._panelContent += '<h1 style="margin-top: 0; padding-top: 0;">'
				+ graphData.getNode(nodeId).name + '</h1>';
		this._panelContent += '<h5 style="margin-top: 0; padding-top: 0; color: gray; font-weight: normal;">'+helpers.STR("strings_main","graph.node.nodeid")+" "
				+ graphData.getNode(nodeId).id + '</h5>';
	},

	/**
	 * Store properties.
	 */
	save : function() {
		if (this._updateActions.length > 0) {
			var oldConf = graphData.getScraperConfigPart();

			jQuery.each(this._updateActions, function(index, updateAction) {
				updateAction();
			});

			var newConf = graphData.getScraperConfigPart();

			graphView.createAndPushCmd(oldConf, newConf);

			graphView.renderGraph();
		}
	},

	/**
	 * Returns HTML snippet for context help.
	 *
	 * @param {string} tooltip The text of the tooltip.
	 * @param {string} ref The reference as a URL.
	 * @return {string} HTML snippet.
	 */
	help : function(tooltip, ref) {
		var baseUrl = Firebug.getPref(Firebug.prefDomain, "scraperExtension.scraperURL");

		return '<a href="' + baseUrl + '/help/' + ref + '" class="graphHelpLink">'
			+ '<img title="' + tooltip + '" '
			+ 'src="chrome://scraperExtension/skin/images/question-small-white_16.png" /></a>'
	},

	/**
	 * Adds a new property using the given attributes.
	 * 
	 * @param {string} type
	 *            The type of this property ('textBox', 'jqSelectorInput', ...)
	 * @param {string} configId
	 *            The name of the config property.
	 * @param {object} value
	 *            The currently set value.
	 * @param {function} updateAction
	 *            The action which is performed to update the data model.
	 * @param {Attributes} attrs
	 *            The attributes, e.g. {label: 'foo', ...}
	 * @return {string} The CSS ID of the newly created element.
	 */
	addProperty : function(type, configId, value, updateAction, attrs) {
		var cssIdDiv = this._getCssId(configId);

		graphPropsPanel._updateActions.push(updateAction);

		switch (type) {
		case "textBox":
			if (value === null) {
				value = "";
			}

			var cssIdInput = this._getCssId(configId, "input");

			graphPropsPanel.saveOnChange(cssIdInput);

			this._panelContent += '<div id="' + cssIdDiv + '" style="'
					+ this._defaultDivStyle + '"><b>' + attrs.label
					+ '</b>' + this.help(attrs.tooltip, attrs.helpRef) + '<br />' + '<input style="'
					+ this._defaultElementStyle + '" id="' + cssIdInput
					+ '" name="' + configId + '" type="text" value="' + value
					+ '" size="20" /></div>';

			this._values[configId] = function() {
				if (graphPropsPanel._getDomElement(configId).is(":hidden")) {
					return null;
				}

				return graphPropsPanel._getDomElement(configId, "input").val();
			};

			break;
		case "urlInput":
			if (value === null) {
				value = "";
			}

			var cssIdInput = this._getCssId(configId, "input");
			var cssIdLink = this._getCssId(configId, "link");

			graphPropsPanel.saveOnChange(cssIdInput);

			this._panelContent += '<div id="' + cssIdDiv + '" style="'
					+ this._defaultDivStyle + '"><b>' + attrs.label
					+ '</b>' + this.help(attrs.tooltip, attrs.helpRef) + ' <small style="color: gray;"><a style="color: gray;" id="' + cssIdLink
					+ '">'+helpers.STR("strings_main","graph.pp.url")+'</a></small><br />' + '<input style="'
					+ this._defaultElementStyle + '" id="' + cssIdInput
					+ '" name="' + configId + '" type="text" value="' + value
					+ '" size="20" /></div>';

			this.addClickListener(cssIdLink, function() {
				var currentURL = window.content.location.href;

				if (helpers.startsWith(currentURL, "http")) {
					graphPropsPanel._getDomElement(configId, "input").val(currentURL);

					graphPropsPanel.save();
				} else {
					status.info(helpers.STR("strings_main","graph.pp.url.error"));
				}
			});

			this._values[configId] = function() {
				if (graphPropsPanel._getDomElement(configId).is(":hidden")) {
					return null;
				}

				return graphPropsPanel._getDomElement(configId, "input").val();
			};

			break;
		case "jqSelectorInput":
			// Get parent node selector if there is one
			var parentNodeSelector = null;

			if (typeof attrs.parentSelector !== 'undefined') {
				parentNodeSelector = attrs.parentSelector;
			} else if (typeof attrs.parentItemSelector !== 'undefined') {
				parentNodeSelector = attrs.parentItemSelector;
			} else if (typeof attrs.parentCustomSelector !== 'undefined') {
				parentNodeSelector = attrs.parentCustomSelector;
			}

			if (parentNodeSelector !== null) {
				parentNodeSelector = parentNodeSelector.toString();
			}

			// Get CSS IDs
			var cssIdInput = this._getCssId(configId, "input");
			var cssIdRadioGroup = this._getCssId(configId, "radioGroup");
			var cssIdInspectButton = this._getCssId(configId, "inspectButton");

			graphPropsPanel.saveOnChange(cssIdInput);

			// Define default selector if there is none defined
			if (typeof attrs.selectorTypes === 'undefined') {
				attrs.selectorTypes = [ {
					id : "selector"
				} ];
			}

			// Hide radio group if there's only one choice
			var radioGroupStyleDisplay = "";

			if (attrs.selectorTypes.length === 1) {
				radioGroupStyleDisplay = "display: none;";
			}

			// Build radio group
			var radioGroup = '<form style="margin-bottom: 4px; '
					+ radioGroupStyleDisplay + '" id="' + cssIdRadioGroup
					+ '">';

			var checked = false;

			jQuery
					.each(
							attrs.selectorTypes,
							function(index, selType) {
								// Generate CSS ID for the radio button
								var cssIdRadioButton = graphPropsPanel
										._getCssId(configId, selType.id);

								// The radio button
								radioGroup += '<input title="'
										+ selType.tooltip
										+ '" type="radio" name="selectorType" id="'
										+ cssIdRadioButton
										+ '" value="'
										+ selType.id
										+ '" '
										+ ((selType.disabled == true) ? 'disabled="true" '
												: '');

								if (!checked
										&& (value === null || value.id === selType.id)
										&& !selType.disabled) {
									radioGroup += 'checked="checked"';
									checked = true;
								}

								radioGroup += '>';

								// The label
								radioGroup += ' <label for="'
										+ cssIdRadioButton + '" title="'
										+ selType.tooltip + '">'
										+ selType.label + '</label><br />';
							});

			radioGroup += '</form>';

			// Register post-render action
			this.addPostRenderAction(function() {
				jQuery("#" + cssIdRadioGroup + " input[name='selectorType']", fbDocument).off('click');

				jQuery("#" + cssIdRadioGroup + " input[name='selectorType']", fbDocument).click(function() {
					graphPropsPanel.save();
				});
			});

			// Build widget
			selectorValue = "";

			if (value !== null) {
				selectorValue = value.value;
			}

			this._panelContent += '<div id="' + cssIdDiv + '" style="'
					+ this._defaultDivStyle + '"><b>' + attrs.label
					+ '</b>' + this.help(helpers.STR("strings_main","graph.pp.jqsel.help"), attrs.helpRef) + '<br />' + radioGroup
					+ '<input style="width: 80%;" id="' + cssIdInput
					+ '" name="' + cssIdInput + '" type="text" value="'
					+ selectorValue + '" size="20" />';

			this._panelContent += ' <a href="#" id="' + cssIdInspectButton + '">'
					+ '<img src="chrome://scraperExtension/skin/images/Templarian_inspector_16.png" />'
					+ '</a></div>';

			// Register click listener for Firebug inspector
			this
					.addClickListener(
							cssIdInspectButton,
							function() {
								Selector.unmarkAll();
								jQuery("#" + cssIdInput, fbDocument).val('');
								Firebug.Inspector
										.toggleInspecting(Firebug.currentContext);

								graphPropsPanel._inspectFunction = function(
										node) {
									
									var sel = null;

									if (parentNodeSelector !== null) {
										var parentSelObj = new Selector();
										parentSelObj.setSelector(parentNodeSelector);
										
										var selObj = new Selector(parentSelObj);
										selObj.addDOMNode(node);

										sel = selObj.getSelector();
									} else {
										parentNodeSelector = "";

										var selObj = new Selector();
										selObj.addDOMNode(node);

										sel = selObj.getSelector();

										status
												.info(helpers.STR("strings_main","graph.pp.relsel.notfound"));
									}

									sel = Selector.arrToString(sel);

									jQuery("#" + cssIdInput, fbDocument).val(sel);

									graphPropsPanel.save();

									// Mark selected item persistently

									// need full path selector for that
									sel = parentNodeSelector + sel;

									var color = Firebug.getPref(
											Firebug.prefDomain,
											"scraperExtension.markColor");
									var opac = Firebug.getPref(
											Firebug.prefDomain,
											"scraperExtension.markOpac");
									selObj.mark(color, opac/100);
									
									graphPropsPanel._inspectFunction = null;
								}
							});

			// Register 'getValue' function
			this._values[configId] = function() {
				if (graphPropsPanel._getDomElement(configId).is(":hidden")) {
					return null;
				}

				var selKey = jQuery(
						'#' + cssIdRadioGroup
								+ ' input[name=selectorType]:checked',
						fbDocument).val();

				return {
					selectorKey : selKey,
					selectorValue : graphPropsPanel._getDomElement(configId,
							"input").val()
				};
			};

			break;
		default:
			break;
		}
	},

	/**
	 * Adds encoding input field.
	 *
	 * @param {string} value The selected encoding.
	 */
	addEncodingInput : function(value, helpRef) {
		var encodings = ["UTF-8", "ISO-8859-1", "Windows-1252"];

		var detectedEncoding = content.document.characterSet;

		if (typeof value === 'undefined' || value === null) {
			value = "";
		}

		var configId = "encoding";
		var cssId = this._getCssId(configId);

		graphPropsPanel.saveOnChange(cssId);

		graphPropsPanel._updateActions.push(function() {
			var value = graphPropsPanel.getValue(configId);
			var node = graphData.getNode(graphPropsPanel._nodeId);

			if (typeof value === 'undefined' || value === "" || value === null) {
				delete node.encoding;
			} else {
				node.encoding = value;
			}
		});

		this._panelContent += '<div style="' + this._defaultDivStyle
				+ '"><b>'+helpers.STR("strings_main","graph.pp.enc.label")+'</b>' + this.help(helpers.STR("strings_main","graph.pp.enc.help"), helpRef) + ' <small style="color: gray;">'+helpers.STR("strings_main","graph.pp.enc.description")+" "
				+ detectedEncoding + '</small><br />' + '<select style="'
				+ this._defaultElementStyle + '" id="' + cssId + '" name="'
				+ configId + '">';

		graphPropsPanel._panelContent += '<option value="">'+helpers.STR("strings_main","graph.pp.enc.notspec")+'</option>';

		jQuery.each(encodings, function(index, enc) {
			graphPropsPanel._panelContent += '<option value="' + enc
					+ '"';

			if (value === enc) {
				graphPropsPanel._panelContent += ' selected="selected"';
			}

			graphPropsPanel._panelContent += '>' + enc + '</option>';
		});

		this._panelContent += '</select></div>';

		this._values[configId] = function() {
			return graphPropsPanel._getDomElement(configId).val();
		};
	},

	/**
	 * Adds mapping selection box.
	 *
	 * @param {string} value The selected mapping.
	 */
	addMappingSelect : function(value, helpRef) {
		var configId = "mapping";
		var cssId = this._getCssId(configId);

		graphPropsPanel.saveOnChange(cssId);

		graphPropsPanel._updateActions.push(function() {
			graphData.setMapping(graphPropsPanel._nodeId, graphPropsPanel
					.getValue(configId));
		});

		this._panelContent += '<div style="' + this._defaultDivStyle
				+ '"><b>'+helpers.STR("strings_main","graph.pp.mapp.label")+'</b>' + this.help(helpers.STR("strings_main","graph.pp.mapp.description"), helpRef) + '<br />' + '<select style="'
				+ this._defaultElementStyle + '" id="' + cssId + '" name="'
				+ configId + '">';

		var mappings = graphData.getAllMappings();

		var valueFound = false;

		jQuery.each(mappings, function(index, mapping) {
			graphPropsPanel._panelContent += '<option value="' + mapping.id
					+ '"';

			if (value === mapping.id) {
				graphPropsPanel._panelContent += ' selected="selected"';

				valueFound = true;
			}

			graphPropsPanel._panelContent += '>' + mapping.name + '</option>';
		});

		// Add entry for selecting "no mapping".
		graphPropsPanel._panelContent += '<option value=""';

		if (!valueFound) {
			graphPropsPanel._panelContent += ' selected="selected"';
		}

		graphPropsPanel._panelContent += '>' + graphConfig.noneMappingName
				+ '</option>';

		this._panelContent += '</select></div>';

		this._values[configId] = function() {
			return graphPropsPanel._getDomElement(configId).val();
		};
	},

	/**
	 * Adds node config selection box.
	 *
	 * @param {string} value The selected config.
	 * @param {boolean} configIdHide This field will be hidden in case a config is selected.
	 */
	addNodeConfigSelect : function(value, configIdHide, helpRef) {
		var configId = "nodeConfig";
		var cssId = this._getCssId(configId);

		graphPropsPanel.saveOnChange(cssId);

		graphPropsPanel._updateActions.push(function() {
			graphData.setNodeConfig(graphPropsPanel._nodeId, graphPropsPanel
					.getValue(configId));
		});

		this._panelContent += '<div style="' + this._defaultDivStyle
				+ '"><b>'+helpers.STR("strings_main","graph.pp.conf.label")+'</b>' + this.help(helpers.STR("strings_main","graph.pp.conf.description"), helpRef) + '<br />' + '<select style="'
				+ this._defaultElementStyle + '" id="' + cssId + '" name="'
				+ configId + '">';

		var configs = configurationData.getConfigs();

		var valueFound = false;

		jQuery
				.each(
						configs,
						function(configObjName, config) {
							var configId = config.getID();
							var configName = config.getName();

							graphPropsPanel._panelContent += '<option value="'
									+ configId + '"';

							if (value === configId) {
								graphPropsPanel._panelContent += ' selected="selected"';

								valueFound = true;
							}

							graphPropsPanel._panelContent += '>' + configName
									+ '</option>';
						});

		// Add entry for selecting "no config".
		graphPropsPanel._panelContent += '<option value=""';

		if (!valueFound) {
			graphPropsPanel._panelContent += ' selected="selected"';
		}

		graphPropsPanel._panelContent += '>' + graphConfig.noneNodeConfigName
				+ '</option>';

		this._panelContent += '</select></div>';

		this._values[configId] = function() {
			return graphPropsPanel._getDomElement(configId).val();
		};

		// Show/hide selector property
		var showHideSelectorProp = function() {
			if (graphPropsPanel.getValue(configId) === null) {
				graphPropsPanel._getDomElement(configIdHide).show();
			} else {
				graphPropsPanel._getDomElement(configIdHide).hide();
			}
		};

		// Register post-render action
		this.addPostRenderAction(showHideSelectorProp);

		// Register click listener
		if (typeof configIdHide !== 'undefined') {
			this.addClickListener(cssId, function() {
				showHideSelectorProp();
				graphPropsPanel.markSelector(configId, configIdHide);
			});
		}

		graphData.update();
	},

	/**
	 * Adds a visual separator to the panel.
	 */
	addSeparator : function() {
		this._panelContent += '<div style="margin: 20px;" />';
	},

	/**
	 * Starts a container with the given title.
	 */
	startContainer : function(title) {
		this._panelContent += '<div style="border: 1px solid gray; '
				+ this._defaultDivStyle
				+ '">'
				+ '<div style="background-color: gray; padding: 2px; font-weight: bold; color: white;">'
				+ title + '</div><div style="padding: 5px;">';
	},

	/**
	 * Closes the currently opened container.
	 */
	endContainer : function() {
		this._panelContent += '</div></div>';
	},

	/**
	 * Registers an action (function) which will be executed after the completing the rendering.
	 *
	 * @param {function} action The action which has to be performed.
	 */
	addPostRenderAction : function(action) {
		graphPropsPanel._postRenderActions.push(action);
	},

	/**
	 * Registers a click handler for the given element.
	 * 
	 * @param {string} cssId The CSS ID to address the element.
	 * @param {function} clickHandler The function which will be executed on click.
	 */
	addClickListener : function(cssId, clickHandler) {
		this._clickListeners[cssId] = clickHandler;
	},

	/**
	 * Tag the given element with 'save on change'.
	 * 
	 * @param {string} cssId The CSS ID to address the element.
	 */
	saveOnChange : function(cssId) {
		this._saveOnChange.push(cssId);
	},

	/**
	 * Override the 'getValue' function for a certain element.
	 * 
	 * @param {string} configId The config ID to address the element.
	 * @param {function} valueFunct The new function.
	 */
	overrideValueFunction : function(configId, valueFunct) {
		this._values[configId] = valueFunct;
	},

	/**
	 * Override the 'getValue' function for a certain element.
	 * 
	 * @param {string} configId The config ID to address the element.
	 * @return {string} The value which is generated by the registered function.
	 */
	getValue : function(configId) {
		var value = this._values[configId]();

		if (jQuery.trim(value) === "") {
			value = null;
		}

		return value;
	},

	/**
	 * Returns the node ID.
	 * 
	 * @return {string} The node ID.
	 */
	getNodeId : function() {
		return this._nodeId;
	},

	/**
	 * Marks an element.
	 * 
	 * @param {string} configId The config ID to address the element.
	 * @param {string} configIdHide The config ID of the hidden element.
	 */
	markSelector : function(configId, configIdHide) {
		Selector.unmarkAll();
		var selObj = new Selector();

		if (configId == null || configIdHide == null) {			
			return;
		}

		if (graphPropsPanel.getValue(configId) === null) {
			selObj.setSelector(graphPropsPanel.getValue(configIdHide).selectorValue);
		} else {
			var id = graphPropsPanel._getDomElement(configId).val();

			selObj = configurationData.getConfig(id).getListConfig();
		}
		selObj.mark();
	},

	/**
	 * Renders the panel.
	 */
	render : function() {
		this._panelContent += this._endContent;

		this._getPanel().html(this._panelContent);

		// Register click handler on DOM nodes
		jQuery.each(this._clickListeners, function(cssId, clickHandler) {
			jQuery("#" + cssId, fbDocument).off('click');

			jQuery("#" + cssId, fbDocument).click(clickHandler);
		});

		jQuery.each(this._saveOnChange, function(index, cssId) {
			jQuery("#" + cssId, fbDocument).change(function() {
				graphPropsPanel.save();
			});
		});

		// Process post-render actions
		jQuery.each(this._postRenderActions, function(index, action) {
			action();
		});

		// Register click handlers for help links
		jQuery(".graphHelpLink", fbDocument).each(function(index) {
			var helpLink = $(this).prop("href");

			$(this).click(function() {
				openUILinkIn(helpLink, "current");
			});

			$(this).prop("href", "#");
		});
	}
}
