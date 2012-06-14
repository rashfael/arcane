mongolian = global.mongolian
_ = require 'underscore'
transform = require '../transform'

Project = global.mongoose.model 'Project'

module.exports.list = (req, res) ->
	Project.find {}, (err, projects) ->
		res.render 'projects', {
			title: 'Projects | Arcane Academy'
			projects: projects
		}

module.exports.details = (req, res) ->
	Project.findById req.params.id, (err, project) ->
		res.render 'project_details', {
			title: 'Project Details | Arcane Academy'
			project: project
		}

module.exports.collection = (req, res) ->
	Project.findById req.params.id, (err, project) ->
		col = req.params.col
		
		colMeta = project.collections[col]

		structure = colMeta.structure
		collection = mongolian.db(project.database).collection(col)
		
		console.log req.header('Accept').indexOf 'application/json'
		if req.header('Accept', '').indexOf('application/json') is 0
			collection.find().limit(10).skip(res.pagination.page*res.pagination.pagerLimit).toArray (err, data) ->
				res.json data
		else
			collection.find().limit(res.pagination.pagerLimit).skip(res.pagination.page*res.pagination.pagerLimit).toArray (err, data) ->
				collection.count (err, count) ->
					res.pagination.generate count
					if req.method is 'POST'
						template = 'collection_table'
					else
						template = 'collection'
					res.render template,
						title: 'Project Details | Arcane Academy'
						data: data
						project: project
						col: col
						structure: structure
						empty: count is 0


module.exports.structure = (req, res) ->
	Project.findById req.params.id, (err, project) ->
		col = req.params.col

		map = ->
			for key, val of this
				if key is '_id'
					continue
				emit key, {count: 1}
		
		reduce = (key, values) ->
			count = 0
			for value in values
				count += value.count
			return {count: count}

		collection = mongolian.db(project.database).collection(col)
		collection.mapReduce map, reduce, {out: {inline:1}}, (err, dbRes) ->
			console.log err if err?
			collection.count (err, count) ->
				console.log err if err?
				structure = project.collections[col].structure or {}
				
				for result in dbRes.results
					key = result._id.replace /[$\.]/g, '_'
					structure[key] =
						count: result.value.count
						ratio: result.value.count/count
						show: if structure[key]? then structure[key].show else true
						config: if structure[key]? then structure[key].config
						# new: not structure[result._id]?
				project.collections[col].structure = structure
				project.saveCollections()
				res.render 'structure', {
					title: 'Analyse Structure | Arcane Academy'
					project: project
					structure: structure
				}

module.exports.changeStructure = (req, res) ->
	Project.findById req.params.id, (err, project) ->
		col = req.params.col
		newStructure = req.body
		structure = project.collections[col].structure

		for key, val of structure
			if newStructure[key]?
				val.show = true
			else
				val.show = false

		project.saveCollections()
		console.log structure
		res.redirect "/projects/#{req.params.id}/#{req.params.col}/"

module.exports.extract = (req, res) ->
	Project.findById req.params.id, (err, project) ->
		col = req.params.col
		
		structure = project.collections[col].structure
		if req.method is 'GET'
			rawColumns = []
			for key, val of structure
				rawColumns.push {name: key}
			res.render 'extract', {
				title: 'Extract | Arcane Academy'
				col: col
				project: project
				structure: structure
				rawColumns: JSON.stringify rawColumns
			}
			return
		db = mongolian.db(project.database)
		exConfig = req.body
		rawCollection = db.collection col
		resultCollection = db.collection exConfig.result.name
		referenceCollection = db.collection exConfig.reference.name
		transformationId = new ObjectId()
		transformation =
			type: 'extract'
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
		# set collection metadata
		refMeta = {structure: {}, type: 'reference'}
		for key,i in exConfig.reference.attributes
			if i is 0
				refMeta.structure._id = {}
			else
				refMeta.structure[key.name] = {}
		project.collections[exConfig.reference.name] = refMeta
		
		resMeta = {structure: {}, type: 'result'}
		for key in exConfig.result.attributes
			resMeta.structure[key.name] = {}
		project.collections[exConfig.result.name] = resMeta
		project.markModified 'collections'
		project.save()
		# iterate all the raws!
		rawCollection.find().forEach (raw) ->
			# extract reference
			# TODO possible autogenerate _id
			# TODO find differences
			referenceCollection.find({_id: raw[exConfig.reference.attributes[0].name]}).count (err, count) ->
				if count is 0
					reference = {}
					for key,i in exConfig.reference.attributes
						if i is 0
							reference._id = raw[key.name]
						else
							reference[key.name] = raw[key.name]
					referenceCollection.insert reference
				# save result
				result = {}
				for key in exConfig.result.attributes
					if key.referenceKey
						result[key.name] = reference._id
					else
						result[key.name] = raw[key.name]
				resultCollection.insert result
		, (err, res) ->
			console.log err if err?
			transformation.finished = new Date()
			project.saveTransformations()
		req.send 'extract accepted'

module.exports.export = (req, res) ->
	Project.findById req.params.id, (err, project) ->
		col = req.params.col
		exType = req.params.exType

		
		colMeta = project.collections[col]

		structure = colMeta.structure
		
		keys = []
		for key, val of structure
			keys.push key

		collection = mongolian.db(project.database).collection(col)
		if exType is 'json'
			json = []
			collection.find().forEach (row) ->
				row._id = row._id.toString()
				json.push row
			, (err, val) ->
				console.log err if err?
				res.json json
			return

		mapHead = []
		
		for m in keys
			mapHead.push ('"' + m + '"')
		csv = (mapHead.join ',') + '\n'

		collection.find().forEach (row) ->
			vals = []
			for m in keys
				if row[m]?
					vals.push '"' + row[m] + '"'
				else
					vals.push '""'
			csv += (vals.join ',') + '\n'
		, (err, val) ->
			console.log err if err?
			res.send csv, {
				'Content-Type': 'text/csv'
			}

###
# Render the merge view.
###
module.exports.merge = (req, res) ->
	res.render 'merge', {
		title: 'Merge Documents in Collection | Arcane Academy'
		project: req.params.id
		collection: req.params.col
	}

###
# Perform a merge operation.
###
module.exports.performMerge = (req, res) ->
	Project.findById req.params.id, (err, project) ->
		col = req.params.col

		map = 'function(object) {' + req.body.merge.map + '}'

		if req.body.merge.reduce isnt ""
			reduce = 'function(key, values) {' + req.body.merge.reduce + '}'

		if reduce?
			transform.merge project, col, map,
				reduce: reduce
		else
			transform.merge project, col, map

		res.redirect '/projects/' + req.params.id + '/' + col

###
# Render the transform view.
###
module.exports.transform = (req, res) ->
	res.render 'transform', {
		title: 'Transform Documents in Collection | Arcane Academy'
		project: req.params.id
		collection: req.params.col
	}

###
# Perform a transform operation.
###
module.exports.performTransform = (req, res) ->
	Project.findById req.params.id, (err, project) ->
		col = req.params.col

		modifier = 'function(object) {' + req.body.transform.modifier + '}'

		transform.transform project, col, modifier

		res.redirect '/projects/' + req.params.id + '/' + col
