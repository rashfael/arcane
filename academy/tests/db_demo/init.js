academyDb = connect('localhost:27017/academy');
dataDb = connect('localhost:27017/analysis');
academyDb.dropDatabase();
dataDb.dropDatabase();
academyDb.projects.insert({
	_id: 'analysis',
	database: 'analysis',
	jobs: [],
	collections: {
		raw1: {
			type: 'raw',
			configKeys: {}
		}
	},
	transformations: {
		abcdefghijk123: {
			type: 'transform',
			collection: 'raw1',
			started: new Date(),
			finished: new Date(),
			maxActions: 100,
			actions: {total: 100, noop: 5, changed: 45, deleted: 50}
		},
		abcdefghijk124: {
			type: 'merge',
			collection: 'raw1',
			started: new Date(),
			maxActions: 100,
			actions: {total: 50, noop: 5, changed: 15, deleted: 30}
		},
		abcdefghijk125: {
			type: 'merge',
			collection: 'raw1',
			started: new Date(),
			error: 'AN ERROR!!',
			maxActions: 100,
			actions: {total: 50, noop: 5, changed: 15, deleted: 30}
		}
	}
});

dataDb.raw1.insert({
	title: 'A Song of Ice and Fire: A Game of Thrones',
	author: 'George R.R. Martin',
	authorWebsite: 'http://georgerrmartin.com/',
	publisher: 'Bantam',
	language: 'english',
	isbn10: '0553386794',
	price: '$10.36'
});
dataDb.raw1.insert({
	title: 'A Song of Ice and Fire: A Feast for Crows',
	author: 'George R.R. Martin',
	authorWebsite: 'http://georgerrmartin.com/',
	publisher: 'Bantam',
	language: 'english',
	isbn10: '0553381695',
	price: '$10.49'
});
dataDb.raw1.insert({
	title: 'A Song of Ice and Fire: A Storm of Swords',
	author: 'George R.R. Martin',
	authorWebsite: 'http://georgerrmartin.com/',
	publisher: 'Bantam',
	language: 'english',
	isbn10: '055357342X',
	price: '$8.99'
});
dataDb.raw1.insert({
	title: 'A Song of Ice and Fire: Clash of Kings',
	author: 'George R.R. Martin',
	authorWebsite: 'http://georgerrmartin.com/',
	publisher: 'Bantam',
	language: 'english',
	isbn10: '0553582038',
	price: '$10.36'
});
dataDb.raw1.insert({
	title: 'A Song of Ice and Fire: A Dance with Dragons',
	author: 'George R.R. Martin',
	authorWebsite: 'http://georgerrmartin.com/',
	publisher: 'Bantam',
	language: 'english',
	isbn10: '0553801473',
	price: '$21.00'
});
dataDb.raw1.insert({
	title: 'Infoquake',
	author: 'David Luis Edelman',
	authorWebsite: 'http://www.davidlouisedelman.com/',
	publisher: 'Pyr',
	language: 'english',
	isbn10: '1591024420',
	price: '$12.69',
	asin: 'B0044KMTIS'
});
dataDb.raw1.insert({
	title: 'MultiReal',
	author: 'David Luis Edelman',
	authorWebsite: 'http://www.davidlouisedelman.com/',
	publisher: 'Pyr',
	language: 'english',
	isbn10: '1591026474',
	price: '$16.41'
});
dataDb.raw1.insert({
	title: 'Geosyncron',
	author: 'David Luis Edelman',
	authorWebsite: 'http://www.davidlouisedelman.com/',
	publisher: 'Pyr',
	language: 'english',
	isbn10: '1591027926',
	price: '$11.63'
});
dataDb.raw1.insert({
	title: 'Ender\'s Game',
	author: 'Orson Scott Card',
	authorWebsite: 'http://www.hatrack.com/',
	publisher: 'Starscape',
	language: 'english',
	isbn10: '0765342294',
	price: '$5.99'
});
dataDb.raw1.insert({
	title: 'Speaker for the Dead',
	author: 'Orson Scott Card',
	authorWebsite: 'http://www.hatrack.com/',
	publisher: 'Tor Books',
	language: 'english',
	isbn10: '0312853254',
	price: '$11.67'
});
dataDb.raw1.insert({
	title: 'Xenocide',
	author: 'Orson Scott Card',
	authorWebsite: 'http://www.hatrack.com/',
	publisher: 'Tor Books',
	language: 'english',
	isbn10: '0312861877',
	price: '$11.55'
});
