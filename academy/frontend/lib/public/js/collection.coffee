class CollectionRow extends Backbone.Model

class CollectionCell extends Backbone.Model

class CollectionColumn extends Backbone.Model

class CollectionStructure extends Backbone.Collection
	model: CollectionColumn


class Collection extends Backbone.Collection
	model: CollectionRow

class CollectionTableColumnHeader extends Backbone.View

	tagName: 'th'
	
	events:
		'click .icon-remove': 'rmColumn'
	
	initialize: (opts) =>
		@parent = opts.parent
	
	rmColumn: (evt) =>
		@parent.model.structure.remove @model
	
	render: =>
		@$el.text @model.get 'key'
		@$el.prepend ' <i class="icon-remove" style="display:none"></i>'
		return @


class CollectionTableCellView extends Backbone.View

	tagName: 'td'

	render: =>
		subitem = @model.get 'value'
		if subitem? and typeof subitem is 'object'
			if subitem.length > 0
				console.info 'Render subitems:', subitem # TODO: Subitem handling!
				
				subitemTable = $ '''
				<table>
					<thead><tr></tr></thead>
					<tbody></tbody>
				</table>'''
				
				for key,value of subitem[0]
					subitemTable.find('thead tr').append """<th>#{key}</th>"""

				for item in subitem
					subitemTable.find('tbody').append '<tr></tr>'
					for key,value of item
						subitemTable.find('tbody tr:last').append """<td>#{value}</td>"""

				console.log 'THE TABLE:', subitemTable.html()

				@$el.html """
				<a class="btn btn-info subitem" rel="popover"
					data-content='<table class="table table-condensed">#{subitemTable.html()}</table>'
					data-original-title="#{@model.get('key')} - #{subitem.length}">Subitems (#{subitem.length})</a>
				"""
			else @$el.html ""
		else
			@$el.html @model.get 'value'
		return @




class CollectionTableView extends Backbone.View
	
	tagName: 'table'
	className: 'table table-striped collection-table'
	
	initialize: (opts) =>
		@model.structure.on 'remove', @render
		
	render: =>
		@$el.html ''
		# build the table header
		thead = $ '<thead></thead>'
		theadrow = thead.append '<tr></tr>'
		# decide if the view should filter for the show/hide flag
		if @model.structure.at(0).get('show')?
			filterFn = (e) -> e.get 'show'
		else
			filterFn = -> true
		
		# build the table head and remember the keys used
		keys = []
		for entry in @model.structure.filter(filterFn)
			keys.push entry.get 'key'
			h = new CollectionTableColumnHeader
				model: entry
				parent: @
			theadrow.append(h.render().el)
		@$el.append thead

		@model.each (entry) =>
			row = $('<tr></tr>')
			for key in keys
				model = new CollectionCell
					key: key
					value: entry.get key
				cellView = new CollectionTableCellView
					 model: model
				 row.append cellView.render().el
			@$el.append row
		return @



$ ->
	# create the table structure (columns)
	structure = new CollectionStructure
	if rawStructure?
		for key, value of rawStructure
			structure.add new CollectionColumn
				key: key
				count: value.count
				ratio: value.ratio
				show: value.show
	else
		for key in rawKeys
			structure.add new CollectionColumn
				key: key
				count: 0
				ratio: 0
				show: true
	
	entryCollection = new Collection rawData
	entryCollection.structure = structure # let the collection know about its structure
			
	tableView = new CollectionTableView
		model: entryCollection 

	tableElement = $ '.collection-table-wrap'
	tableElement.append tableView.render().el
	
	$(document).on 'hover', 'th', (evt) ->
		if evt.type is 'mouseenter'
			$(this).find('i').show()
		else
			$(this).find('i').hide()

	# fancy up the stuffs
	$('.collection-table th').tooltip
		placement: 'bottom'
		
	$('.btn.subitem').popover
		placement: 'left'
		trigger: 'focus'
		delay: {show: 500, hide: 100}

	$('.btn.subitem').click ->
		$(this).toggleClass 'btn-info'
		$(this).popover 'toggle'
		
