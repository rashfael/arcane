log4js = require 'log4js'
logger = log4js.getLogger 'worker'
logger.setLevel 'INFO'
events = require 'events'

# Represents one worker on a remote host.
# Holds the state of the remote worker.
#
# Properties
# ----------
#
# - isWorking: Boolean
#
# Events
# ------
#
# - taskCompleted(task):
#		fired when worker finishes his current task.
module.exports = class Worker extends events.EventEmitter
	constructor: (@id, @supervisor) ->
		console.log "Created worker #{@id}"
		@isWorking = false

	# Instruct the remote worker to execute this task
	work: (task) ->
		task.worker = @id
		@task = task
		@isWorking = true
		@supervisor.sendTask @task
