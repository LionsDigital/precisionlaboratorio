
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  url_image: { type: String, default: '' },
  startDate: { type: Date, default: Date.now() },
  endDate: { type: Date, default: Date.now() },
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
