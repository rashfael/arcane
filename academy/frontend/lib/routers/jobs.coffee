###
# job control
###
Job = require('../job').Job
DbJob = global.mongoose.model 'Job'
Project = global.mongoose.model 'Project'

jobs = global.jobs

module.exports.list = (req, res) ->
	DbJob.find({archived: true}).exec (err, dbJobs) ->
		res.render 'control', {
			title: 'Job Control | Arcane Academy'
			jobs: jobs
			dbJobs: dbJobs
		}

module.exports.details = (req, res) ->
	try
		id = new global.mongoose.Types.ObjectId req.params.id
	catch error
		res.send 404
		return
	  
	if jobs[id]
		job = jobs[id]
		if req.query.start?
			console.log 'start'
			job.start()
		else if req.query.pause?
			job.pause()
		else if req.query.abort?
			job.abort()
		else if req.query.delete?
			job.delete (err) ->
				if not err
					res.redirect '/control'
				else
					console.log 'Error deleting job:', err
			return
		else if req.query.restart?
			global.spawner.createJob job.configuration, job.name, job.project, (err, newJob) ->
				res.redirect "/jobs/#{newJob.id}"
		Project.findById job.project, (err, project) ->
			res.render 'job', {
				title: 'Job | Arcane Academy'
				archived: false
				job: job
				project: project
			}
	else
		DbJob.findOne {_id: id}, (err, job) ->
			if req.query.delete?
				Project.findOne {_id: job.project}, (err, project) ->
					project.jobs.splice(project.jobs.indexOf(job._id),1)
					project.save()
				job.remove()
				res.redirect '/control'
			else if req.query.restart?
				global.spawner.createJob job.configuration, job.name, job.project, (err, newJob) ->
					res.redirect "/jobs/#{newJob.id}"
			else
				Project.findById job.project, (err, project) ->
					res.render 'job', {
						title: 'Job | Arcane Academy'
						archived: true
						job: job
						project: project
					}

module.exports.edit = (req, res) ->
	id = new global.mongoose.Types.ObjectId req.params.id
	display = (job, archived) ->
		res.render 'job_edit', {
			title: 'Job | Arcane Academy'
			archived: archived
			job: job
		}
	if jobs[id]
		job = jobs[id]
		if req.body? and req.method is 'POST'
			job.name = req.body.name
			job._dbJob.name = req.body.name
			job._dbJob.save()
			res.redirect "/jobs/#{id}"
		else
			display job, false
	else
		DbJob.findOne {_id: id}, (err, job) ->
			if req.body? and req.method is 'POST'
				job.name = req.body.name
				job.save()
				res.redirect "/jobs/#{id}"
			else
				display job, true
