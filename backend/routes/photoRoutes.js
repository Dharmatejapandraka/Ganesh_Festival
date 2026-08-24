const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Photo = require("../models/Photo");

const router = express.Router();


// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "photos"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}


// ==========================================
// MULTER STORAGE
// ==========================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {

    const extension =
      path.extname(file.originalname);

    const filename =
      `photo-${Date.now()}-${Math.round(
        Math.random() * 100000
      )}${extension}`;

    cb(null, filename);
  },

});


// ==========================================
// FILE FILTER
// ==========================================

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files are allowed"
      )
    );
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
});


// ==========================================
// GET PHOTOS
// ==========================================

router.get("/", async (req, res) => {

  try {

    const year =
      Number(req.query.year);

    const filter = {};

    if (year) {
      filter.festivalYear = year;
    }

    const photos =
      await Photo.find(filter)
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      photos,
    });

  } catch (error) {

    console.error(
      "GET PHOTOS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch photos",
      error: error.message,
    });
  }
});


// ==========================================
// ADD PHOTO
// ==========================================

router.post(
  "/",
  upload.single("image"),
  async (req, res) => {
    try {
      const { festivalYear } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a photo",
        });
      }

      if (!festivalYear) {
        fs.unlinkSync(req.file.path);

        return res.status(400).json({
          success: false,
          message: "Festival year is required",
        });
      }

      const image =
        `/uploads/photos/${req.file.filename}`;

      const photo = await Photo.create({
        image,
        festivalYear: Number(festivalYear),
      });

      res.status(201).json({
        success: true,
        message: "Photo uploaded successfully",
        photo,
      });

    } catch (error) {
      console.error(
        "ADD PHOTO ERROR:",
        error
      );

      if (req.file) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (err) {
          console.error(err);
        }
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to upload photo",
      });
    }
  }
);

// ==========================================
// DELETE PHOTO
// ==========================================

router.delete(
  "/:id",
  async (req, res) => {

    try {

      const photo =
        await Photo.findByIdAndDelete(
          req.params.id
        );


      if (!photo) {

        return res.status(404).json({
          success: false,
          message:
            "Photo not found",
        });

      }


      // DELETE IMAGE FILE

      if (photo.image) {

        const imagePath =
          path.join(
            __dirname,
            "..",
            photo.image
          );


        if (
          fs.existsSync(imagePath)
        ) {

          fs.unlinkSync(
            imagePath
          );

        }
      }


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
        error: error.message,
      });
    }
  }
);


// ==========================================
// MULTER ERROR
// ==========================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {

    if (
      error instanceof multer.MulterError
    ) {

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });

    }


    if (error) {

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });

    }


    next();
  }
);


module.exports = router;