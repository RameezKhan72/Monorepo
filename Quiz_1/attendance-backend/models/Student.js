const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, default: '' },
  class: { type: String, default: '' }
});

module.exports = mongoose.model('Student', StudentSchema);
