# Controls all jobs and workers and schedules the tasks

events = require 'events'
Cluster = require './cluster'
{Job, JobState} = require './job'
DbJob = global.mongoose.model 'Job'
Project = global.mongoose.model 'Project'
Task = require './task'
md5 = require 'MD5'

log4js = require 'log4js'
logger = log4js.getLogger 'spawner'
logger.setLevel 'INFO'

# save all jobs
jobs = {}
global.jobs = jobs

module.exports = class spawner extends events.EventEmitter
	constructor: ->
		logger.info 'Creating global Spawner'
		@cluster = new Cluster global.config.cluster.port
		
		# listen for new workers
		@cluster.on 'register', (worker) =>
			worker.on 'taskCompleted', (task) =>
				logger.info 'Worker completed task'
				task.job.finishTask task
				# try all workers for new tasks when this worker is finished
				# one finished task can yield more than one new node to work on
				@deployWorkers()
			# give the new worker a taks
			@deployWorker worker

	# deploy one workers
	deployWorker: (worker) ->
		# use a round robin scheduler
		if not @nextRobin?
			return
		if not (@nextRobin.job? and @nextRobin.job.state is JobState.Running)
			@nextRobin.prev.next = @nextRobin.next
			@nextRobin.next.prev = @nextRobin.prev
			if @nextRobin is @nextRobin.next
				@nextRobin = undefined
				return
			@nextRobin = @nextRobin.next
			return @deployWorker worker
		@nextRobin.job.deployWorker worker
		@nextRobin = @nextRobin.next
	

	# deploy all idle workers
	deployWorkers: ->
		for id,worker of @cluster.workers
			if not worker.isWorking
				logger.info "deploy worker #{worker.id}"
				@deployWorker worker
	

	getJob: (id, cb) ->
		# look for active jobs
		job = jobs[id]
		if job?
			cb? job
			return
		DbJob.findById id, (err, job) ->
			cb? job

	createJob: (config, name, projectId, cb, collector) =>
		# ensure config as object
		if typeof(config) is 'string'
			config = JSON.parse config

		# find the project id
		if projectId?
			_projectId = projectId
		else if config.project?
			_projectId = config.project
		else
			throw new Error 'no project associated'
		# find the project or create it
		Project.findById _projectId, (err, project) =>
			logger.error err if err?
			if not project?
				project = new Project {
					_id: _projectId
					database: _projectId.toLowerCase().replace(/\s+/,'_')
				}

			# create job and connect all the wires
			job = new Job config, name, project, collector
			jobs[job.id] = job
			project.jobs.push job.id
			project.save (err, obj) ->
				logger.error err if err?
			job.on 'start', () =>
				# schedule the job on start
				if @nextRobin?
					robin = {job: job, prev: @nextRobin, next: @nextRobin.next}
					@nextRobin.next = robin
				else
					@nextRobin = {job: job}
					@nextRobin.prev = @nextRobin
					@nextRobin.next = @nextRobin
				@deployWorkers()
			cb null, job
