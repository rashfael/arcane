/**
 * Helpers.js
 *
 * This javascript file provides general helper methods to the other javascript files.
 *
 */
var helpers = {


	/**
	 * Returns true whether the passed string ends with the passed postfix or
	 * false else.
	 * 
	 * @param {String}
	 *            string The string to check.
	 * @param {String}
	 *            postfix The postfix.
	 * @return {Boolean} endsWith True if the string end with the postfix else
	 *         false.
	 */
	endsWith : function(string, postfix) {
		return (string.match(postfix + "$") == postfix)
	},

	/**
	 * Returns the url of the current web page.
	 * 
	 * @return {String} currURL The url of the current web page.
	 */
	getCurrentURL : function() {
		var currentWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
				.getService(Components.interfaces.nsIWindowMediator)
				.getMostRecentWindow("navigator:browser");

		var currBrowser = currentWindow.getBrowser();
		var currURL = currBrowser.currentURI.spec;

		return currURL;
	},

	/**
	 * Clones the given JavaScript object.
	 * 
	 * @param jsObject
	 *            The original object.
	 * @returns The cloned object.
	 */
	cloneObject : function(jsObject) {
		// Deep copy
		return jQuery.extend(true, {}, jsObject);
	},

	/**
	 * Returns the icon with the passed name.
	 * 
	 * @param {String} name The file name of the image including the data extension,e.g. png, jpg
	 * @return {String} The complete image path. 
	 */
	getImage : function(name) {
		return "chrome://scraperExtension/skin/images/" + name;
	},

	/**
	 * Returns the icon with the passed name.
	 * @param {String} name The file name.
	 * @return {String} The complete file path.
	 */
	getFile : function(name) {
		return "chrome://scraperExtension/content/" + name;
	},

	/**
	 * Returns true if the given string has the prefix.
	 * @param {String} string The string to check.
	 * @param {String} prefix The prefix to check. 
	 * @return {String} True if the string starts with the prefix, else false.
	 */
	startsWith : function(string, prefix) {
		return string.indexOf(prefix) === 0;
	},
	
	/**
	 * Method to ensure an specific string length. Three dots will
	 * get appended to the shortened string if the original one is 
	 * too long.
	 * @param {String} string The string to check.
	 * @param {Integer} length The maximum number of characters of the string. 
	 * @return {String} The original string if its size is ok, else the shortened one.
	 */
	ensureStringLength:function(string,length) {
		if(string==null||length==null)
			return;
	  	if(string.length > length) {
	   		var newString = string.substr(0, length-3);
			newString=newString+'...';
	   		return newString;
	  	}else{
	    	return string;
	  	}
	},
	
	/**
	 * Validator for hexcodes.
	 * @param {string} code The code to test.
	 * @return {boolean} True if code is valid else false. 
	 */
	isHexcode : function(code) {
		var strPattern = /^#[0-9a-f]{6}$/i; 
		return strPattern.test(code); 
	},
	
	/**
	 * Returns the string of the bundle with the given id.
	 * @param {String} bundleId The id of the bundle.
	 * @param {String} stringId The id of the string.
	 * @return {String} The locale string.
	 */
	STR: function (bundleId,stringId)
	{
		
	    if(document.getElementById(bundleId)==null){
    		Components.utils.reportError("No bundle with ID "+bundleId+" found.");
    		return "UNDEFINED";
    	}
    	try{
    		return document.getElementById(bundleId).getString(stringId);
    	}catch(err){
    		Components.utils.reportError("Could not find String Id "+stringId+" in bundle "+bundleId+".");
    		return "UNDEFINED";
    	}
	},
	
	/**
	 * Returns the string of the bundle with the given id and inserts parameters.
	 * @param {String} bundleId The id of the bundle.
	 * @param {String} stringId The id of the string.
	 * @param {[]} args Arguments to insert in.
	 * @return {String} The locale string.
	 */
	STRF:function (bundleId,stringId, args)
	{
		if(document.getElementById(bundleId)==null){
    		Components.utils.reportError("No bundle with ID "+bundleId+" found.");
    		return "UNDEFINED";
    	}
		try{
    		return document.getElementById(bundleId).getFormattedString(stringId, args);
    	}catch(err){
    		Components.utils.reportError("Could not find String Id "+stringId+" in bundle "+bundleId+".");
    		return "UNDEFINED"
    	}
	},
	
	/**
	 * Opens the help chapter within a new window.
	 * @param {String} path The relative path without starting "/"
	 */
	openHelp:function (path)
	{	
		var url=Firebug.getPref(Firebug.prefDomain, "scraperExtension.scraperURL");
		openUILinkIn(url+"/"+path,"current");

	},
	
	/**
	 * hoverin method
	 * @param {jQueryObject} obj The object.
	 */
	hoverinHelper : function(obj){
		obj.addClass("hover");				
	},
	
	/**
	 * hoverout method
	 * @param {jQueryObject} obj The object.
	 */		
	hoveroutHelper : function(obj){
		obj.removeClass("hover");

	}
}