#!/usr/bin/env coffee
argv = require('optimist')
        .usage('Usage: $0 -f path/to/config [-o the/result.out]')
        .demand(['file'])
        .alias('f', 'file')
        .describe('file', 'Configuration file (.json or module)')
        .alias('o', 'out')
        .describe('out', 'Output file location.')
        .default('out', 'scraper-result.txt')
        .argv

fs = require 'fs'

log4js = require('log4js')
logger = log4js.getLogger 'test runner'
logger.setLevel 'INFO'

mongoose = require 'mongoose'
mongoose.connect 'mongodb://localhost/academy_tests'
global.mongoose = mongoose

Mongolian = require 'mongolian'
global.mongolian = new Mongolian
mongodb_server = global.mongolian

#initialize db-models
DbJob = mongoose.model 'Job', require('../frontend/lib/schemas/job').Job(), 'jobs'
Project = mongoose.model 'Project', require('../frontend/lib/schemas/project').Project(), 'projects'

Job = require('../frontend/lib/job').Job

#try starting the workers in this instance
cluster = require '../cluster/lib/cluster'

# global Spawner
Spawner = require '../frontend/lib/spawner'
global.spawner = new Spawner()

config = require './' + argv.file

logger.info 'Using config file: ', argv.file
logger.info config

# create spawner and collector for this job
logger.info 'Creating Collector for Spawner'
collector = require('./collectors').createCollector {
 type: 'File'
 file: './' + argv.out
}

logger.info 'Using custom Collector:', collector

spawner.createJob config, null, 'tests', (err, job) ->
	job.on 'finished', (data) ->
		logger.info "Job finished (got event)"
		logger.info "Data:"
		logger.info data
		#logger.info j.getStatus()
		logger.info "Our job is done here!"
		mongoose.disconnect()
		collector.end()
		setTimeout((-> process.exit 0), 1500)

	starter = ->
		job.start ->
			logger.info "Job started!"

	setTimeout starter, 3000
, collector

