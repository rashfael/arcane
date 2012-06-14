log4js = require('log4js')
logger = log4js.getLogger 'nav:walkLinks'
logger.setLevel 'DEBUG'

Generic = require './Generic'
helpers = require './helpers'

#### Walkthrough Links
# selector with hyperlinks in it, yields one request per hyperlink
#
# Options:
#
# * **areaSelector**: uses an area selector to get lists
# * **customSelector**: uses user specified jQuery selector, if this is set, then the areaSelector isnt used
# * **encoding**: uses user specified encoding (optional)
module.exports = class WalkthroughLinks extends Generic

	validateSettings: ->
		if not @config.areaSelector
			throw Error 'WalkthroughLinks needs an areaSelector!'

	process: (cb) =>
		@getWindow (err, window) =>
			if err
				window.close()
				cb err, null
				return
			type = "a"
			if not helpers.isEmpty @config.customSelector
				selector = @config.customSelector
				type = "a"
			else if not helpers.isEmpty @config.areaSelector
				selector = @config.areaSelector
				type = ""
			helpers.getElements window, selector, type, @config.encoding, (elements) =>
				if not elements
					logger.info "no elements found"
				out = []
				if @config.areaSelector and not @config.customSelector
					elements = elements.find('a')
				elements.each (i, el)=>
					out.push {
						request:
							url: el.href
						data:
							_breadcrumb: window.jQuery(el).text()
					}
					logger.info '-| Walkthrough Links|-', el.href
				logger.fatal 'Did not find any links! This is a probably a dead end.' if out.length is 0
				window.close()
				cb err, out
