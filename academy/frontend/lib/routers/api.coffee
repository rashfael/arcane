jobs = global.jobs

DbJob = global.mongoose.model 'Job'
Project = global.mongoose.model 'Project'

Job = require('../job').Job

###
# REST APIs
###

module.exports.version = (req, res) ->
	try
		pkg = require('../../package.json')
		console.log('API Request: Version')
		res.json {
			version: pkg.version,
			name: pkg.name,
		}
	catch error
		res.json {
			errorShort: "Can't find package.json!",
			errorLong: error.message
		}

module.exports.list = (req, res) ->
	wrapJobs = []
	for id, job of jobs
		wrapJobs.push {
			id: job.id
			name: job.name
			project: job.project
			state: job.state
			archived: false
		}
	DbJob.find({archived: true}).exec (err, dbJobs) ->
		if err
			res.json {
				errorShort: "Database error!",
				errorLong: err.message
			}
		else
			for job in dbJobs
				wrapJobs.push {
					id: job.id
					name: job.name
					project: job.project
					state: job.state
					archived: true
				}
			res.json wrapJobs

module.exports.edit = (req, res) ->
	id = new global.mongoose.Types.ObjectId req.params.id
	if not req.body.name?
		res.json {
			errorShort: "New parameter: 'name' not set!",
			errorLong: "New parameter: 'name' not set!"
		}
		#res.send 'Y U NO NAME', 400
	name = req.body.name
	console.log "check database"
	DbJob.findById id, (err, dbJob) ->
		if err
			res.json {
				errorShort: "Database error!",
				errorLong: err.message
			}
			#res.send err, 500
		if not jobs[id]? and not dbJob?
			res.json {
				errorShort: "Job not found!",
				errorLong: "Job not found!"
			}
		if jobs[id]?
			job = jobs[id]
			job.name = name
		dbJob.name = name
		dbJob.save()
		res.send 'job edited'

module.exports.newJob = (req, res) ->
	response = {}

	if req.is('json')
		global.spawner.createJob req.body, null, null, (err, job) ->
			if err
				res.json {
					errorLong: err.message
				}
			else
				response = {
					id: job.id
					debug: 'Job received!'
					#received: req.body
				}

				res.header 'Content-Type','application/json'
				res.json response

	else
		res.json {
			errorShort: "File content is not JSON!",
			errorLong: "Invalid content type. Use application/json."
		}
		#throw new Error 'Invalid content type. Use application/json.'

module.exports.details = (req, res) ->
	try
		id = new global.mongoose.Types.ObjectId req.params.id
	catch error
		res.json
			errorShort: "Job not found!"
			errorLong: "Job not found!"
		, 404
		return
	global.spawner.getJob id, (job) ->
		if not job?
			res.json
				errorShort: "Job not found!"
				errorLong: "Job not found!"
			, 404
			return
		status = {}
		status._id = job.id
		status.name = job.name
		status.configuration = job.configuration
		status.project = job.project
		status.state = job.state
		status.archived = job.archived
		status.submitted = job.submitted
		status.started = job.started
		status.stopped = job.stopped
		status.finished = job.finished
		status.finishedWorkers = job.finishedWorkers
		status.runningWorkers = job.runningWorkers
		res.json status

module.exports.start = (req, res) ->
	job = jobs[req.params.id]
	if job
		job.start()
		status = job.getStatus()
		status._id = job.id
		status.configuration = job.configString
		response = {
			status: status
			debug: 'Job started!'
		}
		res.json response
	else
		res.json {
			errorShort: "Job not found!",
			errorLong: "Job not found!"
		}

module.exports.pause = (req, res) ->
	job = jobs[req.params.id]
	if job
		job.pause()
		status = job.getStatus()
		status._id = job.id
		status.configuration = job.configString
		response = {
			status: status
			debug: 'Job paused!'
		}
		res.json response
	else
		res.json {
			errorShort: "Job not found!",
			errorLong: "Job not found!"
		}

module.exports.abort = (req, res) ->
	job = jobs[req.params.id]
	if job
		job.abort()
		status = job.getStatus()
		status._id = job.id
		status.configuration = job.configString
		response = {
			status: status
			debug: 'Job aborted!'
		}
		res.json response
	else
		res.json {
			errorShort: "Job not found!",
			errorLong: "Job not found!"
		}

module.exports.delete = (req, res) ->
	job = jobs[req.params.id]
	if job
		job.delete (err) ->  # TODO: Remove from db somwhere
			if err
				error = {
			 		error: 'Job could not be deleted',
			 		debug: err.message,
				}
				res.json error
				return
			else
				res.json {debug: 'Job was deleted!'}
	else
		DbJob.findOne {_id: req.params.id}, (err, job) ->
			if err
				res.json {
					errorShort: "Job could not be deleted!",
					errorLong: err.message
				}
				return
			else if not job?
				res.json {
					errorShort: "Job not found!",
					errorLong: "Job not found!"
				}
			else
				job.remove()
				res.json {debug: 'deleted'}

# List of projects
module.exports.listProjects = (req, res) ->
	Project.find {}, (err, projects) ->
		if err
			res.json {
				errorShort: "Database error!",
				errorLong: err.message
			}
		else
			wrapProjects = []
			
			for id, project of projects
				wrapProjects.push {
					name: project.id
				}
			res.json wrapProjects
