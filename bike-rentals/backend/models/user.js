const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  isManager: { type: Boolean, required: false },
  image: { type: String, required: false },
  reservedBikes: [{ type: Object, required: false, ref: 'Bike' }] 
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
