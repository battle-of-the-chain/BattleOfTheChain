var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var photoSchema = new Schema({
	'content' : String
});

module.exports = mongoose.model('photo', photoSchema);
