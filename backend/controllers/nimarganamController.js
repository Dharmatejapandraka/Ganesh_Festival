const Nimarganam = require(
  "../models/Nimarganam"
);


// ========================================
// GET NIMARGANAM RECORDS
// ========================================

const getNimarganams = async (
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

    const records =
      await Nimarganam.find(filter)
        .sort({
          immersionDate: 1,
        });


    res.status(200).json({
      success: true,
      count: records.length,
      nimarganams: records,
    });

  } catch (error) {

    console.error(
      "GET NIMARGANAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch Nimarganam records",
      error: error.message,
    });
  }
};


// ========================================
// ADD NIMARGANAM
// ========================================

const addNimarganam = async (
  req,
  res
) => {
  try {

    const {
      idolName,
      immersionDate,
      location,
      vehicle,
      responsiblePerson,
      mobile,
      status,
      notes,
      year,
      festivalYear,
    } = req.body;


    const record =
      await Nimarganam.create({
        idolName,
        immersionDate,
        location,
        vehicle,
        responsiblePerson,
        mobile,
        status,
        notes,

        festivalYear:
          festivalYear || year,
      });


    res.status(201).json({
      success: true,
      message:
        "Nimarganam record added successfully",
      nimarganam: record,
    });

  } catch (error) {

    console.error(
      "ADD NIMARGANAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add Nimarganam record",
      error: error.message,
    });
  }
};


// ========================================
// UPDATE NIMARGANAM
// ========================================

const updateNimarganam = async (
  req,
  res
) => {
  try {

    const record =
      await Nimarganam.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );


    if (!record) {

      return res.status(404).json({
        success: false,
        message:
          "Nimarganam record not found",
      });
    }


    res.status(200).json({
      success: true,
      message:
        "Nimarganam record updated successfully",
      nimarganam: record,
    });

  } catch (error) {

    console.error(
      "UPDATE NIMARGANAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update Nimarganam record",
      error: error.message,
    });
  }
};


// ========================================
// DELETE NIMARGANAM
// ========================================

const deleteNimarganam = async (
  req,
  res
) => {
  try {

    const record =
      await Nimarganam.findByIdAndDelete(
        req.params.id
      );


    if (!record) {

      return res.status(404).json({
        success: false,
        message:
          "Nimarganam record not found",
      });
    }


    res.status(200).json({
      success: true,
      message:
        "Nimarganam record deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE NIMARGANAM ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete Nimarganam record",
      error: error.message,
    });
  }
};


module.exports = {
  getNimarganams,
  addNimarganam,
  updateNimarganam,
  deleteNimarganam,
};