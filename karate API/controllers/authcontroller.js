const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const catchAsync = require("./../utils/catchAsync");
const User = require("./../model/usermodel");
const AppError = require("./../utils/apperror");

const sendtoken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    address: req.body.address,
    contact: req.body.contact,
    location: req.body.location,
    pincode: req.body.pincode,
  });
  console.log(newUser);
  const token = sendtoken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: newUser,
  });
});

exports.getallusers = catchAsync(async (req, res, next) => {
  const Users = await User.find();

  res.status(200).json({
    status: "success",
    data: {
      data: Users,
    },
  });
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide your name and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.CorrectPassword(password, user.password))) {
    return AppError("invalid,please provide correct user and password", 400);
  }
  const token = sendtoken(user._id);
  console.log(" you are logged now");
  res.status(201).json({
    status: "success",
    token,
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  //getting token
  // 1) Getting token and check of it's there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);
  if (!token) {
    console.log("no token");
    return next(
      new AppError("you are not logged in,please provide a valid token", 401)
    );
  }

  //   //return errors
  //varification of token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  //check current usermodel
  const CurrentUser = await User.findById(decoded.id);
  if (!CurrentUser) {
    return next(new AppError("User no more exist,please login again", 401));
  }
  console.log(CurrentUser);
  //check if user changed password or not
  if (CurrentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("user recently changed the password please try again", 401)
    );
  }
  req.user = CurrentUser;
  next();
});
exports.restrict = (...roles) => {
  if (!roles.includes(req.user.role))
    return next(
      new AppError("you do not have the permission to perform this action", 401)
    );
  next();
};
