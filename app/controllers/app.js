


angular.module('megabyte.fcc-charts', [])


.directive('confirmationNeeded', function () {
  return {
    priority: 1,
    terminal: true,
    link: function (scope, element, attr) {
        
      var msg = attr.confirmationNeeded || "Are you sure?";
      
      var clickAction = attr.ngClick;
      element.bind('click', function(){
           $('#modal-confirm-text').html(msg);
          
           $('#confirmation-modal').modal();
           
           $('#modal-confirm-btn').unbind('click');
           $('#modal-confirm-btn').on('click', function() {
              $('#confirmation-modal').modal('hide'); 
              scope.$eval(clickAction);
          }); 
      });
    }
  };
});

