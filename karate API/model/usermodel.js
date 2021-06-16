const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userschema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
    trim: true,
    minlength: [4, "Enter your full name minmum four characters"],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "please provide a valid email address"],
    unique: true,
    required: [true, "A user must have at least one email address"],
    lowercase: true,
  },
  address: String,
  contact: {
    type: Number,
    required: [true, "please provide your contact number"],
    minlength: [10, "please provide a valid contact number"],
  },
  password: {
    type: String,
    // required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    // required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  Location: String,
  pincode: Number,
  photo: String,
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ["user", "admin", "teacher"],
    default: user,
  },
});

userschema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userschema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userschema.methods.CorrectPassword = async function(
  candidatepassword,
  password
) {
  const compared = await bcrypt.compare(candidatepassword, password);
  return compared;
};
const USER = mongoose.model("User", userschema);

module.exports = USER;
