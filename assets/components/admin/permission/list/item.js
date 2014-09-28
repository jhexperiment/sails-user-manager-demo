Mast.define('AdminPermissionListItem', function() {
  return {
    
    beforeRender: function(next) {
    	if ( ! this.model ) {
    		throw new Error('Componenet::AdminPermissionListItem - missing permission model');
    	}
    	
    	if ( ! this.model.attributes ) {
    		throw new Error('Componenet::AdminPermissionListItem - permission model missing attributes');
    	}
    	
      next();
      
    },
    afterRender: function() {
    	
			this.listenForPermissionChanges();
		},
		listenForPermissionChanges: function() {
			var component = this;
      
      // start listener
      io.socket.on('permission', function(message) {
      	
      	// permission id of permission model bound to this list item
			  var permissionId = component.model.attributes.id;
			  // look for messages about this permission model
			  if (
			    message 
			    && message.data 
			    && message.id === permissionId
		    ) {
					switch (message.verb) {
						case 'updated': 
							component.updateAttribute(message.data);
							break;
					}
			  }
			});
		},
		updateAttribute: function(permission) {
			var component = this;
			_.each(permission, function(value, attribute) {
	    	component.model.set(attribute, value);
	    });	
	    
	    // update table cell with new data
	    this.$el.find("td.name").text(permission.name);
		}
  }; 
});