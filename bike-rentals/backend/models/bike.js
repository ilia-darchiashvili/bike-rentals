const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bikeSchema = new Schema({
  model: { type: String, required: true },
  color: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, required: false },
  image: { type: String, required: false },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  isAvailable: { type: Boolean, required: true },
  reservations: [{
    userId: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    userEmail: { type: String, require: false }
  }]
});

module.exports = mongoose.model('Bike', bikeSchema);
