const mongoose = require("mongoose");

const donationSchema =
  new mongoose.Schema(
    {
      donorName: {
        type: String,
        required: true,
        trim: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 1,
      },

      paymentMethod: {
        type: String,
        enum: [
          "Cash",
          "UPI",
          "Bank Transfer",
          "Other",
        ],
        default: "Cash",
      },

      status: {
        type: String,
        enum: [
          "Received",
          "Pending",
        ],
        default: "Received",
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

module.exports =
  mongoose.model(
    "Donation",
    donationSchema
  );