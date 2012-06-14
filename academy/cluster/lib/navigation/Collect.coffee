log4js = require('log4js')
logger = log4js.getLogger 'nav:collect'
logger.setLevel 'DEBUG'

Generic = require './Generic'
helpers = require './helpers'

Mongolian = require 'mongolian'
server = new Mongolian global.config.mongolian.url


#### Collect
# Endpoint of a scraping path. Dump all previously code to the collector.
#
# Options:
#
# * **mapping.map**: the map for the data keys to the wanted keys
# * **database**: database were the data should be saved
# * **collection**: specifies the collection were the data in the given database is saved

module.exports = class Collect extends Generic
	
	process: (cb) =>
		mapping = @config.mapping.map # gets the mapping from the given config
		if mapping and Object.keys(mapping).length > 0 # if the mapping exists, it map the keys of the data to new
			insertData = {} # keys and drops the data were the old key is in the config false
			
			for key, val of @input
				if mapping[key] is false
					continue
				if mapping[key] is '' or not mapping[key]?
					insertData[key] = val
				else
					insertData[mapping[key]] = val
		else
			insertData = @input # if no mapping is defined, it takes all data
		if Object.keys(insertData).length > 0
			for key,val of insertData
				logger.debug '-| Collect |-> ' + key + ' : ' + val
			server.db(@config.database).collection(@config.collection).insert insertData
		else
			logger.error 'No Data found'
		cb null, @input
