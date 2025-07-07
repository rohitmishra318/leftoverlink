const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  fullname: {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true }
  },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Make hashPassword a static method
UserSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const userModel = mongoose.model('user', UserSchema);

module.exports = userModel;