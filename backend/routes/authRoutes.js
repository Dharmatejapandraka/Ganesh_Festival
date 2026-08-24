const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {

    console.log("=================================");
    console.log("LOGIN REQUEST");
    console.log("BODY:", req.body);
    console.log("=================================");

    const {
      mobile,
      password,
    } = req.body;


    // =================================================
    // VALIDATE MOBILE
    // =================================================

    if (!mobile || !mobile.trim()) {

      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });

    }


    // =================================================
    // VALIDATE PASSWORD
    // =================================================

    if (!password) {

      return res.status(400).json({
        success: false,
        message: "Password is required",
      });

    }


    const cleanMobile =
      mobile.trim();


    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findOne({
        mobile: cleanMobile,
      });


    if (!user) {

      console.log(
        "LOGIN FAILED: USER NOT FOUND"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid mobile number or password",
      });

    }


    // =================================================
    // CHECK PASSWORD
    // =================================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {

      console.log(
        "LOGIN FAILED: WRONG PASSWORD"
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid mobile number or password",
      });

    }


    // =================================================
    // CHECK JWT SECRET
    // =================================================

    if (!process.env.JWT_SECRET) {

      console.error(
        "JWT_SECRET IS MISSING IN .env"
      );

      return res.status(500).json({
        success: false,
        message:
          "JWT configuration is missing",
      });

    }


    // =================================================
    // CREATE TOKEN
    // =================================================

    const token =
      jwt.sign(
        {
          id: user._id.toString(),

          name: user.name,

          mobile: user.mobile,

          role: user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );


    // =================================================
    // USER DATA
    // =================================================

    const userData = {

      id:
        user._id.toString(),

      name:
        user.name,

      mobile:
        user.mobile,

      role:
        user.role,

    };


    // =================================================
    // DEBUG
    // =================================================

    console.log(
      "LOGIN SUCCESS"
    );

    console.log(
      "USER:",
      userData
    );

    console.log(
      "TOKEN CREATED:",
      token ? "YES" : "NO"
    );


    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({

      success: true,

      message:
        "Login successful",

      token: token,

      user: userData,

    });


  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Login failed",

      error:
        error.message,

    });

  }
});


// =====================================================
// REGISTER
// =====================================================

router.post("/register", async (req, res) => {

  try {

    console.log("=================================");
    console.log("REGISTER REQUEST");
    console.log("BODY:", req.body);
    console.log("=================================");


    const {
      name,
      mobile,
      password,
      role,
    } = req.body;


    // =================================================
    // NAME
    // =================================================

    if (!name || !name.trim()) {

      return res.status(400).json({

        success: false,

        message:
          "Name is required",

      });

    }


    // =================================================
    // MOBILE
    // =================================================

    if (!mobile || !mobile.trim()) {

      return res.status(400).json({

        success: false,

        message:
          "Mobile number is required",

      });

    }


    if (
      !/^[0-9]{10}$/.test(
        mobile.trim()
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Enter a valid 10-digit mobile number",

      });

    }


    // =================================================
    // PASSWORD
    // =================================================

    if (!password) {

      return res.status(400).json({

        success: false,

        message:
          "Password is required",

      });

    }


    if (password.length < 6) {

      return res.status(400).json({

        success: false,

        message:
          "Password must be at least 6 characters",

      });

    }


    // =================================================
    // CHECK USER
    // =================================================

    const existingUser =
      await User.findOne({
        mobile:
          mobile.trim(),
      });


    if (existingUser) {

      return res.status(400).json({

        success: false,

        message:
          "User with this mobile number already exists",

      });

    }


    // =================================================
    // PASSWORD HASH
    // =================================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    // =================================================
    // ROLE
    // =================================================

    const userRole =
      ["admin", "editor", "viewer"]
        .includes(role)
        ? role
        : "viewer";


    // =================================================
    // CREATE USER
    // =================================================

    const user =
      await User.create({

        name:
          name.trim(),

        mobile:
          mobile.trim(),

        password:
          hashedPassword,

        role:
          userRole,

      });


    // =================================================
    // RESPONSE
    // =================================================

    console.log(
      "REGISTER SUCCESS:",
      user._id.toString()
    );


    return res.status(201).json({

      success: true,

      message:
        "User created successfully",

      user: {

        id:
          user._id.toString(),

        name:
          user.name,

        mobile:
          user.mobile,

        role:
          user.role,

      },

    });


  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to create user",

      error:
        error.message,

    });

  }

});


module.exports = router;