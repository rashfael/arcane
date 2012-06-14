/**
 *	Singleton for the jobs tab.
 */
var jobsView = {
	
	_jobs : [],
	
	_unrequestedJobs : null,
	
	_selectedProjectName : null,

	/**
	 *	The state of the view. Needed for restoring.
	 */
	state : {
	
		/**
		 *	Container for list of opened items.
		 */
		openedItems : {}
	},
	
	/**
	 * Method which is called when the project filter changes or the update button is pressed. Updates the jobs tab.
	 */
	filterChanged : function(){
		var projectCmbBx=browser.chrome.$("projectMenuList");
		this._selectedProjectName=projectCmbBx.selectedItem.label;
		this.update();
	},

	/**
	 *	Method to redraw the jobs tab.
	 */
	update : function(){
		
		//Remove all projects form menu list
		var projectCmbBx=browser.chrome.$("projectMenuList");
		var selectedIndex=0;
		projectCmbBx.removeAllItems();
		projectCmbBx.appendItem(helpers.STR("strings_main","jobs.projects.label"));
		projectCmbBx.selectedIndex=0;
		
		communication.requestProjects(function(projects){

			jQuery.each(projects,function(index){
				if(this==null)
					return;
				if(this.name==null)
					return;
				projectCmbBx.appendItem(this.name);
				if(this.name==jobsView._selectedProjectName)
					selectedIndex=index+1;
			});
			projectCmbBx.selectedIndex=selectedIndex;
			jobsView._selectedProjectName=projectCmbBx.selectedItem.label;
			
		});
		

		browser.chrome.$("jobRefreshBttn").disabled=true;

		//Remove all elements from panel
		this._getPanel().children().remove();

		//Render Item Header
		this._renderHeader();

		// Request jobs to render
		communication.requestJobs(this._drawJobs);

	},
	
	/**
	 * Draws the jobs.
	 * @param {[Object]} jobs The jobs. Each jo contains the most important jobt informations.
	 */
	_drawJobs : function(jobs){
		jobsView._unrequestedJobs = new Array();

		if(jobs==null||jQuery.isEmptyObject(jobs)==true)
			browser.chrome.$("jobRefreshBttn").disabled=false;
		else{			
			//Render all Job Items
			jQuery.each(jobs,function(index){
				if(this.project==jobsView._selectedProjectName||jobsView._selectedProjectName==helpers.STR("strings_main","jobs.projects.label")){
					
					if(this.archived==false)		
						jobsView._jobs.push(this);	
					jobsView._drawJob(this);
					
					if(this.archived==true)
						return;
					jobDetails.appendArea(this.id);
					
					//Request the detailed job informations for the details area.
					communication.requestJob(this.id,jobsView._drawDetails);
				}
	
				
			});
			
			browser.chrome.$("jobRefreshBttn").disabled=false;
		}

	},
	
	/**
	 * Draws a single job.
	 * @param {Object} job The most important information of one job.
	 */
	_drawJob : function(job){
		
		var finWork=job.finishedWorkers;
		var runWork=job.runningWorkers;
		
		//Check for undefined values
		if(finWork==null)
			finWork=0;
		if(runWork==null)
			runWork=0;		
			
		//Renders the item itself
		jobItem.render(job.id,job.name,job.state,job.project,finWork,runWork);
		
		jobItem.update(job);
		
	},
	
	/**
	 * Draws the details area of one job.
	 * @param {String} id The id of the job.
	 * @param {Object} job The most important information of one job.
	 */
	_drawDetails : function(id,job){
		if(job==null){
			jobsView._unrequestedJobs.push(id);
		}
	

		//Show Message if some jobs cant get requested
		if(jobsView._jobs.length==0){

			//Show info dialog if any job couldn't get requested.
			if(jobsView._unrequestedJobs.length!=0){
				var params ={
						title : helpers.STR("strings_main","jobs.dialog.unrequestedjobs.title"),
						description : helpers.STR("strings_main","jobs.dialog.unrequestedjobs.description"),
						reason : "",
						image : "alert-icon",
						details : helpers.STR("strings_main","jobs.dialog.unrequestedjobs.details")+jobsView._unrequestedJobs
					};
					extensionPanel.context.chrome.window.openDialog(helpers.getFile("dialog/dialog.details.xul"), "","chrome,titlebar,toolbar,centerscreen,modal", params);
			};

		}
		
		if(job==null){
			return;
		}
		
				
		//Remove object from _jobs
		jobsView._jobs=jQuery.grep(jobsView._jobs, function(obj,i){
			return obj.id != id;
		});	
		
		if(job.archived==true)
			return;
			
		var finWork=job.finishedWorkers;
		var runWork=job.runningWorkers;
		
		//Check for undefined values
		if(finWork==null)
			finWork=0;
		if(runWork==null)
			runWork=0;
			
		//Renders the items details area 
		jobDetails.render(id,job.submitted,job.started,job.stopped,job.finished,finWork,runWork);

		//Restore state of the job detailsarea
		if(typeof jobsView.state.openedItems[id]!='undefined')
			jobDetails.toggle(id);
	},
	
	/**
	 *	Renders the header of the list of jobs.
	 */
	_renderHeader : function(){
		
		var jobItemHeader='<div id="jobItemHeader">';
		jobItemHeader+='<div class="jobNameColumn">';
		jobItemHeader+='<p class="jobName">'+helpers.STR("strings_main","jobs.header.name")+'</p>';
		jobItemHeader+='</div>';
		
		jobItemHeader+='<div class="jobStateColumn">';
		jobItemHeader+='<p class="jobState">'+helpers.STR("strings_main","jobs.header.state")+'</p>';
		jobItemHeader+='</div>';
		
		jobItemHeader+='<div class="jobProjectColumn">';
		jobItemHeader+='<p class="jobProject">'+helpers.STR("strings_main","jobs.header.project")+'</p>';
		jobItemHeader+='</div>';
		
		jobItemHeader+='<div class="jobProgressColumn"/>';
		
		jobItemHeader+='<div class="jobControlBttns">';
		jobItemHeader+='</div>';
		
		jobItemHeader+='</div>';
		this._getPanel().append(jobItemHeader);
	},
	
	/**
	 *	Restores the state of the items before updating.
	 */
	_restoreState : function(){
		
		if(jQuery.isEmptyObject(jobsView.state))
			return;
		
		jQuery.each(jobsView.state.openedItems,
			function(){
				jobDetails.toggle(this);
			}
		);
	},
	
	/**
	 *	Returns the jobs panel.
	 */
	_getPanel : function() {
		return jQuery("#jobs", fbDocument);
	}

}

