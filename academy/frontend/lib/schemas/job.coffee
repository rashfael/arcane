module.exports.Job = ->
	Schema = global.mongoose.Schema
	Job = new Schema {
		_id: Schema.ObjectId
		name: String
		configuration: String
		project: String
		collections: [String]
		state: String
		submitted: Date
		archived: Boolean
		started: Date
		stopped: Date
		finished: Date
		finishedWorkers: Number
		runningWorkers: Number
	}
