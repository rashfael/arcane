log4js = require('log4js')
logger = log4js.getLogger 'nav:magic'
logger.setLevel 'DEBUG'

Generic = require './Generic'
helpers = require './helpers'

magicLib = require '../../../../magic'

#### Magic
# Node which uses the magic library for the given site with selector or given html code. If no selectors are set, the
# whole site is used.
#
# Options:
#
# * **itemSelector**: uses parent.children to get lists
# * **customSelector**: uses user specified jQuery selector, if this is set, then the itemSelector isnt used
# * **encoding**: uses user specified encoding (optional)
# * **magic**: configuration for the magic library (optional)
module.exports = class Magic extends Generic

	process: (cb) =>
		@getWindow (err, window) =>
			if err
				logger.fatal 'Got broken window'
				if window
					window.close()
				cb err, null
				return null
			if not helpers.isEmpty @config.itemSelector
				selector = @config.itemSelector
			if not helpers.isEmpty @config.customSelector
				selector = @config.customSelector
			# if no selector is defined, then the whole document is used
			helpers.getElements window, selector, "", @config.encoding, (elements) =>
				if selector
					logger.info elements.length
					element = elements[0]
				else
					element = window.document
			
				if not element?
					window.close()
					cb "Selector returned nothing!", {data:{}}
					return null
  
				magic = new magicLib window # start of the magic library
  
				if not magic.checkEnvironment()
					logger.error 'Collector Error! No jQuery on given window!'
					window.close()
					cb new Error 'No jQuery on window object!', null
				if not element
					logger.fatal 'Element is null or undefined!'
					window.close()
					cb new Error 'Undefined Element'
				config = @config.magic or {}
				detected = magic.attributes.findAttributes(element, config) # detect elements with magic
				data = magicLib.cleanUp detected
				window.close()
				cb err, [data]
