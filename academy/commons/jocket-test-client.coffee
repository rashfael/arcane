jocket = require './jocket'
client = new jocket.JocketClient 50000
client.send {id: 5}
