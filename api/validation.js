const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).required().email(),
    phoneNumber: Joi.string().min(10).max(10).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string(),
    flat: Joi.string(),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const categoryValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(30).required(),
    icon: Joi.string().min(3).max(30).required(),
    color: Joi.string().min(7).max(7),
  });
  return schema.validate(data);
};

const flatValidation = (data) => {
  const schema = Joi.object({
    flatNo: Joi.string().min(1).max(4).required(),
  });
  return schema.validate(data);
};

const expenseValidation = (data) => {
  const schema = Joi.object({
    amount: Joi.number().min(1).max(99999999).required(),
    payee: Joi.string().min(1).max(50).required(),
    category: Joi.string().required(),
    description: Joi.string().allow(""),
    attachment: Joi.string(),
  });
  return schema.validate(data);
};

const paymentValidation = (data) => {
  const schema = Joi.object({
    amount: Joi.number().min(1).max(99999999).required(),
    categoryId: Joi.string().required(),
    collectionInfo: Joi.string().required(),
  });
  return schema.validate(data);
};

const collectionValidation = (data) => {
  const schema = Joi.object({
    totalAmount: Joi.number().min(1).max(99999999).required(),
    category: Joi.string().required(),
    description: Joi.string().allow(""),
    payments: Joi.array()
      .items(
        Joi.object({
          flatNo: Joi.string(),
          amount: Joi.number(),
        })
      )
      .has(Joi.object({ flatNo: Joi.string(), amount: Joi.number() })),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.expenseValidation = expenseValidation;
module.exports.paymentValidation = paymentValidation;
module.exports.categoryValidation = categoryValidation;
module.exports.flatValidation = flatValidation;
module.exports.collectionValidation = collectionValidation;
