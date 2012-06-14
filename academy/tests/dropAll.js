academyDb = connect('localhost:27017/academy');
academyDb.projects.find().forEach(function (project){
	db = connect('localhost:27017/'+project.database);
	db.dropDatabase();
	print('dropped Database: ' + project.database);
});
academyDb.dropDatabase();
print('dropped Academy Metadata');
