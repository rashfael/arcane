/**
 * The abstract WeDeX debugger.
 */
var abstractWedexDebugger = {
	
	/**
	 * The background color of the log. 
	 */
	_backgroundColor : null,
	
	/**
	 * Method to append a logging message.
	 * @param {Object} content The String or Object ot log.
	 * @param {String} style The style definition of the log div. 
	 */
	_append : function(content, style) {
		var currentDate = new Date();
		var divContainer = jQuery("#debug", fbDocument);

		divContainer
				.append("<div style=\"background-color: "
						+ this._backgroundColor
						+ "; padding: 10px; border-bottom: 1px solid gray; color: gray;\"><p style=\"width: 100%;\">"
						+ currentDate + "</p><p style=\"width: 100%;" + style
						+ "\">" + content + "</p></div>");
	},
	
	/**
	 * Method to transform JavaScript-Objects to JSON.
	 * @param {Object} jsObject The Object to transform.
	 * @return {String} jsonString The transformed JSON String.
	 */
	_toJSON : function(jsObject) {
		var jsonString = JSON.stringify(jsObject, null, "  ");

		jsonString = jsonString.replace(/ /g, "&nbsp;");
		jsonString = jsonString.replace(/\n/g, "<br />");

		return jsonString;
	},
	
	/**
	 * Creates an new instance of the debugger.
	 * @param {String} bgColor The color as hexcode.
	 * @return {Object} debuggerInst The new abstractWedexDebugger instance.
	 */
	newInstance : function(bgColor) {
		var debuggerInst = helpers.cloneObject(abstractWedexDebugger);
		debuggerInst._backgroundColor = bgColor;

		return debuggerInst;
	},
	
	/**
	 * Method to log a message.
	 * @param {String} message The message to log.
	 */
	log : function(message) {
		this._append(message, "color: black;");
	},
	
	/**
	 * Method to log an object.
	 * @param {String} objTitle The title of the object.
	 * @param {Object} jsObject The object to log.
	 */
	logObj : function(objTitle, jsObject) {
		this._append("<b>" + objTitle + "</b><br /><br />"
				+ this._toJSON(jsObject),
				"color: blue; font-family: monospace;");
	},
	
	/**
	 * Method to log a warning.
	 * @param {String} message The message to log.
	 */
	warn : function(message) {
		this._append(message, "color: orange;");
	},
	
	/**
	 * Method to log an error.
	 * @param {String} message The message to log.
	 */
	error : function(message) {
		this._append(message, "color: red;");
	}
};

/**
 * The debugger instances.
 */
var wedexDebug = {};

/**
 * Register instances for tabs and custom areas.
 */
wedexDebug.map = abstractWedexDebugger.newInstance("#f7ffe9");

wedexDebug.nav = abstractWedexDebugger.newInstance("#dedeff");

wedexDebug.conf = abstractWedexDebugger.newInstance("#123456");

wedexDebug.jobs = abstractWedexDebugger.newInstance("#ffffff");

wedexDebug.communication = abstractWedexDebugger.newInstance("#aabbcc");
