module.exports = (req, res, next) => {
	res.status(404).render('blog/404', {
		status : 404
	});
	// res.status(404).send('Not Found');
	// send로 종결이 되므로 next로 넘어갈 필요가 없다.
};