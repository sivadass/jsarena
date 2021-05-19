const router = require("express").Router();
const Project = require("../model/Project");
const { projectValidation } = require("../validation");
const verify = require("./verifyToken");

router.post("/", async (req, res) => {
  const { error } = projectValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const category = new Project({
    name: req.body.name,
    code: req.body.code,
    // owner: req.user._id,
  });
  try {
    const savedCategory = await category.save();
    res.send(savedCategory);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", async (req, res) => {
  let query = {};
  const excludedFields = ["-__v", "-owner"];
  try {
    const allCategories = await Project.find(query).select(excludedFields);
    res.send(allCategories);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:id", async (req, res) => {
  let query = {};
  if (req.user.role !== "admin") {
    query.owner = req.user._id;
  }
  try {
    const categoryDetails = await Project.findById(
      req.params.id,
      (err, detail) => {
        var opts = [{ path: "category", match: { owner: req.user._id } }];
        Project.populate(detail, opts, function (err, details) {
          console.log(details);
        });
      }
    );
    res.send(categoryDetails);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    Project.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        name: req.body.name,
        code: req.body.code,
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
    const data = await Project.deleteOne({ _id: req.params.id });
    if (data.ok === 1) {
      return res.send("Successfully deleted!");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
