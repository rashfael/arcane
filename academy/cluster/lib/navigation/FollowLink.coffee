log4js = require('log4js')
logger = log4js.getLogger 'nav:followLink'
logger.setLevel 'DEBUG'

Generic = require './Generic'
helpers = require './helpers'

#### Follow Link
# follow one link in html and return new req
#
# Options:
#
# * **linkSelector**: selektor for the link which should be followed
# * **encoding**: uses user specified encoding (optional)
module.exports = class FollowLink extends Generic

	process: (cb) =>
		logger.info 'Getting link to follow.'
		@getWindow (err, window) =>
			if err
				logger.fatal 'FollowLink got broken window: ' + err
				window.close()
				cb err, null
			else
				logger.info 'Trying to extract link to follow!'
				helpers.getElements window, @config.linkSelector, "a", @config.encoding, (elements) =>
					anchor = elements[0]
					if not anchor?
						logger.warn 'linkSelector did not return result!'
						# throw the window out
						window.close()
						cb "FollowLink selector didn't return an anchor!", null
						return
					out = [{
						request:
							url: anchor.href
					}]
					logger.log '-| Follow Link |->', anchor.href
					window.close()
					cb null, out
