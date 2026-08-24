const mongoose = require("mongoose");


const pujariSchema =
  new mongoose.Schema(

    {

      name: {
        type: String,
        required: true,
        trim: true,
      },


      mobile: {
        type: String,
        required: true,
        trim: true,
      },


      amount: {
        type: Number,
        required: true,
        min: 0,
      },


      details: {
        type: String,
        default: "",
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


module.exports =
  mongoose.model(
    "Pujari",
    pujariSchema
  );