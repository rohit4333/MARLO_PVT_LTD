const mongoose = require("mongoose");

// As per requirement:
// mandatory:- firstname, lastname, middlename(optional),
// DOB- optional,
// email - mandatory and unique,
// phone - mandatory and unique,
// occupation - optional,
// company - optional,
// password - mandatory.

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
  },
  dob: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  occupation: {
    type: String,
  },
  company: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});

const user = mongoose.model("users", userSchema);

module.exports = user;
