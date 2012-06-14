log4js = require('log4js')
logger = log4js.getLogger 'nav:fillForm'
logger.setLevel 'DEBUG'

Generic = require './Generic'
helpers = require './helpers'

parser = require '../parser'

#### FillForm
# Node which makes it possible to fill a form and send it to the given url. Its also possible to take previous data
# from a Magic node an use it for the form input.
#
# Options:
#
# * **formSelector**: selector to find the form element in the site
# * **url**: the form values are sended to this url
# * **parameters**: set of parameter lists
# * **method**: method of sending informations from the from (e.g. get, post, ...)
# * **encoding**: uses user specified encoding (optional)
module.exports = class FillForm extends Generic

	process: (cb) =>
		logger.info 'Getting Form.'
		if @request and @request.url # if the previous node is one with a site you can get the form element
			@getWindow (err, window) =>
				if err
					logger.fatal 'FillForm got broken window: ' + err
					cb err, null
				else
					helpers.getElements window, @config.formSelector, "form", @config.encoding, (elements) =>
						form = elements[0] # gets the form element from the site and
						if not form? # checks if the given url from the config and the url from the website is the same
							logger.warn 'Form not found!'
							cb "Form not found!", null
							return
						formUrl = form.getAttribute 'action'
						if @config.url isnt formUrl
							logger.info 'Form url and config url does not match!'

						inputElements = elements.find("input") # takes all input elements from the form and searches for
						hiddenFields = [] # elements which are hidden and put them to the list to take them to the parameters later, because
						for i in [0..inputElements.length-1] # without these elements maybe it dont works fine
							if inputElements[i].type.toLowerCase() is "hidden"
								hiddenFields.push { name : inputElements[i].name, value : inputElements[i].value }
						
						out = []
						for par in @config.parameters # goes through all parameter sets
							for field in hiddenFields # puts the list with the hidden fields to the parameters
								if par[field.name]
									par[field.name].entry.push field.value
								else
									par[field.name] = {"entry": [ field.value ]}
							if par._iterator
								# Iterator is defined
								if par._iterator.interval
									interval = par._iterator.interval
									# Iterator is an expression
									start = interval[0]
									end = interval[1] - 1
									offset = interval[2]
									for i in [start..end] by offset
										out.push createRequest @config.method, @config.url, par, i, {}
								else if par._iterator.sequence
									# Iterator is an array
									for i in par._iterator.sequence
										out.push createRequest @config.method, @config.url, par, i, {}
									
							else
								# Iterator is not defined
								out.push createRequest @config.method, @config.url, par, null, {}	
						logger.log '-| FormFill |->', @config.url
						logger.log '-| FormFill |->', @config.method
						logger.log '-| FormFill |->', "created requests: " + out.length
						cb null, out

		else # if the previous node is a magic node you cant get the form, because you dont know the site
			# takes the elements form the magic node and map the keys like described in the config
			if @input and Object.keys(@input).length > 0
				map = {}
				if @config.mapping
					mapping = @config.mapping.map

					if mapping and Object.keys(mapping).length > 0
						
						for key, val of @input
							if mapping[key] is false
								continue
							if mapping[key] is ""
								map[key] = val
							else
								map[mapping[key]] = val
				out = []
				for par in @config.parameters
					if par._iterator
						# Iterator is defined
						if par._iterator.interval
							interval = par._iterator.interval
							# Iterator is an expression
							start = interval[0]
							end = interval[1] - 1
							offset = interval[2]
							for i in [start..end] by offset
								out.push createRequest @config.method, @config.url, par, i, map
						else if par._iterator.sequence
							# Iterator is an array
							for i in par._iterator.sequence
								out.push createRequest @config.method, @config.url, par, i, map
							
					else
						# Iterator is not defined
						out.push createRequest @config.method, @config.url, par, null, map	
				logger.log '-| FormFill |->', @config.url
				logger.log '-| FormFill |->', @config.method
				logger.log '-| FormFill |->', "created requests: " + out.length
				cb null, out
			else
				cb null, []
	
	doFormFill = () =>
		
	
	# Creates the request
	createRequest = (method, url, par, iterator, map) ->
		parameters = {}
		data = ""
		
		for key, val of par
			if key isnt "_iterator"
				vars = map
				if iterator? and iterator isnt null
					vars.i = iterator
				if val.format
					vars.format = val.format
				for e in val.entry
					data = data + escape(key) + "=" + escape(parser.parse(e, vars)) + "&"
		data = data.slice 0, data.length - 1
		
		if method.toUpperCase() is "GET"
			if url.match(/\?/) is null
				url = url + "?" + data
			else
				url = url + "&" + data
			out = {
				request: {
					url: url,
					method: method.toUpperCase()
				}
			}
		else
			out = {
				request: {
					url: url,
					method: method.toUpperCase(),
					body: data,
					headers: {
						'content-type': 'application/x-www-form-urlencoded'
					}
				}
			}
		return out
