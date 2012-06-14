transformationEmulator = {}

# takes an array and returns a modified array
transformationEmulator.transform = (data, modifier) ->
	# clone
	modifiedData = JSON.parse JSON.stringify data
	if typeof modifier is 'string'
		eval 'modifier = ' + modifier
	for item,i in modifiedData
		# 'reset' modification if the modifier aborts
		if not modifier item
			modifiedData[i] = data[i]
	return modifiedData

transformationEmulator.merge = (data, map, reduce) ->
	if typeof map is 'string'
		eval 'map = ' + map
	if typeof reduce is 'string'
		eval 'reduce = ' + reduce
	if not reduce?
		reduce = (key, values) ->
			result = {}
			for value in values
				for k, v of value
					if not result[k]?
						result[k] = v
					else if result[k] instanceof Array
						result[k].push v
					else
						result[k] = [result[k], v]
			return result
	
	mapped = {}
	# map
	for item in data
		key = JSON.stringify map item
		if not mapped[key]?
			mapped[key] = []
		mapped[key].push JSON.parse JSON.stringify item
	
	reduced = {}
	# reduce
	for key, values of mapped
		reduced[key] = reduce key, values

	out = []
	# unpack
	for key, value of reduced
		if value._id instanceof Array
			value._id = value._id[0]
		out.push value

	return out

# Generator for map functions usable in merge
# key: name of the key to compare at
# options:
# 	- caseInsensitive
#   - ommitSpecialChars ([^A-Za-z0-9])
#		- ommitWhitespace
# returns function
transformationEmulator.mapFunctionGenerator = (key, options) ->
	mapFunction = "function(object){ key = object['#{key}'];"
	if options?
		if options.caseInsensitive?
			mapFunction += 'key = key.toLowerCase();'
		if options.ommitWhitespace? and not options.ommitSpecialChars?
			mapFunction += "key = key.replace(/\\s/g,'');"
		if not options.ommitWhitespace? and options.ommitSpecialChars?
			mapFunction += "key = key.replace(/[^A-Za-z0-9\\s]/g,'');"
		if options.ommitWhitespace? and options.ommitSpecialChars?
			mapFunction += "key = key.replace(/\[^A-Za-z0-0]/g,'');"
	mapFunction += 'return key;}'
	mapFunction

@transformationEmulator = transformationEmulator
