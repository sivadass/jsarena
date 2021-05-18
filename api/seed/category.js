const Category = require("../model/Category");
const categories = require("../constants/categories");

const categorySeed = async () => {
  Category.deleteMany({}, (err, res) => {
    if (res) {
      Category.insertMany(categories, (err, res) => {
        if (err) {
          console.log("Category Insert Error ==>", err);
        }
        if (res) {
          return {
            message: `Inserted ${res.length} categories`
          };
        }
      });
    } else {
      console.log("Category Remove Error ==>", err);
    }
  });
};

module.exports = categorySeed;
