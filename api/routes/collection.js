const router = require("express").Router();
const { ObjectId } = require("mongodb");
const Collection = require("../model/Collection");
const Payment = require("../model/Payment");
const { collectionValidation } = require("../validation");
const sendEmail = require("../utils/sendMail");
const plainMessageTemplate = require("../emails/plainMessage");
const verify = require("./verifyToken");

router.post("/", verify, async (req, res) => {
  const { error } = collectionValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const { totalAmount, category, payments, description } = req.body;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const collection = new Collection({
    totalAmount: totalAmount,
    category: category,
    description: description,
    owner: req.user._id,
    dueDate: dueDate,
  });
  try {
    const savedCollection = await collection.save();
    payments.forEach(async (p) => {
      const payment = new Payment({
        amount: p.amount,
        flat: p.flatNo,
        collectionInfo: savedCollection._id,
      });
      await payment.save();
      // const msg = {
      //   to: `${savedUser.name} <${savedUser.email}>`,
      //   from: `JS Console <no-reply@jsconsole.ml>`,
      //   subject: `Welcome to JS Console Apartment Association`,
      //   html: plainMessageTemplate(
      //     `Hi ${savedUser.name},`,
      //     `You have been added to the JS Console Apartment Association. <br/> <br/> You can pay all your monthly maintenance charges and track how your money was utilized using this app. <br/><br/> Your login details are below: <br/> Username: <b>${savedUser.email}</b> <br/> Password: <b>${savedUser.phoneNumber}</b>. <br/><br/> Please use the link below to access it: <br /> <a href="https://jsconsole.ml">https://jsconsole.ml</a>`
      //   ),
      // };
      // try {
      //   await sendEmail(msg);
      //   res.send("Registered successfully!");
      // } catch (err) {
      //   res.status(400).send(err);
      // }
      await Collection.findOneAndUpdate(
        {
          _id: savedCollection._id,
        },
        {
          $push: { payments: payment._id },
        }
      );
    });
    res.send(savedCollection);
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
    const total = await Collection.find(query).countDocuments();
    const data = await Collection.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("-createdAt")
      .populate("category", "name icon -_id")
      .populate({
        path: "payments",
        populate: {
          path: "flat",
          select: "flatNo",
        },
      })
      .populate({
        path: "payments",
        populate: {
          path: "paidBy",
          select: "name",
        },
      });
    res.send({ data, total });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/dashboard", verify, async (req, res) => {
  const payer = req.user._id;
  return Payment.aggregate(
    [
      {
        $match: {
          payer: new ObjectId(payer),
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
    const paymentDetails = await Collection.findById(req.params.id)
      .populate("category", "name icon _id")
      .populate({
        path: "payments",
        populate: {
          path: "flat",
          select: "flatNo",
        },
      })
      .populate({
        path: "payments",
        populate: {
          path: "paidBy",
          select: "name",
        },
      });

    res.send(paymentDetails);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:id", async (req, res) => {
  const {
    totalAmount,
    category,
    payments,
    description,
    removedPayments = [],
  } = req.body;
  try {
    Collection.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        totalAmount,
        category,
        description,
      },
      (err) => {
        if (err) {
          return res.send(err);
        }
        removedPayments.forEach(async (removedPaymentId) => {
          try {
            const removedPayment = await Payment.deleteOne({
              _id: removedPaymentId,
            });
            return removedPayment;
          } catch (err) {
            console.log(err);
          }
        });
        payments.forEach(async (p) => {
          if (p.id) {
            try {
              const updatedPayment = await Payment.findOneAndUpdate(
                {
                  _id: p.id,
                },
                {
                  flat: p.flatNo,
                  amount: p.amount,
                },
                { new: true }
              );
              return updatedPayment;
            } catch (err) {
              console.log(err);
            }
          } else {
            try {
              const newPayment = new Payment({
                amount: p.amount,
                flat: p.flatNo,
                collectionInfo: req.params.id,
              });
              await newPayment.save();
              await Collection.findOneAndUpdate(
                {
                  _id: req.params.id,
                },
                {
                  $push: { payments: newPayment._id },
                }
              );
            } catch (err) {
              console.log("==> ", err);
            }
          }
        });
        return res.send("Successfully updated!");
      }
    );
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete("/:id", verify, async (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).send("Forbidden!");
  }
  try {
    const data = await Collection.deleteOne({ _id: req.params.id });
    if (data.ok === 1) {
      return res.send("Successfully deleted!");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
