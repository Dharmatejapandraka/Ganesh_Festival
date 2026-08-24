const express = require("express");

const Committee = require("../models/Committee");

const router = express.Router();


// ==========================================
// GET ALL COMMITTEE MEMBERS
// ==========================================

router.get("/", async (req, res) => {
  try {

    const members =
      await Committee.find()
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      committee: members,
    });

  } catch (error) {

    console.error(
      "GET COMMITTEE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch committee members",
      error: error.message,
    });
  }
});


// ==========================================
// ADD COMMITTEE MEMBER
// ==========================================

router.post("/", async (req, res) => {
  try {

    const {
      name,
      mobile,
    } = req.body;


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


    const member =
      await Committee.create({
        name: name.trim(),
        mobile: mobile.trim(),
      });


    res.status(201).json({
      success: true,
      message:
        "Committee member added successfully",
      member,
    });

  } catch (error) {

    console.error(
      "ADD COMMITTEE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add committee member",
      error: error.message,
    });
  }
});


// ==========================================
// UPDATE COMMITTEE MEMBER
// ==========================================

router.put("/:id", async (req, res) => {
  try {

    const {
      name,
      mobile,
    } = req.body;


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


    const member =
      await Committee.findByIdAndUpdate(
        req.params.id,
        {
          name: name.trim(),
          mobile: mobile.trim(),
        },
        {
          new: true,
          runValidators: true,
        }
      );


    if (!member) {
      return res.status(404).json({
        success: false,
        message:
          "Committee member not found",
      });
    }


    res.status(200).json({
      success: true,
      message:
        "Committee member updated successfully",
      member,
    });

  } catch (error) {

    console.error(
      "UPDATE COMMITTEE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update committee member",
      error: error.message,
    });
  }
});


// ==========================================
// DELETE COMMITTEE MEMBER
// ==========================================

router.delete("/:id", async (req, res) => {
  try {

    const member =
      await Committee.findByIdAndDelete(
        req.params.id
      );


    if (!member) {
      return res.status(404).json({
        success: false,
        message:
          "Committee member not found",
      });
    }


    res.status(200).json({
      success: true,
      message:
        "Committee member deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE COMMITTEE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete committee member",
      error: error.message,
    });
  }
});


module.exports = router;