/**
 *	Singleton 'class' for job items.
 */
var jobItem = {
	
	/**
	 *	Renders the job item with the passed attributes.
	 *	@param {String} id The job id.
	 *	@param {String} name The name of the job.
	 *	@param {String} state The state of the job.
	 *  @param {String} project The project name of the job.
	 *	@param {Integer} finWork The number of finished workers.
	 *	@param {Integer} runningWork The number of running workers. 
	 */
	render : function(id,name,state,project,finWork,runningWork){
		
		var currentItem=jQuery('<div class="jobItem" id="'+"jobItem"+id+'"/>',fbDocument);
		jobsView._getPanel().append(currentItem);
		
		this._appendNameEntry(id,currentItem,name);
		
		this._appendStateEntry(id,currentItem,state);
		
		this._appendProjectEntry(id,currentItem,project);
		
		this._appendProgBarEntry(id,currentItem,finWork,runningWork);
		
		this._appendControlEntry(id,currentItem);
		
		this._appendDetailsEntry(id,currentItem);

	},
	
	/**
	 *	Creates and appends the name entry to the passed job item.
	 *	@param {String} id The job id.
	 *	@param {JQObject} currentItem The job item to append the entry to.
	 *	@param {String} name The name of the job. 
	 */
	_appendNameEntry : function(id,currentItem,name){
		if(name==null)
			name=id;
		var url = Firebug.getPref(Firebug.prefDomain, "scraperExtension.scraperURL");
		url+="/jobs/"+id;
		var nameDiv='<div class="jobNameColumn">';
		nameDiv+='<p class="jobName"><a id="name'+id+'">'+helpers.ensureStringLength(name,20)+'</a></p>';
		nameDiv+='</div>';
		
		var jqNameDiv = jQuery(nameDiv,fbDocument);
		
		var nameBttn ='<button class="jobBttn" title="'+helpers.STR("strings_main","jobs.button.rename.tooltip")+'">';
		nameBttn+='<img class="jobEditNameImage" src="'+helpers.getImage("pencil_16.png")+'"/>';
		nameBttn+='</button>';
		
		var jqNameBttn = jQuery(nameBttn,fbDocument);
		jqNameBttn.click(
			function(){
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				var io ={value : ""}
				var confirmed = prompts.prompt(null, helpers.STR("strings_main","jobs.dialog.rename.title"), helpers.STRF("strings_main","jobs.dialog.rename.description",[name]), io, null, {});
				
				if(confirmed == true) {
					communication.renameJob(id,io.value,jobItem._updateName);
				}
				
			}
		);
		jqNameBttn.hover(
			function(){
				helpers.hoverinHelper(jqNameBttn);
				
			},
			function(){
				helpers.hoveroutHelper(jqNameBttn);

			}
		);
		
		currentItem.append(jqNameDiv);
		
		jqNameDiv.append(jqNameBttn);
		
		jQuery("#name"+id,fbDocument).click(function(){
			window.open(url);
		});
		
	},

	/**
	 *	Creates and appends the state entry to the passed job item.
	 * 	@param {String} id The job id.
	 *	@param {JQObject} currentItem The job item to append the entry to.
	 *	@param {String} state The state of the job.
	 */	
	_appendStateEntry : function(id,currentItem,state){
		var item='<div class="jobStateColumn">';
		item+='<p class="jobState" id="'+"state"+id+'">'+state+'</p>';
		item+='</div>';
		
		var htmlEl=jQuery(item,fbDocument);
		currentItem.append(htmlEl);
	},

	/**
	 *	Creates and appends the project entry to the passed job item.
	 *  @param {String} id The job id.
	 *	@param {JQObject} currentItem The job item to append the entry to.
	 *	@param {String} project The name of the project the job belongs to.
	 */	
	_appendProjectEntry : function(id,currentItem,project){
		var item='<div class="jobProjectColumn">';
		item+='<p class="jobProject" id="project'+id+'">'+project+'</p>';
		item+='</div>';
		
		var htmlEl=jQuery(item,fbDocument);
		currentItem.append(htmlEl);
	},
	
	/**
	 *	Creates and appends the progress bar entry to the passed job item.
	 *	@param {String} id The job id.
	 *	@param {JQObject} currentItem The job item to append the entry to.
	 *	@param {Integer} finWork The number of finished workers.
	 *	@param {Integer} runningWork The number of running workers. 
	 */		
	_appendProgBarEntry : function(id,currentItem,finWork,runningWork){

		var item='<div class="jobProgressColumn"/>';

		
		var htmlEl=jQuery(item,fbDocument);
		currentItem.append(htmlEl);

	},

	/**
	 *	Creates and appends the control entry to the passed job item.
	 *	@param {String} id The job id.
	 *	@param {JQObject} currentItem The job item to append the entry to.
	 */		
	_appendControlEntry : function(id,currentItem){
		var item='<div class="jobControlColumn" id="'+"controlEntry"+id+'"/>';
		
		var htmlEl=jQuery(item,fbDocument);
		currentItem.append(htmlEl);
		
		this._appendControlBttn("start"+id,htmlEl,helpers.getImage("play_16.png"),helpers.STR("strings_main","jobs.button.start.tooltip")).click(
			function(){
				communication.startJob(id,
					function(job){
						if(job!=null){
							jobItem.update(job.status);
							jobDetails.update(job.status);
						}
					}
				);
				
			}
		);
		
		this._appendControlBttn("pause"+id,htmlEl,helpers.getImage("pause_16.png"),helpers.STR("strings_main","jobs.button.pause.tooltip")).click(
			function(){
				communication.pauseJob(id,
					function(job){
						if(job!=null){
							jobItem.update(job.status);
							jobDetails.update(job.status);
						}
					}
				);
			}
		);
		
		this._appendControlBttn("abort"+id,htmlEl,helpers.getImage("stop_16.png"),helpers.STR("strings_main","jobs.button.stop.tooltip")).click(
			function(){
				communication.abortJob(id,
					function(job){
						if(job!=null){
							jobItem.update(job.status);
							jobDetails.update(job.status);
						}
					}
				);
			}
		);
		
		this._appendControlBttn("reinitialize"+id,htmlEl,helpers.getImage("restart_16.png"),helpers.STR("strings_main","jobs.button.reinitialize.tooltip")).click(
			function(){
				communication.reinitializeJob(id, function(id,job){
					if(job==null)
						return;
						
					var finWork=job.finishedWorkers;
					var runWork=job.runningWorkers;
					
					//Check for undefined values
					if(finWork==null)
						finWork=0;
					if(runWork==null)
						runWork=0;
						
					//Renders the item itself
					jobItem.render(id,job.name,job.state,job.project,finWork,runWork+finWork);
					
					jobDetails.appendArea(id);
					
					//Renders the items details area 
					jobDetails.render(id,job.submitted,job.started,job.stopped,job.finished,finWork,runWork+finWork);
					
					jobItem.update(job);
					jobDetails.update(job);
				});
				
			}
		);
		
		this._appendControlBttn("download"+id,htmlEl,helpers.getImage("drive-download_16.png"),helpers.STR("strings_main","jobs.button.download.tooltip")).click(
			function(){
				communication.requestJob(id,
					function(id,job){
						var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
						var confirmed = prompts.confirm(null, helpers.STR("strings_main","jobs.dialog.download.title"), helpers.STR("strings_main","jobs.dialog.download.description"));
						if(confirmed==true){
							wedexDebug.nav.logObj("config",job);
							io.loadConfig(JSON.parse(job.configuration));
							status.success("Job configuration loaded.");
						}
					});
			}
		);
		
		this._appendControlBttn("delete"+id,htmlEl,helpers.getImage("cross-button_16.png"),helpers.STR("strings_main","jobs.button.delete.tooltip")).click(
			function(){
				communication.deleteJob(id, function(){
					jobItem.remove(id);
					jobDetails.remove(id);
					delete jobsView.state.openedItems[id];	
				});
				
			}
		);
		
	},
	
	/**
	 *	Creates and appends a control button to the passed parent.
	 *	@param {JQObject} parent The parent to append the button to.
	 *	@param {String} image The path to the source of the image.
	 *  @param {String} tooltip The tooltip of the button.
	 *	@return {JQObject} jqBttn The button.
	 */	
	_appendControlBttn : function (cntrlId,parent,image,tooltip){
		var bttn='<button class="jobControlBttn" id="'+cntrlId+'" title="'+tooltip+'">';
		bttn+='<img class="jobImage" src="'+image+'" id="'+cntrlId+'Image" title="'+tooltip+'"/>';
		bttn+='</button>';
		
		var jqBttn=jQuery(bttn,fbDocument);
		jqBttn.hover(
			function(){
				helpers.hoverinHelper(jqBttn);
				
			},
			function(){
				helpers.hoveroutHelper(jqBttn);

			}
		);
		parent.append(jqBttn);
		
		return jqBttn;
		
	},

	/**
	 *	Creates and appends the details entry to the passed job item.
	 *	@param {String} id The job id.
	 *	@param {JQObject} currentItem The job item to append the entry to.
	 */
	_appendDetailsEntry : function(id,currentItem){
		var item='<button class="jobDetailsBttn" id="'+"detailsBttn"+id+'" title="'+helpers.STR("strings_main","jobs.button.expand.tooltip")+'">';
		item+='<img class="jobImage" id="'+"detailsImage"+id+'" src="'+helpers.getImage("plus_16.png")+'"/>';
		item+='</button>';
		
		var htmlEl=jQuery(item,fbDocument);
		htmlEl.click(
			function(){
				jobDetails.toggle(id);
			}
		);
		currentItem.append(htmlEl);
	},
	
	/**
	 *	Updates the start button identified by its id.
	 *	@param {Object} stat The status of the job the button belongs to.
	 */
	_updateStartBttn : function(stat){
		
		var cntrlId="start"+stat.id;
		if(stat._id!=null)
			cntrlId="start"+stat._id;
			
		var bttn=jQuery("#"+cntrlId,fbDocument);
		var img=jQuery("#"+cntrlId+"Image",fbDocument);

		if(stat.state=="running"||stat.state=="finished"||stat.archived==true){
			bttn.attr('disabled','disabled');
			img.attr('src',helpers.getImage("play_dis_16.png"));
			helpers.hoveroutHelper(bttn);
			return;
		}
		img.attr('src',helpers.getImage("play_16.png"));
		bttn.removeAttr('disabled');
	},
	
	/**
	 *	Updates the pause button identified by its id.
	 *	@param {Object} stat The status of the job the button belongs to.
	 */
	_updatePauseBttn : function(stat){
		var cntrlId="pause"+stat.id;
		if(stat._id!=null)
			cntrlId="pause"+stat._id;
		var bttn=jQuery("#"+cntrlId,fbDocument);
		var img=jQuery("#"+cntrlId+"Image",fbDocument);
		
		if(stat.state!="running"||stat.archived==true){
			bttn.attr('disabled','disabled');
			img.attr('src',helpers.getImage("pause_dis_16.png"));
			helpers.hoveroutHelper(bttn);
			return;
		}
		img.attr('src',helpers.getImage("pause_16.png"));
		bttn.removeAttr('disabled');
	},
	
	/**
	 *	Updates the abort button identified by its id.
	 *	@param {Object} stat The status of the job the button belongs to.
	 */
	_updateAbortBttn : function(stat){
		var cntrlId="abort"+stat.id;
		if(stat._id!=null)
			cntrlId="abort"+stat._id;
		var bttn=jQuery("#"+cntrlId,fbDocument);
		var img=jQuery("#"+cntrlId+"Image",fbDocument);
		
		if(stat.state!="running"&&stat.state!="paused"||stat.archived==true){
			bttn.attr('disabled','disabled');
			img.attr('src',helpers.getImage("stop_dis_16.png"));
			helpers.hoveroutHelper(bttn);
			return;
		}
		img.attr('src',helpers.getImage("stop_16.png"));
		bttn.removeAttr('disabled');
	},
	
	/**
	 *	Updates the delete button identified by its id.
	 *	@param {Object} stat The status of the job the button belongs to.
	 */
	_updateDeleteBttn : function(stat){
		var cntrlId="delete"+stat.id;
		if(stat._id!=null)
			cntrlId="delete"+stat._id;
		var bttn=jQuery("#"+cntrlId,fbDocument);
		var img=jQuery("#"+cntrlId+"Image",fbDocument);
		
		if(stat.state=="running"){
			bttn.attr('disabled','disabled');
			img.attr('src',helpers.getImage("cross-button_dis_16.png"));
			helpers.hoveroutHelper(bttn);
			return;
		}
		img.attr('src',helpers.getImage("cross-button_16.png"));
		bttn.removeAttr('disabled');
	},

	/**
	 *	Updates the state label identified by its id.
	 *	@param {Object} stat The status of the job the button belongs to.
	 */
	_updateState : function(stat){
		var cntrlId="state"+stat.id;
		if(stat._id!=null)
			cntrlId="state"+stat._id;
		var label=jQuery("#"+cntrlId,fbDocument);

		label.text(stat.state);

	},
	
	/**
	 *	Updates the name label identified by its id.
	 *	@param {Object} stat The status of the job the button belongs to.
	 */
	_updateName : function(stat){
		var cntrlId="name"+stat.id;
		if(stat._id!=null)
			cntrlId="name"+stat._id;
		var link=jQuery("#"+cntrlId,fbDocument);
		var value=helpers.ensureStringLength(stat.name,20);

		link.text(value);

	},
	
	/**
	 *	Updates the project label identified by its id.
	 *	@param {Object} stat The status of the job the button belongs to.
	 */
	_updateProject : function(stat){
		var cntrlId="project"+stat.id;
		if(stat._id!=null)
			cntrlId="project"+stat._id;
		var label=jQuery("#"+cntrlId,fbDocument);

		label.text(stat.project);

	},
	
	/**
	 *	Updates the details button identified its id.
	 *	@param {Object} stat The status of the job the button belongs to.
	 */
	_updateDetailsBttn: function(stat){
		var cntrlId="detailsBttn"+stat.id;
		if(stat._id!=null)
			cntrlId="detailsBttn"+stat._id;
		var bttn=jQuery("#"+cntrlId,fbDocument);
		if(stat.archived==true){
			bttn.remove();
		}

	},
	
	/**
	 *	Updates the controls inside the job item.
	 * 	@param {Object} stat The status of the job.
	 */
	update : function(stat){
		this._updateStartBttn(stat);
		this._updatePauseBttn(stat);
		this._updateAbortBttn(stat);
		this._updateState(stat);
		this._updateName(stat);
		this._updateProject(stat);
		this._updateDetailsBttn(stat);
		this._updateDeleteBttn(stat);
	},
	
	/**
	 *	Removes the job item identified by its id.
	 * 	@param {String} id The id of the job.
	 */
	remove : function(id){
		var jobId="jobItem"+id;
		jQuery('#'+jobId,fbDocument).remove();
	}
}

