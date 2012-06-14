###
# Help contents
###

module.exports.index = (req, res) ->
	res.render 'help/index', {
		title: 'Überblick | Arcane Help'
	}

module.exports.gettingStarted = (req, res) ->
	res.render 'help/gettingStarted', {
		title: 'Mein erster Job | Arcane Help'
	}



module.exports.wandIntro = (req, res) ->
	res.render 'help/wand/intro', {
		title: 'Einführung | Arcane Wand Help'
	}

module.exports.wandGui = (req, res) ->
	res.render 'help/wand/gui', {
		title: 'Grafische Oberfläche | Arcane Wand Help'
	}



module.exports.academyIntro = (req, res) ->
	res.render 'help/academy/intro', {
		title: 'Einführung | Arcane Academy Help'
	}

module.exports.academyMonitor = (req, res) ->
	res.render 'help/academy/monitor', {
		title: 'Monitor | Arcane Academy Help'
	}

module.exports.academyJobMgmt = (req, res) ->
	res.render 'help/academy/jobMgmt', {
		title: 'Job-Verwaltung | Arcane Academy Help'
	}

module.exports.academyProjectMgmt = (req, res) ->
	res.render 'help/academy/projectMgmt', {
		title: 'Projekt-Verwaltung | Arcane Academy Help'
	}
