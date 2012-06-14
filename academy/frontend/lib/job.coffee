# Job related code

log4js = require 'log4js'
logger = log4js.getLogger 'job'
logger.setLevel 'DEBUG'

events = require 'events'
util = require 'util'
Task = require './task'
ResultTreeNode = require './resultTreeNode'

DbJob = global.mongoose.model 'Job'

module.exports.JobState = JobState = {
		Idle : 'idle'
		Paused : 'paused'
		Stopped : 'stopped'
		Running : 'running'
		Finished : 'finished'
}

#	configuration: job configuration JSON
#	name: Job Name
#	project: Associated project
#	collector: a collector object instance
#
## Events
#
# * start
# * pause
# * abort
# * finished

module.exports.Job = class Job extends events.EventEmitter
	
	constructor: (@_config, @name, @_project, @_collector) ->
		logger.info '++ New Job!'

		events.EventEmitter.call this

		throw Error('Emtpy job configuration!') if not @_config
		
		# initialize things
		
		@state = JobState.Idle
		
		# dates
		@submitted = new Date()
		@started = undefined
		@stopped = undefined
		@finished = undefined
		
		@finishedWorkers = 0
		@runningWorkers = 0

		@archived = false
		@configuration = JSON.stringify @_config, null, 2
		@project = @_project._id
		@collections = []
		
		@generateTrees()
		
		# throw job into db
		@_dbJob = new DbJob {
			_id: new global.mongoose.Types.ObjectId()
			name: @name
			configuration: @configuration
			project: @project
			collections: @collections
			state: @state
			submitted: @submitted
			archived: false
			finishedWorkers: @finishedWorkers
			runningWorkers: @runningWorkers
		}
		
		@_dbJob.save()
		
		@id = @_dbJob._id

	# generate the config tree from the configuration
	generateTrees: ->
		# TODO: check for cycles
		navigation = @_config.navigation
		
		# build mapping dict
		nodeMappings = {}
		for key, mapping of @_config.mappings
			for validNode in mapping.validFor
				# escape $ and .
				cleanMap = {}
				for key, val of mapping.map
					# clean value
					if typeof val isnt 'string'
						cleanVal = val
					else
						cleanVal = val.replace(/[$\.]/g, '_')
					# clean key
					cleanMap[key.replace(/[$\.]/g, '_')] = cleanVal
				mapping.map = cleanMap
				nodeMappings[validNode] = mapping
		
		# create root node
		@configTree = {next: []}

		# recursive function to build the tree
		buildConfigTree = (parent, navNode) =>
			# if node already exists, just connect
			if navNode.node?
				navNode.node.prev.push parent
				parent.next.push navNode.node
				return

			# create new node
			node = {
				id: navNode.id
				name: navNode.name
				type: navNode.type
				config: navNode.config
				prev: [parent]
				next: []
			}

			# find encoding
			if navNode.encoding
				node.encoding = navNode.encoding
			else if parent
				node.encoding = parent.encoding
			
			# find mapping
			if nodeMappings[node.id]
				node.mapping = nodeMappings[node.id]
			else
				node.mapping = parent.mapping
			
			if node.type is 'FillForm'
				node.config.mapping = node.mapping
			
			# generate additional config for collect nodes
			if node.type is 'Collect'
				node.config.mapping = node.mapping
				node.config.database = @_project.database
				
				if not node.config.collection?
					node.config.collection = 'raw:' + new global.mongoose.Types.ObjectId()
				else
					node.config.collection = 'raw:' + node.config.collection
				
				# create clean list of keys
				structure = {}
				if node.config.mapping?
					for key, val of node.config.mapping.map
						if val is false
							# structure[key] = {count: 0, ratio:0, show: false, config: true}
							continue
						else if not val
							structure[key] = {count: 0, ratio:0, show: true, config: true}
						else
							structure[val] = {count: 0, ratio:0, show: true, config: true}
				
				# TODO could create duplicates, fix later
				if @collections.indexOf(node.config.collection) < 0
					@collections.push node.config.collection
				# TODO possibly overrides everything
				if @_project.collections[node.config.collection]?
					oldStructure = @_project.collections[node.config.collection].structure
					for key, val of structure
						oldStructure[key] = val
				else
					@_project.collections[node.config.collection] = {type: 'raw', structure: structure}
				@_project.markModified 'collections'
			
			# remember our created node in the configuration
			navNode.node = node
			parent.next.push node

			# recursion!
			for navNodeName in navNode.next
				buildConfigTree node, navigation[navNodeName]
		
		# start recursive build depending on configuration base
		# check if base is array
		if navigation.base.next?
			buildConfigTree @configTree, navigation.base
		else
			for base in navigation.base
				buildConfigTree @configTree, base

		# initialize result tree
		@resultTree = new ResultTreeNode undefined, undefined
		@resultTree.addChildren @configTree.next

	# create new task and send it to the worker
	deployWorker: (worker) =>
		node = @resultTree.findNextNode()
		# no free nodes does not mean that the job is finished, some tasks could still be open
		# just do nothing, scheduler handles this
		#logger.debug "All Nodes #{@resultTree.countFreeNodes()}/#{@resultTree.countNodes()}"
		if node is undefined
			#logger.debug 'No Task'
			return false
		
		node.inProgress = true
		# start node has no input
		if node.configNode.type isnt 'Start'
			input = node.input
		
		config = node.configNode.config
		type = node.configNode.type
		task = new Task worker, config, type, input
		task.node = node
		# TODO, put this in the config
		if node.configNode.encoding
			task.encoding = node.configNode.encoding
		task.job = @
		worker.work task
		@runningWorkers++
		@_dbJob.runningWorkers++
		@_dbJob.save()
		return true

	# gets called from the scheduler on finish response from the worker
	finishTask: (task) =>
		node = task.node
		logger.info 'Output Count: ' + task.output.length
		
		@finishedWorkers++
		@runningWorkers--
		@_dbJob.finishedWorkers++
		@_dbJob.runningWorkers--
		@_dbJob.save()
		node.inProgress = false
		
		# use given local collector, if existing, just for testing
		if @_collector? and node.type is 'Collect'
			for output in task.output
				@_collector.save output
		else
			#nc = 0
			# create children from output
			for input in task.output
				for configNode in node.configNode.next
					node.addChild configNode, input
					#nc++
			#logger.debug "New Nodes #{nc}"
		#try removing finished node and check if all work is done
		node.remove()
		if @resultTree.children.length is 0
			@state = JobState.Finished
			@finished = new Date()
			console.log '!! Job is done !!'
			@_dbJob.state = @state
			@_dbJob.finished = @finished
			@_dbJob.save()
			@emit 'finished', {}

	# all the status changes
	getStatus: =>
		return {
			state : @state
			submitted : @submitted
			started : @started
			stopped : @stopped
			finished : @finished
			finishedWorkers: @finishedWorkers
			runningWorkers: @runningWorkers
		}
	
	# @param {function} cb Callback is executed when the job was successfully started
	start: (cb) =>
		if @state != JobState.Finished and @state != JobState.Running and @state != JobState.Stopped
			console.log "Starting job!"
			@state = JobState.Running
			@started = new Date()
			@_dbJob.state = @state
			@_dbJob.started = @started
			@_dbJob.save()
			@emit 'start'
			cb?()

	pause: (cb) =>
		if @state != JobState.Finished and @state != JobState.Stopped
			console.log 'Pausing job!'
			@state = JobState.Paused
			@stopped = new Date()
			@_dbJob.state = @state
			@_dbJob.stopped = @stopped
			@_dbJob.save()
			@emit 'pause'
			cb?()
	
	abort: (cb) =>
		console.log 'Aborting job!'
		@state = JobState.Stopped
		@stopped = new Date()
		@_dbJob.state = @state
		@_dbJob.stopped = @stopped
		@_dbJob.save()
		@emit 'abort'
		cb() if cb?

	delete: (cb) =>
		console.log 'Deleting job!'
		if @state is JobState.Running
			cb(new Error('Cannot delete a running Job'))
			return
		console.log 'Cleaning up DB Job'
		@_project.jobs.splice(@_project.jobs.indexOf(@_id),1)
		@_project.save()
		@_dbJob.remove =>
			console.log 'Removing traces of myself'
			delete global.jobs[@id]
			cb(null)

