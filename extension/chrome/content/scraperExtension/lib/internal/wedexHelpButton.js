/**
 * Class which represents an help button.
 */
var WedexHelpButton = (function() {
	
	/**
	 * Creats a new WedexHelpButton and appends it to the parent defined
	 * @param {String} tooltip The tooltip/title of the button.
	 * @param {String} helpLink The link of the detailed help.
	 * @param {jqObject} parent The jQuery-Object the button will be appended to.
	 */
	function WedexHelpButton(tooltip,helpLink,parent) {
		var obj=this;
		this.parent=parent;
		this.tooltip=tooltip;
		this.helpLink=helpLink;
		this.button=new WedexImageButton(parent,helpers.getImage("question-small-white_16.png"),helpers.getImage("question-small-white_16.png"),
		function(){
			if(helpLink!=null){
				var url=Firebug.getPref(Firebug.prefDomain, "scraperExtension.scraperURL");
				helpers.openHelp(helpLink);
			}
		},tooltip);	
		
	};

	/**
	 * Returns the Button as jQuery-Object.
	 * @return {jqObject} The jQuery-Button.
	 */
	WedexHelpButton.prototype.getButton = function() {
		return this.button.getButton();
	};
	
	/**
	 * Disabled or enables the button.
	 * @param {Boolean} dis Disables the button if true, else enables it.
	 */	
	WedexHelpButton.prototype.disable = function(dis) {
		return this.button.disable(dis);
	};
	
	return WedexHelpButton;	
	
})();
