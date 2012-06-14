log4js = require('log4js')
logger = log4js.getLogger 'nav:generic'
logger.setLevel 'DEBUG'

util = require 'util'
jquery = require 'jquery'
assert = require 'assert'
jsdom = require 'jsdom'

require('jsdom').defaultDocumentFeatures = {
	FetchExternalResources : []
	ProcessExternalResources : false
	MutationEvents : false
	QuerySelector : false
}

#### Generic
# Parameters:
#
# * **html**: source of the page
# * **config**: magic configuration of this nav element
# * **request**: the request object which produced the html
module.exports = class Generic

	constructor: (@html, @config, @request, @input) ->
		throw Error 'GenericElement is missing args!' if not config
		logger.info '++ GenericElement (navigation)'
		logger.info ' + Request', @request
		logger.info ' + Config', @config
	
	#### getWindow
	# shortcut to execute js in a DOM created from the given HTML
	#
	# cb(errors, window)
	#
	# Window is populated with jQuery

	getWindow: (cb) =>
		reqUrl = @request.url
		assert.ok @html, 'HTML exists and this is right.'
		jsdom.env @html, [], (err, window) ->
			if err
				logger.fatal "Window creation failed wit #{err} HTML: " + @html
				cb err, null # fast exit if window creation fails hard
				return null
			# set url of document from request to allow resolving of relative hyperlinks
			window.document._URL = reqUrl
			# attach jQuery to the window
			jquery.create window
			assert.ok window.jQuery, 'Window has loaded jQuery'
			logger.debug "JSDOM: Created Window with jQuery #{window.jQuery.fn.jquery}!"
			cb err, window

	process: (cb) =>
		logger.debug '''============================
						Element Configuration:
						============================'''
		logger.debug 'CONFIG:', @config, 'REQ:', @request
		throw new Error "processing this element is not implemented yet: " + util.inspect @config, false, 4
