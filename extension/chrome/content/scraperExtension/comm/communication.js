/**
 * Singleton for communication methods.
 */
var communication = {
		
	// The URL of the scraper
	url : null,
	
	// The username
	usrName : null,
	
	// The password
	pwd : null,
		
	// The current config
	config : null,
		
	// The parent
	parent : null,
	
	// The timeout 
	timeout : null,
	
	/**
	 * Opens up Dialog for the case of a request timeout.
	 */
	showTimeoutDialog : function(){
		var params ={
			title : helpers.STR("strings_main","comm.dialog.timeout.title"),
			description : helpers.STR("strings_main","comm.dialog.timeout.description"),
			reason : "timeout",
			image : "error-icon",
			details : helpers.STR("strings_main","comm.dialog.timeout.details")
		};
		parent.openDialog(helpers.getFile("dialogs/details.xul"), "","chrome,titlebar,toolbar,centerscreen,modal", params);
	},
	
	/**
	 * Updates the attributes of the communication object.
	 */
	updateAttrs : function(){
		this.url = Firebug.getPref(Firebug.prefDomain, "scraperExtension.scraperURL");
		this.usrName = Firebug.getPref(Firebug.prefDomain, "scraperExtension.usrName");
		this.pwd = Firebug.getPref(Firebug.prefDomain, "scraperExtension.pwd");
		this.timeout = Firebug.getPref(Firebug.prefDomain, "scraperExtension.timeout");
	},
	
	/**
	 *	Sends the current configuration to the scraper.
	 *  @param {String} project The name of the project the job belongs to.
	 *	@return {String} jobId The id of the job. 
	 */
	sendJob : function (project){
		
		var jobId;
		var timeoutId;
		var context=extensionPanel.context;
		if(context!=null){
			this.parent = context.chrome.window;
			this.updateAttrs();
			this.config = io.getConfig();
			this.config.project=project;
			this.config=JSON.stringify(this.config, null, 4);
		}else{
			throw new Error('No context available.');
			return;
		};

		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd, 
			type: 'POST',
			async: false,
			url: communication.url+"/api/jobs",
			data: communication.config,
			contentType: "application/json; charset=utf-8",
			beforeSend: function(jqXHR,settings){
				timeoutId=window.setTimeout(communication.showTimeoutDialog,communication.timeout);
			},
			success: function(event, XMLHttpRequest, ajaxOptions) {
				window.clearTimeout(timeoutId);
				var jobLink = communication.url;
				jobLink+="/jobs/"+event.id;
				
				var params ={
					title : helpers.STR("strings_main","comm.dialog.sent.title"),
					description :"",
					reason : helpers.STR("strings_main","comm.dialog.sent.description"),
					linkLabel : event.id,
					href : jobLink,
					image : "message-icon",
					details : JSON.stringify(event)
				};
				jobId=event.id;
				parent.openDialog(helpers.getFile("dialogs/details.xul"), "","chrome,titlebar,toolbar,centerscreen,modal", params);						
			},
			error : function(jqXHR, textStatus, errorThrown){
				window.clearTimeout(timeoutId);
				var params ={
					title : helpers.STR("strings_main","comm.dialog.sent.error.title"),
					description : helpers.STR("strings_main","comm.dialog.sent.error.description"),
					reason : errorThrown,
					image : "error-icon",
					details : JSON.parse(jqXHR.responseText).errorLong
				};
				parent.openDialog(helpers.getFile("dialogs/details.xul"), "","chrome,titlebar,toolbar,centerscreen,modal", params);
			}					
		});
		
		return jobId;
		
	},
	
	/**
	 *	Requests jobs from the scraper.
	 *  @param {Function} callback The callback which will be invoked after communication.
	 */
	requestJobs : function (callback){ 
		this.updateAttrs();
		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd,
			type: 'GET',
			url: communication.url+"/api/jobs",
			timeout: communication.timeout,
			success: function(jobs, XMLHttpRequest, ajaxOptions) {
				callback(jobs);
			},
			error : function(jqXHR, textStatus, errorThrown){

				if(errorThrown=="timeout"||errorThrown==null||errorThrown=="")
					status.error(helpers.STR("strings_main","comm.timeout.error"));
				else{
					var data=jQuery.parseJSON(jqXHR.responseText);
					if(typeof data =='object'){
						status.error(data.errorShort);
						Components.utils.reportError(data.errorLong);
					}
				}
				callback(null);
			}
		});
	
	},

	/**
	 *	Requests a detailed job from the scraper.
	 *	@param {String} id Identifies the job.
	 *	@return {Object} job A job in all its detail or null.
	 */
	requestJob : function (id,callback){
		
		this.updateAttrs();
		
		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd,
			type: 'GET',
			url: communication.url+"/api/jobs/"+id,
			timeout: communication.timeout,
			success: function(job, XMLHttpRequest, ajaxOptions) {
				callback(id,job);
			},
			error : function(jqXHR, textStatus, errorThrown){
				if(errorThrown=="timeout"||errorThrown==null||errorThrown=="")
					status.error(helpers.STR("strings_main","comm.timeout.error"));
				else{
					var data=jQuery.parseJSON(jqXHR.responseText);
					if(typeof data =='object'){
						status.error(data.errorShort);
						Components.utils.reportError(data.errorLong);
					}
				}
				callback(id,null);
			}					
		});
	
	},

	/**
	 *	Requests the version from the scraper.
	 *	@param {Function} callback The callback which will be invoked after communication.
	 */
	requestVersion : function (callback) {
	
		this.updateAttrs();
		
		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd,
			type: 'GET',
			url: communication.url+"/api/version",
			timeout: communication.timeout,
			success: function(versionObject, XMLHttpRequest, ajaxOptions) {				
				callback(versionObject);
			},
			error : function(jqXHR, textStatus, errorThrown){
				var data=jQuery.parseJSON(jqXHR.responseText);
				if(errorThrown=="timeout"||errorThrown==null||errorThrown=="")
					status.error(helpers.STR("strings_main","comm.timeout.error"));
				else{
					var data=jQuery.parseJSON(jqXHR.responseText);
					if(typeof data =='object'){
						status.error(data.errorShort);
						Components.utils.reportError(data.errorLong);
					}
				}
				callback(null);
			}
		});
	},
	
	/**
	 *	Starts the job inside the scraper.
	 *	@param {String} id Identifies the job.
	 *	@param {Function} callback The callback which will be invoked after communication.
	 */
	startJob : function (id, callback) {

		this.updateAttrs();
		var url=communication.url+"/api/jobs/"+id+"/start";
		
		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd,
			type: 'GET',
			url: url,
			timeout: communication.timeout,
			success: function(job, XMLHttpRequest, ajaxOptions) {
				status.success(id+" "+helpers.STR("strings_main","comm.job.started.success"));
				callback(job);
			},
			error : function(jqXHR, textStatus, errorThrown){
				if(errorThrown=="timeout"||errorThrown==null||errorThrown=="")
					status.error(helpers.STR("strings_main","comm.timeout.error"));
				else{
					var data=jQuery.parseJSON(jqXHR.responseText);
					if(typeof data =='object'){
						status.error(data.errorShort);
						Components.utils.reportError(data.errorLong);
					}
				}
			}					
		});
	},
	
	/**
	 *	Pauses the job inside the scraper.
	 *	@param {String} id Identifies the job.
	 *	@param {Function} callback The callback which will be invoked after communication.
	 */
	pauseJob : function (id, callback) {
		
		this.updateAttrs();
		
		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd, 
			type: 'GET',
			url: communication.url+"/api/jobs/"+id+"/pause",
			timeout: communication.timeout,
			success: function(job, XMLHttpRequest, ajaxOptions) {
				status.success(id+" "+helpers.STR("strings_main","comm.job.paused.success"));
				callback(job);
			},
			error : function(jqXHR, textStatus, errorThrown){
				if(errorThrown=="timeout"||errorThrown==null||errorThrown=="")
					status.error(helpers.STR("strings_main","comm.timeout.error"));
				else{
					var data=jQuery.parseJSON(jqXHR.responseText);
					if(typeof data =='object'){
						status.error(data.errorShort);
						Components.utils.reportError(data.errorLong);
					}
				}
			}					
		});
	},

	/**
	 *	Aborts the job inside the scraper.
	 *	@param {String} id Identifies the job.
	 *	@param {Function} callback The callback which will be invoked after communication.
	 */
	abortJob : function (id, callback) {
		
		this.updateAttrs();
		
		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd,
			type: 'GET',
			url: communication.url+"/api/jobs/"+id+"/abort",
			timeout: communication.timeout,
			success: function(job, XMLHttpRequest, ajaxOptions) {
				status.success(id+" "+helpers.STR("strings_main","comm.job.aborted.success"));
				callback(job);
			},
			error : function(jqXHR, textStatus, errorThrown){
				var data=JSON.parse(jqXHR.responseText);
				if(errorThrown=="timeout"||errorThrown==null||errorThrown=="")
					status.error(helpers.STR("strings_main","comm.timeout.error"));
				else{
					status.error(data.errorShort);
					Components.utils.reportError(data.errorLong);
				}
			}					
		});
	},
	
	/**
	 *	Deletes the job inside the scraper.
	 *	@param {String} id Identifies the job.
	 *  @param {Function} callback The callback which will be invoked after communication.
	 */
	deleteJob : function (id, callback) {
		
		this.updateAttrs();
		
		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd,
			type: 'POST',
			url: communication.url+"/api/jobs/"+id+"/delete",
			timeout: communication.timeout,
			success: function(obj, XMLHttpRequest, ajaxOptions) {
				status.success(id+" "+helpers.STR("strings_main","comm.job.deleted.success"));
				callback();
			},
			error : function(jqXHR, textStatus, errorThrown){
				if(errorThrown=="timeout"||errorThrown==null||errorThrown=="")
					status.error(helpers.STR("strings_main","comm.timeout.error"));
				else{
					var data=jQuery.parseJSON(jqXHR.responseText);
					if(typeof data =='object'){
						status.error(data.errorShort);
						Components.utils.reportError(data.errorLong);
					}
				}
			}					
		});
	},

	/**
	 *	Reinitializes the job inside the scraper.
	 *	@param {String} id Identifies the job.
	 *	@param {Function} callback The callback which will be invoked after communication.
	 */
	reinitializeJob : function (id,callback) {
		
		this.updateAttrs();
		
		this.requestJob(id,function(id,job){

			this.config=job.configuration;
			
			var jobId=communication.sendJob(job.project);
			
			communication.requestJob(jobId,callback);
		});
		

	},

	/**
	 *	Renames the job inside the scraper.
	 *	@param {String} id Identifies the job.
	 *  @param {String} name he name of the job.
	 * 	@param {Function} callback The callback which will be invoked after communication.
	 *	@return {Object} job A job in all its detail or null.
	 */
	renameJob : function (id,name,callback) {
		
		this.updateAttrs();
		
		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd,
			type: 'POST',
			url: communication.url+"/api/jobs/"+id,
			timeout: communication.timeout,
			data: {name:name},
			//contentType: "application/json",
			success: function(job, XMLHttpRequest, ajaxOptions) {
				status.success(id+" "+helpers.STR("strings_main","comm.job.renamed.success"));
				callback({id:id,name:name});
			},
			error : function(jqXHR, textStatus, errorThrown){
				if(errorThrown=="timeout"||errorThrown==null||errorThrown=="")
					status.error(helpers.STR("strings_main","comm.timeout.error"));
				else{
					var data=jQuery.parseJSON(jqXHR.responseText);
					if(typeof data =='object'){
						status.error(data.errorShort);
						Components.utils.reportError(data.errorLong);
					}
				}
			}					
		});
		
	},
	
	/**
	 *	Requests the projects from the scraper.
	 * 	@param {Function} callback The callback which will be invoked after communication.
	 */
	requestProjects : function (callback) {
		
		this.updateAttrs();
		
		jQuery.ajax({
			username : communication.usrName,
			password : communication.pwd,
			type: 'GET',
			url: communication.url+"/api/projects",
			timeout: communication.timeout,
			//contentType: "application/json",
			success: function(data, XMLHttpRequest, ajaxOptions) {
				callback(data);
			},
			error : function(jqXHR, textStatus, errorThrown){
				if(errorThrown=="timeout"||errorThrown==null||errorThrown=="")
					status.error(helpers.STR("strings_main","comm.timeout.error"));
				else{
					var data=jQuery.parseJSON(jqXHR.responseText);
					if(typeof data =='object'){
						status.error(data.errorShort);
						Components.utils.reportError(data.errorLong);
					}
				}
			}					
		});
		
	},
	
	
};
