const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const GaneshIdol = require("../models/GaneshIdol");

const {
  protect,
  editorOrAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// UPLOAD DIRECTORY
// ======================================================

const uploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "ganesh-idols"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}


// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {

    const extension =
      path.extname(file.originalname);

    const filename =
      `idol-${Date.now()}-${Math.round(
        Math.random() * 100000
      )}${extension}`;

    cb(null, filename);
  },

});


// ======================================================
// FILE FILTER
// ======================================================

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


// ======================================================
// MULTER
// ======================================================

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

});


// ======================================================
// GET GANESH IDOLS
// VIEWER + EDITOR + ADMIN
// ======================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      const year =
        Number(req.query.year);

      const filter = {};

      if (year) {
        filter.festivalYear = year;
      }


      const idols =
        await GaneshIdol.find(filter)
          .sort({
            createdAt: -1,
          });


      res.status(200).json({

        success: true,

        idols,

      });

    } catch (error) {

      console.error(
        "GET GANESH IDOLS ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to fetch Ganesh idols",

        error:
          error.message,

      });

    }

  }
);


// ======================================================
// ADD GANESH IDOL
// EDITOR + ADMIN ONLY
// ======================================================

router.post(
  "/",
  protect,
  editorOrAdmin,
  upload.single("image"),

  async (req, res) => {

    try {

      console.log(
        "GANESH IDOL REQUEST:",
        req.body
      );


      const {
        donorName,
        mobile,
        feet,
        totalAmount,
        festivalYear,
      } = req.body;


      // ==================================================
      // DONOR NAME
      // ==================================================

      if (
        !donorName ||
        !donorName.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Donor name is required",

        });

      }


      // ==================================================
      // MOBILE
      // ==================================================

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


      if (
        !/^[0-9]{10}$/.test(
          mobile.trim()
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Enter a valid 10-digit mobile number",

        });

      }


      // ==================================================
      // FEET
      // ==================================================

      if (
        feet === undefined ||
        feet === null ||
        feet === "" ||
        Number(feet) <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Valid idol height is required",

        });

      }


      // ==================================================
      // TOTAL AMOUNT
      // ==================================================

      if (
        totalAmount === undefined ||
        totalAmount === null ||
        totalAmount === "" ||
        Number(totalAmount) < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Valid total amount is required",

        });

      }


      // ==================================================
      // FESTIVAL YEAR
      // ==================================================

      if (!festivalYear) {

        return res.status(400).json({

          success: false,

          message:
            "Festival year is required",

        });

      }


      // ==================================================
      // IMAGE
      // ==================================================

      let image = "";

      if (req.file) {

        image =
          `/uploads/ganesh-idols/${req.file.filename}`;

      }


      // ==================================================
      // CREATE
      // ==================================================

      const idol =
        await GaneshIdol.create({

          donorName:
            donorName.trim(),

          mobile:
            mobile.trim(),

          feet:
            Number(feet),

          totalAmount:
            Number(totalAmount),

          image,

          festivalYear:
            Number(festivalYear),

        });


      console.log(
        "GANESH IDOL CREATED:",
        idol
      );


      // ==================================================
      // RESPONSE
      // ==================================================

      res.status(201).json({

        success: true,

        message:
          "Ganesh idol added successfully",

        idol,

      });

    } catch (error) {

      console.error(
        "ADD GANESH IDOL ERROR:",
        error
      );


      // Delete uploaded image if database
      // creation failed

      if (req.file) {

        const filePath =
          path.join(
            uploadDir,
            req.file.filename
          );

        if (
          fs.existsSync(filePath)
        ) {

          fs.unlinkSync(
            filePath
          );

        }

      }


      res.status(500).json({

        success: false,

        message:
          error.message ||
          "Failed to add Ganesh idol",

      });

    }

  }
);


// ======================================================
// DELETE GANESH IDOL
// EDITOR + ADMIN ONLY
// ======================================================

router.delete(
  "/:id",
  protect,
  editorOrAdmin,

  async (req, res) => {

    try {

      const idol =
        await GaneshIdol.findById(
          req.params.id
        );


      // ==================================================
      // NOT FOUND
      // ==================================================

      if (!idol) {

        return res.status(404).json({

          success: false,

          message:
            "Ganesh idol not found",

        });

      }


      // ==================================================
      // DELETE DATABASE RECORD
      // ==================================================

      await GaneshIdol.findByIdAndDelete(
        req.params.id
      );


      // ==================================================
      // DELETE IMAGE
      // ==================================================

      if (idol.image) {

        const imagePath =
          path.join(
            __dirname,
            "..",
            idol.image
          );


        if (
          fs.existsSync(imagePath)
        ) {

          fs.unlinkSync(
            imagePath
          );

        }

      }


      // ==================================================
      // RESPONSE
      // ==================================================

      res.status(200).json({

        success: true,

        message:
          "Ganesh idol deleted successfully",

      });

    } catch (error) {

      console.error(
        "DELETE GANESH IDOL ERROR:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Failed to delete Ganesh idol",

        error:
          error.message,

      });

    }

  }
);


// ======================================================
// MULTER ERROR HANDLER
// ======================================================

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