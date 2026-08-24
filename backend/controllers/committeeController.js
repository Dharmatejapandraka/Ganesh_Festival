const Committee = require("../models/Committee");

// ========================================
// GET COMMITTEE
// ========================================

const getCommittee = async (req, res) => {
  try {
    const { year } = req.query;

    const filter = {};

    if (year) {
      filter.festivalYear = Number(year);
    }

    const members = await Committee.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: members.length,
      committee: members,
    });
  } catch (error) {
    console.error(
      "GET COMMITTEE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch committee",
      error: error.message,
    });
  }
};

// ========================================
// ADD MEMBER
// ========================================

const addCommitteeMember = async (
  req,
  res
) => {
  try {
    const {
      name,
      role,
      mobile,
      email,
      address,
      status,
      notes,
      year,
      festivalYear,
    } = req.body;

    const member =
      await Committee.create({
        name,
        role,
        mobile,
        email,
        address,
        status,
        notes,
        festivalYear:
          festivalYear || year,
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
};

// ========================================
// UPDATE MEMBER
// ========================================

const updateCommitteeMember = async (
  req,
  res
) => {
  try {
    const member =
      await Committee.findByIdAndUpdate(
        req.params.id,
        req.body,
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
};

// ========================================
// DELETE MEMBER
// ========================================

const deleteCommitteeMember = async (
  req,
  res
) => {
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
};

module.exports = {
  getCommittee,
  addCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
};