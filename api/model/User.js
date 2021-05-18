const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 255,
    },
    email: {
      type: String,
      required: true,
      min: 6,
      max: 255,
    },
    phoneNumber: {
      type: String,
      required: true,
      min: 10,
      max: 10,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 1024,
    },
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    activated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
