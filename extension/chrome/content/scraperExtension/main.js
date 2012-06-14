/*
 * The displayed panelname
 */
var panelName="Arcane Wand";

/*
 * Firebugs document
 */
var fbDocument=null;

/*
 * The browser var of this context.
 */
var browser;

/**
 * The panel containing the whole wand extension.
 */
var extensionPanel;

/**
 * The id of the selected tab.
 */
var activeTab;

/**
 * The inspectBar object.
 */
var inspectBar = {};

/**
 * Indicates whether the listener is registered or not. Ensures one time initialization.
 */
var isDOMListenerRegistered=false;

/**
 * Wands console service.
 */
var CS = Components.classes["@mozilla.org/consoleservice;1"].
     getService(Components.interfaces.nsIConsoleService);
     
/**
 * Local method to update the marks of the tabs depending on which tab is active. Used in preference listeners.
 */			
var updateMarksOfCurrentTab = function(){
	switch (activeTab) {
		case "debug":						
		
			break;					
		case "graph":						
			pergament.render(graphData.getScraperConfigPart(), fbDocument);
			break;
		case "mapping":
			break;
		case "jobs":						
			break;
		case "configuration":
			configurationView._drawMarks();
			break;
	}
	
}

FBL.ns(function() { 
	with (FBL) {

		/*
		 * Domplate whichs describes extentions GUI
		 */
		var tabsDP = domplate({
			tag:DIV(
					
				// div for the debug tab
				DIV({id: "debug", style: "display: block;"}),
				
				// div for the graph tab
				DIV({id: "graph", style: "display: block;"},
					DIV({id: "pergament", style: "position: fixed; overflow: scroll; height: 100%; width: 100%; margin: 0 250px 0 0;", tabindex: 0},
					DIV({id: "pergament-boxes", style: "position: absolute; left: 0; top: 0; z-index: 2; height: 100%; width: 100%;"}),
					CANVAS({id:"pergament-canvas", style: "position: absolute; left: 0; top:0; z-index: 1;"})),
					DIV({id: "graphPropsPanel", style: "position: fixed; overflow: scroll; overflow-x: hidden; right: 0; top: 0; width: 250px; margin: 0; height: 100%;"})
				),
				
				// div for the configuration tab
				DIV({id: "configuration", style:"display:none;"}),
				
				// div for the mapping tab
				DIV({id: "mapping", style:"display:none;"},
					
					DIV({id: "mappingTableDiv", style:"overflow:hidden ; height:250px ; width:800px ;  margin-top:10px ; margin-left:auto ; margin-right:auto ;"})				
				),
				
				// div for the jobs tab
				DIV({id: "jobs", style:"display:none;"})
			)
		});

		/*
		 * The model for the extension panel
		 */
		Firebug.ScraperExtensionModel = extend(Firebug.Module,
		{			
			
			/*
			 * After "onSelectingPanel", a panel has been selected but is not yet visible
			 * @param browser The tab's browser element
			 * @param panel Selectet panel OR null
			 */
			showPanel: function(passedBrowser, panel) {
				browser=passedBrowser;
				extensionPanel=panel;
				var isHwPanel = panel && panel.name == panelName;
				var hwButtons = browser.chrome.$("fbScraperExtensionButtons");
				collapse(hwButtons, !isHwPanel);
				if(isHwPanel){
					
					if(browser.chrome.$("showGraphBttn").checked==true){
						this.onShowGraph();
						return;
					}
					if(browser.chrome.$("showMappingBttn").checked==true){
						this.onShowMapping();
						return;
					}
					if(browser.chrome.$("showConfigBttn").checked==true){
						this.onShowConfiguration();
						return;
					}
					if(browser.chrome.$("showJobsBttn").checked==true){
						this.onShowJobs();
						return;
					}
					if(browser.chrome.$("showDebugBttn").checked==true){
						this.onShowDebug();
						return;
					}					
				}				
			},
			
			/*
			 * Loads GUI of debug tab
			 */
			onShowDebug: function() {
			
				Selector.unmarkAll();
				browser.chrome.$("mappingBox").hidden=true;
				browser.chrome.$("graphBox").hidden=true;
				browser.chrome.$("jobsBox").hidden=true;
				browser.chrome.$("configBox").hidden=true;
				
				fbDocument.getElementById("mapping").style.display="none";
				fbDocument.getElementById("graph").style.display="none";
				fbDocument.getElementById("configuration").style.display="none";
				fbDocument.getElementById("jobs").style.display="none";
				fbDocument.getElementById("debug").style.display="block";
				activeTab="debug";
			},
			
			/*
			 * Loads GUI of graph tab
			 */
			onShowGraph: function() {
			
				Selector.unmarkAll();
				browser.chrome.$("graphBox").hidden=false;
				browser.chrome.$("mappingBox").hidden=true;
				browser.chrome.$("jobsBox").hidden=true;
				browser.chrome.$("configBox").hidden=true;
				
				fbDocument.getElementById("mapping").style.display="none";
				fbDocument.getElementById("graph").style.display="block";
				fbDocument.getElementById("configuration").style.display="none";
				fbDocument.getElementById("jobs").style.display="none";
				fbDocument.getElementById("debug").style.display="none";
				
				activeTab="graph";
				
				configurationData.init();
				graphConfig.init();
				graphData.update();
				graphView.update();				
				mappingHelper.initialize();
			},
			
			/*
			 * Loads GUI of mapping tab
			 */
			onShowMapping: function() {
			
				Selector.unmarkAll();
				browser.chrome.$("mappingBox").hidden=false;
				browser.chrome.$("graphBox").hidden=true;
				browser.chrome.$("jobsBox").hidden=true;
				browser.chrome.$("configBox").hidden=true;
				
				fbDocument.getElementById("graph").style.display="none";
				fbDocument.getElementById("mapping").style.display="block";
				fbDocument.getElementById("configuration").style.display="none";
				fbDocument.getElementById("jobs").style.display="none";
				fbDocument.getElementById("debug").style.display="none";
				
				activeTab="mapping";
				configurationData.init();
				mappingHelper.initialize();
				mappingView.redraw();
			},

			/*
			 * Loads GUI of jobs tab
			 */
			onShowJobs: function() {
			
				Selector.unmarkAll();	
				browser.chrome.$("mappingBox").hidden=true;
				browser.chrome.$("graphBox").hidden=true;
				browser.chrome.$("jobsBox").hidden=false;
				browser.chrome.$("configBox").hidden=true;
				
				fbDocument.getElementById("graph").style.display="none";
				fbDocument.getElementById("mapping").style.display="none";
				fbDocument.getElementById("configuration").style.display="none";
				fbDocument.getElementById("jobs").style.display="block";
				fbDocument.getElementById("debug").style.display="none";
				jobsView.update(extensionPanel.context);
				activeTab="jobs";
			},

			/*
			 * Loads GUI of configuration tab
			 */
			onShowConfiguration: function() {				
				Selector.unmarkAll();
				browser.chrome.$("mappingBox").hidden=true;
				browser.chrome.$("graphBox").hidden=true;
				browser.chrome.$("jobsBox").hidden=true;
				browser.chrome.$("configBox").hidden=false;
				
				fbDocument.getElementById("graph").style.display="none";
				fbDocument.getElementById("mapping").style.display="none";
				fbDocument.getElementById("configuration").style.display="block";
				fbDocument.getElementById("jobs").style.display="none";
				fbDocument.getElementById("debug").style.display="none";
				activeTab="configuration";
				configurationView.init();
				configurationView.update();
				configurationView.resize();
			},

			/*
			 * Resets the extension to its initial state.
			 */
			onResetExtension: function() {
				
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				var confirmed = prompts.confirm(null, helpers.STR("strings_main","main.global.dialog.newJob.title"), helpers.STR("strings_main","main.global.dialog.newJob.description"));
				if(confirmed==true){
				
					// Resets the Configuration tab
					configTab.reset();
					
					
					// Resets the navigation tab
					graphConfig.reset();
	
					//TODO implement for mapping tab
					mappingHelper.reset();
				}
			},
			
			/**
			 * Sends the job to the scraper.
			 */
			onSendJob : function() {
				
				//Check some must haves in configuration
				var error = false;
				var message = "";	
				
				var nodes = graphData.getAllNodes();
								
				var i = graphData._idCounter - 1;
				while (nodes['nav' + i] != null) {					
					var node = nodes['nav' + i];
					switch (node.type) {
						case 'Start':
							if (node.config.request.url === "") {									
								error = true;
								message = message + helpers.STR("strings_main","main.send.check.ep.warning") + '\n';
							}
							break;
						case 'WalkthroughLinks':
							if ((node.config.areaSelector == null ||  
								 node.config.areaSelector == '') &&
								(node.config.customSelector == null)) {									
								error = true;
								message = message + helpers.STR("strings_main","main.send.check.wtl.warning") + '\n';
							}
							break;
						case 'WalkthroughItems':
							if ((node.config.itemSelector == null ||  
								 node.config.itemSelector == '') &&
								(node.config.customSelector == null ||  
								 node.config.customSelector == '')) {									
								error = true;
								message = message + helpers.STR("strings_main","main.send.check.wti.warning") + '\n';
							}
							break;
						case 'Pager':
							if ((node.config.pagerSelector == null ||  
								 node.config.pagerSelector == '')) {									
								error = true;
								message = message + helpers.STR("strings_main","main.send.check.wti.warning") + '\n';
							}
							break;
						case 'FollowLink':
							if ((node.config.linkSelector == null ||  
								 node.config.linkSelector == '') &&
								(node.config.customSelector == null ||  
								 node.config.customSelector == '')) {									
								error = true;
								message = message + helpers.STR("strings_main","main.send.check.fl.warning") + '\n';
							}
							break;
						case 'Magic':
							if ((node.config.itemSelector == null ||  
								 node.config.itemSelector == '') &&
								(node.config.customSelector == null ||  
								 node.config.customSelector == '')) {									
								error = true;
								message = message + helpers.STR("strings_main","main.send.check.mg.warning") + '\n';
							}
							break;
						case 'FillForm':
							if ((node.config.formSelector == null ||  
								 node.config.formSelector == '')) {									
								error = true;
								message = message + helpers.STR("strings_main","main.send.check.ff.warning") + '\n';
							}
							break;
						case 'Collect':
							if ((node.config.collection == null ||  
								 node.config.collection == '')) {									
								error = true;
								message = message + helpers.STR("strings_main","main.send.check.cd.warning") + '\n';
							}
							break;
						default:						
							break;						
					}
					i--;
				}				
				if (error === true) {
					var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
							.getService(Components.interfaces.nsIPromptService);
					var result = prompts.confirm(null, helpers.STR("strings_main","main.send.dialog.warning.title"), message + '\n'+helpers.STR("strings_main","main.send.dialog.warning.description"));
					
					if (result === false)
						return;
				}
				
				communication.requestProjects(function(projects){
					
					var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
					
					var projectNames= new Array();
					projectNames.push(helpers.STR("strings_main","main.global.dialog.newProject.title"));
					
					jQuery.each(projects,
						function(){
							projectNames.push(this.name);
						}
					);
					
					var projectName=null;
					
					var selected = {};
					
					var result = prompts.select(null, helpers.STR("strings_main","main.global.dialog.selectProject.title"), helpers.STR("strings_main","main.global.dialog.selectProject.description"), projectNames.length,
					                            projectNames, selected);
					if(result==false){
						status.info(helpers.STR("strings_main","main.send.aborted.message"));
						return;
					}
					if(projectNames[selected.value]==helpers.STR("strings_main","main.global.dialog.newProject.title")){
						var io ={value : ""}
						var confirmed = prompts.prompt(null, helpers.STR("strings_main","main.global.dialog.newProject.title"), helpers.STR("strings_main","main.global.dialog.newProject.description"), io, null, {});
		
						if(confirmed == true) {
							projectName=io.value;
						}else{
							status.info(helpers.STR("strings_main","main.send.aborted.message"));
							return;
						}
					}else{
						projectName=projectNames[selected.value];
					}
					if(projectName!=null){
						communication.sendJob(projectName);
						status.success(helpers.STR("strings_main","main.send.success.message"));
					}else{
						status.error(helpers.STR("strings_main","main.send.noprojectselected.message"));
					}
				});
			},
			
			/**
			 *	Opens the help page of the active tab.
			 *  @param {0-3} val Local int of the tab. Numbers make a switch case easier.
			 */
			onShowHelp : function(val) {
				var url=Firebug.getPref(Firebug.prefDomain, "scraperExtension.scraperURL");
				switch (val) {
					case 0:						//graph-help
						helpers.openHelp("help/wand/gui#Navigation-Tab");
						break;					
					case 1:						//config-help
						helpers.openHelp("help/wand/gui#ConfigTab");
						break;
					case 2:						//mapping-help
						helpers.openHelp("help/wand/gui#MappingTab");
						break;
					case 3:						//jobs-help
						helpers.openHelp("help/wand/gui#JobsTab");
						break;
				}
			},			
		});

		/*
		 * The panel of the extension
		 */
		function ScraperExtensionPanel() {}
		ScraperExtensionPanel.prototype = extend(Firebug.Panel,
		{
			name: panelName,
			title: panelName,
			inspectable: true,
			inspectHighlightColor: "blue",
			persistContent: true,

			// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
			// Initialization

			initialize: function(context, doc) {
				Firebug.Panel.initialize.apply(this, arguments);
				
				//update meta inf
				browser=context.browser;
				fbDocument=this.panelNode.ownerDocument;
				
				//restore customers state
				var persistedState = Firebug.getPanelState(this);
				if (persistedState==null){
					tabsDP.tag.replace({}, this.panelNode, tabsDP);
				}
				
				Firebug.Inspector.addListener(this);					
																
				
				
			},			

			/**
			 * Returns the options menuitems of the tab.
			 * @param {Object} The options entry. Other options can be added.
			 */
			getOptionsMenuItems: function(context) {
				return [
					{
						label: helpers.STR("strings_main","main.global.entry.options.label"),
						nol10n: true,
						image: helpers.getImage("gear_16.png"),
						command: function() {
							var parent = context.chrome.window;
							parent.openDialog(helpers.getFile("dialogs/options.xul"), "",
							"chrome,titlebar,toolbar,centerscreen,modal", Firebug, fbDocument);
						}  
					}
				];
			},
			
			/**
			 * Method called directly after click on inspect.
			 */
			startInspecting: function()	{
				inspectBar = new InspectBar(content.document);
				inspectBar.showInspectBar();
			},
			
			/**
			 * Method called while inspecting.
			 */
			inspectNode: function (node) {
				inspectBar.updateInspectBar(node, null, null);
			},

			/**
			 * Method called directly at the end of inspecting.
			 */
			stopInspecting: function (node, canceled) {
				if(canceled == false) {
					if(inspectBar.getNavigation() == true) {
						inspectBar.updateInspectBar(node, this.onFinishedInspection, null);
					} else {
						inspectBar.closeInspectBar();
						this.onFinishedInspection(node);
					}
				} else {
					if (inspectBar.getFocused() == false)
						inspectBar.closeInspectBar();
				}
			},
			
			/**
			 * Method called after inspecting.
			 */
			onFinishedInspection : function(node) {
				if (activeTab == "graph") {
					inspectBar.closeInspectBar();
					var fnctn = graphPropsPanel.getInspectFunction();
					if (fnctn == null) {
						return;
					}
					fnctn(node);
				} else if (activeTab == "configuration") {
					configurationContent.onInspect(node);
				}
			},

			/**
			 * Returns supported objects for inspector.
			 * @param {Object} object The object.
			 * @param {String} type The type.
			 */
			supportsObject: function (object, type)	{
				if(jQuery(object).hasClass('wedex_inspectSideBar')) {
					return 0;
				} else {
					return 1;
				}
			},
		});

		/*
		 * Register panel and model.
		 */
		Firebug.registerModule(Firebug.ScraperExtensionModel);
		Firebug.registerPanel(ScraperExtensionPanel);
		
		//Adjust UI when resizing Firebug							
		jQuery('#fbContentBox', document).resize(function() {			
			mappingView.setTableSizes();
			configurationView.resize();
		});
		
		//Register Listener for mark updates on website change.
		if(isDOMListenerRegistered==false&&gBrowser){
			gBrowser.addEventListener("DOMContentLoaded", function(){
					updateMarksOfCurrentTab();}, false);
			isDOMListenerRegistered=true;
		}

		
		/*
		 * Register stylesheets
		 */
		Firebug.registerStylesheet("chrome://scraperExtension/skin/scraperExtension.css");		
		Firebug.registerStylesheet("chrome://scraperExtension/skin/pergament.css");
		Firebug.registerStylesheet("chrome://scraperExtension/skin/jobs.css");
		Firebug.registerStylesheet("chrome://scraperExtension/skin/configuration.css");
		Firebug.registerStylesheet("chrome://scraperExtension/skin/jquery-ui-1.8.16.custom.css");
		
		/*
		 * Register all Preference Listeners
		 */
		var application = Components.classes["@mozilla.org/fuel/application;1"].getService(Ci.fuelIApplication);
		
		var pref_nodeSpacing = application.prefs.get("extensions.firebug.scraperExtension.nodeSpacing");
		pref_nodeSpacing.events.addListener("change", function(aEvent) {
			pergament.render(graphData.getScraperConfigPart(), fbDocument);
		});
		
		var pref_nodeStyle = application.prefs.get("extensions.firebug.scraperExtension.nodeStyle");
		pref_nodeStyle.events.addListener("change", function(aEvent) {
			pergament.render(graphData.getScraperConfigPart(), fbDocument);
		});
		
		var pref_markOpac = application.prefs.get("extensions.firebug.scraperExtension.markOpac");
		var pref_markColor = application.prefs.get("extensions.firebug.scraperExtension.markColor");
		
		var color = Firebug.getPref(Firebug.prefDomain, "scraperExtension.markColor");
		var opac = Firebug.getPref(Firebug.prefDomain, "scraperExtension.markOpac");
		
		
		pref_markColor.events.addListener("change",updateMarksOfCurrentTab);
		pref_markOpac.events.addListener("change",updateMarksOfCurrentTab);	    
	}
});
