module.exports = (seq, Seq) => {
  return seq.define("tag", {
    name: {
        type: Seq.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    }
  }, {
    classMethods: {
      relate: (models) => {
      }
    }
  });
};