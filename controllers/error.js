module.exports = (err,req,res,next)=>{
	res.status(500).render('blog/404', {
		status : 500
	});
	console.log(err);
};