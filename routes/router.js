// REST API for contacts (users) that includes CRUD operations and a login module using
// JWT authentication, using Node.js and Express.js:

// 1st: create new contact.
// 2nd: get all contacts.
// 3rd: get contact by id.
// 4th: update contact by id.
// 5th: Delete contact by id.
// 6th: Login module.

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const dotenv = require("dotenv");

// to access .env files data via process.env.VARIABLE_NAME.
dotenv.config();

// 1st. Create a new contact
router.post(
  "/",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("phone", "Phone number is required").not().isEmpty(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    //validate request data..
    console.log(req.firstName);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      middleName,
      dob,
      email,
      phone,
      occupation,
      company,
      password,
    } = req.body;
    try {
      //check if email already exists..
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email-id already exists" }] });
      }

      //check if phone number already exists..
      user = await User.findOne({ phone });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Phone-number already exists" }] });
      }

      // create new User/contact..
      user = new User({
        firstName,
        lastName,
        middleName,
        dob,
        email,
        phone,
        occupation,
        company,
        password,
      });
      // hash password.
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //saving user/contact to database.
      await user.save();

      // generate jwt
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      // send response
      res.send({
        message: "New contact created",
        data: user,
        token: token,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send({ message: "Error! while creating new contact" });
    }
  }
);

// 2nd: get all contacts
router.get("/", async (req, res) => {
  try {
    // get all users from database
    const users = await User.find({});
    // send response
    res.send({
      message: "Contacts retrieved",
      data: users,
    });
  } catch (error) {
    res.status(500).send({ message: "Error retrieving contacts" });
  }
});

// 3rd: Retrieve a contact by id
router.get("/:id", async (req, res) => {
  try {
    // find user by id
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User/Contact not found" });
    }
    // send response
    res.send({
      message: "Contact retrieved",
      data: user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Error retrieving contact" });
  }
});

// 4th: Update a contact by id..

// First we will retrieve the contact then after retrieving the contact, the code will check
// for any validation errors and if there are none, it will update the contact's information
// in the database with the new values from the request body.The updated contact information will
// then be returned to the client in the response

router.put(
  "/:id",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("phone", "Phone number is required").not().isEmpty(),
  ],
  async (req, res) => {
    // validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      middleName,
      dob,
      email,
      phone,
      occupation,
      company,
    } = req.body;

    // creating a new user/contact clone..
    const userFields = {};

    // Here firstname, lastname, email and phone can be left unchecked as these values has been
    // already checked above by express-validator, although I checked it here.

    if (firstName) userFields.firstName = firstName;
    if (lastName) userFields.lastName = lastName;
    if (middleName) userFields.middleName = middleName;
    if (dob) userFields.dob = dob;
    if (email) userFields.email = email;
    if (phone) userFields.phone = phone;
    if (occupation) userFields.occupation = occupation;
    if (company) userFields.company = company;
    try {
      // find user by id
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: "User/Contact not found" });
      }

      user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: userFields },
        { new: true }
      );
      // send response
      res.send({
        message: "Contact updated",
        data: user,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send({ message: "Error updating contact" });
    }
  }
);

// 5th: delete the contact by id..

// This code uses the findByIdAndRemove() method to remove the user with the
// specified ID from the database. It first checks if the user exists, and if it doesn't,
// it returns a 404 status code and a 'User not found' message. If the user is found,
// it is removed and a 'Contact deleted' message is returned to the client in the response.

router.delete("/:id", async (req, res) => {
  try {
    // find user by id
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User/Contact not found" });
    }
    await User.findByIdAndRemove(req.params.id);
    // send response
    res.send({
      message: "Contact deleted",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ message: "Error deleting contact" });
  }
});

// 6th: Login module..

// The login module for the contacts (users) REST API would handle the process of
// authenticating a user by comparing the email and password provided by the client with
// the corresponding values stored in the database.

// if the email and password match, a JWT token is created using the jwt.sign() method
// and sent back to the client in the response.This token can then be used to authenticate
// the user for subsequent requests to the API.

// The code also uses express-validator for validation of the input fields. It checks
// whether the email and password fields are filled in and if the email is a valid one
// or not.If any validation error is found, it returns the error message in json format.

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    // validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials (Username)" }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials (Password)" }] });
      }
      // generate jwt
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      // send response
      res.send({
        message: "Logged in",
        data: user,
        token: token,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send({ message: "Error logging in" });
    }
  }
);

module.exports = router;
