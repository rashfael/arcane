# Acts as supervisor and controls all/some workers on one device.
#
# Talks with the frontend over TCP and forwards tasks to workers.

config = require '../config'

log4js = require('log4js')
log4js.configure(__dirname + '/../../logging.json')
log4js.replaceConsole log4js.getLogger('cluster')

_ = require 'underscore'
mongolian = require 'mongolian'
child_process = require 'child_process'
jocket = require('../../commons/jocket')
workers = {}
cluster = {}

# Fork one worker and handle communication
forkWorker = ->
	worker = child_process.fork __dirname + '/worker'
	worker.id = new mongolian.ObjectId().toString()
	workers[worker.id] = worker
	# forward messages from worker to frontend
	worker.on 'message', (message) ->
		message.worker = @id
		cluster.send {command: 'taskCompleted', task:message}
	# handle worker crashes/exits
	worker.on 'exit', (code) ->
		console.error "Worker #{@id} exited with Code #{code}"
		cluster.send {command: 'workerDied', worker: @id}
		delete workers[@id]
		# fork a new worker for the one that crashed
		newWorker = forkWorker()
		# just wait some time for worker to finish initing, then register at frontend //.HACK.//
		setTimeout () ->
			cluster.send {command: 'register', workers: [newWorker.id]}
		, 5000
	return worker

# Fork three workers TODO: make this configurable
for i in [1..config.cluster.workerCount]
	forkWorker()

# open connection to frontend and register all workers
initJocket = ->
	cluster = new jocket.JocketClient config.cluster.port, config.cluster.host, ->
		cluster.send {command: 'register', workers: _.keys(workers)}
	cluster.on 'error', (error) ->
		# autoretry connection if there is no frontend
		console.log 'socket error, retry'
		setTimeout initJocket, 1000
	# handle all commands from the frontend and delegate to the workers
	cluster.on 'command', (command) ->
		console.info 'cluster received command'
		switch command.command
			when 'task'
				task = command.task
				workers[task.worker].send {task: task}

initJocket()
