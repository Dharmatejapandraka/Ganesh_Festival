const express = require("express");

const Expense = require("../models/Expense");

const {
  protect,
  editorOrAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GET EXPENSES
// VIEWER + EDITOR + ADMIN
// =====================================================

router.get(
  "/",
  protect,
  async (req, res) => {

    try {

      console.log(
        "GET EXPENSES USER:",
        req.user
      );


      const year =
        Number(req.query.year);


      const filter = {};


      if (year) {

        filter.festivalYear =
          year;

      }


      const expenses =
        await Expense.find(filter)
          .sort({
            createdAt: -1,
          });


      return res.status(200).json({

        success: true,

        expenses,

      });


    } catch (error) {

      console.error(
        "GET EXPENSES ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch expenses",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// ADD EXPENSE
// EDITOR + ADMIN ONLY
// =====================================================

router.post(
  "/",
  protect,
  editorOrAdmin,
  async (req, res) => {

    try {

      console.log(
        "ADD EXPENSE USER:",
        req.user
      );


      console.log(
        "EXPENSE REQUEST:",
        req.body
      );


      const {

        title,

        category,

        amount,

        paymentMethod,

        description,

        festivalYear,

      } = req.body;


      // =================================================
      // TITLE
      // =================================================

      if (
        !title ||
        !title.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Expense title is required",

        });

      }


      // =================================================
      // CATEGORY
      // =================================================

      if (
        !category ||
        !category.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Expense category is required",

        });

      }


      // =================================================
      // AMOUNT
      // =================================================

      if (
        amount === undefined ||
        amount === null ||
        amount === "" ||
        Number(amount) <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Valid expense amount is required",

        });

      }


      // =================================================
      // FESTIVAL YEAR
      // =================================================

      if (
        !festivalYear
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Festival year is required",

        });

      }


      // =================================================
      // CREATE EXPENSE
      // =================================================

      const expense =
        await Expense.create({

          title:
            title.trim(),

          category:
            category.trim(),

          amount:
            Number(amount),

          paymentMethod:
            paymentMethod ||
            "Cash",

          description:
            description
              ? description.trim()
              : "",

          festivalYear:
            Number(festivalYear),

        });


      console.log(
        "EXPENSE CREATED:",
        expense
      );


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(201).json({

        success: true,

        message:
          "Expense added successfully",

        expense,

      });


    } catch (error) {

      console.error(
        "ADD EXPENSE ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to add expense",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// UPDATE EXPENSE
// EDITOR + ADMIN ONLY
// =====================================================

router.put(
  "/:id",
  protect,
  editorOrAdmin,
  async (req, res) => {

    try {

      console.log(
        "UPDATE EXPENSE USER:",
        req.user
      );


      const {

        title,

        category,

        amount,

        paymentMethod,

        description,

        festivalYear,

      } = req.body;


      // =================================================
      // VALIDATION
      // =================================================

      if (
        title !== undefined &&
        !String(title).trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Expense title is required",

        });

      }


      if (
        category !== undefined &&
        !String(category).trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Expense category is required",

        });

      }


      if (
        amount !== undefined &&
        (
          amount === "" ||
          Number(amount) <= 0
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Valid expense amount is required",

        });

      }


      // =================================================
      // UPDATE DATA
      // =================================================

      const updateData = {};


      if (
        title !== undefined
      ) {

        updateData.title =
          String(title).trim();

      }


      if (
        category !== undefined
      ) {

        updateData.category =
          String(category).trim();

      }


      if (
        amount !== undefined
      ) {

        updateData.amount =
          Number(amount);

      }


      if (
        paymentMethod !== undefined
      ) {

        updateData.paymentMethod =
          paymentMethod;

      }


      if (
        description !== undefined
      ) {

        updateData.description =
          String(description).trim();

      }


      if (
        festivalYear !== undefined
      ) {

        updateData.festivalYear =
          Number(festivalYear);

      }


      // =================================================
      // FIND AND UPDATE
      // =================================================

      const expense =
        await Expense.findByIdAndUpdate(

          req.params.id,

          updateData,

          {
            new: true,

            runValidators: true,
          }

        );


      // =================================================
      // NOT FOUND
      // =================================================

      if (!expense) {

        return res.status(404).json({

          success: false,

          message:
            "Expense not found",

        });

      }


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        success: true,

        message:
          "Expense updated successfully",

        expense,

      });


    } catch (error) {

      console.error(
        "UPDATE EXPENSE ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update expense",

        error:
          error.message,

      });

    }

  }
);


// =====================================================
// DELETE EXPENSE
// EDITOR + ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  protect,
  editorOrAdmin,
  async (req, res) => {

    try {

      console.log(
        "DELETE EXPENSE USER:",
        req.user
      );


      const expense =
        await Expense.findByIdAndDelete(
          req.params.id
        );


      // =================================================
      // NOT FOUND
      // =================================================

      if (!expense) {

        return res.status(404).json({

          success: false,

          message:
            "Expense not found",

        });

      }


      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({

        success: true,

        message:
          "Expense deleted successfully",

      });


    } catch (error) {

      console.error(
        "DELETE EXPENSE ERROR:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to delete expense",

        error:
          error.message,

      });

    }

  }
);


module.exports = router;