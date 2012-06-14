fs = require 'fs'
Mongolian = require 'mongolian'
assert = require 'assert'

server = new Mongolian
###
# Collector are used to save extracted data.
# 
# Example usage:
# var Collector = require('./lib/collectors.js').Stdout;
# var c = new Collector({'exampleConfigKey': 'someValue'});
# c.save('some_data');
# 
###

module.exports.createCollector = (config) ->
	console.log 'Creating new Collector'
	throw Error 'No configuration given!' if not config
	return new collectorTypes[config.type] config

class Base
	constructor: (@config) ->
		console.log '++ New BaseCollector'
		console.log ' + Configuration:', @config
		
	save: (data, currentNode) ->
		throw Error 'Override this method in the extending class!'

###
# Stdout Collector
###

class Stdout extends Base
	constructor: (@config) ->
		super config
		console.log '++ New StdoutCollector'
		
	save: (data, currentNode) ->
		console.log data

	end: ->
		console.log 'Collector finished!'

###
# File Collector
###

class File extends Base
	constructor: (@config) ->
		super config
		@stream = fs.createWriteStream(@config.file, {flags: 'w'})
		
	save: (data, currentNode) =>
		@stream.write JSON.stringify(data, null, 2)
	
	end: ->
		@stream.end()

###
# MongoDB Collector
#
# TODO use given configuration instead of hardcoded data
###
	
class MongoDb extends Base
	constructor: (@config) ->
		super config
		@db = server.db @config.database
		@collection = @db.collection @config.collection
		console.log '++ new MongoDb Collector', @config
	
	save: (data, currentNode) =>
		@collection.insert data

collectorTypes = {
	Stdout
	File
	MongoDb
}

