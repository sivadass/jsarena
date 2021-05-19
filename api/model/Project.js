const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 1,
      max: 30,
    },
    code: {
      type: String,
      required: true,
    },
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "User",
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
