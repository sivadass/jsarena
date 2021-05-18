const router = require("express").Router();
const Expense = require("../model/Expense");
const { expenseValidation } = require("../validation");
const verify = require("./verifyToken");

router.post("/", verify, async (req, res) => {
  const { error } = expenseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const post = new Expense({
    amount: req.body.amount,
    payee: req.body.payee,
    category: req.body.category,
    description: req.body.description,
    owner: req.user._id,
  });
  try {
    const savedPost = await post.save();
    res.send(savedPost);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/", verify, async (req, res) => {
  const { from, to } = req.query;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  let query = {};
  if (from && to) {
    query.paidOn = { $gte: to, $lte: from };
  }
  try {
    const total = await Expense.find(query).countDocuments();
    const data = await Expense.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("-paidOn")
      .populate("category", "name icon");
    res.send({ data, total });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/dashboard", verify, async (req, res) => {
  const { period = "month" } = req.query;
  const date = new Date();
  const startDate =
    period === "month"
      ? new Date(date.getFullYear(), date.getMonth(), 1)
      : new Date(date.getFullYear(), 0, 1);
  const endDate =
    period === "month"
      ? new Date(date.getFullYear(), date.getMonth() + 1, 0)
      : new Date(date.getFullYear(), 12, 1);
  return Expense.aggregate(
    [
      {
        $match: {
          paidOn: {
            $gte: new Date(new Date(startDate).setHours(00, 00, 00)),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59)),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTransactions: {
            $sum: 1,
          },
          totalAmount: {
            $sum: "$amount",
          },
        },
      },
    ],
    function (err, result) {
      if (err) {
        res.status(400).send(err);
        return;
      }
      return res.send(result);
    }
  );
});

router.get("/:id", verify, async (req, res) => {
  try {
    const expenseDetails = await Expense.findById(req.params.id).populate(
      "category",
      "name icon _id"
    );
    res.send(expenseDetails);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    Expense.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        amount: req.body.amount,
        payee: req.body.payee,
        category: req.body.category,
        description: req.body.description,
        // paidOn: req.body.paidOn,
        attachment: req.body.attachment,
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
    const data = await Expense.deleteOne({ _id: req.params.id });
    if (data.ok === 1) {
      return res.send("Successfully deleted!");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
