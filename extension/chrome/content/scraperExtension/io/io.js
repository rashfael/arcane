var ioConf = {
	mappings : null,
	navigation : null,
	config : null,
	setMapping: function(mapping) {
		this.mappings = mapping;
	},
	setGraph: function(graph) {
		this.navigation = graph;
	},
	setConfig: function(config) {
		this.config = config;
	}
}

var io = {

	/*
	 * Exports the configuration-file
	 */
	exportConfig: function() {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.appendFilter(helpers.STR("strings_main","io.filter.description"), "*.json");
		fp.init(window, helpers.STR("strings_main","io.dialog.save.title"), nsIFilePicker.modeSave);
		
		var res = fp.show();
		if (res == nsIFilePicker.returnOK||res == nsIFilePicker.returnReplace){
			var path = fp.file.path;
			if(!helpers.endsWith(path,".json")){
				path=path+".json";
			}

			//var config = this.getJsonConfig();
			var config = this.getJsonData();

			this.saveFile(path, config);

		}
	},
	
	/*
	 * Imports the configuration-file
	 */
	importConfig: function() {
		this.importJsonFile(this.loadConfig);
	},

	/*
	 * Imports the configuration-file
	 * @param {Function} callback which is exectudes after successfull loading
	 */
	importJsonFile: function(callback) {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.appendFilter(helpers.STR("strings_main","io.filter.description"), "*.json");
		fp.init(window, helpers.STR("strings_main","io.dialog.load.title"), nsIFilePicker.modeLoad);
		
		var res = fp.show();
		var parsedFile;
		if (res == nsIFilePicker.returnOK){
			var path = fp.file.path;
			if(!helpers.endsWith(path,".json")){
				path=path+".json";
			}
			Components.utils.import("resource://gre/modules/NetUtil.jsm");
			var data;
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(path);
			var channel = NetUtil.newChannel(file);  
			channel.contentType = "application/json";  
	
			NetUtil.asyncFetch(channel, function(inputStream, message) {
				if (!Components.isSuccessCode(message)) {
					status.error(helpers.STR("strings_main","io.dialog.load.error"));
					return;
				} else {
					status.success(helpers.STR("strings_main","io.dialog.load.success"));
				}
	
				var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
				var utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);  
				var data = utf8Converter.convertURISpecToUTF8 (data, "UTF-8");
				
				parsedFile = JSON.parse(data);
				callback(parsedFile,file.leafName);
			});
			
		}
		
	},

	/**
	 * Method to load an config javascript object.
	 * @param {Object} config The configuration to load.
	 */
	loadConfig : function(config){
		if(config==null)
			return;
		configurationData.setData(config);
		graphData.setScraperConfigFromJSON(config);
		mappingData.setScraperConfig(config);
		mappingData.setMappingData(config);
		
		//TODO: Remove this call when listeners are implemented
		graphView.renderGraph();
		updateMarksOfCurrentTab();
	},
	
	/*
	 * Method to save the passed data into the given file path
	 */
	saveFile: function(filename, data) {
		// filename is string, for example: "D:\\test.txt"
		// data is a string which is written to the file
		Components.utils.import("resource://gre/modules/NetUtil.jsm");
		Components.utils.import("resource://gre/modules/FileUtils.jsm");

		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(filename);
		var ostream = FileUtils.openSafeFileOutputStream(file)
		
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = "UTF-8";
		var istream = converter.convertToInputStream(data);
		
		// The last argument (the callback) is optional.
		NetUtil.asyncCopy(istream, ostream, function(message) {
			if (!Components.isSuccessCode(message)) {
				status.error(helpers.STR("strings_main","io.dialog.save.error"));
				return;
			}else{
				status.success(helpers.STR("strings_main","io.dialog.save.success"));
			}
		});
	},

	/*
	 * Returns the JSON object for the configuration file.
	 */
	getJsonConfig: function() {

		ioConf.setMapping(mappingData.getScraperConfigPart().mappings);
		ioConf.setGraph(graphData.getScraperConfigPart().navigation);
				
		for (map in ioConf.mappings) {
			ioConf.mappings[map].validFor = graphData.getScraperConfigPart().mappings[map].validFor;
			ioConf.mappings[map].name = graphData.getScraperConfigPart().mappings[map].name;
		}
		
		return JSON.stringify(ioConf, null, 4);
	},
	
	/*
	 * Returns the JSON object for the save state file.
	 */
	getJsonData: function() {

		this.buildConfig();
		
		return JSON.stringify(ioConf, null, 4);
	},
	
	/**
	 * Returns the mashed up config.
	 */
	getConfig: function(){
		this.buildConfig();
		return ioConf;
	},
	
	/**
	 * Builds the config from the local data models of the tabs.
	 */
	buildConfig : function(){
		ioConf.setMapping(mappingData.getScraperConfigPart().mappings);		
		ioConf.setGraph(graphData.getScraperConfigPart().navigation);
		ioConf.mappingData = mappingData.getMappingData();
		ioConf.setConfig(configurationData.getData());
		
		//TODO remove this. Emergency solution!!!!
		//configuration.mappingData=mappingData._mapping;
		
		for (map in ioConf.mappings) {
			ioConf.mappings[map].validFor = graphData.getScraperConfigPart().mappings[map].validFor;
			ioConf.mappings[map].name = graphData.getScraperConfigPart().mappings[map].name;
		}
	}
}