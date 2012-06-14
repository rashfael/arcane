log4js = require('log4js')
logger = log4js.getLogger 'navigation'
logger.setLevel 'DEBUG'

# Contains different NavigationElements
util = require 'util'
jquery = require 'jquery'
assert = require 'assert'
jsdom = require 'jsdom'
request = require 'request'
encoder = require '../encoder'

#### getElements
# Returns an Array of items from jQuery choosen by the given selector.
#
# Parameters:
#
# * **window**: window of the current site, is used for the selector
# * **selector**: selector of the element or elements
# * **elementType**: if the elements should have a special type (for example a), empty string for a types
# * **configEncoding**: specified encoding for the site
module.exports.getElements = (window, selector, elementType, configEncoding, cb) ->
	if selector
		if selector.constructor is Array # if an selector is an array with more than one element, then the searched elements are in an iFrame
			if selector.length > 1
				src = window.jQuery(selector[0])[0].getAttribute 'src'
				if src.indexOf("http://") isnt 0
					logger.info "src is not absolute: " + src
					url = window.document._URL
					logger.info url.indexOf('/', url.indexOf('//') + 2)
					logger.info url.slice(0, url.indexOf('/', url.indexOf('//') + 2))
					url = url.slice(0, url.indexOf('/', url.indexOf('//') + 2))
					src = url + src
					logger.info "new src: " + src

				src.encoding = 'binary'
				request src, (err, res, body) =>
					# Transform encoding if necessary
					if configEncoding?
						encoding = configEncoding.toLowerCase()
						logger.info "using manual encoding: " + task.encoding
					else if res.headers['content-type']?
						# Hint: res.headers['content-type'] should be something
						# like "text/html;charset=ISO-8859-1"
						parts = res.headers['content-type'].split '='
						if parts.length > 1
							encoding = parts[parts.length - 1].toLowerCase()
					body = encoder.toUtf8 body, encoding

					throw err if err
					jsdom.env body, [], (err, window) ->
						if err
							logger.fatal "Window creation failed wit #{err} HTML: " + @html
							cb err, null # fast exit if window creation fails hard
							return null
						# set url of document from request to allow resolving of relative hyperlinks
						window.document._URL = src
						# attach jQuery to the window
						jquery.create window
						assert.ok window.jQuery, 'Window has loaded jQuery'
						logger.debug "JSDOM: Created Window with jQuery #{window.jQuery.fn.jquery}!"					
						getElements window, selector.slice(1, selector.length), elementType, configEncoding, (elements) ->
							window.close()
							cb elements
			else
				elements = getjQueryElements window, selector[0], elementType
				cb elements
		else
			cb getjQueryElements window, selector, elementType
	else
		cb null
		
	
#### getjQueryElements
# Searchs for elements of the given type. First in the given selector, then in the children and then
# in the parents and parents parents and so on.
#
# Parameters:
#
# * **window**: window of the current site
# * **selector**: selector for the elements
# * **elementType**: if the elements should have a special type (for example a), empty string for a types
getjQueryElements = (window, selector, elementType) ->
	type = elementType #.toLowerCase()
	elements = createElementsFromSelector window, selector
	if elements.length is 0
		logger.info "Cant find an element with the selector"
		elements
	else
		if type is ""
			elements
		else
			newElements = elements
			if not elementsFromType(newElements, type) and elements.length > 0
				logger.info "using type"
				newElements = elements.find(type)
			if not elementsFromType(newElements, type) and elements.length > 0
				logger.info "using parent and type"
				newElements = elements.parent()
				while newElements.find(type).length is 0 and newElements[0].nodeName.toUpperCase() isnt 'HTML'
					newElements = newElements.parent()
				newElements = newElements.find(type)
			logger.info "Elements found: " + newElements.length
			newElements

#### elementsFromType
# Checks if the elements are from the given type
#
# Parameters:
#
# * **elements**: list of elements
# * **type**: wanted type of the elements
elementsFromType = (elements, type) ->
	return false if elements.length == 0
	for el in elements
		return false if el.nodeName.toLowerCase() isnt type
	return true

#### isEmpty
# Checks if a selector is empty
#
# Parameters:
#
# * **selector**: selector which is to prove
module.exports.isEmpty = (selector) ->
	not selector? or (selector instanceof Array and (selector.length is 0 or selector[0] is ""))

#### create ElementsFromSelector
# Tries to use the given selector in a better way with different strategies:
#
# 1. the normal selector
# 2. removes the last > from the selector, then the one before and so on
# 3. removes all > of the selector
# 4. removes all nth-child and first-child
# 5. combination of 3. and 4.
#
# strategies are used in this order and stops when an element is found
#
# Parameters:
#
# * **window**: window were the selector is used
# * **selector**: selector for the searched elements
createElementsFromSelector = (window, selector) ->
	elements = window.jQuery(selector)
	if elements.length > 0
		elements
	if elements.length is 0
		splittedSelector = selector.split('>')
		count = splittedSelector.length - 2
		
		for j in [1..(splittedSelector.length - 1)]
			if elements is 0
				newSelector = ""
				for s, i in splittedSelector
					newSelector = newSelector + s
					if i is count
						newSelector = newSelector + ' '
					else
						newSelector = newSelector + '>'
				newSelector = newSelector.slice 0, newSelector.length - 1
				count = count - 1
				elements = window.jQuery(newSelector)
			
	if elements.length is 0
		# Delete all >
		newSelector = selector.replace />/g, " "
		elements = window.jQuery newSelector
	if elements.length is 0
		# Delete all nth-child and first-child
		newSelector = selector.replace /:first-child/g, ""
		newSelector = newSelector.replace /:nth-child\(\d+\)/g, ""
		elements = window.jQuery newSelector
	if elements.length is 0
		# Delete all >, nth-child and first-child
		newSelector = selector.replace />/g, " "
		newSelector = selector.replace /:first-child/g, ""
		newSelector = newSelector.replace /:nth-child\(\d+\)/g, ""
		elements = window.jQuery newSelector
	elements
