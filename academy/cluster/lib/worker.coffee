# A permanent worker to execute tasks from the frontend

config = require '../config'
global.config = config

events = require 'events'
util = require 'util'
request = require 'request'
navigation = require './navigation'
encoder = require './encoder'

#log4js = require('log4js')
#log4js.configure(__dirname + '/../../logging.json')
#log4js.replaceConsole log4js.getLogger('worker')

console.log 'Worker forked'

work = (type, html, config, input, cb) ->
	elementCtor = navigation.ConfigurationMapping[type]
	throw Error 'Using nonexistent navigation element: ' + type if not elementCtor
	# put html into nav-element
	element = new elementCtor html, config, input.request, input

	# exectue nav element logic
	element.process (err, result) ->
		cb? err, result

# execute a task
run = (task, cb) ->
	throw Error 'Missing config or task' if not task.config? or not task.type?
	# just shorten things a bit
	type = task.type
	input = task.input
	config = task.config
	if task.encoding?
		config.encoding = task.encoding.toLowerCase()
	console.info "Running #{type}"

	if input
		if task.type is 'Collect'
			console.info "-- USING DATA INPUT"
			work type, {}, config, input, cb
		else if task.type is 'FillForm' and not input.request
			console.info "-- USING DATA INPUT"
			work type, {}, config, input, cb
		else if input.html
			console.info "-- USING HTML INPUT"
			work type, input.html, config, input, cb
		else if input.request
			console.info "-- USING HTTP REQUEST INPUT"
			if input.request.headers
				input.request.headers['User-Agent'] = 'my-little-scraper/0.0.1'
			else
				input.request.headers = {
					'User-Agent': 'my-little-scraper/0.0.1'
				}
			console.info 'Requesting web page:', input.request
			input.request.encoding = 'binary'
			request input.request, (err, res, body) =>
				throw err if err

				# Transform encoding if necessary
				if task.encoding?
					encoding = task.encoding.toLowerCase()
					console.info "using manual encoding: " + task.encoding
				else if res.headers['content-type']?
					# Hint: res.headers['content-type'] should be something
					# like "text/html;charset=ISO-8859-1"
					parts = res.headers['content-type'].split '='
					if parts.length > 1
						encoding = parts[parts.length - 1].toLowerCase()
				body = encoder.toUtf8 body, encoding
				
				work type, body, config, input, cb
	else
		console.info "-- USING CONFIG INPUT"
		work type, config, config, config, cb

# handle messages from the supervisor
process.on 'message', (message) ->
	if message.task?
		task = message.task
		run task, (err, output) ->
			# answer to the supervisor
			if err?
				process.send {id: task.id, err: err}
			else
				process.send {id: task.id, output: output}
