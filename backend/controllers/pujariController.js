const Pujari = require("../models/Pujari");


// ========================================
// GET PUJARI RECORDS
// ========================================

const getPujaris = async (req, res) => {
  try {
    const { year } = req.query;

    const filter = {};

    if (year) {
      filter.festivalYear = Number(year);
    }

    const pujaris = await Pujari.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pujaris.length,
      pujaris,
    });

  } catch (error) {

    console.error(
      "GET PUJARIS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch pujari records",
      error: error.message,
    });
  }
};


// ========================================
// ADD PUJARI
// ========================================

const addPujari = async (req, res) => {
  try {

    const {
      pujariName,
      mobile,
      totalAmount,
      advanceAmount,
      date,
      paymentMethod,
      status,
      notes,
      year,
      festivalYear,
    } = req.body;


    const pujari = await Pujari.create({
      pujariName,
      mobile,
      totalAmount,
      advanceAmount,
      date,
      paymentMethod,
      status,
      notes,
      festivalYear:
        festivalYear || year,
    });


    res.status(201).json({
      success: true,
      message: "Pujari added successfully",
      pujari,
    });

  } catch (error) {

    console.error(
      "ADD PUJARI ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to add pujari",
      error: error.message,
    });
  }
};


// ========================================
// UPDATE PUJARI
// ========================================

const updatePujari = async (req, res) => {
  try {

    const pujari =
      await Pujari.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );


    if (!pujari) {
      return res.status(404).json({
        success: false,
        message: "Pujari not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Pujari updated successfully",
      pujari,
    });

  } catch (error) {

    console.error(
      "UPDATE PUJARI ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update pujari",
      error: error.message,
    });
  }
};


// ========================================
// DELETE PUJARI
// ========================================

const deletePujari = async (req, res) => {
  try {

    const pujari =
      await Pujari.findByIdAndDelete(
        req.params.id
      );


    if (!pujari) {
      return res.status(404).json({
        success: false,
        message: "Pujari not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Pujari deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE PUJARI ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete pujari",
      error: error.message,
    });
  }
};


module.exports = {
  getPujaris,
  addPujari,
  updatePujari,
  deletePujari,
};