assert = require 'assert'
jsdom = require('jsdom').jsdom
jquery = require('jquery')
attributes = require '../src/lib/attributes'
magic = require '../src/magic'

template = '''
<html>
<head>
	<title>magic tests</title>
</head>
<body>
	{body}
</body>
</html>
'''

suite 'General stability', ->

	test 'Weird documents', ->
		documents = [
			'<html></html>',
			'<html><p<h1></html>',
			'<html><p<p<p>>></html>',
		]

		for snippet in documents
			document = jsdom snippet
			window = document.createWindow()
			assert.doesNotThrow(
					window.jQuery = jquery.create window
					attr = new attributes.Attributes window
					result = attr.findAttributes document)


	test 'full magic API usage with cleanup', ->
		body = '''
		<p class='test'>
			Hello World
		</p>
		<div class='level1'> Level 1
			<div> Level 2
				<div> Level 3</div>
			</div>
			<img src='http://img.tld/some.png/' alt='some image' />
		</div>
		<div class='review'>
			<span class='name'>It is bullshit!</span>
			<span class='rating'>1/5</span>
		</div>
		<div class='review'>
			<span class='name'>I love it!</span>
			<span class='rating'>5/5</span>
		</div>
		<div class='review'>
			<span class='name'>Meh!</span>
			<span class='rating'>2/5</span>
		</div>
		<div id='foo' class='bar'>Egg</div>
		<div>
		<ul class="related">
			<li><span class="name">Hurr Produkt 123</span></li>
			<li><span class="name">Durr Dings Dreiunvierzig</span></li>
		</ul>
		</div>
		<table class='some-table'>
			<tr>
				<td>K4</td><td>K5</td><td>K6</td>
			</tr>
			<tr>
				<td>V4</td><td>V5</td><td>V6</td>
			</tr>
		</table>
		'''
		
		config = {
			SubItems: {
				groups: [{
							key: 'reviews'
							selector: '.review'
						},
						{
							key: 'related-items'
							selector: 'ul.related li'
						}]
			}
		}
		
		document = jsdom template.replace /{body}/, body
		window = document.createWindow()
		window.jQuery = jquery.create window
		m = new magic window
		result = m.attributes.findAttributes document, config
		result = magic.cleanUp result
		
		assert.equal 'Hello World', result.test
		assert.equal 'V5', result.K5
		
		relatedItems = [
			{name: 'Hurr Produkt 123'},
			{name:'Durr Dings Dreiunvierzig'} ]
		assert.deepEqual relatedItems, result['related-items']

suite 'CustomSelectors', ->
	
	method = {}
	document = {}
	window = {}
	
	setup ->
		body = '''
		<p class='test'>
			Hello World
		</p>
		<div class='level1'> Level 1
			<div> Level 2
				<div> Level 3</div>
			</div>
		</div>		
		'''
		
		document = jsdom template.replace /{body}/, body
		window = document.createWindow()
		window.jQuery = jquery.create window
		method = new attributes.methods.CustomSelectors window
	
	test 'has correct method name', ->
		assert.equal 'CustomSelectors', method.name
		
	test 'returns the expected values', ->
		config = {
			selectors: [
				{
					key: 'the_title',
					selector: 'html head title',
				},
				{
					key: 'one_paragraph',
					selector: 'p.test',
				},
				{
					key: 'level_1_only',
					selector: 'div.level1',
				},
				{
					key: 'level_1_2',
					selector: 'div.level1',
					includeChildren: 1,
				},
				{
					key: 'level_3',
					selector: 'div.level1 div div',
				},
			]
		}
		result = method.execute document, config
		assert.equal 'the_title', result[0].key
		assert.equal 'magic tests', result[0].value
		
		assert.equal 'one_paragraph', result[1].key
		assert.equal 'Hello World', result[1].value
		
		assert.equal 'level_1_only', result[2].key
		assert.equal 'Level 1', result[2].value
		
		assert.equal 'level_1_2', result[3].key
		assert.equal 'Level 1\n\t Level 2', result[3].value
		
		assert.equal 'level_3', result[4].key
		assert.equal 'Level 3', result[4].value
		
	test 'survives null returning selector', ->
		config = {
			selectors: [
				{
					key: 'do_not_exist',
					selector: 'this.isnot the#selector.yourlookingfor'
				}
			]
		}
		result = method.execute document, config
		assert.equal 0, result.length

	test 'survives misconfigured includeChildren', ->
		config = {
			selectors: [
				{
					key: 'level_2_3',
					selector: 'div.level1 div',
					includeChildren: 10,
				}
			]
		}
		result = method.execute document, config
		assert.equal 'Level 2\n\t\t Level 3', result[0].value

