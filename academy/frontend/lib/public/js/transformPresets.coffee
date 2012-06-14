###
# The default modifier function body.
###
modifierDefault = """// 'object' is the input parameter and represents one document (one row in the collection table)
	object;

	// modify 'object' here, e.g. eliminate prefixes by
	//    object.Preis = object.Preis.substring(3);
	// or do some replacements like
	//    object.Preis = object.Preis.replace('EUR', '€');

	// return 'false' iff the document (row) should be removed, otherwise 'true'
	return true;"""
###
# Some presets for transform operations.
###
presets =
	template:
		name: 'General Template'
		modifier: modifierDefault



presetSelection = ->
	sel = $('#presets').val()

	modifierEditor.setValue presets[sel].modifier

$ ->
	modifierEditor.setValue modifierDefault

	$.each presets, (id, preset) ->
		$('#presets').append '<option value="' + id + '">' + preset.name + '</option>'

	$('#presets').change presetSelection
