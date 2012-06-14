# Maps all navigation nodes

log4js = require('log4js')
logger = log4js.getLogger 'navigation'
logger.setLevel 'DEBUG'

# globally configure jsdom (does this work?)
require('jsdom').defaultDocumentFeatures = {
	FetchExternalResources : []
	ProcessExternalResources : false
	MutationEvents : false
	QuerySelector : false
}

#### ConfigurationMapping
# controlls which classes are used for
# which type name in the configuration file
module.exports.ConfigurationMapping =
	WalkthroughLinks: require './navigation/WalkthroughLinks'
	WalkthroughItems: require './navigation/WalkthroughItems'
	FollowLink: require './navigation/FollowLink'
	FillForm: require './navigation/FillForm'
	Magic: require './navigation/Magic'
	Collect: require './navigation/Collect'
	Pager: require './navigation/Pager'
	Start: require './navigation/Start'

