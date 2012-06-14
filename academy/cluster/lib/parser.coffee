# Parser for the specified language of the form fill parameters

moment = require 'moment'
jison = require 'jison'
Parser = jison.Parser
cs = require 'coffee-script'
vm = require 'vm'
fs = require 'fs'
assert = require 'assert'



#### grammar
# Grammar for the parser
grammar = {
		"lex": {
			"rules": [
				["\\s+",                         "return 'SPACE';"],
				["now",                          "return 'NOW';"],				
				["\#\{",                         "return 'START';"],
				["\}",                           "return 'END';"],
				["[0-9]{1,2}\\.[0-9]{1,2}\\.[0-9]{4}", "return 'DATE';"],
				["[0-9]+(?:\\.[0-9]+)?\\b",      "return 'NUMBER';"],
				["i",                            "return 'ITERATOR';"],
				["[A-ZÅÅÕÑa-z_]+[A-ZÅÅÕÑa-z0-9_]*",      "return 'VARIABLE';"], # TODO: exclude js keywords
				["\\*",                          "return '*';"],
				["\\/",                          "return '/';"],
				["-",                            "return '-';"],
				["\\+",                          "return '+';"],
				["\\^",                          "return '^';"],
				["\\(",                          "return '(';"],
				["\\)",                          "return ')';"],
				["$",                            "return 'EOF';"],
				["[A-ZÅÅÕÑa-z0-9_äüöÄÜÖß\\\!\"\§\$\%\&\/\(\)\=\?\`\,\;\.\:\-\^\°\/\*\-\+\{\}]*",          "return 'TEXT';"]
				]
		},

		"operators": [
			["left", "+", "-"],
			["left", "*", "/"],
			["left", "^"],
			["left", "UMINUS"]
		],

		"bnf": {
			"expressions" :[[ "u EOF",   "return $1;"  ],
				[ "EOF",   "return $1;"  ]],

			"u" :[[ "var",               "$$ = $1;" ],
				[ "TEXT",                "$$ = $1;" ],
				[ "SPACE",                "$$ = $1;" ],
				[ "VARIABLE",            "$$ = $1;" ],
				[ "DATE",                "$$ = $1;" ],
				[ "+",                   "$$ = $1;" ],
				[ "-",                   "$$ = $1;" ],
				[ "*",                   "$$ = $1;" ],
				[ "/",                   "$$ = $1;" ],
				[ "^",                   "$$ = $1;" ],
				[ "(",                   "$$ = $1;" ],
				[ ")",                   "$$ = $1;" ],
				[ "ITERATOR",            "$$ = $1;" ],
				[ "NOW",                 "$$ = $1;" ],
				[ "NUMBER",              "$$ = $1;" ],
				[ "var u",               "$$ = $1 + $2;" ],
				[ "TEXT u",              "$$ = $1 + $2;" ],
				[ "SPACE u",              "$$ = $1 + $2;" ],
				[ "VARIABLE u",          "$$ = $1 + $2;" ],
				[ "DATE u",              "$$ = $1 + $2;" ],
				[ "+ u",                 "$$ = $1 + $2;" ],
				[ "- u",                 "$$ = $1 + $2;" ],
				[ "* u",                 "$$ = $1 + $2;" ],
				[ "/ u",                 "$$ = $1 + $2;" ],
				[ "^ u",                 "$$ = $1 + $2;" ],
				[ "( u",                 "$$ = $1 + $2;" ],
				[ ") u",                 "$$ = $1 + $2;" ],
				[ "ITERATOR u",          "$$ = $1 + $2;" ],
				[ "NOW u",               "$$ = $1 + $2;" ],
				[ "NUMBER u",            "$$ = $1 + $2;" ]
				],
			
			"date" : [[ "DATE",          "$$ = \"moment('\" + $1 + \"', 'D.M.YYYY').format(format)\";" ],
				[ "DATE s + e",            "$$ = \"moment('\" + $1 + \"', 'D.M.YYYY').add('d', \" + $4 + \").format(format)\";" ],
				[ "DATE s - e",            "$$ = \"moment('\" + $1 + \"', 'D.M.YYYY').subtract('d', \" + $4 + \").format(format)\";" ],
				[ "NOW",                 "$$ = \"moment().format(format)\";" ],
				[ "NOW s + e",             "$$ = \"moment().add('d', \" + $4 + \").format(format)\";" ],
				[ "NOW s - e",             "$$ = \"moment().subtract('d', \" + $4 + \").format(format)\";" ]],
			
			"var" : [[ "START e END",    "$$ = $1 + $2 + $3;" ],
				[ "START date END",      "$$ = $1 + $2 + $3;" ],
				[ "START VARIABLE END",  "$$ = $1 + $2 + $3;" ]],

			"e" :[
				[ "e + e",             "$$ = $1 + \"+\" + $3;" ],
				[ "e - e",               "$$ = $1 + \"-\" + $3;" ],
				[ "e * e",               "$$ = $1 + \"*\" + $3;" ],
				[ "e / e",               "$$ = $1 + \"/\" + $3;" ],
				[ "e ^ e",               "$$ = \"Math.pow(\" + $1 + \",\" + $3 + \")\";" ],
				[ "- e",                 "$$ = \"-\" + $2 + $3;"],
				[ "braces",               "$$ = $1;" ],
				[ "numbers",              "$$ = $1;" ]],

			"numbers" : [
				[ "NUMBER SPACE",        "$$ = $1 + $2;" ],
				[ "ITERATOR SPACE",      "$$ = $1 + $2;" ],
				[ "SPACE NUMBER",        "$$ = $1 + $2;" ],
				[ "SPACE ITERATOR",      "$$ = $1 + $2;" ],
				[ "SPACE NUMBER SPACE",  "$$ = $1 + $2 + $3;" ],
				[ "SPACE ITERATOR SPACE","$$ = $1 + $2 + $3;" ],
				[ "NUMBER",              "$$ = $1;" ],
				[ "ITERATOR",            "$$ = $1;" ]],
				
			"braces" : [
				[ "( e ) SPACE",        "$$ = $1 + $2 + $3 + $4;" ],
				[ "SPACE ( e )",        "$$ = $1 + $2 + $3 + $4;" ],
				[ "SPACE ( e ) SPACE",  "$$ = $1 + $2 + $3 + $4 + $5;" ],
				[ "( e )",              "$$ = $1 + $2 + $3;" ]],
			
			"s" : [
				[ "SPACE",              "$$ = $1;" ],
				[ "",                   "$$ = $1;" ]]
		}
}

