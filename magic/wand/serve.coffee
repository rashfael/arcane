fs = require 'fs'
http = require 'http'
coffee = require 'coffee-script'
jade = require 'jade'

console.log 'Serving the magic for your wand!'
console.log 'Stop with ctrl+c'

getFile = (name) ->
	return fs.readFileSync(name, 'utf8')

jquery_src = getFile('../tests/template/jquery.js')

compileFile = (file, cb) ->
	source = getFile file
	return coffee.compile source

server = http.createServer (req, res) ->
	res.writeHead 200, {'Content-Type': 'text/javascript'}
	console.log('providing ' + req.url)
	if req.url isnt '/'
		switch req.url
			when "/bootstrap" then res.end compileFile('bootstrap.coffee')
			when "/jquery" then res.end jquery_src
			when "/magic" then res.end getFile('../out/magic.js')
			when "/wand" then res.end compileFile('wand.coffee')
			else res.end 'alert("Request for nonexisting script!")'
	else
		res.writeHead 200, {'Content-Type': 'text/html'}
		res.end jade.compile(getFile('manual.jade'))({
			bookmarklet: getFile('bookmarklet.js')
		})

server.listen(9000)
console.log 'Server is listening on http://localhost:9000'
