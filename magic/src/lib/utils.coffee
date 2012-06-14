# # Helper functions
#
# Those function are shared by some methods,
# so it makes sense to put them in one file.
#

getText = (element, includeChildren=0) ->
	text = ''
	if includeChildren >= 0
		# console.log element, includeChildren
		text = ''
		for child in element.childNodes
			text += if child.attributes then getText(child, --includeChildren) else child.textContent
	return text

module.exports.getText = getText