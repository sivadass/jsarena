const categorySeed = require("./category");

const seedData = async () => {
  try {
    const category = await categorySeed();
    return {
      message: "Data seeded successfully!",
      data: {
        category: category
      }
    };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = seedData;
