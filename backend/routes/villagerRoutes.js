const express = require("express");

const Villager = require("../models/Villager");

const router = express.Router();


// ==========================================
// GET ALL VILLAGERS
// ==========================================

router.get("/", async (req, res) => {
  try {
    const villagers = await Villager.find()
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      villagers,
    });

  } catch (error) {

    console.error(
      "GET VILLAGERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch villagers",
      error: error.message,
    });
  }
});


// ==========================================
// ADD VILLAGER
// ==========================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      mobile,
      gender,
    } = req.body;


    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }


    if (!mobile || !mobile.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }


    if (!gender) {
      return res.status(400).json({
        success: false,
        message: "Gender is required",
      });
    }


    const allowedGenders = [
      "Male",
      "Female",
      "Other",
    ];


    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender",
      });
    }


    const villager =
      await Villager.create({
        name: name.trim(),
        mobile: mobile.trim(),
        gender,
      });


    res.status(201).json({
      success: true,
      message: "Villager added successfully",
      villager,
    });

  } catch (error) {

    console.error(
      "ADD VILLAGER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to add villager",
      error: error.message,
    });
  }
});


// ==========================================
// UPDATE VILLAGER
// ==========================================

router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      mobile,
      gender,
    } = req.body;


    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }


    if (!mobile || !mobile.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }


    if (!gender) {
      return res.status(400).json({
        success: false,
        message: "Gender is required",
      });
    }


    const allowedGenders = [
      "Male",
      "Female",
      "Other",
    ];


    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender",
      });
    }


    const villager =
      await Villager.findByIdAndUpdate(
        req.params.id,
        {
          name: name.trim(),
          mobile: mobile.trim(),
          gender,
        },
        {
          new: true,
          runValidators: true,
        }
      );


    if (!villager) {
      return res.status(404).json({
        success: false,
        message: "Villager not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Villager updated successfully",
      villager,
    });

  } catch (error) {

    console.error(
      "UPDATE VILLAGER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update villager",
      error: error.message,
    });
  }
});


// ==========================================
// DELETE VILLAGER
// ==========================================

router.delete("/:id", async (req, res) => {
  try {

    const villager =
      await Villager.findByIdAndDelete(
        req.params.id
      );


    if (!villager) {
      return res.status(404).json({
        success: false,
        message: "Villager not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Villager deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE VILLAGER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete villager",
      error: error.message,
    });
  }
});


module.exports = router;