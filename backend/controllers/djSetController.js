const DJSet = require("../models/DJSet");

const getDJSets = async (req, res) => {
  try {
    const year = Number(req.query.year);

    const filter = {};

    if (year) {
      filter.festivalYear = year;
    }

    const djSets = await DJSet.find(filter)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: djSets.length,
      djSets,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch DJ sets",
      error: error.message,
    });
  }
};

const addDJSet = async (req, res) => {
  try {
    const {
      djName,
      mobile,
      totalAmount,
      advanceAmount,
      date,
      paymentMethod,
      status,
      notes,
      festivalYear,
      year,
    } = req.body;

    if (!djName || !mobile || !totalAmount || !date) {
      return res.status(400).json({
        success: false,
        message:
          "DJ name, mobile, amount and date are required",
      });
    }

    const djSet = await DJSet.create({
      djName,
      mobile,
      photo: req.file
        ? `/uploads/dj/${req.file.filename}`
        : "",

      totalAmount: Number(totalAmount),
      advanceAmount: Number(advanceAmount || 0),

      date,
      paymentMethod: paymentMethod || "Cash",
      status: status || "Pending",
      notes: notes || "",

      festivalYear: Number(
        festivalYear || year
      ),
    });

    res.status(201).json({
      success: true,
      message: "DJ set added successfully",
      djSet,
    });
  } catch (error) {
    console.error(
      "ADD DJ SET ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to add DJ set",
      error: error.message,
    });
  }
};

const updateDJSet = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    if (req.file) {
      updateData.photo =
        `/uploads/dj/${req.file.filename}`;
    }

    if (updateData.totalAmount !== undefined) {
      updateData.totalAmount =
        Number(updateData.totalAmount);
    }

    if (updateData.advanceAmount !== undefined) {
      updateData.advanceAmount =
        Number(updateData.advanceAmount);
    }

    const djSet =
      await DJSet.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!djSet) {
      return res.status(404).json({
        success: false,
        message: "DJ set not found",
      });
    }

    res.json({
      success: true,
      message: "DJ set updated successfully",
      djSet,
    });
  } catch (error) {
    console.error(
      "UPDATE DJ SET ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update DJ set",
      error: error.message,
    });
  }
};

const deleteDJSet = async (req, res) => {
  try {
    const djSet =
      await DJSet.findByIdAndDelete(
        req.params.id
      );

    if (!djSet) {
      return res.status(404).json({
        success: false,
        message: "DJ set not found",
      });
    }

    res.json({
      success: true,
      message: "DJ set deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete DJ set",
      error: error.message,
    });
  }
};

module.exports = {
  getDJSets,
  addDJSet,
  updateDJSet,
  deleteDJSet,
};