suite 'SimpleAttributes', ->

	method = {}
	document = {}
	window = {}
	
	setup ->
		body = '''
		<p class='test'>
			Hello World
		</p>
		<div class='level1'> Level 1
			<div> Level 2
				<div> Level 3</div>
			</div>
		</div>
		<div id='foo' class='bar'>Egg</div>
		<div id='empty'></div>
		'''
		
		document = jsdom template.replace /{body}/, body
		window = document.createWindow()
		window.jQuery = jquery.create window
		method = new attributes.methods.SimpleAttributes window
	
	test 'has correct method name', ->
		assert.equal 'SimpleAttributes', method.name

	test 'returns expected results', ->
		result = method.execute document
		
		assert.equal 'test', result[0].key
		assert.equal 'Hello World', result[0].value
		
		assert.equal 'level1', result[1].key
		assert.equal 'Level 1', result[1].value
		
		assert.equal 3, result.length
		
	test 'chooses id over class as key', ->
		result = method.execute document
		
		assert.equal 'foo', result[2].key
		assert.equal 'Egg', result[2].value
	
	test 'doesn\'t return pairs with empty values', ->
		result = method.execute document
		for pair in result
			assert.notEqual 0, pair.value.length, "Pair must not be empty! Key: '#{pair.key}'"
	
	test 'can handle zero found results properly', ->
		document = jsdom '<html><body>Nothing to find here!</body><html>'
		window = document.createWindow()
		window.jQuery = jquery.create window
		
		result = method.execute document
		assert.equal 0, result.length

suite 'ImageAltTags', ->

	method = {}
	document = {}
	window = {}
	
	setup ->
		body = '''
		<img src='http://img.tld/some.png/' alt='some image' />
		'''
		
		document = jsdom template.replace /{body}/, body
		window = document.createWindow()
		window.jQuery = jquery.create window
		method = new attributes.methods.ImageAltTags window
	
	test 'has correct method name', ->
		assert.equal 'ImageAltTags', method.name
	
	test 'returns expected results', ->
		result = method.execute document
		assert.equal 'img_0', result[0].key
		assert.equal 'some image', result[0].value


suite 'SimpleTable', ->
	
	method = {}
	document = {}
	window = {}
	
	setup ->
		body = '''
		<table class='table1'>
			<tr>
				<td>K1</td><td>V1</td>
			</tr>
			<tr>
				<td>K2</td><td>V2</td>
			</tr>
			<tr>
				<td>K3</td><td>V3</td>
			</tr>
		</table>
		<table class='table2'>
			<tr>
				<td>K4</td><td>K5</td><td>K6</td>
			</tr>
			<tr>
				<td>V4</td><td>V5</td><td>V6</td>
			</tr>
		</table>
		'''
		
		document = jsdom template.replace /{body}/, body
		window = document.createWindow()
		window.jQuery = jquery.create window
		method = new attributes.methods.SimpleTable window
	
	test 'has correct method name', ->
		assert.equal 'SimpleTable', method.name
		
	test 'returns expected number of results', ->
		result = method.execute document
		assert.equal 6, result.length, "Method finds all the pairs: #{result}"

	test 'detects correct layout of table', ->
		assert.equal 'firstColumnKeys', method.guessLayout window.jQuery('table.table1')[0]
		assert.equal 'firstRowKeys', method.guessLayout window.jQuery('table.table2')[0]

	test 'returns expected key-value pairs', ->
		result = method.execute document
		
		assert.equal 'K1', result[0].key
		assert.equal 'V1', result[0].value
		
		assert.equal 'K4', result[3].key
		assert.equal 'V4', result[3].value
		
		assert.equal 'K6', result[5].key
		assert.equal 'V6', result[5].value

	test 'can handle zero found results properly', ->
		document = jsdom '''
		<html>
			<body>Nothing to find here!
			<table></table>
			<table><tr></tr></table>
			<table><td>foo</td></table>
			</body>
		<html>'''
		window = document.createWindow()
		window.jQuery = jquery.create window
		
		result = method.execute document
		assert.equal 0, result.length, "Result contains zero elements: #{result}"

suite 'SubItems', ->
	
	method = {}
	document = {}
	window = {}
	
	setup ->
		body = '''
		<p class='test'>
			Hello World
		</p>
		<div class='review'>
			<span class='name'>It is bullshit!</span>
			<span class='rating'>1/5</span>
		</div>
		<div class='review'>
			<span class='name'>I love it!</span>
			<span class='rating'>5/5</span>
		</div>
		<div class='review'>
			<span class='name'>Meh!</span>
			<span class='rating'>2/5</span>
		</div>
		<div id='foo' class='bar'>Egg</div>
		<div>
		<ul class="related">
			<li><span class="name">Hurr Produkt 123</span></li>
			<li><span class="name">Durr Dings Dreiunvierzig</span></li>
		</ul>
		</div>
		'''
		
		document = jsdom template.replace /{body}/, body
		window = document.createWindow()
		window.jQuery = jquery.create window
		method = new attributes.methods.SubItems window
	
	test 'Find all specified subitems', ->
		config = {
			groups: [{
						key: 'reviews'
						selector: '.review'
					},
					{
						key: 'related-items'
						selector: 'ul.related li'
					}]
		}

		result = method.execute document, config
		assert.equal 2, result.length
		group1 = result[0]
		group2 = result[1]
		assert.equal 'reviews', group1.key
		assert.equal 'related-items', group2.key

		assert.equal 3, group1.value.length
		assert.equal 2, group2.value.length

		assert.equal 'name', group1.value[0][0].key
		assert.equal 'It is bullshit!', group1.value[0][0].value

		assert.equal 'rating', group1.value[0][1].key
		assert.equal '1/5', group1.value[0][1].value
