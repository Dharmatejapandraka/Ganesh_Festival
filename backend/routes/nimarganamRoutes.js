const express = require("express");

const Nimarganam = require("../models/Nimarganam");

const router = express.Router();


// ==========================================
// GET NIMARGANAM LINKS
// ==========================================

router.get("/", async (req, res) => {

  try {

    const year =
      Number(req.query.year);

    const filter = {};

    if (year) {
      filter.festivalYear = year;
    }

    const records =
      await Nimarganam.find(filter)
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      records,
    });

  } catch (error) {

    console.error(
      "GET NIMARGANAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch Nimarganam links",
      error: error.message,
    });

  }

});


// ==========================================
// ADD DRIVE LINK
// ==========================================

router.post("/", async (req, res) => {

  try {

    const {
      driveLink,
      festivalYear,
    } = req.body;


    // CHECK LINK

    if (
      !driveLink ||
      !driveLink.trim()
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Google Drive link is required",
      });

    }


    // CHECK URL

    let validUrl;

    try {

      validUrl =
        new URL(
          driveLink.trim()
        );

    } catch {

      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid Google Drive link",
      });

    }


    // CHECK GOOGLE DRIVE

    if (
      !validUrl.hostname.includes(
        "drive.google.com"
      ) &&
      !validUrl.hostname.includes(
        "docs.google.com"
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Please enter a Google Drive link",
      });

    }


    // YEAR

    if (!festivalYear) {

      return res.status(400).json({
        success: false,
        message:
          "Festival year is required",
      });

    }


    // CREATE

    const record =
      await Nimarganam.create({

        driveLink:
          driveLink.trim(),

        festivalYear:
          Number(festivalYear),

      });


    res.status(201).json({
      success: true,
      message:
        "Drive link added successfully",
      record,
    });


  } catch (error) {

    console.error(
      "ADD NIMARGANAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add Drive link",
      error: error.message,
    });

  }

});


// ==========================================
// DELETE
// ==========================================

router.delete(
  "/:id",
  async (req, res) => {

    try {

      const record =
        await Nimarganam.findByIdAndDelete(
          req.params.id
        );


      if (!record) {

        return res.status(404).json({
          success: false,
          message:
            "Drive link not found",
        });

      }


      res.status(200).json({
        success: true,
        message:
          "Drive link deleted successfully",
      });


    } catch (error) {

      console.error(
        "DELETE NIMARGANAM ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete Drive link",
        error: error.message,
      });

    }

  }
);


module.exports = router;