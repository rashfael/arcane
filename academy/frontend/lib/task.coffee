log4js = require 'log4js'
logger = log4js.getLogger 'worker'
logger.setLevel 'INFO'
mongolian = require 'mongolian'
events = require 'events'

module.exports = class Task extends events.EventEmitter
	constructor: (@worker, @config, @type, @input) ->
		@id = new mongolian.ObjectId()

	sanitize: () ->
		sanitized =
			worker: @worker
			config: @config
			type: @type
			input: @input
			encoding: @encoding
		return sanitized