/**
 *	Singleton 'class' for job details.
 */
var jobDetails = {
	
	/**
	 * Append the details area to the concerning job item identified by the job id.
	 */
	appendArea : function(id){
		var detailsArea='<div class="jobDetailsArea" id="'+"detailsArea"+id+'"/>';
		
		var htmlEl=jQuery(detailsArea,fbDocument);
		jobsView._getPanel().append(htmlEl);
	},
	
	/**
	 *	Renders the details area of the job with the passed attributes.
	 *	@param {String} id The job id.
	 *	@param {String} submitted The date when the job was submitted.
	 *	@param {String} started The start date of the job. Can be null.
	 *	@param {String} stopped The date when the job was stopped. Can be null.
	 *	@param {String} finished The end date of the job. Can be null.
	 *	@param {Integer} finishedWorkers The number of finished workers.
	 *	@param {Integer} runningWorkers The number of running workers. 
	 */
	render : function(id,submitted,started,stopped,finished,finishedWorkers,runningWorkers){
		
		var submitDate="-";
		var startDate="-";
		var stopDate="-";
		var endDate="-";
		
		if(typeof submitted!="undefined")
			submitDate=new Date(Date.parse(submitted)).toLocaleString();
			
		if(typeof started!="undefined")
			startDate=new Date(Date.parse(started)).toLocaleString();
		
		if(typeof stopped!="undefined")
			stopDate=new Date(Date.parse(stopped)).toLocaleString();
			
		if(typeof finished!="undefined")
			endDate=new Date(Date.parse(finished)).toLocaleString();
		
		var firstRow=this._appendRow(id);
		
		var submitDateP =jQuery('<p id="submitDate'+id+'">'+helpers.STR("strings_main","jobs.details.submitted")+submitDate+'</p>',fbDocument);
		submitDateP.addClass('jobFirstDetailsColumn');
		firstRow.append(submitDateP);	

		var workedItemsP =jQuery('<p id="finishedWorkers'+id+'">'+helpers.STR("strings_main","jobs.details.finwork")+finishedWorkers+'</p>',fbDocument);
		workedItemsP.addClass('jobSecondDetailsColumn');
		firstRow.append(workedItemsP);
		
		var secondRow=this._appendRow(id);
		
		var startDateP =jQuery('<p id="startDate'+id+'">'+helpers.STR("strings_main","jobs.details.started")+startDate+'</p>',fbDocument);
		startDateP.addClass('jobFirstDetailsColumn');
		secondRow.append(startDateP);	

		var runningWorkersP =jQuery('<p id="runningWorkers'+id+'">'+helpers.STR("strings_main","jobs.details.totalwork")+runningWorkers+'</p>',fbDocument);
		runningWorkersP.addClass('jobSecondDetailsColumn');
		secondRow.append(runningWorkersP);
				
		var thirdRow=this._appendRow(id);
		
		var stopDateP =jQuery('<p id="stopDate'+id+'">'+helpers.STR("strings_main","jobs.details.stopped")+stopDate+'</p>',fbDocument);
		stopDateP.addClass('jobFirstDetailsColumn');
		thirdRow.append(stopDateP);
		
		var fourthRow=this._appendRow(id);
		
		var endDateP =jQuery('<p id="endDate'+id+'">'+helpers.STR("strings_main","jobs.details.finished")+endDate+'</p>',fbDocument);
		endDateP.addClass('jobFirstDetailsColumn');
		fourthRow.append(endDateP);
	},
	
	/**
	 *	Shows/Hides the details area of the job with the passed id and toggles the image of the corrsepondign details button.
	 *	@param {String} id The id of the job.
	 */
	toggle : function(id){
		var area=this._getDetailsArea(id);
		var bttn=jQuery("#"+"detailsImage"+id,fbDocument);
		
		if(area.css('display')=='block'){
			area.css('display','none');
			bttn.attr('src', helpers.getImage('plus_16.png'));
			delete jobsView.state.openedItems[id];
		}else{
			area.css('display','block');
			bttn.attr('src', helpers.getImage('minus_16.png'));
			jobsView.state.openedItems[id]=id;
		}
	},
	
	/**
	 *	Creates and appends a row to the details area.
	 *	@param {String} id The id of the job.
	 *	@return {JQObject} jqRow The appended row.
	 */
	_appendRow : function(id){
		var row='<div class="jobDetailsRow" />';
		
		var jqRow=jQuery(row,fbDocument);
		this._getDetailsArea(id).append(jqRow);
		
		return jqRow;
	},
	
	/**
	 *	Returns the details area belonging to the job with the given id.
	 *	@param {String} id The job id.
	 *	@return {JQObject} The details area.
	 */
	_getDetailsArea : function(id){
		return jQuery("#"+"detailsArea"+id, fbDocument);
	},
	
	/**
	 *	Updates the start date label identified by its id.
	 *	@param {Object} status The status of the job the button belongs to.
	 */
	_updateStartDate : function(stat){
		if(stat.started==null)
			return;
		var cntrlId="startDate"+stat.id;
		var label=jQuery("#"+cntrlId,fbDocument);
		
		label.text(stat.started);
	},

	/**
	 *	Updates the end date label identified by its id.
	 *	@param {Object} status The status of the job the button belongs to.
	 */
	_updateEndDate : function(stat){
		if(stat.finished==null)
			return;
		var cntrlId="endDate"+stat.id;
		var label=jQuery("#"+cntrlId,fbDocument);

		label.text(stat.finished);

	},
	
	/**
	 *	Updates the finished workers label identified by its id.
	 *	@param {Object} status The status of the job the button belongs to.
	 */
	_updateFinishedWorkers : function(stat){
		if(stat.finishedWorkers==null)
			return;
		var cntrlId="finishedWorkers"+stat.id;
		var label=jQuery("#"+cntrlId,fbDocument);
		var finWork=stat.finishedWorkers;
		if(finWork==null)
			finWork=0;
		label.text(finWork);

	},
	
	/**
	 *	Updates the project label identified by its id.
	 *	@param {Object} status The status of the job the button belongs to.
	 */
	_updateRunWorkers : function(stat){
		if(stat.runningWorkers==null)
			return;
		var cntrlId="runningWorkers"+stat.id;
		var label=jQuery("#"+cntrlId,fbDocument);

		var runWork=stat.runningWorkers;

		if(runWork==null)
			runWork=0;
		label.text(runWork);

	},
	
	/**
	 * Updates the details area of the job identified by its id.
	 *	@param {Object} status The status of the job the details area belongs to.
	 */
	update : function(stat){
		this._updateStartDate(stat);
		this._updateEndDate(stat);
		this._updateFinishedWorkers(stat);
		this._updateRunWorkers(stat);
	},
	
	/**
	 *	Removes the details area identified by its id.
	 * 	@param {String} id The id of the job.
	 */
	remove : function(id){
		var jobId="detailsArea"+id;
		jQuery('#'+jobId,fbDocument).remove();
	}
}
