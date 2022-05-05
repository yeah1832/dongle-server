const mongoose = require("mongoose");

const storageSchema = mongoose.Schema({
  Book_id: {
    type: String,
    maxlength: 10
  },
  user_id: {
    type: String,
    minlength: 5
  },
  page: {
    type: String,
    default: 0
  }
});

const Storage = mongoose.model("Storage", storageSchema);

module.exports = {
  Storage
};
