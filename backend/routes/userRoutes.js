const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// ADMIN CHECK
// =====================================================

const adminOnly = (req, res, next) => {

  if (!req.user) {

    return res.status(401).json({

      success: false,

      message: "Authentication required",

    });

  }


  if (
    String(req.user.role).toLowerCase() !== "admin"
  ) {

    return res.status(403).json({

      success: false,

      message: "Admin access required",

    });

  }


  next();

};


// =====================================================
// GET ALL USERS
// ADMIN ONLY
// GET /api/users
// =====================================================

router.get(
  "/",
  protect,
  adminOnly,
  async (req, res) => {

    try {

      console.log(
        "================================="
      );

      console.log(
        "GET USERS"
      );

      console.log(
        "ADMIN USER:",
        req.user
      );


      const users =
        await User.find({})
          .select("-password")
          .sort({
            createdAt: -1,
          });


      console.log(
        "USERS FOUND:",
        users.length
      );


      return res.status(200).json({

        success: true,

        users,

      });


    } catch (error) {

      console.error(
        "GET USERS ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch users",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// GET SINGLE USER
// ADMIN ONLY
// GET /api/users/:id
// =====================================================

router.get(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        ).select("-password");


      if (!user) {

        return res.status(404).json({

          success: false,

          message: "User not found",

        });

      }


      return res.status(200).json({

        success: true,

        user,

      });


    } catch (error) {

      console.error(
        "GET USER ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch user",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// CREATE USER
// ADMIN ONLY
// POST /api/users
// =====================================================

router.post(
  "/",
  protect,
  adminOnly,
  async (req, res) => {

    try {

      const {
        name,
        mobile,
        password,
        role,
      } = req.body;


      // =================================================
      // NAME
      // =================================================

      if (
        !name ||
        !name.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Name is required",

        });

      }


      // =================================================
      // MOBILE
      // =================================================

      if (
        !mobile ||
        !mobile.trim()
      ) {

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


      // =================================================
      // CHECK EXISTING USER
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
      // ROLE
      // =================================================

      const userRole =
        [
          "admin",
          "editor",
          "viewer",
        ].includes(
          String(role).toLowerCase()
        )
          ? String(role).toLowerCase()
          : "viewer";


      // =================================================
      // PASSWORD HASH
      // =================================================

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


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


      return res.status(201).json({

        success: true,

        message:
          "User created successfully",

        user: {

          id:
            user._id,

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
        "CREATE USER ERROR:",
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

  }
);


// =====================================================
// UPDATE USER
// ADMIN ONLY
// PUT /api/users/:id
// =====================================================

// =====================================================
// CHANGE USER ROLE
// ADMIN ONLY
// PUT /api/users/:id/role
// =====================================================

router.put(
  "/:id/role",
  protect,
  adminOnly,
  async (req, res) => {

    try {

      console.log(
        "CHANGE USER ROLE"
      );

      console.log(
        "ADMIN:",
        req.user
      );

      console.log(
        "USER ID:",
        req.params.id
      );

      console.log(
        "REQUEST BODY:",
        req.body
      );


      const {
        role,
      } = req.body;


      // =================================================
      // VALID ROLE
      // =================================================

      const validRoles = [
        "admin",
        "editor",
        "viewer",
      ];


      const cleanRole =
        String(role || "")
          .toLowerCase()
          .trim();


      if (
        !validRoles.includes(
          cleanRole
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid user role. Use admin, editor or viewer.",

        });

      }


      // =================================================
      // FIND USER
      // =================================================

      const user =
        await User.findById(
          req.params.id
        );


      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User not found",

        });

      }


      // =================================================
      // PREVENT ADMIN FROM REMOVING OWN ADMIN ROLE
      // =================================================

      if (
        String(req.user.id) ===
        String(user._id) &&
        cleanRole !== "admin"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "You cannot remove your own admin role",

        });

      }


      // =================================================
      // UPDATE ROLE
      // =================================================

      user.role =
        cleanRole;


      await user.save();


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        success: true,

        message:
          "User role updated successfully",

        user: {

          id:
            user._id,

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
        "CHANGE USER ROLE ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update user role",

        error:
          error.message,

      });

    }

  }
);

router.put(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {

    try {

      const {
        name,
        mobile,
        password,
        role,
      } = req.body;


      const user =
        await User.findById(
          req.params.id
        );


      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User not found",

        });

      }


      // =================================================
      // NAME
      // =================================================

      if (
        name !== undefined
      ) {

        if (
          !String(name).trim()
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Name is required",

          });

        }

        user.name =
          String(name).trim();

      }


      // =================================================
      // MOBILE
      // =================================================

      if (
        mobile !== undefined
      ) {

        const cleanMobile =
          String(mobile).trim();


        if (
          !/^[0-9]{10}$/.test(
            cleanMobile
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Enter a valid 10-digit mobile number",

          });

        }


        const existingUser =
          await User.findOne({

            mobile:
              cleanMobile,

            _id: {
              $ne:
                req.params.id,
            },

          });


        if (existingUser) {

          return res.status(400).json({

            success: false,

            message:
              "Another user already has this mobile number",

          });

        }


        user.mobile =
          cleanMobile;

      }


      // =================================================
      // ROLE
      // =================================================

      if (
        role !== undefined
      ) {

        const validRoles = [
          "admin",
          "editor",
          "viewer",
        ];


        const cleanRole =
          String(role)
            .toLowerCase()
            .trim();


        if (
          !validRoles.includes(
            cleanRole
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              "Invalid user role",

          });

        }


        user.role =
          cleanRole;

      }


      // =================================================
      // PASSWORD
      // =================================================

      if (
        password !== undefined &&
        password !== ""
      ) {

        user.password =
          await bcrypt.hash(
            password,
            10
          );

      }


      await user.save();


      return res.status(200).json({

        success: true,

        message:
          "User updated successfully",

        user: {

          id:
            user._id,

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
        "UPDATE USER ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update user",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// DELETE USER
// ADMIN ONLY
// DELETE /api/users/:id
// =====================================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {

    try {

      // =================================================
      // PREVENT ADMIN DELETING HIMSELF
      // =================================================

      if (
        String(req.user.id) ===
        String(req.params.id)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "You cannot delete your own account",

        });

      }


      const user =
        await User.findByIdAndDelete(
          req.params.id
        );


      if (!user) {

        return res.status(404).json({

          success: false,

          message:
            "User not found",

        });

      }


      return res.status(200).json({

        success: true,

        message:
          "User deleted successfully",

      });


    } catch (error) {

      console.error(
        "DELETE USER ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to delete user",

        error:
          error.message,

      });

    }

  }
);


module.exports = router;