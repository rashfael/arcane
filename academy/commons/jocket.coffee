net = require 'net'
events = require 'events'

class JocketClient extends events.EventEmitter
	constructor: (clientOrPort, @host='localhost', cb) ->
		init = =>
			@client.setEncoding 'utf8'
			@client.on 'data', (data) =>
				if @buffer?
					@buffer += data
				else
					@buffer = data
				lines = @buffer.split '\n'
				#return fast if no line break
				if lines.length < 2
					return
				if lines[lines.length - 1] is ''
					@buffer = undefined
					#remove last empty
					lines.splice lines.length - 1 , 1
				else
					@buffer = lines[lines.length - 1]
					#remove last incomplete
					lines.splice lines.length - 1, 1
				
				for line in lines
					json = JSON.parse line
					@emit 'command', json
			if cb?
				cb()
			
		if typeof(clientOrPort) is 'number'
			@port = clientOrPort
			@client = net.connect @port, @host, =>
				init()
			@client.on 'error', (error) =>
				@emit 'error', error
		else
			@client = clientOrPort
			init()
	
	send: (command) ->
		string = (JSON.stringify command) + '\n'
		@client.write string

module.exports.JocketClient = JocketClient

module.exports.JocketServer = class JocketServer extends events.EventEmitter
	constructor: (@port) ->
		@server = net.createServer (client) =>
			console.log 'Connection established with ', client.remoteAddress
			@emit 'connect', new JocketClient client
		@server.listen @port, =>
			console.log 'Listening on', @port
