var port = 3000;
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser());
app.use(express.static(__dirname));

console.log("Listening on port:", port);
app.listen(port);
