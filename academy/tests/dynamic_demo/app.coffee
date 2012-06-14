_ = require 'underscore'
express = require 'express'
db = require './data'
app = express.createServer()

app.configure ->
  app.set 'views', __dirname + '/views'
  app.set 'view engine', 'jade'
  app.set 'name', 'MiniCMS'
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static(__dirname + '/public')
  app.use app.router;

app.configure 'development', ->
  app.use express.errorHandler { dumpExceptions: true, showStack: true }
  app.use(express.logger());

app.configure 'production', ->
  app.use express.errorHandler()

# Middleware
loadCategory = (req, res, next) ->
  if db[req.params.category]
    req.category = db[req.params.category]
    next()
  else
    throw Error "Category #{req.params.category} does not exist!"

# Routes
app.get '/:category/', loadCategory, (req, res) ->
    res.render 'category', {
        title: app.settings.name + ' | ' + req.params.category
        categoryName: req.params.category
        items: req.category
    }

app.get '/:category/:id', loadCategory, (req, res) ->
    item = req.category[req.params.id]
    throw Error "Item with id #{req.params.id} does not exist!" if not item
    res.render 'details', {
        title: app.settings.name + ' | ' + item.name
        item: item
    }

app.get '/', (req, res) ->
  res.render 'index', {
    title: app.settings.name
    categories: _.keys db
  }

app.listen 3000;
console.log "Express server listening on port %d in %s mode", app.address().port, app.settings.env