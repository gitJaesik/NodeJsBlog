const path = require('path');
const config = require(path.join(__dirname, 'config'));
const express = require('express');
const app = express();
//const models = require(path.join(__dirname, './models'));	

/** configuration **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.app = config.app;



/** middlewares **/
app.use(require(path.join(__dirname,'controllers/logger')));
app.use(express.static(path.join(__dirname,'public')));
app.use(require('serve-favicon')(path.join(__dirname, config.app.favicon)));
app.use([
	require('morgan')('dev'),
	require('express-session')({secret: config['session-secret'], resave:true, saveUninitialized: true})]);

/** routers **/
app.use((req,res,next)=> {
	res.locals.req = {
		user : req.session.user || null,
		url : req.originalUrl,
		nav : req.path.split('/')[1],
		path : req.path,
		query : req.query
	};

	
	// 이 시점에 보통 query 불러오는 것이 끝난다.
	// models에 대한 require가 한번만 수행되기 때문에 해당 데이타 더 이상 오버헤드가 일어나지 않는다.
	// res.locals.blog = models.blogPlain;
	// DB 정보가 바뀌었을 시 반영 안됨

	next();
});

/** models **/
// models.Blog.findOne().then(blog=>{
// 	app.blog = blog;
// 	app.locals.blog = blog.get({plain:text});
// });

app.use('/', require(path.join(__dirname, 'controllers/blog-router')));
app.use('/admin', require(path.join(__dirname, 'controllers/admin-router')));

/** error handlers **/
app.use([
		require(path.join(__dirname, 'controllers/not-found')),
		require(path.join(__dirname, 'controllers/error'))
	]);

/** run server **/
app.listen(config.port);
console.log('Blog server started at '+new Date());
