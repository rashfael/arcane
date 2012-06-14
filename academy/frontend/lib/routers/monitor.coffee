Project = global.mongoose.model 'Project'
mongolian = global.mongolian

module.exports.get = (req, res) ->
	# grab all running transformations
	col = mongolian.db('academy').collection('projects')

	runningTransforms = []
	errorTransforms = []
	finishedTransforms = []

	col.find({}).forEach (project) ->
		for id, transform of project.transformations
			transform.id = id
			transform.project = { id: project._id, name: project.name}
			if transform.error?
				errorTransforms.push transform
			else if transform.finished?
				finishedTransforms.push transform
			else
				runningTransforms.push transform
	, (err) ->
		console.log err if err?
		res.render 'monitor',
			title: 'Monitor | Arcane Academy'
			runningTransforms: runningTransforms
			errorTransforms: errorTransforms
			finishedTransforms: finishedTransforms
