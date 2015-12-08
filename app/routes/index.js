'use strict';

var path = process.cwd();
var PlaceHandler = require(path + '/app/controllers/placeHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var placeHandler = new PlaceHandler();


	app.route('/')
		.get( function (req, res) {
			req.session.currentPoll = false;
			res.sendFile(path + '/public/index.html');
		});
		
	app.route('/afterLoginData')
		.get(function (req, res) {
			if(req.isAuthenticated()){
				if(req.session.afterLoginRequest) {
					res.json(req.session.afterLoginRequest);
					delete(req.session.afterLoginRequest.placeId)
					req.session.save();
				} else {
					res.end();
				}
				
			} else {
				res.end();
			}
		});

	app.route('/login')
		.get(function (req, res) {
			if(Object.keys(req.query).length > 0)
			{
				req.session.afterLoginRequest = req.query;
			}
			
			res.sendFile(path + '/public/login.html');
		});
		
	app.route('/favicon.ico')
		.get(function (req, res) {
			res.sendFile(path + '/public/img/favicon.ico');
		});
		
		
		

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));
		
	app.get('/auth/google',
	  passport.authenticate('google', { scope: 'https://www.googleapis.com/auth/plus.login' }));
	
	app.get('/auth/google/callback', 
	  passport.authenticate('google', {
	  	failureRedirect: '/login' }),
	  function(req, res) {
	    res.redirect('/');
	  });
	  
	app.get('/auth/twitter',
	  passport.authenticate('twitter'));
	
	app.get('/auth/twitter/callback', 
	  passport.authenticate('twitter', { failureRedirect: '/login' }),
	  function(req, res) {
	    res.redirect('/');
	  });



	app.route('/api/place')
		.get(placeHandler.getPlaces)
		.post(placeHandler.postPlace)
	

};
