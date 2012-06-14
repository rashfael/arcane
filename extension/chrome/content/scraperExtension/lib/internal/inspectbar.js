/**
 * inspectbar.js
 *
 * Provides the functionality to preview attributes and links, and navigate up and down if the wished node couldn't be selected directly.
 *
 * Example:
 * var bar = new InspectBar(content.document);
 * bar.showInspectBar(); 							it appears
 * bar.updateInspectBar(node, Fn, [sel1, sel2]); 	it shows attributes and so on
 * bar.closeInspectBar(); 							it disappears
 */
var InspectBar = (function() {

	/**
	 * Constructor. Initializes the inspect bar
	 * @param context		The current context which should be used to draw the inspect bar
	 */
	function InspectBar(context) {
	
		//Set context
		if (context == null) throw new Error("Context must be given!");
		this.context = context;
		
		//Initialize magic & magic-config
		var magicLib = require('./magic');
		this.magic = new magicLib(window);
		this.magicConfig = {};
		this.magicConfig.SimpleAttributes = {};
		this.magicConfig.SimpleAttributes.includeChildren = 0;
		this.magicConfig.ImageAltTags = {};
		this.magicConfig.ImageAltTags.keyGen = 'fancy';
		this.magicConfig.SimpleTable = {};
		this.magicConfig.SimpleTable.wurbl = 'durbl';
		this.magicConfig.CustomSelectors = {};
		this.magicConfig.CustomSelectors.selectors = [];				

		this.tempLinks = new Selector();
		this.navigationNode = new Selector();
	}
	
	/**
	 * Draws the inspect bar
	 */
	InspectBar.prototype.showInspectBar = function() {
		
		var context = this.context;
		var inspectBar = $('#inspect-sidebar', context).toArray();
		
		//If theres a inspect bar
		if(inspectBar.length < 1) {			
			
			//Draw the overlay
			var overlay = $('<div id="inspect-sidebar" class="wedex_inspectSideBar"></div>', context);
			overlay.height('97%');
			overlay.width(200);
			overlay.css('top','0px');
			overlay.css('right','0px');
			overlay.css("padding-top", 5);
			overlay.css("padding-right", 5);
			overlay.css("padding-bottom", 5);
			overlay.css("padding-left", 5);
			overlay.css("z-index", 99999);				
			overlay.css("position", "fixed");
			overlay.css("background-color", "lightgrey");
			overlay.css("overflow-y", "auto");
			overlay.css("overflow-x", "hidden");
			overlay.css('text-align', 'left');
			overlay.mouseout(function() {
				if($(this).hasClass('focused') == true && $(this).hasClass('navigation') == false) {
					$(this).removeClass('focused');
					Firebug.Inspector.toggleInspecting(Firebug.currentContext);
				}
			});
			overlay.mouseover(function() {
				if($(this).hasClass('focused') == false && $(this).hasClass('navigation') == false) {
					$(this).addClass('focused');
					Firebug.Inspector.toggleInspecting(Firebug.currentContext);
				}
			});
			
			$("body", context).append(overlay);
			
			//Draw the headline
			var headline = $('<div class="wedex_inspectSideBar">'+helpers.STR("strings_main","lib.inspbar.label")+'</div>', context);
			headline.css('color', '#6699CC');
			headline.css('font-size', '22px');
			headline.css('font-weight', 'bold');
			headline.css('font-family', 'tahoma, helvetica');
			$('#inspect-sidebar', context).append(headline).append($("<hr class='wedex_inspectSideBar'>", context));
			
			//Draw some toggles
			var checkboxes = $('<input class="wedex_inspectSideBar cbInput" type="checkbox" name="isb_config" value="Navigation" id="isb_nav-toggle" /><span class="cbSpan">'+helpers.STR("strings_main","lib.inspbar.nav.label")+'</span><br />' +
							   '<input class="wedex_inspectSideBar cbInput" type="checkbox" name="isb_config" value="Attributes" id="isb_attr-toggle"/><span class="cbSpan">'+helpers.STR("strings_main","lib.inspbar.att.label")+'</span><br />' +
							   '<input class="wedex_inspectSideBar cbInput" type="checkbox" name="isb_config" value="Links" id="isb_link-toggle"/><span class="cbSpan">'+helpers.STR("strings_main","lib.inspbar.lin.label")+'</span><br />' +
							   '<input class="wedex_inspectSideBar cbInput" type="checkbox" name="isb_config" value="Links" id="isb_sel-toggle"/><span class="cbSpan">'+helpers.STR("strings_main","lib.inspbar.sel.label")+'</span><br />', context);

			$('#inspect-sidebar', context).append(checkboxes).append($("<hr class='wedex_inspectSideBar'>", context));
						
			//Draw some navigation buttons
			var upButton = $('<button type="button"></button>', context);
			upButton.attr('name', 'Klickmich');
			upButton.attr('id', 'isb_up-button');
			upButton.css('width', '36px');
			upButton.addClass('wedex_inspectSideBar');
			upButton.html('<img src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAiFJREFUeNqMU0FrE0EUntmdJEs2q60Ry/aghGowWlCbQ0W8eOnFo6h4UvAnFPQXeAr9A16KCFXwIAh6kIII9eAlelBLClUKmoNaNLvZJbM7b8b3Ji300KU+eMy++eb73veGWX73wS/mOA7r/u0yjOOYFzB9dnAkmB/EbtUMmqwX9eaWbp+/0zjmV40xuojJOXe+/UzSxUcfuRXAw9dqbq3Tnmw3Vl7QzqiwbdVjycVzTnf+rI80Ewgp7eHOjYVgMgzh89HAmwKts4LO/NOGqr9aS+baLfEWBbgYDoeENWZPHXn95XsaeCUxoUDLIgdnTpZ+Lz+PpkEHGsMRUTSwgNJaIZEpMIaySCBHe8RREBorEMeRBUAbjaBBIUOHigQIJ04ORuMIjkiSdAwgOcs1yxWumIRmygDuI4XZeqcRJw6AGY8gZb5jzWiJ3kfYfpCqDJd9B0FRQxxsxKwAuhiPgAJRmqtBmuepBEVkzsekXSGqySlxcm0duMJ1PQvGI5VtxxKm6z7LoPAK6A4YcUgfABxRLtcsIHPqaiBKM1HzyvaV7CdQEq5HnM0ffyoSH5HwvEMWcB1HTNQq/c3+QADoyl423/M9EwYBce4/XF2VW++7/PDUPJtdWPl6/aoftFrsDd4jFNkXLnfX19mVZy+T+N3jmUs0OYnXT19euhk2b91j3D1x4D9oYKu/8aTTW1t8itU2CVQxA5qC/X+Qyxgz/SfAAJxqWKbBDnujAAAAAElFTkSuQmCC" width="24" height="24" alt="SELFHTML Logo">');
			upButton.attr('disabled', 'disabled');
						
			var downButton = $('<button type="button"></button>', context);
			downButton.attr('name', 'Klickmich');
			downButton.attr('id', 'isb_down-button');
			downButton.css('width', '36px');
			downButton.addClass('wedex_inspectSideBar');
			downButton.html('<img src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAihJREFUeNqMU89rE0EUfrM7WbdNN61Gq4U2pWKth6JR8eox/4DgTfSfENGL3oP/guBVwYOFQg2eVERBBKsWDRprrQ2larKb3ezs/PLNYpIiWdphHztv3ve+9703u+T8jRqYVS6UgRByCa2K7hzsvRpa6+u059XDOpToTPVyxTt4eiFXw6DKysQi1rtP/MKDJ0G1R1AKZXh2O9me2+iw1bUXYjQr2XVssTDl/V6c917fe9SpUKxkzs/dvVq+1m1rOHUiPyWVLg5LtrB0sxWLV/Vf+vixfOT7begReLOH8yO1z02YmXYZl4plKThScN2gyykWUUHg9wmIUEqwhAMGtAlmESBOJUJpgaAwjICin6ozSSwRwDFoAFkEB6jSBsMl4hkfEBhGLgBQvjKGQpBIK5HuQat/UvFFuJAgpTmy+i1YhlEoAjFXyo84RxVymAwmDLEySsG23V0tIEHECLQjLqJYmGRNcDZp1fRJHZIqRTDHlh1nbEAQxCKJmAUIwDZ0r/j/IrQZT8KVCRDXLfQJbLw74ThOe2dHT08csn4gxdBB5mzLnRjNja++V4tI0KBSylSBbVl0cpI8a2ySi/I7zGu9+9Md7GePAjx/aZfeinj9z8bKbfpz6Q4UKzfjb81W/szJ8S52v5x1hdQm9nqzNbLFPzzevH9lCY8CGm99LLbePPxyK/KfEuqO7fULahF3umsrX3HL0UIjzvw4npkD7H+ZvgO06K8AAwCY1mxp6gswAQAAAABJRU5ErkJggg==" width="24" height="24" alt="SELFHTML Logo">');
			downButton.attr('disabled', 'disabled');
						
			var readyButton = $('<input type="button" name="finishButton" value="OK"/>', context);
			readyButton.css('width', '36px');
			readyButton.css('height', '32px');
			readyButton.attr('disabled', 'disabled');			
			readyButton.attr('id', 'isb_ready-button');
			readyButton.addClass('wedex_inspectSideBar');
			
			$('#inspect-sidebar', context).append(upButton).append(downButton).append(readyButton).append($("<hr class='wedex_inspectSideBar'>", context));
			
			var typeLabel = $('<b style="position:relative;">'+helpers.STR("strings_main","lib.inspbar.type.label")+'</b><span id="isb_typeSpan" style="position:relative; left:3px"></span><br />', context);
			$('#inspect-sidebar', context).append(typeLabel).append($("<hr style='position:relative;' class='wedex_inspectSideBar'>", context));
			
			$('#inspect-sidebar', context).find('*').css({"vertical-align" : "middle", 'margin':'1px'});
			$('#inspect-sidebar', context).find('.cbInput').css({"position": "relative", "left": "2px"});
			$('#inspect-sidebar', context).find('.cbSpan').css({"position": "relative", "left": "4px"});
			$('#inspect-sidebar', context).find('hr').css({"position": "relative", "left": "0px", "margin-top": "3px"});
			$('#inspect-sidebar', context).find('span').css({'font-family':'tahoma, helvetica', 'font-size':'11px', 'color':'black'});
			$('#inspect-sidebar', context).find('b').css({'font-family':'tahoma, helvetica', 'font-size':'11px', 'color':'black'});
		}
	};
	
	/**
	 * Updates the inspect bar when a new node is given
	 * @param node 				The node in which attributes or links should be searched or which has to be marked.
	 * @param finishFn 			The callback Fn for the navigation ready button. If not null navigation is activated.
	 * @param childSelectors	The nodes which were visited. Used to navigate 'down'.
	 */
	InspectBar.prototype.updateInspectBar = function(node, finishFn, childSelectors) {
		
		var context = this.context;
		var tempLinks = this.tempLinks;
		var navigationNode = this.navigationNode;		
		var inspectBarObject = this;
		var inspectBar = $('#inspect-sidebar', context).toArray();		
		
		if(inspectBar.length > 0) {
		
			var childDepth = $('#isb_inputChildDepth', context).val();
			$('.isb_attribute', context).remove();
			$('.isb_childDepth', context).remove();
			$('.isb_link', context).remove();
			$('.isb_selector', context).remove();
			tempLinks.unmark();
						
			//Update type			
			if ($(node).parents('form').toArray().length > 0)
				$('#isb_typeSpan', context).html('Form - ' + $(node)[0].tagName);
			else 
				$('#isb_typeSpan', context).html($(node)[0].tagName);
			
			//Preview a selector of given node if corresponding checkbox is checked
			if($('#isb_sel-toggle', context).attr('checked')) {				
				var selectorLabel = $('<b style="position:relative;" class="isb_selector">Selector:</b>', context);
				var selectorSpan = $('<span>Test</span>', context);
				selectorSpan.attr('id', 'isb_selectorSpan');
				selectorSpan.attr('class', 'isb_selector');
				selectorSpan.css('position', 'relative');
				selectorSpan.css('left', '3px');
				var sel = new Selector();
				sel.addDOMNode(node);				
				selectorSpan.html(sel.getSelector().toString());
				$('#inspect-sidebar', context).append(selectorLabel).append(selectorSpan).append($("<br class='isb_selector' /><hr style='position:relative;' class='wedex_inspectSideBar isb_selector'>", context));
			}
			
			//Search for attributes in given node if corresponding toggle is checked
			if($('#isb_attr-toggle', context).attr('checked')) {
				
				//Initialize magic and some temp objects
				var magic = this.magic;
				var magicConfig = this.magicConfig;
				var mainSpan;
				var span;
				var data = this;
				
				if($('.isb_childDepth', context).toArray().length < 1) {
					var form = $('<div class="isb_childDepth wedex_inspectSideBar" style="position:relative;"/>', context);		
					
					var attributeLabel = $('<b>Include Children:</b>', context);
					var attributeInput = $('<input style="width: 20px; left: 5px; position: relative;">', context);
					if(isNaN(parseInt(childDepth)))
						childDepth = 0;
					$(attributeInput).val(childDepth);					
					attributeInput.attr('id', 'isb_inputChildDepth');
					
					form.append(attributeLabel);
					form.append(attributeInput);
					$('#inspect-sidebar', context).append(form);
				}
				this.magicConfig.SimpleAttributes.includeChildren = $('#isb_inputChildDepth', context).val();
				
				//Draw found attributes
				jQuery.each(magic.attributes.findAttributes(node, magicConfig), function(index, element) {
					if(element.key.length + element.value.length < 100) {
						
						mainSpan = $('<div class="isb_attribute wedex_inspectSideBar" style="position:relative; top:0px; margin:0px"></div>', context);
						
						span = $('<span class="wedex_inspectSideBar" style="margin:0px"></span>', context);
						span.css('position', 'relative');
						span.css('font-size', '8pt');
						span.css('font-family', 'arial, sans-serif');
						span.css('color', 'black');
						span.html(element.key);						
						$(mainSpan).append(span);
						
						span = $('<span class="wedex_inspectSideBar" style="margin:0px"></span>', context);
						span.css('position', 'relative');
						span.css('font-size', '8pt');
						span.css('font-family', 'arial, sans-serif');
						span.html("   " + element.value);
						span.css('color', 'red');
						$(mainSpan).append(span);
						
						$('#inspect-sidebar', context).append(mainSpan);
					}
				});				
			}
			
			//Search for links in given node if corresponding toggle is checked
			if ($('#isb_link-toggle', context).attr('checked')) {
				tempLinks = new Selector();
				$($(node).find('a')).each(function(index, element) {									
					tempLinks.addDOMNode(element);
				});
				tempLinks.mark();
			}
			
			//Update navigation logic if a finishFn is given
			if (finishFn != null) {

				//Update marks
				navigationNode.unmark();
				navigationNode = new Selector();
				navigationNode.addDOMNode(node);
				navigationNode.mark();				
				
				//Update side-bar mode and unregister all click events from all buttons
				$('#inspect-sidebar', context).addClass('navigation');
				$('#isb_up-button, #isb_down-button, #isb_ready-button', context).unbind( "click" );
				$('#isb_up-button, #isb_ready-button', context).removeAttr('disabled');
				if (childSelectors == null) {
					$('#isb_down-button', context).attr('disabled', 'disabled');
				} else if (childSelectors.length < 1){
					$('#isb_down-button', context).attr('disabled', 'disabled');
				} else {
					$('#isb_down-button', context).removeAttr('disabled');
				}
				
				//Register the click event from the up button
				$('#isb_up-button', context).click(function() {
					if (childSelectors == null) {
						childSelectors = [];
					}
					childSelectors.push(node);				
					inspectBarObject.updateInspectBar(jQuery(node, context).parent()[0], finishFn, childSelectors);
				});
				
				//Register the click event from the down button
				$('#isb_down-button', context).click(function() {
					var childSelector = childSelectors[childSelectors.length - 1];
					childSelectors = jQuery.grep(childSelectors, function(element, index){
						return element != childSelector;
					});
					inspectBarObject.updateInspectBar(childSelector, finishFn, childSelectors);
				});
				
				//Register the click event from the ready button
				$('#isb_ready-button', context).click(function() {
				
					navigationNode.unmark();
					
					$('#inspect-sidebar', context).removeClass('navigation');
					$('#isb_up-button, #isb_down-button, #isb_ready-button', context).attr('disabled', 'disabled');				
					finishFn(node);
				});				
			}
			
			//Set some css
			$('#inspect-sidebar', context).find('span').css({'font-family':'tahoma, helvetica', 'font-size':'11px'});
			$('#inspect-sidebar', context).find('b').css({'font-family':'tahoma, helvetica', 'font-size':'11px', 'color':'black'});
		}
		
		this.tempLinks = tempLinks;
		this.navigationNode = navigationNode;
	};
	
	/**
	 * Deletes the inspect bar
	 */
	InspectBar.prototype.closeInspectBar = function() {
		$('#inspect-sidebar', this.context).remove();
	};

	/**
	 * Returns the navigation "property"
	 * @return {boolean} True if inspect bar is in navigation mode, else false
	 */
	InspectBar.prototype.getNavigation = function() {
		if($('#isb_nav-toggle', this.context).attr('checked'))
			return true;
		else
			return false;		
	};
	
	/**
	 * Returns the focused "property"
	 * @return {boolean} True if inspect bar is focused, else false
	 */
	InspectBar.prototype.getFocused = function() {
		if($('#inspect-sidebar', this.context).hasClass('focused'))
			return true;
		else
			return false;
	};
	
	return InspectBar;
})();