parser = new Parser(grammar)

#### parse
# Parses the String from the FillForm Syntax to the end representation
#
# Parameters:
#
# * **string**: the string which should be parsed
# * **vars**: vars is a map of variables which are used for the parsing
module.exports.parse = parse = (string, vars) ->
	options = {}
	options.sandbox = vars
	options.sandbox.moment = require 'moment'
	options.filename = __filename
	result = cs.eval "\"" + parser.parse(string) + "\"", options

#### generate
# Generates a JS Funktion for the parser
module.exports.generate = () ->
	parserSource = parser.generate()
	log = fs.createWriteStream("parser.js", {'flags': 'w+'});
	log.write(parserSource);
	
#### test
# Test Funktion
module.exports.test = test = () ->
	i = 10
	format = "D.M.YYYY"
	map = { key1 : "String1", key2 : "String2" }
	vars = map
	vars.i = i
	vars.format = format
	
	# Test only Text input
	assert.equal parse("", vars), ""
	assert.equal parse("Äquator", vars), "Äquator"
	assert.equal parse("München", vars), "München"
	assert.equal parse("Test 3TEs fwerergi 15.5", vars), "Test 3TEs fwerergi 15.5"
	assert.equal parse("15.01.2012", vars), "15.01.2012"
	assert.equal parse("now", vars), "now"
	assert.equal parse("1.14", vars), "1.14"
	assert.equal parse("i", vars), "i"
	assert.equal parse("Test_12", vars), "Test_12"
	assert.equal parse("*", vars), "*"
	assert.equal parse("/", vars), "/"
	assert.equal parse("-", vars), "-"
	assert.equal parse("+", vars), "+"
	assert.equal parse("^", vars), "^"
	assert.equal parse("(", vars), "("
	assert.equal parse(")", vars), ")"
	assert.equal parse("3Test", vars), "3Test"
	assert.equal parse("a+i", vars), "a+i"
	assert.equal parse("a * i", vars), "a * i"
	assert.equal parse("10.06.1987+i", vars), "10.06.1987+i"
	assert.equal parse("10.06.1987 + i", vars), "10.06.1987 + i"
	
	# Test only variables
	assert.equal parse("\#\{i\}", vars), "10"
	assert.equal parse("\#\{i * i\}", vars), "100"
	assert.equal parse("\#\{i + i\}", vars), "20"
	assert.equal parse("\#\{i - i\}", vars), "0"
	assert.equal parse("\#\{i / i\}", vars), "1"
	assert.equal parse("\#\{i ^ i\}", vars), "10000000000"
	assert.equal parse("\#\{i * (i + i)\}", vars), "200"
	assert.equal parse("\#\{i * 5\}", vars), "50"
	assert.equal parse("\#\{i + 5\}", vars), "15"
	assert.equal parse("\#\{i - 5\}", vars), "5"
	assert.equal parse("\#\{i / 5\}", vars), "2"
	assert.equal parse("\#\{i ^ 5\}", vars), "100000"
	assert.equal parse("\#\{5 * (i + 5)\}", vars), "75"
	assert.equal parse("\#\{5 * i\}", vars), "50"
	assert.equal parse("\#\{5 + i\}", vars), "15"
	assert.equal parse("\#\{5 - i\}", vars), "-5"
	assert.equal parse("\#\{5 / i\}", vars), "0.5"
	assert.equal parse("\#\{5 ^ i\}", vars), "9765625"
	assert.equal parse("\#\{i * (5 + i)\}", vars), "150"
	assert.equal parse("\#\{5\}", vars), "5"
	assert.equal parse("\#\{5.5\}", vars), "5.5"
	assert.equal parse("\#\{5 * 6\}", vars), "30"
	assert.equal parse("\#\{5 + 2\}", vars), "7"
	assert.equal parse("\#\{5 - 3\}", vars), "2"
	assert.equal parse("\#\{5 / 2\}", vars), "2.5"
	assert.equal parse("\#\{5 ^ 2\}", vars), "25"
	assert.equal parse("\#\{5 * (2 + 4)\}", vars), "30"
	
	# Test Date variables
	assert.equal parse("\#\{now\}", vars), moment().format(format)
	assert.equal parse("\#\{now + 5\}", vars), moment().add('d', 5).format(format)
	assert.equal parse("\#\{now - 5\}", vars), moment().subtract('d', 5).format(format)
	assert.equal parse("\#\{now + i\}", vars), moment().add('d', i).format(format)
	assert.equal parse("\#\{now - i\}", vars), moment().subtract('d', i).format(format)
	assert.equal parse("\#\{now + i + i\}", vars), moment().add('d', i + i).format(format)
	assert.equal parse("\#\{now - i + i\}", vars), moment().subtract('d', i + i).format(format)
	try
		parse("\#\{i + now\}", vars)
	catch error
		console.log "now must come at first: OK"
		
	assert.equal parse("\#\{15.01.2011\}", vars), moment("15.01.2011", "D.M.YYYY").format(format)
	assert.equal parse("\#\{15.01.2011 + 5\}", vars), moment("15.01.2011", "D.M.YYYY").add('d', 5).format(format)
	assert.equal parse("\#\{15.01.2011 - 5\}", vars), moment("15.01.2011", "D.M.YYYY").subtract('d', 5).format(format)
	assert.equal parse("\#\{15.01.2011 + i\}", vars), moment("15.01.2011", "D.M.YYYY").add('d', i).format(format)
	assert.equal parse("\#\{15.01.2011 - i\}", vars), moment("15.01.2011", "D.M.YYYY").subtract('d', i).format(format)
	assert.equal parse("\#\{15.01.2011 + i + i\}", vars), moment("15.01.2011", "D.M.YYYY").add('d', i + i).format(format)
	assert.equal parse("\#\{15.01.2011 - i + i\}", vars), moment("15.01.2011", "D.M.YYYY").subtract('d', i + i).format(format)
	
	assert.equal parse("\#\{1.1.2011\}", vars), moment("1.1.2011", "D.M.YYYY").format(format)
	assert.equal parse("\#\{1.1.2011 + 5\}", vars), moment("1.1.2011", "D.M.YYYY").add('d', 5).format(format)
	assert.equal parse("\#\{1.1.2011 - 5\}", vars), moment("1.1.2011", "D.M.YYYY").subtract('d', 5).format(format)
	assert.equal parse("\#\{1.1.2011 + i\}", vars), moment("1.1.2011", "D.M.YYYY").add('d', i).format(format)
	assert.equal parse("\#\{1.1.2011 - i\}", vars), moment("1.1.2011", "D.M.YYYY").subtract('d', i).format(format)
	assert.equal parse("\#\{1.1.2011 + i + i\}", vars), moment("1.1.2011", "D.M.YYYY").add('d', i + i).format(format)
	assert.equal parse("\#\{1.1.2011 - i + i\}", vars), moment("1.1.2011", "D.M.YYYY").subtract('d', i + i).format(format)
	
	try
		parse("\#\{i + 15.01.2011\}", vars)
	catch error
		console.log "Date must come at first: OK"

	# Test Mapping
	assert.equal parse("\#\{key1\}", vars), "String1"
	assert.equal parse("\#\{key2\}", vars), "String2"
	try
		parse("\#\{key2 + i\}", vars)
	catch error
		console.log "Only a mapping var in \#\{ \} allowed: OK"
	
