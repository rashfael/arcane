log4js = require('log4js')
logger = log4js.getLogger 'nav:pager'
logger.setLevel 'DEBUG'
assert = require 'assert'

Generic = require './Generic'
helpers = require './helpers'

request = require 'request'
jsdom = require 'jsdom'
jquery = require 'jquery'
encoder = require '../encoder'

#### Pager
# Searches for all urls for a selected pager.
#
# Options:
#
# * **pagerSelector**: selector for the pager
# * **encoding**: uses user specified encoding (optional)
module.exports = class Pager extends Generic

	process: (cb) =>
		logger.info 'Using Pager.'
		@getWindow (err, window) =>
			if err
				logger.fatal 'FillForm got broken window: ' + err
				window.close()
				cb err, null
			else
				helpers.getElements window, @config.pagerSelector, "", @config.encoding, (elements) =>
					urls = []
					# start for the pager
					for i in elements.find('a')
						urls.push {href: i.href, innerHTML: i.innerHTML}
					
					getUrlsFromPager @request, urls, @config.pagerSelector, {}, [], @config.encoding, (newUrls) =>
						logger.log '-| Pager |->' + newUrls.lenght + " Elements found"
						
						out = []
						
						if @request.method? and @request.method.toUpperCase() is 'POST'
							for url in newUrls
								out.push {
									request: {
										url: url
										method: @request.method
										body: @request.body
										headers: {
											'content-type': 'application/x-www-form-urlencoded'
										}
									}
								}
						else
							for url in newUrls
								newUrl = url
								newUrl = newUrl.replace " ", "%20"
								#newUrl = newUrl.replace "%3F","?"
								#newUrl = newUrl.replace "%26","&"
								#newUrl = newUrl.replace "%3D","="
								out.push {
									request: {
										url: newUrl
									}
								}

						window.close()
						cb null, out

	#### getUrlsFromPager
	# Pagerfunction, cb is array of urls
	#
	# Parameter:
	#
	# * **pageRequest**: for checking if this node is after an form with post request, for sending the post information with the next requests.
	# * **urlsToVisit**: is an object array (keys: href, innerHTML). Saves the urls which are visit in the next steps.
	# * **selector**: selector of the pager
	# * **visitedUrls**: is a dictionary with the already visited urls
	# * **urls**: saves the all correct urls from the pager
	# * **configEncoding**: user specified encoding (optional)
	getUrlsFromPager = (pageRequest, urlsToVisit, selector, visitedUrls, urls, configEncoding, cb) ->
		if urlsToVisit.length > 0
			if urlsToVisit[0].href.constructor is String and urlsToVisit[0].href.indexOf("http://") isnt 0
				urlsToVisit.shift()
				getUrlsFromPager pageRequest, urlsToVisit, selector, visitedUrls, urls, configEncoding, (url) ->
					cb url
			else
				req = { 
					url: urlsToVisit[0].href,
					encoding: 'binary'
					headers: {
						'User-Agent': 'my-little-scraper/0.0.1'
					}
				}
				#urlsToVisit[0].href.encoding = 'binary'
				
				if pageRequest.method?
					if pageRequest.method.toUpperCase() is 'POST'
						req.method = pageRequest.method
						req.body = pageRequest.body
						req.headers.content-type = 'application/x-www-form-urlencoded'
				
				request req, (err, res, body) =>
					throw err if err

					# Transform encoding if necessary
					if configEncoding?
						encoding = configEncoding.toLowerCase()
						# logger.info "using manual encoding: " + encoding
					else if res.headers['content-type']?
						# Hint: res.headers['content-type'] should be something
						# like "text/html;charset=ISO-8859-1"
						parts = res.headers['content-type'].split '='
						if parts.length > 1
							encoding = parts[parts.length - 1].toLowerCase()
					body = encoder.toUtf8 body, encoding

					jsdom.env body, [], (err, window) ->
						if err
							logger.fatal "Window creation failed wit #{err} HTML: " + @html
							window.close()
							# fast exit if window creation fails hard
							cb err, null
							return null
						jquery.create window
						assert.ok window.jQuery, 'Window has loaded jQuery'
						# Delete the current url from the urls which are to visit
						currentUrl = urlsToVisit.shift()
						visitedUrls[currentUrl.innerHTML] = currentUrl
						urls[currentUrl.innerHTML] = currentUrl.href
						
						elements = window.jQuery(selector).find('a')
						count = 0

						for el in elements
							href = el.href
							found = false
							for u in urlsToVisit
								if u.innerHTML is el.innerHTML
									found = true

							if not found and not urls[el.innerHTML] and not visitedUrls[el.innerHTML] and href.indexOf("http://") is 0
								count++
								urlsToVisit.push {href: el.href, innerHTML: el.innerHTML}
						
						getUrlsFromPager pageRequest, urlsToVisit, selector, visitedUrls, urls, configEncoding, (url) ->
							window.close()
							cb url
		else
			savedUrls = []
			for key,val of urls
				savedUrls.push val
			cb savedUrls
