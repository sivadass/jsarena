const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 1,
      max: 30
    },
    icon: {
      type: String,
      required: true,
      min: 3,
      max: 30
    },
    color: {
      type: String,
      min: 7,
      max: 7
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Category", categorySchema);
