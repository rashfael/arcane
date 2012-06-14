Generic = require './Generic'

#### Start
# returns an request of the defined site
#
# Options:
#
# * **request.url**: Url which is the starting adress of the website
module.exports = class Start extends Generic
	
	process: (cb) =>
		cb null, [{
			request:
				url: @config.request.url
		}]
