const Expense = require("../models/Expense");


// ========================================
// GET EXPENSES
// ========================================

const getExpenses = async (req, res) => {
  try {
    const { year } = req.query;

    const filter = {};

    if (year) {
      filter.festivalYear = Number(year);
    }

    const expenses =
      await Expense.find(filter)
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });

  } catch (error) {

    console.error(
      "GET EXPENSES ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
};


// ========================================
// ADD EXPENSE
// ========================================

const addExpense = async (req, res) => {
  try {

    const {
      description,
      category,
      amount,
      method,
      status,
      date,
      notes,
      year,
      festivalYear,
    } = req.body;


    const expense =
      await Expense.create({
        description,
        category,
        amount,
        method,
        status,
        date,
        notes,
        festivalYear:
          festivalYear || year,
      });


    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
    });

  } catch (error) {

    console.error(
      "ADD EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to add expense",
      error: error.message,
    });
  }
};


// ========================================
// UPDATE EXPENSE
// ========================================

const updateExpense = async (req, res) => {
  try {

    const expense =
      await Expense.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );


    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });

  } catch (error) {

    console.error(
      "UPDATE EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update expense",
      error: error.message,
    });
  }
};


// ========================================
// DELETE EXPENSE
// ========================================

const deleteExpense = async (req, res) => {
  try {

    const expense =
      await Expense.findByIdAndDelete(
        req.params.id
      );


    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE EXPENSE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
      error: error.message,
    });
  }
};


module.exports = {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
};