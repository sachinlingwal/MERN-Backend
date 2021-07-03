const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");

var cookieParser = require("cookie-parser");
router.use(cookieParser());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("../db/conn");
const User = require("../models/userSchema");

router.get("/", (req, res) => {
  res.send("hello from router ");
});

//!using promises
// router.post("/register",  (req, res) => {
//   //   console.log(req.body);
//   //   res.json({ message: req.body });

//   const { name, email, phone, work, password, cpassword } = req.body;

//   if (!name || !email || !phone || !work || !password || !cpassword) {
//     return res.status(422).json({ message: "please fill all the fields" });
//   }

//   User.findOne({ email: email })
//     .then((userExist) => {
//       if (userExist) {
//         return res.status(422).json({ Error: "email already exits" });
//       }

//       const user = new User({
//         name,
//         email,
//         phone,
//         work,
//         password,
//         cpassword,
//       });

//       user
//         .save()
//         .then(() => {
//           res.status(201).json({ message: "user registered successfully" });
//         })
//         .catch((err) =>
//           res.status(500).json({ message: "failed to registered" })
//         );
//     })
//     .catch((err) => console.log(err));
// });

//!using async await
router.post("/register", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;

  if (!name || !email || !phone || !work || !password || !cpassword) {
    return res.status(422).json({ message: "please fill all the fields" });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ Error: "email already exits" });
    }

    const user = new User({ name, email, phone, work, password, cpassword });

    //
    //
    //
    //! call Middleware here [bcrypt js ]
    //
    //
    //
    //
    //

    //!1st method
    // const userRegistered = await user.save();
    // if (userRegistered) {
    //   res.status(201).json({ message: "user registered successfully" });
    // } else {
    //   res.status(500).json({ error: "failed to registered" });
    // }

    //! 2nd method
    await user.save();
    res.status(201).json({ message: "user registered successfully" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/signin", async (req, res) => {
  // console.log(req.body);
  // res.json({ message: "awesome" });
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please Filled the Data" });
    }

    const userLogin = await User.findOne({ email: email });
    // console.log(userLogin);

    if (userLogin) {
      //! compare the hash password here
      const isMatch = await bcrypt.compare(password, userLogin.password);

      //! token jsonwebtoken
      const token = await userLogin.generateAuthToken();
      // console.log(token);

      //!store cookies
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 259200),
        httpOnly: true,
      });

      if (!isMatch) {
        res.status(422).json({ error: "Invalid Credientials" });
      } else {
        res.status(201).json({ message: "User Signin successfully" });
      }
    } else {
      res.status(422).json({ error: "Invalid details" });
    }
  } catch (error) {
    console.log(error);
  }
});

//! about us page

router.get("/about", authenticate, (req, res) => {
  res.send(req.rootUser);
});

router.get("/getData", authenticate, (req, res) => {
  res.send(req.rootUser);
});

//!contact us page

router.post("/contact", authenticate, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    console.log(req.body.name);
    console.log(req.body.email);
    console.log(req.body.phone);
    console.log(req.body.message);
    if (!name || !email || !phone || !message) {
      console.log("error in contact form");
      return res.json({ message: "please filled the contact form" });
    }

    const userContact = await User.findOne({ _id: req.userID });
    if (userContact) {
      const userMessage = await userContact.addMessage(
        name,
        email,
        phone,
        message
      );
      await userContact.save();
      res.status(200).json({ message: "user submit message successfully" });
    }
  } catch (error) {
    console.log(error);
  }
});

//! logout page
router.get("/logout", (req, res) => {
  res.clearCookie("jwtoken", { path: "/" });
  console.log("hello my logout page");
  res.status(200).send("user logout");
});
module.exports = router;
