const mongoose = require("mongoose");

const flatSchema = new mongoose.Schema(
  {
    flatNo: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
      min: 1,
      max: 4,
    },
    flatTenants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    flatOwners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Flat", flatSchema);
