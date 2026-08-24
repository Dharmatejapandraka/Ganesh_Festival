const express = require("express");

const Pujari = require("../models/Pujari");

const {
  protect,
  editorOrAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET PUJARIS
// VIEWER + EDITOR + ADMIN
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      console.log(
        "GET PUJARIS USER:",
        req.user
      );


      const year =
        Number(req.query.year);


      const filter = {};


      if (year) {

        filter.festivalYear =
          year;

      }


      const pujaris =
        await Pujari.find(filter)
          .sort({
            createdAt: -1,
          });


      return res.status(200).json({

        success: true,

        pujaris,

      });

    } catch (error) {

      console.error(
        "GET PUJARIS ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch pujaris",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// ADD PUJARI
// EDITOR + ADMIN ONLY
// =====================================================

router.post(
  "/",
  protect,
  editorOrAdmin,
  async (req, res) => {

    try {

      console.log(
        "ADD PUJARI USER:",
        req.user
      );


      console.log(
        "PUJARI REQUEST:",
        req.body
      );


      const {
        name,
        mobile,
        amount,
        details,
        festivalYear,
      } = req.body;


      // ===============================================
      // NAME
      // ===============================================

      if (
        !name ||
        !name.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Pujari name is required",

        });

      }


      // ===============================================
      // MOBILE
      // ===============================================

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


      // ===============================================
      // AMOUNT
      // ===============================================

      if (
        amount === undefined ||
        amount === null ||
        amount === "" ||
        Number(amount) < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Valid amount is required",

        });

      }


      // ===============================================
      // YEAR
      // ===============================================

      if (
        !festivalYear
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Festival year is required",

        });

      }


      // ===============================================
      // CREATE
      // ===============================================

      const pujari =
        await Pujari.create({

          name:
            name.trim(),

          mobile:
            mobile.trim(),

          amount:
            Number(amount),

          details:
            details
              ? details.trim()
              : "",

          festivalYear:
            Number(festivalYear),

        });


      console.log(
        "PUJARI CREATED:",
        pujari
      );


      return res.status(201).json({

        success: true,

        message:
          "Pujari added successfully",

        pujari,

      });

    } catch (error) {

      console.error(
        "ADD PUJARI ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to add pujari",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// DELETE PUJARI
// EDITOR + ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  protect,
  editorOrAdmin,
  async (req, res) => {

    try {

      console.log(
        "DELETE PUJARI USER:",
        req.user
      );


      const pujari =
        await Pujari.findByIdAndDelete(
          req.params.id
        );


      if (!pujari) {

        return res.status(404).json({

          success: false,

          message:
            "Pujari not found",

        });

      }


      return res.status(200).json({

        success: true,

        message:
          "Pujari deleted successfully",

      });

    } catch (error) {

      console.error(
        "DELETE PUJARI ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to delete pujari",

        error:
          error.message,

      });

    }

  }
);


module.exports = router;