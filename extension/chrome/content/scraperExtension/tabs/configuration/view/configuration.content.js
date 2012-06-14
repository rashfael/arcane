/**
 * Singleton which represents the part of the configurations tab that manages the contents of the browser, i.e. the websites.
 */
var configurationContent = {
	
	/**
	 * The current inspection strategy.
	 */
	_iStrategy : null,
	
	/**
	 * The current inspection strategy.
	 */
	_mode : 'null',
	
	/**
	 * Method to set the inspection strategy.
	 * @param {Function} strategy The strategy of the inspector. Strategy function gets and returns dom node.
	 */
	setIStrategy : function(strategy){
		this._iStrategy=strategy;
	},
	
	/**
	 * Invoked on inspect.
	 * @param {DOMNode} node The node which has been selected.
	 */
	onInspect : function(node){
		switch(configurationContent._mode) {
			case 'null':
				try {					
					var nodes = jQuery(this._iStrategy(node));
					var listConf = configurationData.getCurrentConfig().getListConfig();
					listConf.resetList();
					listConf.addDOMNode(nodes);
					listConf.selector = listConf.getSelector();
					Firebug.Inspector.toggleInspecting(Firebug.currentContext);
					configurationView.update();		
				} catch(e) {
					Components.utils.reportError(e.fileName + ":" + e.lineNumber + " - " + e.message);
					status.error(helpers.STR("strings_main","conf.cont.ff.insp.error"));
				}
				break;
			case 'customKey':			
				var listConf = configurationData.getCurrentConfig().getListConfig();
								
				var sel = new Selector(listConf);
				sel.addDOMNode(node);
								
				jQuery('#customSelectorInput', fbDocument).val(sel.getSelector().toString());
				jQuery('#customSelectorInput', fbDocument).trigger('change'); 
				configurationContent._mode = 'null';

				break;
			case 'formInput':
				
				var sel = new Selector();
				sel.addDOMNode(node);
				
				$('.fillFormSelectorField', fbDocument).val(sel.getSelector().toString());
				$('.fillFormSelectorField', fbDocument).change();
				configurationContent._mode = 'null';
				break;
			case 'subItem':
				var sel = new Selector();
				sel.addDOMNode($($('#siCustomSelectorInput', fbDocument).val(), content.document).toArray());
				sel.addDOMNode(node);
				jQuery('#siCustomSelectorInput', fbDocument).val(sel.getSelector().toString());
				jQuery('#siCustomSelectorInput', fbDocument).trigger('change');
				Firebug.Inspector.toggleInspecting(Firebug.currentContext);
				break;
		}		
	},
	
}
