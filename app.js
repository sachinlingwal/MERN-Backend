const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const app = express();

dotenv.config({ path: "./config.env" });
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
require("./db/conn");
// const User = require("./models/userSchema");

app.use(require("./router/auth"));

// const middleware = (req, res, next) => {
//   console.log(`middleware`);
//   next();
// };

// app.get("/", (req, res) => {
//   res.send("hello home page");
// });
// app.get("/about", (req, res) => {
//   res.send("hello about page");
// });
// app.get("/contact", (req, res) => {
//   res.send("hello contact page");
// });
// app.get("/signin", (req, res) => {
//   res.send("hello login page");
// });
// app.get("/signup", (req, res) => {
//   res.send("hello signup page");
// });

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`Server is running at port ${PORT}`);
});
