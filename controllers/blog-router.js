const models = require('../models');
const express = require('express');
var router = express.Router();

router.use((req,res,next) => {
	// find blog 1
	models.Blog.findOne({
		include: [
			models.Blog.associations.aboutPost,
			models.Blog.associations.logoFile
		]
	}).then(blog => {
		res.blog = blog;
		res.locals.blog = blog.get({plain:true});
		next();
	});
});

router.get('/', (req,res) => {
	let block = 1,
	page = parseInt(req.query.page);
	page = (isNaN(page) || page < 1) ? 1: page;

	categoryQuery = parseInt(req.query.category);
	if (isNaN(categoryQuery) == true) {
		categoryQuery = 0;
	}

	Promise.all([
		res.blog.getPosts({
			where : {
				category_id : categoryQuery
			},
			include: [
				models.Category,
				{
					model: models.File,
					where: {
						type: {
							$like: 'image/%'
						}
					}
				}
			],
			offset: (page-1)*block,
			limit: block,
			order: [['id','desc']]
		}),
		
		res.blog.countPosts(),

		res.blog.getPosts({
			attributes : ['id', 'title'],
			order : [['id', 'asc']],
			limit : 4
		}),

		res.blog.getComments({
			attributes : ['id', 'contents', 'post_id'],
			order : [['id', 'asc']],
			limit : 4
		}),

		models.seq.query(`SELECT COUNT(*) AS count, categories.name AS name, categories.id AS id FROM categories 
			JOIN posts ON posts.category_id=categories.id WHERE posts.blog_id=${res.blog.id} GROUP BY categories.id`),

		models.seq.query(`SELECT COUNT(*) AS count, DATE_FORMAT(created_at, '%Y-%m') AS created_at FROM posts
			WHERE blog_id=${res.blog.id}
			GROUP BY created_at
			ORDER BY created_at DESC`)

		// res.blog.getCategories({
		// 	attributes : ['id','name'],
		// 	order : [['id', 'desc']]
		// }),

		// res.blog.getPosts({
		// 	include : [
		// 	models.comments
		// 	]
		// })
	
	]).then(result => {

		let posts = result[0], count = result[1], recentPosts = result[2];
		let recentComments = result[3];
		let categories = result[4][0];
		let archives = result[5][0];
		console.log(categories);

		// let categoryCnt = categories.filter(x=> return x.id==categoryQuery);
		let categoryCnt = categories.filter(x=> return x.id==categoryQuery)[0].count;
		let totalCnt = (isNaN(categoryQuery) ? cnt : categoryCnt);
		console.log(categories);

		categories.allCount = count;
		categories.noneCount = count - categories.map(cate=>cate.count).reduce((c1,c2)=>c1+c2);

		// console.log(archives);
		// console.log(result[5]);

		posts.page = {
			entryTotal: count,
			total: Math.floor(totalCnt/block) + (totalCnt%block==0 ? 0 : 1),
			current: page,
			recentPosts : recentPosts,
			recentComments : recentComments,
			archives : archives,
			categories : categories
		};

		res.render('blog/home', {
			posts: posts
		});
	}).catch(err=> {
		console.log(err);
	});
});

router.get('/about', (req,res) => {
	res.render('blog/about');
});

router.get('/contact', (req,res) => {
	res.render('blog/contact');
});

router.get('/photos', (req,res) => {
	res.render('blog/photos');
});

router.get('/archives', (req,res) => {
	res.render('blog/archives');
});

module.exports = router;