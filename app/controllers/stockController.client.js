'use strict';




(function() {

      var chartsDataVersion = 'na';
      var chartsData;
      var googleChartsLoaded;
      var chart;
      
      function onGoogleChartsLoaded () {
         googleChartsLoaded = true;
         buildGoogleCharts();
      }
      
      function dateToString(d){
   		return (d.toISOString().split('T'))[0];
   	}
      
      google.load('visualization', '1', {packages: ['corechart', 'line']});
      google.setOnLoadCallback(onGoogleChartsLoaded);

     
      

      function buildGoogleCharts() {
      
      
         if(!googleChartsLoaded)
            return;
         if(!chartsData)
            return;
         
         
         if(chartsData.length === 0){
            if(chart){
               chart.clearChart();
            }
            return;
         }
         

         var data = new google.visualization.DataTable();
         data.addColumn('string', 'X');
         
         
        
         
         chartsData.forEach(function(c){
           data.addColumn('number', c.code+' ('+c.name+')');
           c.lastVal = 0.0;
         })
         
         var rows = [];

         var curTime = new Date().getTime();
         
         
         
         
         for(var h = 365; h--; h>=0)
         {
            var date = dateToString(new Date(curTime - h*1000*60*60*24));
            var r = [date];
               
               chartsData.forEach(function(c){

                  var v = c.vals[date];
                  if(!v) {
                     v = c.lastVal;
                  }
                  c.lastVal = v;
                  r.push(v);
               })
               
               rows.push(r);

         }
            
            
            
         data.addRows(rows);

         
         
         var options = {
            'width':'100%',
            'height':600,
            hAxis: {
               textPosition: 'none',
               title: 'Date',
               logScale: true
            },
            vAxis: {
               title: 'Value',
               logScale: false
            }
         };

         chart = new google.visualization.LineChart(document.getElementById('chart_div'));
         chart.draw(data, options);


      }









   angular.module('megabyte.fcc-charts')

   .controller('StockController', function($http, $interval) {

      var controller = this;


      controller.newName = '';

      controller.findedStocks = [];
      controller.addEnabled = false;
      controller.newNameChanged = function() {
         if (controller.newName) {

            controller.newName = controller.newName.toUpperCase();

            $http.get('api/symbols/' + controller.newName).then(function(res) {

               controller.addEnabled = false;
               var ret = [];
               for (var k in res.data) {

                  ret.push({
                     code: k,
                     name: res.data[k]
                  });

                  if (k === controller.newName) {
                     controller.addEnabled = true;
                     checkIfAlreadyAdded();
                  }
               }

               controller.findedStocks = ret;

            });
         }
         else {
            controller.findedStocks = [];
            controller.addEnabled = false;
         }


      }
      
      
      function checkIfAlreadyAdded(){
         
         chartsData.forEach(function(c){
            if(c.code === controller.newName){
               controller.addEnabled = false;
               return;
            }
         })
      }
      
      controller.clickFinded = function(f) {
         controller.newName = f.code;
         controller.findedStocks = [];
         controller.addEnabled = true;
         checkIfAlreadyAdded();
         $('input').focus();
      }
      
      var renewDelay =0;
      
      $interval(function(){
         renewDelay++;
         if(renewDelay > 10){
            renewCharts();
         }
      },1000)
      
      
      function renewCharts() {
         renewDelay = 0;
         $http.get('api/'+chartsDataVersion).then(function(res) {
            if(res.data == "not-modified"){
               return;
            }
            
            chartsDataVersion = res.data.v;
            chartsData = res.data.data;
            controller.chartsData = chartsData;
            
            buildGoogleCharts();
         });

      }


      controller.addClick = function() {
         if(controller.addEnabled) {
            $http.post('api/symbols/' + controller.newName).then(function() {
               controller.newName = '';
               renewCharts();
            });
         }
      }
      
      controller.removeClick = function(chart){
         $http.delete('api/symbols/' + chart.code).then(function() {
            renewCharts();
         });
      }

      renewCharts();



   });


})();
