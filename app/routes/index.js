'use strict';

var path = process.cwd();
var StockHandler = require(path + '/app/controllers/stockHandler.server.js');

module.exports = function(app, passport) {


	var stockHandler = new StockHandler();


	app.route('/')
		.get(function(req, res) {
			res.sendFile(path + '/public/index.html');
		});


	app.route('/favicon.ico')
		.get(function(req, res) {
			res.sendFile(path + '/public/img/favicon.ico');
		});

	app.route('/api/:haveVersion')
		.get(stockHandler.getCharts);


	app.route('/api/symbols/:id')
		.get(stockHandler.getSymbols);


	app.route('/api/symbols/:id')
		.post(stockHandler.addSymbol)
		.delete(stockHandler.deleteSymbol)


};
