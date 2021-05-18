const router = require("express").Router();
const { ObjectId } = require("mongodb");
const axios = require("axios");
const Payment = require("../model/Payment");
const { paymentValidation } = require("../validation");
const verify = require("./verifyToken");

const getPaymentStatus = (status = "") => {
  switch (status) {
    case "Pending": {
      return "PENDING";
    }
    case "Credit": {
      return "PAID";
    }
    case "Failed": {
      return "FAILED";
    }
    default:
      return status.toUpperCase();
  }
};

router.put("/:id/payment-request", verify, async (req, res) => {
  const { amount, purpose } = req.body;
  const { id } = req.params;
  const { name, phoneNumber, email, _id: userId } = req.user;
  try {
    const response = await axios({
      method: "post",
      url: `${process.env.INSTAMOJO_BASE_URL}/payment-requests/`,
      headers: {
        "X-Api-Key": process.env.INSTAMOJO_API_KEY,
        "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN,
      },
      data: {
        amount,
        email,
        buyer_name: name,
        phone: phoneNumber,
        purpose,
        allow_repeated_payments: false,
        redirect_url: process.env.INSTAMOJO_REDIRECT_URL,
        webhook: process.env.INSTAMOJO_WEBHOOK_URL,
      },
    });
    const {
      data: {
        payment_request: { id: paymentId, status, longurl },
      },
    } = response;
    try {
      const paymentStatus = getPaymentStatus(status);
      const paymentDetails = await Payment.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            paymentMode: "ONLINE",
            paymentRequestId: paymentId,
            paymentStatus: paymentStatus,
            paymentUrl: longurl,
            paidBy: userId,
          },
        },
        { new: true }
      );
      if (paymentDetails) {
        res.send(paymentDetails);
      }
    } catch (err) {
      console.log(err);
      return res.send(err);
    }
  } catch (error) {
    console.error(error);
    return res.send(error);
  }
});

router.put("/:id/offline-payment", verify, async (req, res) => {
  const { paymentMode } = req.body;
  const { id } = req.params;
  const { _id: userId } = req.user;
  try {
    const paymentDetails = await Payment.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          paymentMode: paymentMode,
          paymentStatus: "PAID",
          paidBy: userId,
        },
      },
      { new: true }
    );
    if (paymentDetails) {
      res.send(paymentDetails);
    }
  } catch (err) {
    console.log(err);
    return res.send(err);
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const paymentDetails = Object.assign({}, req.body);
    const paymentStatus = getPaymentStatus(paymentDetails.status);
    Payment.findOneAndUpdate(
      {
        paymentRequestId: paymentDetails.payment_request_id,
      },
      {
        $set: {
          paymentStatus: paymentStatus,
        },
      },
      { new: true },
      (err) => {
        if (err) {
          return res.send(err);
        }
        return res.send("Successfully updated!");
      }
    );
  } catch (err) {
    console.error(err);
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
  if (req.user.role !== "admin") {
    query.flat = req.user.flat;
  }
  try {
    const total = await Payment.find(query).countDocuments();
    const data = await Payment.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("-createdAt")
      .populate("flat", "flatNo _id")
      .populate("paidBy", "name")
      .populate({
        path: "collectionInfo",
        select: "totalAmount",
        populate: {
          path: "category",
          select: "name",
        },
      });
    res.send({ data, total });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/upcoming-payments", verify, async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;
  let query = {};
  query.flat = req.user.flat;
  query.paymentStatus = ["PENDING", "OPEN", "OVERDUE"];

  try {
    const data = await Payment.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort("-createdAt")
      .populate("flat", "flatNo _id")
      .populate("paidBy", "name")
      .populate({
        path: "collectionInfo",
        select: "totalAmount",
        populate: {
          path: "category",
          select: "name",
        },
      });
    res.send(data);
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
  return Payment.aggregate(
    [
      {
        $match: {
          // payer: new ObjectId(payer),
          paymentStatus: "PAID",
          updatedAt: {
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
  let query = {};
  if (req.user.role !== "admin") {
    query.payer = req.user._id;
  }
  try {
    const paymentDetails = await Payment.findById(req.params.id)
      .populate("flat", "flatNo")
      .populate("paidBy", "name")
      .populate({
        path: "collectionInfo",
        select: "totalAmount dueDate",
        populate: {
          path: "category",
          select: "name",
        },
      });
    res.send(paymentDetails);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    Payment.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        amount: req.body.amount,
        categoryId: req.body.categoryId,
        comment: req.body.comment,
        paidOn: req.body.paidOn,
        paymentMode: req.body.paymentMode,
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
    const data = await Payment.deleteOne({ _id: req.params.id });
    if (data.ok === 1) {
      return res.send("Successfully deleted!");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
