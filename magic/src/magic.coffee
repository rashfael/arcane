attributes = require('./lib/attributes').Attributes
magic = require('./magic') # workaround to be requireable in browser bundle

# Magic provies a set of functions and method to detect data in web documents.
# It uses different approaches to gather it. CSS Classes, table structures are
# just an small example of what it can do.

class Magic
	constructor: (@w = this) ->
		@checkEnvironment()
		# This varuable holds the reference to an instance of the Attributes class
		@attributes = new attributes(@w)
		
	# Verify that jQuery is loaded because we depend on it
	checkEnvironment: =>
		if typeof @w.jQuery isnt 'function' # the window needs to have the jQuery fn
			console.error 'No jQuery on window object'
			return false
		else
			console.log "Using jQuery #{@w.jQuery.fn.jquery}"
			return true


module.exports = Magic

cleanUp = (magicResult, subItem=false) ->
	data = {} # object which will hold the final result
	if subItem # process an entry with subitems
		resultList = []
		for item in magicResult
			subItemResult = {}
			for itemAttribute in item
				subItemResult[itemAttribute.key] = itemAttribute.value
			resultList.push subItemResult
		return resultList
		
	for attr in magicResult
		# if the value of this key-value pair is an array we got
		# something with subitems and call cleanup recursively on
		# this kv-pair
		if Array.isArray attr.value
			data[attr.key] = cleanUp attr.value, true
		else
			data[attr.key] = attr.value

	return data

module.exports.cleanUp = cleanUp