log4js = require 'log4js'
logger = log4js.getLogger 'spawner'
logger.setLevel 'INFO'

# Project data is completely in the db and has no in memory objects except db representations
module.exports.Project = ->
	Schema = global.mongoose.Schema
	Project = new Schema {
		_id: String
		name: String
		database: String
		
		# this object contains all collections of the given type
		# associated with the project as properties
		#
		# Each Collection is an object, containing the following:
		# 	- type: [raw|reference|result]
		# 	- structure: the full key structure created by analysis
		# 	- lockedBy: possible lock by the given transformation
		collections:
			type: {}
			default: () -> {}

		# this data object contains all transformations associated
		# with the project.

		# Transformations have the form of:
		# 	- type
		#  	- started: Date
		# 	- finished: Date
		#		- collection: durr
		# 	- error: error object
		# 	- maxActions: upper bound for the action count
		# 	- actions: already executed actions
		# 		- total
		#			- noop
		# 		- changed
		# 		- deleted
		transformations:
			type: {}
			default: () -> {}
		jobs: [Schema.ObjectId]
	}
	
	Project.methods.saveCollections = ->
		@markModified 'collections'
		@save (err, obj) ->
			logger.error err if err?
	
	Project.methods.saveTransformations = ->
		@markModified 'transformations'
		@save (err, obj) ->
			logger.error err if err?

	Project.methods.splitCollections = ->
		collections = {raw: [], reference: [], result: []}
		for col, data of @collections
			collections[data.type].push col
		return collections
	
	
	return Project
