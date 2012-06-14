class Attribute extends Backbone.Model
	
class AttributeView extends Backbone.View
	tagName: 'li'
	className: 'ui-state-default attribute'
	
	initialize: =>
		@$el.data 'view', @

	render: =>
		if @model.get('referenceKey')
			@$el.attr 'class', 'ui-state-highlight attribute'
		@$el.text @model.get 'name'
		return @

class AttributeList extends Backbone.Collection
	model: Attribute

class Collection extends Backbone.Model
	defaults:
		attributes: new AttributeList()

class CollectionModalView extends Backbone.View
	tagName: 'div'
	className: 'modal fade'

	events:
		'click .save': 'save'
		'click .cancel': 'hide'
		'hidden': 'hidden'
		'shown': 'shown'
	
	template: 'views/client/extractCollectionModal'

	render: =>
		@$el.html jade.render @template, @model.toJSON()
		@$el.modal(show: false)
		@delegateEvents()
		@$el.modal 'show'
	
	save: =>
		@model.set('name',@$('form [name=name]').val())
		@hide()
	
	hide: =>
		@$el.modal 'hide'
	
	hidden: =>
		@remove()
	
	shown: =>


class CollectionView extends Backbone.View
	tagName: 'div'
	className: 'collection'

	events:
		'click i.icon-pencil': 'edit'

	template: 'views/client/extractCollection'

	initialize: =>
		@model.get('attributes').on 'add', @addAttr
		@model.on 'change', @render
		@$el.html jade.render @template,
			name: @model.get 'name'
			type: @model.get 'type'
		@$('ul').sortable({
			connectWith: '.sortable'
			placeholder: 'ui-state-highlight'
			items: ':not(li.key)'
			remove: @remove
			receive: @receive
		}).disableSelection()
		@model.get('attributes').forEach (attr) =>
			@$('ul').append new AttributeView({model: attr}).render().el
		
		return @

	render: ()=>
		@$('h4').text @model.get('name')
	
	edit: () =>
		new CollectionModalView({model:@model}).render()

	remove: (event) =>
		@model.get('attributes').remove($(event.srcElement).data('view').model)
	
	receive: () =>
		@model.get('attributes').add($(event.srcElement).data('view').model)


$ ->
	rawCol = new Collection
		name: rawColl
		attributes: new AttributeList rawColumns
		type: 'raw'
	referenceCol = new Collection
		name: 'Reference'
		type: 'reference'
	resultCol = new Collection
		attributes: new AttributeList [{name: 'reference key', referenceKey:true}]
		name: 'Result'
		type: 'result'

	rawColView = new CollectionView
		model: rawCol
	
	referenceColView = new CollectionView
		model: referenceCol
	
	resultColView = new CollectionView
		model: resultCol

	colBox = $ '.collections'
	colBox.append rawColView.el
	colBox.append referenceColView.el
	colBox.append resultColView.el

	$('#submit').click ->
		# $(@).button 'loading'
		data =
			raw: rawCol
			reference: referenceCol
			result: resultCol
		$.ajax
			type: 'POST'
			contentType: 'application/json'
			data: JSON.stringify data
			success: (res, textStatus, jqXHR) ->
				console.log 'grate success'
