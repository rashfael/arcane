log4js = require 'log4js'
logger = log4js.getLogger 'cluster'
logger.setLevel 'INFO'

jocket = require('../../commons/jocket')
Supervisor = require './supervisor'
events = require 'events'

# This is the entry point for the *cluster* module and
# represents the Command & Control Server for the Cluster infrastructure.
# It tracks all **Supervisors** and **Workers** in the network.
# **Supervisors** automatically register with this Cluster.
#
# Events:
# -------
#
# - register(worker): 
#		fired when a new worker instance on a remote host becomes available
module.exports = class Cluster extends events.EventEmitter
	constructor: (@port) ->
		@supervisors = []
		@workers = {}
		@server = new jocket.JocketServer @port
		console.log 'Created JocketServer'
		@server.on 'connect', (client) =>
			supervisor = new Supervisor client, @
			supervisor.on 'register', (worker) =>
				@workers[worker.id] = worker
				@emit 'register', worker
			@supervisors.push supervisor
