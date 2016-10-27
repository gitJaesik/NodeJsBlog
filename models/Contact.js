module.exports = (seq, Seq) => {
  return seq.define("contact", {
    name: {
        type: Seq.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    },
    email: {
        type: Seq.STRING,
        validate: {isEmail: true}
    },
    contents: {
        type: Seq.TEXT,
        allowNull: false,
        validate: {notEmpty: true}
    }
  }, {
    classMethods: {
      relate: (models) => {
        models.Contact.belongsTo(models.Blog);
      }
    }
  });
};