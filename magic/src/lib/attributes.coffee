utils = require './utils'

# The Attributes class is the facade for all functionality concerning
# magical attribtue detection.

class Attributes

	# Assign the window variable to a local variable
	constructor: (@window) ->
		throw new Error 'No window!' if not @window
		throw new Error 'No jQuery' if (typeof @window.jQuery isnt 'function')
		@methods = (new method(@window) for method in methodClasses)
	
	# Use all common attribute detection strategies on a dom element
	# and its children.
	#
	# The configuration arguments looks like this:
	#
	#     {
	#        'methodName': {
	#          configKey: configValue,
	#        },
	#       'SimpleAttributes': {
	#          maxDepth: 4,
	#       }
	#     }
	#
	findAttributes: (domElement, config={}) =>
		detected = []
		for method in @methods
			methodConfig = config[method.name] or {} # get config for the method from the dict
			attributes = method.execute(domElement, methodConfig)
			for attr in attributes
				detected.push(attr) if typeof attr != 'undefined'
		return detected

# Detection methods are implemented as a class inheriting from DetectionMethod.
class DetectionMethod
	# Set default settings for detection methods and do common initialization
	constructor: (@window, @config) ->
		@weight = 0
		@name = 'Name of the Method'
		@j = @window.jQuery # assign jQuery to our own object so the context is always clear
	
	# Dummy method which should be overwritten by the inheriting class.
	# It has to return a list of dictionaries with the following content:
	#
	# - key: the generated key for the attribute
	# - value: the value for the detected attribute
	# - name: the name of the used method
	# - element: the DOM Element on which the attribute was detected
	execute: (element, config) =>
		return if not element # if element is null, don't bother
		# throw new Error 'Error: Using unspecified Detection method!'

# ## CustomSelectors
# Custom jQuery selector is given, and we return the value.
#
# Note that we only return text of the specified node.
# So if you have a `<div id='a'>foo<div>bar</div></div>`
# and specify the selector '#a' we will only return `foo`
# and not bar!
#
# The includeChildren value is optional, the default is 0.
# A selector *item* looks like this:
#
#     {
#       key: 'some_key_name'
#       selector: '#a.fancy jQuery > selector'
#       includeChildren: 9
#     }
#
# Configuration:
#
# - selectors : [item]
#
class CustomSelectors extends DetectionMethod
	constructor: (window) ->
		super window
		@name = 'CustomSelectors'

	execute: (element, config={}) =>
		return [] if not config.selectors?
		for item in config.selectors
			found = @j(item.selector, element)[0]
			break if not found?
			depth = item.includeChildren or 0
			value = @j.trim utils.getText(found, depth)
			{
				key: item.key
				value
				found
				@name
			}


# ## Simple attributes
#
# Title and CSS classes will be used as keys,
# the value of the dom element will be the value.
#
# Configuration:
#
# - includeChildren : 0
#
class SimpleAttributes extends DetectionMethod
	constructor: (window) ->
		super window
		@name = 'SimpleAttributes'

	execute: (element, config={}) =>
		super element, config
		children = @j(element).find '[id],[title],[class]'
		depth = config.includeChildren or 0
		results = []
		for el in children
			value = @j.trim(utils.getText(el, depth)).replace /(\n|\t|\r)+/g, ' '
			key = @j.trim(el.title or el.id or el.className)
			results.push {
				key
				value
				element: el
				@name
			} if value and value isnt key # only push non-empty key-value pairs
		return results

# ## Image alt text
#
# A hopefully constant key will be generated,
# and the alt tag of the image is the value.
class ImageAltTags extends DetectionMethod
	constructor: (window) ->
		super window
		@name = 'ImageAltTags'
		
	execute: (element, config={}) =>
		super element, config
		# get all images with an 'alternative text' tag
		images = @j(element).find 'img[alt]'
		for el, index in images
			{
				key: 'img_' + index #Improvement: generate & use most specific relative selector?
				value: el.alt
				element: el
				@name
			}

# ## Sub Item Handling
#
# Makes it possible to assing a list of found item
# as a list of results to one parent item.
#
# A *groupDefinition* looks like this:
#
#     {
#       key: 'some-key'
#       selector: 'selector-for-all-items'
#     }
#
# ### Configuration:
#
# groups: [groupDefinition]
#
#
class SubItems extends DetectionMethod
	
	constructor: (window) ->
		super window
		@name = 'SubItems'
	
	execute: (element, config={}) =>
		super element, config
		if not config.groups or config.groups.length is 0
			return []
		else
			attributes = new Attributes @window
			results = []
			for group in config.groups
				values = []
				for item in @j(element).find group.selector
					found = attributes.findAttributes item
					values.push found

				results.push {
					key: group.key
					value: values
					element: null
					@name
				}

			return results

# ## Simple Table Detection
#
# Provides simple tabluar detection
#
# ### Configuration:
#
# The layout can either be automatically detected or forced.
#
# #### layout
# - *auto*
#		magic will try to guess the table layout
# - firstColumnKeys
#		First column will be used as key
# - firstRowKeys
#		First row will be used as keys
#
class SimpleTable extends DetectionMethod
	constructor: (window, config={layout:'auto'}) ->
		super window, config
		@name = 'SimpleTable'
	
	firstColumnKeys: (element) =>
		rows = @j(element).find 'tr'
		result = []
		for row in rows
			tds = @j(row).find('td')
			key = @j(tds[0]).text()
			value = @j(tds[1]).text()
			result.push {
				key
				value
				element: row
				@name
			} if value.length isnt 0
		return result

	firstRowKeys: (element) =>
		keys = []
		values = []
		for key in @j(element).find 'tr:nth(0) td'
			keys.push @j(key).text()
		for value in @j(element).find 'tr:nth(1) td'
			values.push @j(value).text()
		for key, index in keys
			value = values[index]
			{
				key: key
				value: value
				element: element
				@name
			} if value
	
	guessLayout: (table) =>
		if @j(table).find('tr').length is 2
			layout = 'firstRowKeys'
		else
			layout = 'firstColumnKeys'
		
		return layout

	detectTables: (element) =>
		tables = [] # saves tables and layout
		if @config.layout is 'auto'
			if element.localName is 'table' # detection is run on only one table
				#The method runs on only one table which is the element itself
				tables.push {
					element: element
					layout: @guessLayout element
				}
			else # find all tables in the container and guess their layouts
				tableElements = @j(element).find 'table'
				for element in tableElements
					layout = @guessLayout element
					tables.push {
						element
						layout
					}
		else tables.push {
			element: element
			layout: @config.layout
		}
		
		return tables

	execute: (element, config={}) =>
		super element, config
		tables = @detectTables element
		results = []
		for table in tables
			# extract values according to column layout
			if table.layout is 'firstColumnKeys'
				results = results.concat @firstColumnKeys(table.element)
			else if table.layout is 'firstRowKeys'
				results = results.concat @firstRowKeys(table.element)
			else
				throw new Error "Table layout #{table.layout} not supported!"
		
		return results

# All methods which should be used must be listed here.
methodClasses = [SimpleAttributes, ImageAltTags, SimpleTable, CustomSelectors, SubItems]

# Export the main funcionality
module.exports.Attributes = Attributes

# Export the single methods, mainly for testing purposes.
module.exports.methods = {
	SimpleAttributes,
	ImageAltTags,
	SimpleTable,
	CustomSelectors,
	SubItems
}
