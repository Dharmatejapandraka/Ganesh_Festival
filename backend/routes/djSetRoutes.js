const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const DJSet = require("../models/DJSet");

const {
  protect,
  editorOrAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "dj-sets"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {

    const extension = path.extname(
      file.originalname
    );

    const filename =
      `dj-${Date.now()}-${Math.round(
        Math.random() * 100000
      )}${extension}`;

    cb(null, filename);
  },

});


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (
    allowedTypes.includes(file.mimetype)
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only JPG, PNG, WEBP and GIF images are allowed"
      )
    );

  }

};


const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

});


// =====================================================
// GET DJ SETS
// VIEWER + EDITOR + ADMIN
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      console.log(
        "\n================================="
      );

      console.log(
        "GET DJ SETS"
      );

      console.log(
        "USER:",
        req.user
      );

      console.log(
        "QUERY:",
        req.query
      );


      // -----------------------------------------------
      // GET YEAR
      // -----------------------------------------------

      const year = Number(
        req.query.year
      );


      // -----------------------------------------------
      // FILTER
      // -----------------------------------------------

      const filter = {};

      if (
        req.query.year &&
        !Number.isNaN(year)
      ) {

        filter.festivalYear = year;

      }


      console.log(
        "DJ SET FILTER:",
        filter
      );


      // -----------------------------------------------
      // FETCH
      // -----------------------------------------------

      const djSets =
        await DJSet.find(filter)
          .sort({
            createdAt: -1,
          });


      // -----------------------------------------------
      // DEBUG
      // -----------------------------------------------

      console.log(
        "DJ SETS FOUND:",
        djSets.length
      );

      console.log(
        "DJ SETS DATA:",
        djSets
      );


      console.log(
        "=================================\n"
      );


      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      return res.status(200).json({

        success: true,

        count: djSets.length,

        djSets,

      });

    } catch (error) {

      console.error(
        "GET DJ SETS ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch DJ sets",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// ADD DJ SET
// EDITOR + ADMIN ONLY
// =====================================================

router.post(
  "/",
  protect,
  editorOrAdmin,
  upload.single("image"),

  async (req, res) => {

    try {

      console.log(
        "\n================================="
      );

      console.log(
        "ADD DJ SET"
      );

      console.log(
        "USER:",
        req.user
      );

      console.log(
        "REQUEST BODY:",
        req.body
      );

      console.log(
        "UPLOADED FILE:",
        req.file
      );


      // -----------------------------------------------
      // GET DATA
      // -----------------------------------------------

      const {
        djName,
        city,
        mobile,
        totalAmount,
        advanceAmount,
        festivalYear,
      } = req.body;


      // -----------------------------------------------
      // DJ NAME
      // -----------------------------------------------

      if (
        !djName ||
        !djName.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "DJ name is required",

        });

      }


      // -----------------------------------------------
      // CITY
      // -----------------------------------------------

      if (
        !city ||
        !city.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "City is required",

        });

      }


      // -----------------------------------------------
      // MOBILE
      // -----------------------------------------------

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


      // -----------------------------------------------
      // TOTAL AMOUNT
      // -----------------------------------------------

      if (
        totalAmount === undefined ||
        totalAmount === "" ||
        Number.isNaN(Number(totalAmount)) ||
        Number(totalAmount) < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Valid total amount is required",

        });

      }


      // -----------------------------------------------
      // ADVANCE AMOUNT
      // -----------------------------------------------

      if (
        advanceAmount === undefined ||
        advanceAmount === "" ||
        Number.isNaN(Number(advanceAmount)) ||
        Number(advanceAmount) < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Valid advance amount is required",

        });

      }


      if (
        Number(advanceAmount) >
        Number(totalAmount)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Advance amount cannot be greater than total amount",

        });

      }


      // -----------------------------------------------
      // FESTIVAL YEAR
      // -----------------------------------------------

      if (
        !festivalYear ||
        Number.isNaN(Number(festivalYear))
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Festival year is required",

        });

      }


      // -----------------------------------------------
      // IMAGE
      // -----------------------------------------------

      let image = "";

      if (req.file) {

        image =
          `/uploads/dj-sets/${req.file.filename}`;

      }


      // -----------------------------------------------
      // CREATE
      // -----------------------------------------------

      const djSet =
        await DJSet.create({

          djName:
            djName.trim(),

          city:
            city.trim(),

          mobile:
            mobile.trim(),

          totalAmount:
            Number(totalAmount),

          advanceAmount:
            Number(advanceAmount),

          image,

          festivalYear:
            Number(festivalYear),

        });


      // -----------------------------------------------
      // IMPORTANT DEBUG
      // -----------------------------------------------

      console.log(
        "DJ SET CREATED SUCCESSFULLY:"
      );

      console.log(
        djSet
      );


      console.log(
        "CREATED ID:",
        djSet._id
      );

      console.log(
        "CREATED YEAR:",
        djSet.festivalYear
      );

      console.log(
        "=================================\n"
      );


      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      return res.status(201).json({

        success: true,

        message:
          "DJ set added successfully",

        djSet,

      });

    } catch (error) {

      console.error(
        "ADD DJ SET ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to add DJ set",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// DELETE DJ SET
// EDITOR + ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  protect,
  editorOrAdmin,

  async (req, res) => {

    try {

      console.log(
        "DELETE DJ SET ID:",
        req.params.id
      );


      const djSet =
        await DJSet.findByIdAndDelete(
          req.params.id
        );


      if (!djSet) {

        return res.status(404).json({

          success: false,

          message:
            "DJ set not found",

        });

      }


      // -----------------------------------------------
      // DELETE IMAGE
      // -----------------------------------------------

      if (djSet.image) {

        const imagePath =
          path.join(
            __dirname,
            "..",
            djSet.image
          );


        if (
          fs.existsSync(imagePath)
        ) {

          fs.unlinkSync(
            imagePath
          );

        }

      }


      return res.status(200).json({

        success: true,

        message:
          "DJ set deleted successfully",

      });

    } catch (error) {

      console.error(
        "DELETE DJ SET ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to delete DJ set",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "DJ SET ROUTE ERROR:",
      error
    );


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