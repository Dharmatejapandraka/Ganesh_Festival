const Donation = require("../models/Donation");

const getDonations = async (req, res) => {
  try {
    const year = Number(req.query.year);

    const filter = {};

    if (year) {
      filter.festivalYear = year;
    }

    const donations =
      await Donation.find(filter)
        .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error(
      "GET DONATIONS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch donations",
      error: error.message,
    });
  }
};

const addDonation = async (
  req,
  res
) => {
  try {
    const {
      donorName,
      mobile,
      amount,
      paymentMethod,
      status,
      date,
      festivalYear,
      year,
    } = req.body;

    if (
      !donorName ||
      !mobile ||
      !amount ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Donor name, mobile, amount and date are required",
      });
    }

    const donation =
      await Donation.create({
        donorName: donorName.trim(),
        mobile: mobile.trim(),
        amount: Number(amount),
        paymentMethod:
          paymentMethod || "Cash",
        status:
          status || "Pending",
        date,
        festivalYear: Number(
          festivalYear || year
        ),
      });

    res.status(201).json({
      success: true,
      message:
        "Donation added successfully",
      donation,
    });
  } catch (error) {
    console.error(
      "ADD DONATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add donation",
      error: error.message,
    });
  }
};

const updateDonation = async (
  req,
  res
) => {
  try {
    const donation =
      await Donation.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message:
          "Donation not found",
      });
    }

    res.json({
      success: true,
      donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to update donation",
      error: error.message,
    });
  }
};

const deleteDonation = async (
  req,
  res
) => {
  try {
    const donation =
      await Donation.findByIdAndDelete(
        req.params.id
      );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message:
          "Donation not found",
      });
    }

    res.json({
      success: true,
      message:
        "Donation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Failed to delete donation",
      error: error.message,
    });
  }
};

module.exports = {
  getDonations,
  addDonation,
  updateDonation,
  deleteDonation,
};