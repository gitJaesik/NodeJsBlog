const models = require('../models');
const express = require('express');
const bodyParser = require('body-parser');
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
	let block = 6,
			page = parseInt(req.query.page),
			category = parseInt(req.query.category);

	page = (isNaN(page) || page < 1) ? 1: page;

	// posts where
	let postsWhere = {};
	if (!isNaN(category)) {
		postsWhere.category_id = {$eq: ((category == 0) ? null : category)};
	} else {
		category = "all";
	}

	Promise.all([
		// posts
		res.blog.getPosts({
			where: postsWhere,
			include: [
				{
					model: models.Category,
					required: false
				},
				{
					model: models.File,
					where: {
						type: {
							$like: 'image/%'
						}
					},
					required: false
				}
			],
			offset: (page-1)*block,
			limit: block,
			order: [['id','desc']]
		}),
		
		// posts count with paging
		res.blog.countPosts({where: postsWhere}),

		// posts count
		res.blog.countPosts(),

		// recent posts
		res.blog.getPosts({
			attributes: ['id', 'title'],
			limit: 4,
			order: [['id','desc']]
		}),

		// recent comments
		res.blog.getComments({
			attributes: ['id', 'post_id', 'contents', 'name'],
			limit: 4,
			order: [['id','desc']]
		}),

		// categories
		models.seq.query(`
			select count(*) as count, categories.id, categories.name
			from categories join posts on posts.category_id = categories.id
			where posts.blog_id = ${res.blog.id}
			group by categories.id
			order by categories.name asc`),

		// archives
		models.seq.query(`
			select count(*) as count, DATE_FORMAT(created_at, '%Y-%m') as date
			from posts
			where posts.blog_id = ${res.blog.id}
			group by date
			order by date desc`)

	]).then(result => {

		// posts data
		let posts = result[0], count = result[1];
		posts.page = {
			entryTotal: count,
			total: Math.floor(count/block) + (count%block==0 ? 0 : 1),
			current: page
		};
		posts.category = category;

		// sidebar data
		let postTotalCount = result[2],
				recentPosts = result[3],
				recentComments = result[4],
				categories = result[5][0],
				archives = result[6][0];

		// calculate category counts
		categories.allCount = postTotalCount;
		categories.noneCount = postTotalCount - categories.map(cate => cate.count).reduce((c1,c2) => c1+c2);

		res.render('blog/home', {
			posts: posts,
			recentPosts: recentPosts,
			recentComments: recentComments,
			categories: categories,
			archives: archives
		});
	});
});


// write를 쓰러 가는 곳
router.get('/write', (req,res) => {
	res.render('blog/write');
});

// write에서 db로 파일을 보낼 때 사용하는 곳
router.post('/write', bodyParser.urlencoded(), (req,res) => {

	console.log(req.body);

	Promise.all([
		res.blog.getCategories({
			where : {
				name : req.body.category
			}
		}),
		res.blog.countCategories(),
		res.blog.countPosts()
	]).then( result => {
		var hasCategories = result[0];

		var write_category_id;
		if (hasCategories.length == 0) {
			write_category_id = result[1];
		}else {
			write_category_id = hasCategories.id;
		}

		var data = {
				title: req.body.title,
				contents: req.body.contents,
				category_id: write_category_id,
				blog_id: 1,
				created_at: new Date(new Date() - 1000*60*60*24*30)
		}
		models.Post.create(
					data
		).then(post => {
			res.render('blog/');
		});
	});
	
});

router.post('/upload', function(req,res) {
	var sampleFile;

	if (!req.files) {
		res.send('No files were uploaded');
		return;
	}

	sampleFile = req.files.sampleFile;
	sampleFile.mv('../public/files/sample.jpg', function(err) {
		if (err) {
			res.status(500).send(err);
		}
		else {
			res.send('File uploaded!');
		}
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

router.get('/like/:post_id', (req,res) => {

	res.blog.getPosts({
		where: {
			id: req.params.post_id
		}
	}).then(posts => {

		if (posts.length == 0) {
			res.status(404).end();
		} else {
			var post = posts[0];

			// increment like
			var updated = false;
			if (!req.session.like) req.session.like = [];
			if (req.session.like.indexOf(post.id) == -1){
				req.session.like.push(post.id);
				post.increment('like');
				post.like++;
				updated = true;
			}

			res.json({like: post.like, updated: updated});
		}
	});

});


router.post('/comment/:post_id', bodyParser.urlencoded(), (req,res) => {

	res.blog.getPosts({
		where: {
			id: req.params.post_id
		}
	}).then(posts => {

		if (posts.length == 0) {
			res.status(404).end();
		} else {
			var post = posts[0];
			var data = {
				post_id: post.id,
				comment_id: req.body.comment_id || null,
				name: req.body.name,
				contents: req.body.contents,
				email: req.body.email
			};

			models.Comment.create(data).then(comment => {

				res.json(comment.get({plain:true}));
			});
		}
	});

});

router.get('/:id', (req,res) => {
	res.blog.getPosts({
		where: {
			id: req.params.id
		},
		include: [
			models.File, models.Tag, models.Category,
			{
				model: models.Comment,
				include: [{
					model: models.Comment,
					as: 'childComment'
				}]
			}]
	}).then(posts => {
		if (posts.length == 0) {
			res.status(404).render('blog/error', {
				status: 404
			});
		} else {
			var post = posts[0];

			// increment hit
			if (!req.session.hit) req.session.hit = [];
			// 대표 이미지 찾기
			// indexOf는 글자 위치 찾는것, 매치가 안되면 -1을 리턴한다.
			if (req.session.hit.indexOf(post.id) == -1){
				req.session.hit.push(post.id);
				post.increment('hit');
				post.hit++;
			}

			// image
			var images = post.files.filter(file => {
				return file.type.indexOf('image/') != -1;
			});
			post.image = (images.length > 0) ? images[0] : null;

			res.render('blog/post', {
				post: post
			});	
		}
	});
});

module.exports = router;