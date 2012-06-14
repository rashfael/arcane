log4js = require('log4js')
logger = log4js.getLogger 'nav:walkItems'
logger.setLevel 'DEBUG'

Generic = require './Generic'
helpers = require './helpers'

#### WalkthroughItems
# returns sibling html fragments according to selector
#
# Options:
#
# * **itemSelector**: uses parent.children to get lists
# * **customSelector**: uses user specified jQuery selector, if this is set, then the itemSelector isnt used
# * **encoding**: uses user specified encoding (optional)
module.exports = class WalkthroughItems extends Generic

	validateSettings: =>
		throw Error "WalkthroughItems: Missing item or custom selector!" unless @config.customSelector? or @config.itemSelector?

	process: (cb) =>
		@validateSettings()
		@getWindow (err, window) =>
			if err
				window.close()
				logger.fatal "WalkthroughItems got error from window: " + err
				cb err, null
				return
			out = []
			items = []

			helpers.getElements window, @config.itemSelector, "", @config.encoding, (itemElements) =>
				helpers.getElements window, @config.customSelector, "", @config.encoding, (customElements) =>
					if itemElements
						logger.info "ItemSelector: " + itemElements.parent().children().length
						items = itemElements.parent().children()
					if customElements
						logger.info "CustomSelector: " + customElements.length
						items = customElements
    
					if items.length is 0
						logger.fatal 'WalkthroughItems selector returned no items!'
						logger.fatal "Selectors: #{@config.itemSelector}, #{@config.customSelector}"
					items.each (i, el)=>
						out.push {
							request:
								url: @request.url
							html: el.innerHTML
						}
					if out.length is 0
						logger.fatal 'HTML:'
						logger.fatal 'WalkthroughItems produced no results! Check your selectors. The HTML is above.'
						logger.fatal "itemSelector: '#{@config.itemSelector}'"
						logger.fatal "customSelector: '#{@config.customSelector}'"
					window.close()
					cb err, out
