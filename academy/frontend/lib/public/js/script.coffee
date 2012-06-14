filter = {}
pager = {}

loadDynamic = ->
	$.ajax {
		type: 'POST'
		data:
			page: pager.page
			filter: filter
		success: (data, textStatus, jqXHR)->
			$('.loadContext').html data
	}

$ ->
	$('table.clickable tbody tr').click ->
		location.href = $(this).find('a').attr 'href'
	
	$(document).on 'click', '.pagination a', ->
		pager.page = $(this).attr 'href'
		return false if not pager.page?
		loadDynamic()
		return false
