log4js = require 'log4js'
logger = log4js.getLogger 'supervisor'
logger.setLevel 'INFO'
events = require 'events'
Worker = require './worker'


# A **Supervisor** represents one remote host supervising multiple workers.
#
# This class is used mostly internally and should not be called directly,
# except for statistics and the likes.
#
# Events (and parameters):
# ------------------------
# - register: worker
module.exports = class Supervisor extends events.EventEmitter
	constructor: (@client, @cluster)->
		@workers = {}
		# receive an answer from the remote supervisor
		@client.on 'command', (command) =>
			switch command.command
				when 'register'
					for workerId in command.workers
						worker = new Worker workerId, @
						@workers[workerId] = worker
						@emit 'register', worker
				when 'taskCompleted'
					worker = @workers[command.task.worker]
					#TODO taskId checking and things
					if not worker.task.id is command.task.id
						throw new Error 'task ids do not match'
					if command.task.output
						worker.task.output = command.task.output
					else
						worker.task.output = []
					worker.isWorking = false
					worker.emit 'taskCompleted', worker.task
				when 'workerDied'
					worker = @workers[command.worker]
					node = worker.task.node
					#retry three times
					if not node.retries?
						node.retries = 0
					if node.retries >= 3
						node.remove()
						logger.error "Worker #{worker.id} died three times, skip node"
					else
						node.inProgress = false
						node.retries++
						logger.error "Worker #{worker.id} died #{node.retries} times and will be replaced"
					delete @workers[command.worker]

	
	# Sends a task to the remote host (internal)
	sendTask: (task) ->
		@client.send {command: 'task', task: task.sanitize()}
