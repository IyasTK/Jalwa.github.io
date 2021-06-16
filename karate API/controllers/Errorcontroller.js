const AppError = require("./../utils/apperror");
const handleValidationErrorDB = (err) => {
  const values = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data. ${values.join(".")}`;
  console.log(message);
  return AppError(message, 400);
};
const handleDuplicateKeyErr = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `duplicate field value: ${value}. please use another value`;
  return AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("Error", err);
    res.status(500).json({
      status: "Error",
      message: "something went very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.code === 11000) error = handleDuplicateKeyErr(error);
    if (error.name === "ValidationError:")
      error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
