'use strict';

var Going = require('../models/going.js');

var oauthSignature = require("oauth-signature");
var https = require("https");
var querystring = require("querystring");


function PlaceHandler () {
	
	
	
	
	this.getPlaces = function (req, res) {
	


          var httpMethod = 'GET',
        	url = 'https://api.yelp.com/v2/search',
        	parameters = {
        		oauth_consumer_key : 'VWEdIlTCQu37QtT4MIOFgg',
        		oauth_token : 'r_Otr07VZ3XJYocFxuIW_YS9xRnFwm5b',
        		oauth_nonce : Math.random()*999999+''+Math.random()*999999,
        		oauth_timestamp : Math.floor(new Date().getTime()/1000),
        		oauth_signature_method : 'HMAC-SHA1',
        		oauth_version : '1.0',
        		limit : 10,
        		category_filter:'nightlife',
        		radius_filter : 10000,
                term : 'food',
                sort:2,
                location : req.query.placeName
                },
        	consumerSecret = 'BX3UZWUg68BlAyy0BqcOd3nGrxM',
        	tokenSecret = '-6RyDk818Q4Mium3QqgCZoFq_9E';

			parameters.oauth_signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, tokenSecret,{ encodeSignature: false});
           
           
           
           var options = {
			  hostname: 'api.yelp.com',
			  port: 443,
			  path: '/v2/search?'+querystring.stringify(parameters),
			  method: 'GET'
			};
			
			var reqs = https.request(options, function(r) {
				
			  var data = '';
				
			  r.on('data', function(d) {
			    data += d;
			  });
			  r.on('end', function() {
			  	
			  	data = JSON.parse(data);
			  	var businesses = [];
			  	
			  	if(data.businesses && data.businesses.length) {
			  		
			  		var callsCount = 0;
			  		
				  	data.businesses.forEach(function(b){
				  		
				  		var bs = {
				  			'id':b.id,
				  			'snippet_text':b.snippet_text,
				  			'image_url':b.image_url,
				  			'name':b.name,
				  			'rating_img_url':b.rating_img_url,
				  			'url':b.url,
				  			'adr':b.location.address[0],
				  			'going':0
				  		};
				  		
				  		Going.count({'placeId':b.id}, function( err, count){
				  			if(!err){
						    	bs.going = count;
				  			};
						    callsCount++;
						    if(callsCount>=data.businesses.length)
						    {
						    	res.json(businesses);
						    }
						});

				  		businesses.push(bs);
				  		
				  	});
			  	} else {
			  		
			  		res.end();
			  		
			  	}
			    
			  });
			  
			  
			});
			
			
			reqs.end();
			
			reqs.on('error', function(e) {
			  throw e;
			});
	}
	
	this.postPlace = function(req, res) {
		
		var placeId = req.body.id;
		
		Going.find({'placeId':placeId}).
		  select({ userId: 1}).
		  exec(function(err, goings){
		  	if(err)	{
		  		res.end(err)
		  	} else {
		  		
		  		var g = goings.find(function(e){
		  			return (e.userId === req.user.id)
		  		});
		  		
		  		if(g){
		  			//already going
		  			
		  			g.remove();
		  			res.json(goings.length-1);
		  		} else {
		  			//added as going
		  			
		  			g = new Going();
		  			g.placeId = placeId;
		  			g.userId = req.user.id;
		  			g.save();
		  			res.json(goings.length+1);
		  		}
		  	}
		  });
	}

}

module.exports = PlaceHandler;
