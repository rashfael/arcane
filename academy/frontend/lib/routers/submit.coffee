###
# For debugging: manual job submission
###
fs = require 'fs'

module.exports.get = (req, res) ->
	res.render 'submit', {
		title: 'Submit JSON | Arcane Academy'
	}

module.exports.post = (req, res, next) ->

	if req.files.configfile.length > 0
		console.log 'Got file!'
		console.log req.files.configfile
		config = JSON.parse fs.readFileSync req.files.configfile.path, 'utf-8'
		name = req.body.config.name or req.files.configfile.name
	else
		config = JSON.parse req.body.config.raw
		name = req.body.config.name or 'Job ' + Date()
	project = req.body.config.project

	global.spawner.createJob config, name, project, (err, job) ->
		res.redirect '/jobs/'+ job.id
	
