const express = require("express");

const Donation =
  require("../models/Donation");

const {
  protect,
  editorOrAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET ALL DONATIONS
// VIEWER + EDITOR + ADMIN
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      const year =
        Number(req.query.year);

      let filter = {};

      if (year) {
        filter.festivalYear =
          year;
      }

      const donations =
        await Donation.find(filter)
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,
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
        error:
          error.message,
      });
    }
  }
);


// =====================================================
// ADD DONATION
// EDITOR + ADMIN ONLY
// =====================================================

router.post(
  "/",
  protect,
  editorOrAdmin,
  async (req, res) => {

    try {

      console.log(
        "ADD DONATION REQUEST:",
        req.body
      );

      console.log(
        "ADD DONATION USER:",
        req.user
      );


      const {
        donorName,
        amount,
        paymentMethod,
        status,
        festivalYear,
      } = req.body;


      // ===============================================
      // DONOR NAME
      // ===============================================

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


      // ===============================================
      // AMOUNT
      // ===============================================

      if (
        amount === undefined ||
        amount === null ||
        Number(amount) <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Valid donation amount is required",
        });

      }


      // ===============================================
      // FESTIVAL YEAR
      // ===============================================

      if (!festivalYear) {

        return res.status(400).json({
          success: false,
          message:
            "Festival year is required",
        });

      }


      // ===============================================
      // PAYMENT METHOD
      // ===============================================

      const allowedPaymentMethods = [
        "Cash",
        "UPI",
        "Bank Transfer",
        "Other",
      ];


      const finalPaymentMethod =
        paymentMethod || "Cash";


      if (
        !allowedPaymentMethods.includes(
          finalPaymentMethod
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid payment method",
        });

      }


      // ===============================================
      // STATUS
      // ===============================================

      const allowedStatuses = [
        "Received",
        "Pending",
      ];


      const finalStatus =
        status || "Received";


      if (
        !allowedStatuses.includes(
          finalStatus
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid donation status",
        });

      }


      // ===============================================
      // CREATE
      // ===============================================

      const donation =
        await Donation.create({

          donorName:
            donorName.trim(),

          amount:
            Number(amount),

          paymentMethod:
            finalPaymentMethod,

          status:
            finalStatus,

          festivalYear:
            Number(festivalYear),

        });


      console.log(
        "DONATION CREATED:",
        donation
      );


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

        error:
          error.message,

      });
    }
  }
);


// =====================================================
// EDIT DONATION
// EDITOR + ADMIN ONLY
// =====================================================

router.put(
  "/:id",
  protect,
  editorOrAdmin,
  async (req, res) => {

    try {

      console.log(
        "UPDATE DONATION:",
        req.params.id
      );

      console.log(
        "UPDATE USER:",
        req.user
      );


      const {
        donorName,
        amount,
        paymentMethod,
        status,
        festivalYear,
      } = req.body;


      // ===============================================
      // DONOR NAME
      // ===============================================

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


      // ===============================================
      // AMOUNT
      // ===============================================

      if (
        amount === undefined ||
        amount === null ||
        Number(amount) <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Valid donation amount is required",
        });

      }


      // ===============================================
      // YEAR
      // ===============================================

      if (!festivalYear) {

        return res.status(400).json({
          success: false,
          message:
            "Festival year is required",
        });

      }


      // ===============================================
      // PAYMENT METHOD
      // ===============================================

      const allowedPaymentMethods = [
        "Cash",
        "UPI",
        "Bank Transfer",
        "Other",
      ];


      const finalPaymentMethod =
        paymentMethod || "Cash";


      if (
        !allowedPaymentMethods.includes(
          finalPaymentMethod
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid payment method",
        });

      }


      // ===============================================
      // STATUS
      // ===============================================

      const allowedStatuses = [
        "Received",
        "Pending",
      ];


      const finalStatus =
        status || "Received";


      if (
        !allowedStatuses.includes(
          finalStatus
        )
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid donation status",
        });

      }


      // ===============================================
      // UPDATE
      // ===============================================

      const donation =
        await Donation.findByIdAndUpdate(

          req.params.id,

          {
            donorName:
              donorName.trim(),

            amount:
              Number(amount),

            paymentMethod:
              finalPaymentMethod,

            status:
              finalStatus,

            festivalYear:
              Number(festivalYear),
          },

          {
            new: true,
            runValidators: true,
          }

        );


      // ===============================================
      // NOT FOUND
      // ===============================================

      if (!donation) {

        return res.status(404).json({
          success: false,
          message:
            "Donation not found",
        });

      }


      res.status(200).json({

        success: true,

        message:
          "Donation updated successfully",

        donation,

      });

    } catch (error) {

      console.error(
        "UPDATE DONATION ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to update donation",

        error:
          error.message,

      });
    }
  }
);


// =====================================================
// DELETE DONATION
// EDITOR + ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  protect,
  editorOrAdmin,
  async (req, res) => {

    try {

      console.log(
        "DELETE DONATION:",
        req.params.id
      );

      console.log(
        "DELETE USER:",
        req.user
      );


      const donation =
        await Donation.findByIdAndDelete(
          req.params.id
        );


      // ===============================================
      // NOT FOUND
      // ===============================================

      if (!donation) {

        return res.status(404).json({

          success: false,

          message:
            "Donation not found",

        });

      }


      res.status(200).json({

        success: true,

        message:
          "Donation deleted successfully",

      });

    } catch (error) {

      console.error(
        "DELETE DONATION ERROR:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Failed to delete donation",

        error:
          error.message,

      });
    }
  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;