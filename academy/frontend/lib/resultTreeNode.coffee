log4js = require 'log4js'
logger = log4js.getLogger 'tree'
logger.setLevel 'INFO'

module.exports = class ResultTreeNode
	constructor: (@parent, @configNode, @input) ->
		@children = []
		@inProgress = false
	
	addChildren: (children) ->
		for child in children
			@addChild child
	
	addChild: (configNode, input) ->
		@children.push new ResultTreeNode @, configNode, input
		
	remove: ->
		if @children.length == 0
			if @parent isnt undefined
				for i in [0..@parent.children.length - 1]
					if @ is @parent.children[i]
						@parent.children.splice i, 1
				@parent.remove()

	findNextNode: ->
		for node in @children
			if not node.inProgress
				if node.children.length isnt 0
					nextNode = node.findNextNode()
					return nextNode if nextNode?
				else
					return node
		return undefined
	
	countNodes: ->
		count = 1
		for node in @children
			if node.children.length isnt 0
				count += node.countNodes()
			else
				count++
		return count
	
	countFreeNodes: ->
		count = 1
		for node in @children
			if not node.inProgress
				if node.children.length isnt 0
					count += node.countNodes()
				else
					count++
		return count
