###
# Dependencies
###
pathLib = '../../lib/'

MondrianSqlFactory = require pathLib + './MondrianSqlFactory'
MondrianSchemaFactory = require pathLib + './MondrianSchemaFactory'



###
# Create factories
###
sqlFactory = new MondrianSqlFactory 'mondrianSqlDump.sql'
xmlFactory = new MondrianSchemaFactory



###
# Some data for testing purposes
###
config = `{
	dimensions: {
		Geography: { // Name of dimension
			Default: { // Name of hierarchy
				Gemeinde: { // Name of level
					dataKey: "gemeinde",
					dataType: "String"	// Allowed values are:
								// "String", "Numeric", "Integer",
								// "Boolean", "Date", "Time", "Timestamp"
				},
				Ort: {
					dataKey: "ort",
					dataType: "String"
				},
				PLZ: {
					dataKey: "plz",
					dataType: "Integer"
				}
			}
		}
	},
	cubes: {
		Address: { // Name of cube
			dimensionUsages: [ {
				dimension: "Geography",
				hierarchy: "Default",
				level: "PLZ"
			} ],
			measures: {
				"Amount Communities": { // Name of measure
					dimension: "Geography",
					hierarchy: "Default",
					dataType: "Integer",	// Allowed values are:
								// "String", "Numeric", "Integer",
								// "Boolean", "Date", "Time", "Timestamp"
					aggregator: "count"	// Allowed values are:
								// "sum", "count", "min",
								// "max", "avg", "distinct-count"
				}
			}
		}
	}
}`

data = `{
	"foo-33": { // Document's ID
		plz: 12345,
		ort: "F\\oo",
		gemeinde: "Bar"
	},
	"bar-44": {
		plz: 54321,
		ort: "O\\'x",
		gemeinde: "M'ox"
	}
}`



###
# Create SQL stuff
###
sqlFactory.createSql config, data

sqlFactory.sql.getDump (dump) ->
  console.log dump

  #console.log JSON.stringify config, null, 2



###
# Create XML stuff
###
xmlFactory.createXML config

#console.log xmlFactory.xmlCode

xmlFactory.saveTo 'mondrianSchema.xml'
