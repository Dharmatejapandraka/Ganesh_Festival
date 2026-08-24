const Villager = require("../models/Villager");

// ========================================
// GET VILLAGERS
// ========================================

const getVillagers = async (
  req,
  res
) => {
  try {
    const { year } = req.query;

    const filter = {};

    if (year) {
      filter.festivalYear =
        Number(year);
    }

    const villagers =
      await Villager.find(filter)
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: villagers.length,
      villagers,
    });
  } catch (error) {
    console.error(
      "GET VILLAGERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch villagers",
      error: error.message,
    });
  }
};

// ========================================
// ADD VILLAGER
// ========================================

const addVillager = async (
  req,
  res
) => {
  try {
    const {
      name,
      mobile,
      age,
      gender,
      address,
      occupation,
      status,
      notes,
      year,
      festivalYear,
    } = req.body;

    const villager =
      await Villager.create({
        name,
        mobile,
        age,
        gender,
        address,
        occupation,
        status,
        notes,
        festivalYear:
          festivalYear || year,
      });

    res.status(201).json({
      success: true,
      message:
        "Villager added successfully",
      villager,
    });
  } catch (error) {
    console.error(
      "ADD VILLAGER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add villager",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE VILLAGER
// ========================================

const updateVillager = async (
  req,
  res
) => {
  try {
    const villager =
      await Villager.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!villager) {
      return res.status(404).json({
        success: false,
        message:
          "Villager not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Villager updated successfully",
      villager,
    });
  } catch (error) {
    console.error(
      "UPDATE VILLAGER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update villager",
      error: error.message,
    });
  }
};

// ========================================
// DELETE VILLAGER
// ========================================

const deleteVillager = async (
  req,
  res
) => {
  try {
    const villager =
      await Villager.findByIdAndDelete(
        req.params.id
      );

    if (!villager) {
      return res.status(404).json({
        success: false,
        message:
          "Villager not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Villager deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE VILLAGER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete villager",
      error: error.message,
    });
  }
};

module.exports = {
  getVillagers,
  addVillager,
  updateVillager,
  deleteVillager,
};