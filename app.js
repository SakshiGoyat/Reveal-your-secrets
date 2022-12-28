// require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
// const md5 = require("md5"); //provides hashing functions
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static("public"));
app.set("view engine", "ejs");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/userDB");

const newSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//encryption part
// newSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });

const user = new mongoose.model("user", newSchema);

app.get("/", (req, res) => {
  res.render("home");
});
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.username;
    // const passwrd = md5(req.body.password);
    const passwrd = req.body.password;

    user.findOne({ email: username }, (err, userFound) => {
      if (err) {
        console.log(err);
      } else {
        if (userFound) {
          bcrypt.compare(passwrd, userFound.password, function (err, result) {
            if (result === true) {
              res.render("secrets");
            } else {
              res.render("wrong");
            }
          });
        } else {
          res.render("wrong");
        }
      }
    });
  });
app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      if (!err) {
        const newUser = new user({
          email: req.body.username,
          //   password: md5(req.body.password),
          password: hash,
        });

        newUser.save((err) => {
          if (err) {
            console.log(err);
          } else {
            res.render("secrets");
          }
        });
      }
    });
  });

app.listen(port, () => {
  console.log(`listening to ${port}`);
});
