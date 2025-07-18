const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  fullname: {
    firstname: { type: String, required: true },
    lastname:  { type: String, required: true }
  },
  email:    { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

UserSchema.methods.generateAuthToken = function () {
  // Include both _id and fullname in the token payload
  const payload = {
    _id:      this._id,
    fullname: this.fullname
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });
};

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

module.exports = mongoose.model('user', UserSchema);
