/**
 *	Singleton for status messages.
 */
var status = {
	
	/**
	 * Queue for the status messages.
	 */
	_statusQueue : [],
	
	/**
	 *	Indicates whether the status will be shown permanently or else disappear with timeout.
	 */
	_persistent : false,
	
	/**
	 * Indicates wheter the status opcet is currently processing messages or not.
	 */
	_processing : false,
	
	/**
	 *  Variable containing the last timeout id.
	 */
	_timeoutId : null,

	/**
	 *	Set mode to persitent or not.
	 *	@param {Boolean} pers Persistent or not.
	 */
	persist : function(pers){
		this._persistent=pers;
	},
	
	/**
	 *	Displays a message in error style.
	 *	@param {String} message The message to display.
	 */
	error : function (message) {
		this._statusQueue.push({ message:message, type:"error", persistent:this._persistent});
		if(!this._processing)
			this._pullMessage();
	},

	/**
	 *	Displays a message in warning style.
	 *	@param {String} message The message to display.
	 */
	warning : function (message) {
		this._statusQueue.push({ message:message, type:"warning", persistent:this._persistent});
		if(!this._processing)
			this._pullMessage();
	},
	
	/**
	 *	Displays a message in success style.
	 *	@param {String} message The message to display.
	 */
	success : function (message) {
		this._statusQueue.push({ message:message, type:"success", persistent:this._persistent});
		if(!this._processing)
			this._pullMessage();
	},

	/**
	 *	Displays a message in info style.
	 *	@param {String} message The message to display.
	 */	
	info : function (message) {
		this._statusQueue.push({ message:message, type:"info", persistent:this._persistent});
		if(!this._processing)
			this._pullMessage();
	},

	/**
	 *	Pulls message, removes it from queue and displays it.
	 */
	_pullMessage : function(){

		var statusLabel=jQuery("#statusLabel",document);
		var statusImage=jQuery("#statusImage",document);
		statusLabel.removeAttr("value");
		statusImage.removeAttr("src");
		
		var msg =  this._statusQueue.shift();
		if(msg==null){
			this._processing=false;
			return;
		}else{
			this._processing=true
		}
		if(Firebug.getPref(Firebug.prefDomain,"scraperExtension.statusTimeout")==-1)
			msg.persist=true;
		else
			msg.persist=false;
		
		if(msg.type!=null){
			if(helpers.getImage(msg.type+"_10.png")!=null)
				statusImage.attr("src",helpers.getImage(msg.type+"_10.png"));
		}else if(msg.message!=null)
			statusImage.attr("src",helpers.getImage("message_10.png"));
		if(msg.message!=null)
			statusLabel.attr("value",msg.message);
		if(!msg.persist){
				this._timeoutId=window.setTimeout(
					function(){
						status._pullMessage();
					},
					Firebug.getPref(Firebug.prefDomain,"scraperExtension.statusTimeout"));
		}
			
	}

}