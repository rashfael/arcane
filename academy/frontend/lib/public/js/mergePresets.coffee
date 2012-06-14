###
# The default map function body.
###
mapDefault = """// 'object' is the input parameter and represents one document
	object;

	// generate a 'key' out of the 'object'
	var key = null;

	return key;"""

###
# The default reduce function body.
###
reduceDefault = """// 'key' is the first input parameter
	key;

	// 'values' is the second input parameter
	values;

	// generate one 'value' out of the input parameters
	var value = null;

	// value needs a property _id with an array of all document _ids, 
	// the first _id will be updated, all others will be deleted

	return value;"""

###
# Some presets for merge operations.
###
presets =
	templateMapReduce:
		name: 'General Template (Map & Reduce)'
		map: mapDefault
		reduce: reduceDefault
	templateMap:
		name: 'General Template (Map only)'
		map: mapDefault
		reduce: '\n\n'
	mapExamples:
		name: 'Map Examples'
		map: """// 'object' is the input parameter and represents one document
			object;

			// generate a 'key' out of the 'object'
			var key = "";

			// make key case-insensitive
			key = key.toLowerCase();
			
			// ommit whitespace, but do not ommit special chars
			key = key.replace(/\\s/g,'');
			
			// do not ommit whitespace, but ommit special chars
			key = key.replace(/[^A-Za-z0-9\\s]/g,'');

			// ommit whitespace and ommit special chars
			key = key.replace(/\[^A-Za-z0-9]/g,'');

			return key;"""
		reduce: '\n\n'
	removeDups:
		name: 'Remove Duplicates'
		map: """// the ID of a single document (single row in the collection table)
			var objectId = '';

			// generate a unique ID for the given document in the collection
			for(var property in object) {
			  if(object.hasOwnProperty(property))
			    objectId += object[property];
			}

			// return the generated document ID
			return objectId;"""
		reduce: '\n\n'


presetSelection = ->
	sel = $('#presets').val()

	mapEditor.setValue presets[sel].map
	reduceEditor.setValue presets[sel].reduce

$ ->
	mapEditor.setValue mapDefault
	reduceEditor.setValue  reduceDefault

	$.each presets, (id, preset) ->
		$('#presets').append '<option value="' + id + '">' + preset.name + '</option>'

	$('#presets').change presetSelection
