var WedexImageButton = (function() {
	
	/**
	 * Creats a new WedexImageButton and appends it to the parent defined
	 * @param {jqObject} parent The jQuery-Object the button will be appended to.
	 * @param {String} image A String representing the source of the image in enabled state.
	 * @param {String} disImage A String representing the source of the image in disabled state.
	 * @param {Function} action The function which is invoked on click.
	 * @param {String} tooltip The tooltip/title of the button.
	 */
	function WedexImageButton(parent, image, disImage, action, tooltip) {
		var obj=this;
		this.parent=parent;
		this.image=image;
		this.disImage=disImage;
		this.button=$('<input type="image"/>',parent);
		this.id=idGenerator.getID();
		this.tooltip=tooltip;
		this.button.attr("id",this.id);
		if(image!=null&&image.trim()!="")
			this.button.attr("src",image);
		
		if(tooltip!=null&&tooltip!="")
			this.button.attr("title",tooltip);
			
		this.button.click(function(){
			if (action!=null)
				action(obj)
		});
		
		this.button.hover(
			function(){
				helpers.hoverinHelper(obj.button);
				
			},
			function(){
				helpers.hoveroutHelper(obj.button);

			}
		);
		
		if(parent!=null)
			parent.append(this.button);
	};

	/**
	 * Returns the Button as jQuery-Object.
	 * @return {jqObject} The jQuery-Button.
	 */
	WedexImageButton.prototype.getButton = function() {
		return this.button;
	};
	
	/**
	 * Disabled or enables the button.
	 * @param {Boolean} dis Disables the button if true, else enables it.
	 */	
	WedexImageButton.prototype.disable = function(dis) {
		if(dis==true||dis==null){
			this.button.attr("src",this.disImage);
			this.button.attr("disabled","disabled");
			helpers.hoveroutHelper(this.button);
		}else{
			this.button.attr("src",this.image);
			this.button.removeAttr('disabled');
		}
	};
	
	return WedexImageButton;	
	
})();
