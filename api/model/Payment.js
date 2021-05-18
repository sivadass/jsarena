const mongoose = require("mongoose");

const PAYMENT_MODES = ["CASH", "ONLINE", "DIRECT_TRANSFER"];
const PAYMENT_STATUS = [
  "OPEN",
  "PENDING",
  "PAID",
  "OVERDUE",
  "FAILED",
  "WRITE_OFF",
];

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 1,
      max: 99999999,
    },
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Flat",
    },
    collectionInfo: {
      // can't use collection as pathname
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: PAYMENT_STATUS[0],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentMode: {
      type: String,
      default: null,
    },
    paymentRequestId: {
      type: String,
    },
    paymentUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
