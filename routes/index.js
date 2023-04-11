const router = require("express").Router();

/* const { route } = require("../app"); */

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const User = require("../models/User.model")

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/signup", isLoggedOut, (req, res, next) => {
  res.render("users/signup");
})

router.post("/signup", isLoggedOut, (req, res, next) => {
  let {username, password, passwordRepeat} = req.body;

  if(username == "" || password == "" || passwordRepeat == "") {
    res.render("users/signup", {mensajeError: "there are empty filds" });
    return;
  }
  else if(password != passwordRepeat) {
    res.render("users/signup", {mensajeError: "different passwords"});
    return;
  }

  User.find({username})
  .then(result => {
    if(result.length != 0) {
      res.render("users/signup", {mensajeError: "User already exist"});
      return;
    }

    let salt = bcrypt.genSaltSync(saltRounds);
    let cryptedPassword = bcrypt.hashSync(password, salt);

    User.create({
      username: username,
      password: cryptedPassword
    })
    .then(result => {
      res.redirect("/login");
    })
    .catch(err => next(err));
  })
  .catch(err => next(err));
})

router.get("/login", isLoggedOut, (req, res, next) => {
  res.render("users/login");
})

router.post("/login", isLoggedOut, (req, res, next) => {
  let {username, password} = req.body;

  if(username == "" || password == "") {
    res.render("users/login", {mensajeError: "there are empty filds"})
    return;
  }

  User.find({username})
  .then(result => {
    if(result.length == 0) {
      res.render("users/login", {mensajeError: "User or password incorrect"});
      return; 
    }

    if(bcrypt.compareSync(password, result[0].password)) {
      req.session.currentUser = username;
      res.redirect("/profile")
    }
    else {
      res.render("users/login", {mensajeError: "User or password incorrect"})
    }
  })
  .catch(err => next(err));
})

router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("users/profile", {username: req.session.currentUser});
})

router.get("/logout", isLoggedIn, (req, res, next)=>{
  req.session.destroy(err => {
    if(err) next(err);
    else res.redirect("/login");
  });
});

router.get("/private", isLoggedIn, (req, res, next) => {
  res.render("users/private");
})

router.get("/main", isLoggedOut, (req, res, next) => {
  res.render("users/main")
})

module.exports = router;
