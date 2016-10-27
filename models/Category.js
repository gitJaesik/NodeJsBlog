module.exports = (seq, Seq) => {
  return seq.define("category", {
    name: {
      type: Seq.STRING,
      allowNull: false,
      validate: {notEmpty: true}
    }
  }, {
    classMethods: {
      relate: (models) => {
        models.Category.belongsTo(models.Blog);
      }
    }
  });
};