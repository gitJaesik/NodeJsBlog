module.exports = (seq, Seq) => {
  return seq.define("comment", {
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
        models.Comment.belongsTo(models.Blog);
        models.Comment.hasMany(models.Comment, {as: 'childComment'});
      }
    }
  });
};