const router = require("express").Router();
const Category = require("../model/Category");
const { categoryValidation } = require("../validation");
const verify = require("./verifyToken");

router.post("/", verify, async (req, res) => {
  const { error } = categoryValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
    owner: req.user._id,
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
  const excludedFields = ["-__v", "-owner", "-createdAt", "-updatedAt"];
  try {
    const allCategories = await Category.find(query).select(excludedFields);
    res.send(allCategories);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:id", verify, async (req, res) => {
  let query = {};
  if (req.user.role !== "admin") {
    query.owner = req.user._id;
  }
  try {
    const categoryDetails = await Category.findById(
      req.params.id,
      (err, detail) => {
        var opts = [{ path: "category", match: { owner: req.user._id } }];
        Category.populate(detail, opts, function (err, details) {
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
    Category.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        name: req.body.name,
        icon: req.body.icon,
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
    const data = await Category.deleteOne({ _id: req.params.id });
    if (data.ok === 1) {
      return res.send("Successfully deleted!");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
