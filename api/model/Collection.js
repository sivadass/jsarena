const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    totalAmount: {
      type: Number,
      required: true,
      min: 1,
      max: 99999999,
    },
    dueDate: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    description: {
      type: String,
      max: 200,
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Collection", collectionSchema);
