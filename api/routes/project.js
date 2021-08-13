const router = require("express").Router();
const Project = require("../model/Project");
const { projectValidation } = require("../utils/validation");
const verify = require("../middlewares/verifyToken");

router.post("/", verify, async (req, res) => {
  const { error } = projectValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const category = new Project({
    name: req.body.name,
    code: req.body.code,
    owner: req.user._id,
  });
  try {
    const savedCategory = await category.save();
    res.send(savedCategory);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", verify, async (req, res) => {
  let query = {
    owner: req.user._id,
  };
  const excludedFields = ["-__v", "-owner"];
  try {
    const allCategories = await Project.find(query).select(excludedFields);
    res.send(allCategories);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:id", verify, async (req, res) => {
  let query = {
    _id: req.params.id,
    owner: req.user._id,
  };
  try {
    const projectDetails = await Project.findOne(query);
    if (projectDetails !== null) {
      res.send(projectDetails);
    } else {
      res.status(404).send("Not found!");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:id", verify, async (req, res) => {
  try {
    Project.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
      },
      {
        name: req.body.name,
        code: req.body.code,
      },
      (err, data) => {
        if (err) {
          return res.send(err);
        }
        return res.send({ data, message: "success" });
      }
    );
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/:id", verify, async (req, res) => {
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
