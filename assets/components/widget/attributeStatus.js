Mast.define('WidgetAttributeStatus', function() {
  return {
    
    
    beforeRender: function(next) {
      
      var component = this;
      component.parentRegion.$el.addClass("loading");
      
      io.socket.get("/user/count", function(resData, jwres) {
        if ( _.isEmpty(resData) ) {
          throw new Error('Component::WidgetAttributeStatus - no data returned.');
          next();
        }
        if ( resData.err ) {
          throw new Error(err);
          next(err);
        }
        if ( ! _.isNumber(resData.count) ) {
          throw new Error('Component::WidgetAttributeStatus - count empty.');
          next(err);
        }
        
        component.model.attributes.data.count = resData.count;
        
        next();
      });
      
      
      
    },
    afterRender: function() {
      var component = this;
      component.parentRegion.$el.removeClass("loading");
      
      io.socket.on('user', function(message) {
        switch (message.verb) {
          case 'created': {
            component.afterUserCreated();  
          }
        }
      });
      
		},
		afterUserCreated: function() {
		  var $count = this.$el.find("div.count");
		  var count = parseInt($count.text());
		  $count.text(count + 1);
		}
  }; 
});