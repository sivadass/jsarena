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
      max: 255,
    },
    gId: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      min: 4,
      max: 1024,
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
