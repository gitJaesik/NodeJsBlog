module.exports = (seq, Seq) => {
  return seq.define("post", {
    title: {
        type: Seq.STRING,
        allowNull: false,
        validate: {notEmpty: true}
    },
    contents: {
        type: Seq.TEXT,
        allowNull: false,
        validate: {notEmpty: true}
    },
    hit: {
        type: Seq.INTEGER,
        defaultValue: 0
    },
    like: {
        type: Seq.INTEGER,
        defaultValue: 0
    }
  }, {
    classMethods: {
      relate: (models) => {
        models.Post.belongsTo(models.Blog);
        models.Post.belongsTo(models.Category);
        models.Post.hasMany(models.Comment);
        models.Post.belongsToMany(models.Tag, {through: 'post_tag'});
        models.Post.belongsToMany(models.File, {through: 'post_file'});
      }
    }
  });
};