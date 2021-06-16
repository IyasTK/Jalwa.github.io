const express = require("express");
const mongoose = require("mongoose");
const userrouter = require("./routers/userrouter");
const globalErrorHandler = require("./controllers/Errorcontroller");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
mongoose
  .connect(" mongodb://127.0.0.1:27017/api", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

const app = express();
const port = 4000;
app.use(express.json());

app.use("/api/v1/users", userrouter);
app.use(globalErrorHandler);
app.listen(port, () => {
  console.log(`you are listening on port ${port}`);
});
