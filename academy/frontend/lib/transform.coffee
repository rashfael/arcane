# Using naive forEach with nested async calls and updating
# the monitoring will probably fuck us in the ass,
# use next and the async lib for serializing the operations
# TODO locking

mongolian = global.mongolian
ObjectId = require('mongolian').ObjectId

log4js = require 'log4js'
logger = log4js.getLogger 'transform'
logger.setLevel 'INFO'

handleError = (project, transformation, err) ->
	transformation.err = err
	transformation.finished = new Date()
	project.saveTransformations()
	logger.error err

module.exports.deleteAttributes = (project, collectionName, attributes) ->
	collection = mongolian.db(project.database).collection(collectionName)
	# do something

# Per-document transformation
#
# project: Project DBObject
# collectionName: -
# modifier: a function with (object) -> return boolean(update) (make changes to object)
# precondition: a query object like in find(), see http://www.mongodb.org/display/DOCS/Advanced+Queries

module.exports.transform = (project, collectionName, modifier, precondition) ->
	collection = mongolian.db(project.database).collection(collectionName)
	precondition = precondition or {}
	if typeof modifier is 'string'
		#security, derp, we should check that
		eval 'modifier = ' + modifier
	cursor = collection.find(precondition)
	transformationId = new ObjectId()
	transformation =
		type: 'transform'
		started: new Date()
		collection: collectionName
		maxActions: 0
		actions:
			total: 0
			noop: 0
			changed: 0
			deleted: 0

	project.transformations[transformationId] = transformation
	project.markModified 'transformations'
	project.save()
	cursor.count (err, count) ->
		if err?
			handleError project, transformation, {message: 'error predicting maxActions', inner:err}
			return
		# roughtly predict maximum actions with total document count
		transformation.maxActions = count
		project.saveTransformations()
		
		cursor.forEach (doc) ->
			_id = doc._id
			if not modifier doc
				transformation.actions.total++
				transformation.actions.noop++
				project.saveTransformations()
				return
			collection.save doc, (err) ->
				if err?
					handleError project, transformation, {message: 'error saving modified document', inner: err}
					return
				transformation.actions.total++
				transformation.actions.changed++
				project.saveTransformations()
			# if the _id has changed, save actually creates a new document,
			# so we have to delete the old one (still counts as one change)
			if _id isnt doc._id
				collection.remove {_id: _id}, (err) ->
					if err?
						handleError project, transformation, {message: 'error deleting document', inner: err}
						return
		#finish
		, (err) ->
			if err?
				handleError project, transformation, {message: 'error iterating over collection', inner: err}
				return
			transformation.finished = new Date()
			project.saveTransformations()
	return transformationId

# n to 1 document merge
#
# project: Project DBObject
# collectionName: -
# map: map function (object) -> return key to merge into
# options: 
#		scope: variable values for the server
#		query: query
# 	reduce: reduce function (key, values) -> return value (if not set, uses standard array reduce)
#		        value needs a property _id with an array of all document _ids, 
#		        the first _id will be updated, all others will be deleted

module.exports.merge = (project, collectionName, _map, options) ->
	collection = mongolian.db(project.database).collection(collectionName)
	
	transformationId = new ObjectId()
	transformation =
		type: 'merge'
		started: new Date()
		collection: collectionName
		maxActions: 0
		actions:
			total: 0
			noop: 0
			changed: 0
			deleted: 0
	#TODO predict maxActions
	project.transformations[transformationId] = transformation
	project.markModified 'transformations'
	project.save()
	logger.info "Started transformation #{transformationId}"
	map = "function(){_map = #{_map}; emit(_map(this), this);}"

	# build the default reduce function (merge to array)
	if not options.reduce?
		options.reduce = (key, values) ->
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
	if not options.scope?
		options.scope = {}
	options.scope._map = _map
	_options =
		scope: options.scope
		query: options.query
		out: 'merge:' + new ObjectId()
	collection.mapReduce map, options.reduce, _options, (err, dbres) ->
		logger.info 'Finished map/reduce'
		if err?
			logger.error err
			handleError project, transformation, {message: 'error submitting mapReduce', inner: err}
			return
		if dbres.err?
			logger.error err
			handleError project, transformation, {message: 'error processing mapReduce', inner: dbres.err}
			return
		mapReduceCol = mongolian.db(project.database).collection(dbres.collection.name)
		mapReduceCol.find().forEach (result) ->
			# only update if really multiple documents to merge
			if not result.value._id instanceof Array
				transformation.actions.total++
				transformation.actions.noop++
				project.saveTransformations()
				return
			# unpack reduced documents, update first _id, delete rest
			ids = result.value._id
			delete result.value._id
			collection.update {_id: ids[0]}, result.value, (err) ->
				if err?
					handleError project, transformation, {message: 'error updating document', inner: err}
				transformation.actions.total++
				transformation.actions.changed++
				project.saveTransformations()
			for id in ids[1..]
				collection.remove {_id: id}, (err) ->
					if err?
						handleError project, transformation, {message: 'error deleting duplicate', inner: err}
					transformation.actions.total++
					transformation.actions.deleted++
					project.saveTransformations()
		, (err) ->
			if err?
				handleError project, transformation, {message: 'error unpacking mapReduce', inner: err}
			else
				logger.info "Finished transformation #{transformationId}"
				transformation.finished = new Date()
				project.saveTransformations()

# Generator for map functions usable in merge
# key: name of the key to compare at
# options:
# 	- caseInsensitive
#   - ommitSpecialChars ([^A-Za-z0-9])
#		- ommitWhitespace
# returns function
module.exports.mapFunctionGenerator = (key, options) ->
	mapFunction = "function(object){ key = object['#{key}'];"
	if options.caseInsensitive?
		mapFunction += 'key = key.toLowerCase();'
	if options.ommitWhitespace? and not options.ommitSpecialChars?
		mapFunction += "key = key.replace(/\\s/g,'');"
	if not options.ommitWhitespace? and options.ommitSpecialChars?
		mapFunction += "key = key.replace(/[^A-Za-z0-9\\s]/g,'');"
	if options.ommitWhitespace? and options.ommitSpecialChars?
		mapFunction += "key = key.replace(/\[^A-Za-z0-0]/g,'');"
	mapFunction += 'return key;'
	mapFunction

