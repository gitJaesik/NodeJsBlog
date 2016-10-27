module.exports = (req, res, next)=> {
	console.log('[REQ]' + req.originalUrl);
	next();
};
