#!/usr/bin/env coffee
fs = require 'fs'
_ = require 'underscore'
{exec} = require 'child_process'

folder =  'examples'

all_files = fs.readdirSync folder

configs = _.filter all_files, (name) ->
	return /\.json/.test name

console.log configs 

runNextConfig = ->
	config = configs.pop()
	console.log "Running #{config}"
	exec "coffee run -f #{folder}/#{config}", (err, stdout, stderr) ->
		console.log("Error in #{config}:", err)
		console.log("Stderr of #{config}:", stderr)
		runNextConfig()

runNextConfig()
	
