'use strict';

var path = process.cwd();

var https = require("https");
var fs = require("fs");

var api_key = 'WxGtcDyCmp4UyzTSm36-';
var api_url = 'https://www.quandl.com/api/v3/';


function StockHandler() {

	function dateToString(d){
		return (d.toISOString().split('T'))[0];
	}


	var symbols = [];

	

	function loadSymbols() {
		var csv = fs.readFileSync(path + '/app/data/codes.csv', 'utf8');
		var s = csv.split('\n');
		s.forEach(function(r) {
			var a = r.split('#');

			var code = a[0],
				name = a[1];

			var i = code.charCodeAt(0);
			var sa = symbols[i];
			if (!sa) {
				sa = {};
				symbols[i] = sa;
			}
			sa[code] = name;

		})
	}
	loadSymbols();


	var currentSymbols = [];
	var charts = {};
	var chartsDate = 0;


	this.getSymbols = function(req, res) {

		var id = req.params.id.toUpperCase();
		var i = id.charCodeAt(0);

		var ret = {};
		var a = symbols[i];
		var count = 0;

		for (var k in a) {
			if (k.indexOf(id) === 0) {
				ret[k] = a[k];
				count++;
			}
			if (count >= 10)
				break;
		}
		res.json(ret);
	}



	this.addSymbol = function(req, res) {
		chartsDataVersion++;
		var id = req.params.id.toUpperCase();
		if (currentSymbols.indexOf(id) < 0) {
			currentSymbols.push(id);
			if(currentSymbols.length > 8){
				currentSymbols.shift();
			}
		}
		res.end();
	}
	this.deleteSymbol = function(req, res) {
		chartsDataVersion++;
		var id = req.params.id.toUpperCase();
		var i = currentSymbols.indexOf(id)
		if (i >= 0) {
			currentSymbols.splice(i, 1);
		}
		res.end();
	}
	
	
	var chartsDataVersion = 0;
	
	
	this.getCharts = function(req, res) {
		
		if(chartsDataVersion == req.params.haveVersion){
			res.end('not-modified');
			return;
		}
		
		if (chartsDate < new Date().getTime()) {
			//charts out of date
			chartsDataVersion++;
			charts = {};
			chartsDate = new Date().getTime() + 1000 * 60 * 60 * 24; //one day
		}

		var requestsCount = 0;

		var ret = [];

		currentSymbols.forEach(function(s) {

			if (!charts.hasOwnProperty(s)) {
				requestsCount++;

				var start = new Date();
				start.setFullYear(start.getFullYear() - 1);
				var end = new Date();

				var url = api_url + 'datasets/WIKI/' + s + '.json?order=asc&exclude_column_names=true&column_index=4&start_date=' + dateToString(start) + '&end_date=' +dateToString(end) + '&api_key=' + api_key;
				//2015-06-09
				//2015-12-09


				https.get(url, function(r) {

					var data = '';

					r.on('data', function(d) {
						data += d;
					});

					r.on('end', function() {
						
						data = JSON.parse(data).dataset;
						
						var chart = {};
						
						var i = s.charCodeAt(0);
						var sa = symbols[i];
						
						chart.name = sa[s];
						chart.code = s;
						
						var vals = {};
						
						data.data.forEach(function(a){
							vals[a[0]] = a[1];
						})
						
						chart.vals=vals;
						
						charts[s] = chart;
						ret.push(chart);

						requestsCount--;
						if (requestsCount < 1) {
							res.json({'v':chartsDataVersion, 'data':ret});
						}
					})

				}).on('error', function(e) {
					requestsCount--;
					if (requestsCount < 1) {
						res.json({'v':chartsDataVersion, 'data':ret});
					}
				});





			}
			else {
				ret.push(charts[s]);
			}


		});

		if (requestsCount < 1) {
			res.json({'v':chartsDataVersion, 'data':ret});
		}


	}

}

module.exports = StockHandler;
