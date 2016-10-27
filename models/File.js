module.exports = (seq, Seq) => {
  return seq.define("file", {
    name: {
        type: Seq.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    },
    type: {
        type: Seq.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    },
    path: {
        type: Seq.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    },
    hit: {
        type: Seq.INTEGER,
        defaultValue: 0
    }
  }, {
    classMethods: {
      relate: (models) => {
        models.File.belongsTo(models.Blog);
      }
    }
  });
};