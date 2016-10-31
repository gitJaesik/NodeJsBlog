const fs = require('fs');
const Seq = require('sequelize');
const config = require('../config');
const path = require('path');

var seq = new Seq(
		config.db.mysql.database,
		config.db.mysql.username,
		config.db.mysql.password, {
	define: {
		underscored: true
	}
});

// Define models
var models = {};

fs.readdirSync(path.normalize(__dirname)).forEach(fileName => {
	if (path.normalize(__dirname+'/'+fileName) == path.normalize(__filename)) return;

	let modelName = fileName.slice(0, -3);
	models[modelName] = require(path.normalize(__dirname+'/'+fileName))(seq, Seq);
});

Object.keys(models).forEach(modelName => {
	let Model = models[modelName];
	if (Model.relate) {
		Model.relate(models);
		delete Model.relate;
	}
});

models.seq = seq;
models.Seq = Seq;

// Sync with database
if (process.env.DROP) {
	seq.sync({force: true}).then(() => {

		console.log("===DATABASE SYNCED===");

		// blog
		var blog = null;
		models.Blog.create({
			user_id: 'admin',
			password: '1234',
			name: 'jaesik',
			facebook_url: 'http://facebook.com/jaesik.phee',
			email: 'maguire1815@gmail.com',
			lat: 37.4814876,
			lang: 126.9500579,
			fax: '02-2054-4620',
			phone: '01020544620',
			contact_text: 'Hello!'

		// category
		}).then(b => {
			blog = b;
			return models.Category.bulkCreate([{
				name: '일상',
				blog_id: 1
			}, {
				name: '정보',
				blog_id: 1
			}]);

		// tag
		}).then(_ => {
			return models.Tag.bulkCreate([{
				name: '코딩',
				blog_id: 1
			}, {
				name: '창업',
				blog_id: 1
			}, {
				name: '음식',
				blog_id: 1
			}]);

		// contact
		}).then(_ => {
			return models.Contact.bulkCreate([{
				name: '피모씨',
				email: 'test@test.com',
				contents: '졸려요',
				blog_id: 1
			}, {
				name: '김모씨',
				email: 'test2@test.com',
				contents: '저도 졸려요',
				blog_id: 1
			}]);
		
		// file
		}).then(_ => {
			return models.File.bulkCreate([{
				name: 'image1.jpg',
				path: '/files/image1.jpg',
				type: 'image/jpg',
				blog_id: 1
			}, {
				name: 'image2.jpg',
				path: '/files/image2.jpg',
				type: 'image/jpg',
				blog_id: 1
			}]);

		// post
		}).then(_ => {
			return Promise.all([

				// post 1
				models.Post.create({
					title: 'post1',
					contents: 'post1 contents',
					category_id: 1,
					blog_id: 1,
					created_at: new Date(new Date() - 1000*60*60*24*30)
				}).then(post => {

					// post 1 comments and files and tags
					return Promise.all([
						models.Comment.bulkCreate([{
							blog_id: 1,
							post_id: post.id,
							name: '피모씨',
							email: 'test@test.com',
							contents: '댓글요',
						}, {
							blog_id: 1,
							post_id: post.id,
							name: '김모씨',
							email: 'test2@test.com',
							contents: '댓글2요',
						}, {
							blog_id: 1,
							post_id: post.id,
							comment_id: 1,
							name: '김모씨',
							email: 'test2@test.com',
							contents: '1번 댓글에 대댓글요',
						}]),
						post.setFiles([1,2]),
						post.setTags([1,2])
					]);
				}),

				// post 2
				models.Post.create({
					title: 'post2',
					contents: 'post2 contents',
					category_id: 2,
					blog_id: 1
				}).then(post => {

					// post 2 comments and files and tags
					return Promise.all([
						models.Comment.bulkCreate([{
							blog_id: 1,
							post_id: post.id,
							name: '피2모씨',
							email: 'test@test.com',
							contents: '댓2글요',
						}, {
							blog_id: 1,
							post_id: post.id,
							name: '김2모씨',
							email: 'test2@test.com',
							contents: '댓2글2요',
						}, {
							blog_id: 1,
							post_id: post.id,
							comment_id: 5,
							name: '김2모씨',
							email: 'test2@test.com',
							contents: '2번 댓글에 대댓글요',
						}]),
						post.setFiles([2]),
						post.setTags([3]),
					]);
				}),

				// post 3
				models.Post.create({
					title: 'post3 (about post)',
					contents: 'post3 contents',
					category_id: null,
					blog_id: 1
				}),

				// blog logo file and about post
				blog.setLogoFile(2),
				blog.setAboutPost(3)
			]);
		}).then(_ => {

			console.log("===DUMMY DATA POPULATED===\nReboot the server without DROP enviroment vairable");
		});
	});

}

module.exports = models;