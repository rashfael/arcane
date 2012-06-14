# Entry point for the frontend, starts all the things

config = require '../config'
global.config = config

# Module dependencies
log4js = require('log4js')
log4js.configure(__dirname + '/../../logging.json')
log4js.replaceConsole log4js.getLogger('academy')
console.info 'Initiated logging framework!'

express = require 'express'
Mongolian = require 'mongolian'
_ = require 'underscore'
jade_browser = require 'jade-browser'

mongoose = require 'mongoose'
mongoose.connect config.mongoose.url
global.mongoose = mongoose

global.mongolian = new Mongolian config.mongolian.url
mongodb_server = global.mongolian
querystring = require 'querystring'

#initialize db-models
DbJob = mongoose.model 'Job', require('./schemas/job').Job(), 'jobs'
Project = mongoose.model 'Project', require('./schemas/project').Project(), 'projects'

Job = require('./job').Job

# global Spawner
Spawner = require './spawner'
global.spawner = new Spawner()

#clean up db
DbJob.update {archive: {$exists: false}}, {$set: {archived: true}}, {multi: true}, (err, data) ->
	if err
		console.log err
	console.log 'cleaned up database'

#TODO Indexing

app = module.exports = express.createServer()

# middlewares

pagination = (req, res, next) ->
	pagerLimit = 30
	page = parseInt req.query.page || 0
	if req.body
		page = parseInt req.body.page || page
	res.pagination = {
		pagerLimit: pagerLimit
		page: page
	}
	res.pagination.generate = (total) ->
		pages = Math.ceil(total / pagerLimit)
		if page > 0 then previous = true
		if page < pages - 1 then nextPage = true

		if pages < 10
			range_start = 1
			range_end = pages - 1
			render_range = false
		else
			range_start = Math.max(page - 3, 1)
			range_end = Math.min(page + 4, pages - 1)
			render_range = true

		pager =
			total: total # all entries
			limit: pagerLimit # entries per page
			pages: pages # total pages
			page: page # current page
			range_start: range_start
			left_ellipsis: range_start isnt 1 # render the right ellipsis
			right_ellipsis: pages - range_end isnt 1 # render the left one
			range_end: range_end
			render_range: render_range # true, if not all pages fit into the pager
			next: nextPage # is there a next page?
			previous: previous # is there a previous page?
			querystring: querystring
		res.local 'pager', pager
	next()

# Configuration

app.configure ->
	app.set 'views', __dirname + '/views'
	app.set 'view engine', 'jade'
	app.set 'view options', {layout: false} # manual layout inheritance
	app.use log4js.connectLogger log4js.getLogger('academy-access')
	app.use express.bodyParser()
	app.use express.methodOverride()
	app.use app.router
	app.use express.static __dirname + '/public'
	app.use jade_browser '/js/templates.js', '/views/client/*', {root: __dirname, maxAge: 0} # serve precompiled jade templates for the browser
	app.use require('connect-assets') {src: __dirname + '/public'}

app.configure 'development', ->
	app.use express.errorHandler { dumpExceptions: true, showStack: true }

app.configure 'production', ->
	app.use express.errorHandler()

# Routes

# index page
app.get '/', (req, res) ->
	res.render 'index', {
		title: 'Arcane Academy'
	}

# manual job submission

submitRouters = require './routers/submit'

app.get '/submit', submitRouters.get
app.post '/submit', submitRouters.post

# project control

projectRouters = require './routers/projects'

app.get '/projects', projectRouters.list
app.get '/projects/:id', projectRouters.details
app.all '/projects/:id/:col', pagination, projectRouters.collection
app.all '/projects/:id/:col/extract', projectRouters.extract
app.get '/projects/:id/:col/structure', projectRouters.structure
app.post '/projects/:id/:col/structure', projectRouters.changeStructure
app.get '/projects/:id/:col/export/:exType/:filename', projectRouters.export
app.post '/projects/:id', pagination, projectRouters.collection

# merge & transform

app.get '/projects/:id/:col/merge', projectRouters.merge
app.post '/projects/:id/:col/merge', projectRouters.performMerge
app.get '/projects/:id/:col/transform', projectRouters.transform
app.post '/projects/:id/:col/transform', projectRouters.performTransform

#collectionRouters = require './routers/collections'
#app.post '/collections/:project/:col', pagination, collectionRouters.dynamicList

# job control

jobRouters = require './routers/jobs'

app.get '/control', jobRouters.list
app.get '/jobs/:id', jobRouters.details
app.all '/jobs/:id/edit', jobRouters.edit

# monitoring

monitorRouters = require './routers/monitor'

app.get '/monitor', monitorRouters.get

# REST API

apiRouters = require './routers/api'

app.get '/api/version', apiRouters.version
app.get '/api/jobs', apiRouters.list
app.post '/api/jobs', apiRouters.newJob
app.get '/api/jobs/:id', apiRouters.details
app.post '/api/jobs/:id', apiRouters.edit
app.all '/api/jobs/:id/start', apiRouters.start
app.all '/api/jobs/:id/pause', apiRouters.pause
app.all '/api/jobs/:id/abort', apiRouters.abort
app.all '/api/jobs/:id/delete', apiRouters.delete
app.get '/api/projects', apiRouters.listProjects

# Help

helpRouters = require './routers/help'

app.get '/help', helpRouters.index
app.get '/help/gettingStarted', helpRouters.gettingStarted
app.get '/help/wand/intro', helpRouters.wandIntro
app.get '/help/wand/gui', helpRouters.wandGui
app.get '/help/academy/intro', helpRouters.academyIntro
app.get '/help/academy/monitor', helpRouters.academyMonitor
app.get '/help/academy/jobMgmt', helpRouters.academyJobMgmt
app.get '/help/academy/projectMgmt', helpRouters.academyProjectMgmt

app.listen config.frontend.port
console.log "Express server listening on port %d in %s mode", config.frontend.port, app.settings.env

process.on 'uncaughtException', (err) ->
	console.error """ 
				--------------------
				UNCAUGHT EXCEPTION !
				--------------------"""
	console.error err
