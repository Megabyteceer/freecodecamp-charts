'use strict';




(function() {


   angular.module('megabyte.night-life')

   .controller('PlaceController', function($http, $timeout, $rootScope, $window) {

      var controller = this;
      
      controller.places =[];
      
      function collapse(){
          controller.containerClass = 'places-container-collapse';
      }
      
      function expand(){
          controller.containerClass=""
      }
      
      
      collapse();
      controller.searchChanged = function () {
        if(controller.whereYou && (controller.whereYou.length > 1)) {
            controller.showLoaderPic = true;
            $http.get('/api/place?placeName='+controller.whereYou).then(function(res) {
               controller.showLoaderPic = false;
               controller.places = res.data;
                $timeout(function(){
                    expand();
                    if(controller.clickAfterLoad) {
                        
                        controller.places.some(function(p){
                            if(p.id === controller.clickAfterLoad){
                                controller.goingClick(p);
                                return true;
                            }
                            return false;
                        });
                        
                        delete(controller.clickAfterLoad);
                    }
                }, 20);
            });
        } else {
            collapse();
        }
      }
      
      controller.goingClick = function (place) {
          if($rootScope.loggedIn) {
          
              $http.post('/api/place', {'id':place.id} ).then(function (res) {
                place.going = res.data;
              });
          } else {
             $window.location.href = ('/login?whereYou='+controller.whereYou+'&placeId='+place.id);
          }
      }
      
      $http.get('/afterLoginData').then(function(res) {
          if(res.data.whereYou) {
              controller.whereYou = res.data.whereYou;
              controller.clickAfterLoad = res.data.placeId;
              controller.searchChanged();
             }
        })

      

   });


})();
