const Photo = require("../models/Photo");
const fs = require("fs");
const path = require("path");


// ========================================
// GET PHOTOS
// ========================================

const getPhotos = async (req, res) => {
  try {
    const { year } = req.query;

    const filter = {};

    if (year) {
      filter.festivalYear = Number(year);
    }

    const photos = await Photo.find(filter)
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: photos.length,
      photos,
    });

  } catch (error) {

    console.error(
      "GET PHOTOS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch photos",
      error: error.message,
    });
  }
};


// ========================================
// ADD PHOTO
// ========================================

const addPhoto = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a photo",
      });
    }

    const {
      title,
      year,
      festivalYear,
    } = req.body;


    if (!title || !title.trim()) {

      // Delete uploaded file
      fs.unlink(
        req.file.path,
        () => {}
      );

      return res.status(400).json({
        success: false,
        message: "Photo title is required",
      });
    }


    const photoDate =
      new Date()
        .toISOString()
        .split("T")[0];


    const photo =
      await Photo.create({
        title: title.trim(),

        filename:
          req.file.filename,

        originalName:
          req.file.originalname,

        imageUrl:
          `/uploads/${req.file.filename}`,

        date:
          photoDate,

        festivalYear:
          Number(
            festivalYear || year
          ),
      });


    res.status(201).json({
      success: true,
      message:
        "Photo uploaded successfully",

      photo,
    });

  } catch (error) {

    console.error(
      "ADD PHOTO ERROR:",
      error
    );


    if (req.file) {
      fs.unlink(
        req.file.path,
        () => {}
      );
    }


    res.status(500).json({
      success: false,
      message:
        "Failed to upload photo",

      error:
        error.message,
    });
  }
};


// ========================================
// DELETE PHOTO
// ========================================

const deletePhoto = async (req, res) => {
  try {

    const photo =
      await Photo.findById(
        req.params.id
      );


    if (!photo) {
      return res.status(404).json({
        success: false,
        message:
          "Photo not found",
      });
    }


    // Delete image from uploads folder

    const filePath =
      path.join(
        __dirname,
        "..",
        "uploads",
        photo.filename
      );


    if (
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(filePath);
    }


    // Delete MongoDB record

    await Photo.findByIdAndDelete(
      req.params.id
    );


    res.status(200).json({
      success: true,
      message:
        "Photo deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE PHOTO ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete photo",

      error:
        error.message,
    });
  }
};


module.exports = {
  getPhotos,
  addPhoto,
  deletePhoto,
};