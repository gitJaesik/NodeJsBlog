const path = require('path');
// config.json에서 object객체를 가져온 후 port번호 사용 및 db 연결 시 사용
const config = require(path.join(__dirname, 'config'));
const express = require('express');
// fileUpload를 위한 모듈 사용
var fileUpload = require('express-fileupload');
const app = express();

/** configuration **/
// ejs엔진을 사용하고, view의 파일을 views 폴더에 위치하도록 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.app = config.app;

/** middlewares **/
app.use(require('serve-favicon')(path.join(__dirname, config.app.favicon)));
app.use(express.static(path.join(__dirname, 'public')));
app.use([
		require('morgan')('dev'),
		require('express-session')({secret: config['session-secret'], resave: true, saveUninitialized: true}),
		fileUpload(),
	]);

/** utils **/
app.locals.util = {
	date_format: (date, format) => {
		return require('date_format')(new Date(date), format);
	},
	nl2br: require('nl2br')
};

/** routers **/
app.use((req,res,next) => {
	res.locals.req = {
		user: req.session.user || null,
		url: req.protocol+'://'+req.hostname+req.originalUrl,
		nav: req.path.split('/')[1],
		path: req.path,
		query: req.query
	};

	// 이 시점에 보통 query 불러오는 것이 끝난다.
	// models에 대한 require가 한번만 수행되기 때문에 해당 데이타 더 이상 오버헤드가 일어나지 않는다.
	// res.locals.blog = models.blogPlain;
	// DB 정보가 바뀌었을 시 반영 안됨

	next();
});
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