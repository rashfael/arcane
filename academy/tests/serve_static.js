var express = require('express');
var demo = express.createServer();

demo.configure(function(){
    demo.use(express.logger());
    demo.use(express.static(__dirname + '/static_demo'));
    demo.use(express.errorHandler());
});

demo.listen(8000);

console.log('Serving static demo from http://localhost:8000');
