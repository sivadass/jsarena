const router = require("express").Router();
const Flat = require("../model/Flat");
const { flatValidation } = require("../validation");
const verify = require("./verifyToken");

router.post("/", verify, async (req, res) => {
  const { error } = flatValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const category = new Flat({
    flatNo: req.body.flatNo,
    owner: req.user._id,
  });
  try {
    const savedFlat = await category.save();
    res.send(savedFlat);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", async (req, res) => {
  let query = {};
  const excludedFields = ["-__v", "-owner"];
  try {
    const allFlats = await Flat.find(query)
      .select(excludedFields)
      .populate({ path: "flatOwners", select: "name email phoneNumber" })
      .populate({ path: "flatTenants", select: "name email phoneNumber" });
    res.send(allFlats);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:id", verify, async (req, res) => {
  let query = {};
  const excludedFields = ["-__v", "-owner"];
  if (req.user.role !== "admin") {
    query.owner = req.user._id;
  }
  try {
    const flatDetails = await Flat.findById(req.params.id)
      .select(excludedFields)
      .populate({ path: "flatOwners", select: "name email phoneNumber" })
      .populate({ path: "flatTenants", select: "name email phoneNumber" });
    res.send(flatDetails);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    Flat.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        flatTenants: req.body.flatTenants,
        flatOwners: req.body.flatOwners,
      },
      (err) => {
        if (err) {
          return res.send(err);
        }
        return res.send("Successfully updated!");
      }
    );
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const data = await Flat.deleteOne({ _id: req.params.id });
    if (data.ok === 1) {
      return res.send("Successfully deleted!");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
