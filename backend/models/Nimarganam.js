const mongoose = require("mongoose");

const nimarganamSchema = new mongoose.Schema(
  {
    driveLink: {
      type: String,
      required: true,
      trim: true,
    },

    festivalYear: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Nimarganam",
  nimarganamSchema
);