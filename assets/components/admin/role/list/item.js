Mast.define('AdminRoleListItem', function() {
  return {
    
    beforeRender: function(next) {
    	if ( ! this.model ) {
    		throw new Error('Componenet::AdminRoleListItem - missing role model');
    	}
    	
    	if ( ! this.model.attributes ) {
    		throw new Error('Componenet::AdminRoleListItem - role model missing attributes');
    	}
    	
      next();
      
    },
    afterRender: function() {
    	
			this.listenForRoleChanges();
		},
		listenForRoleChanges: function() {
			var component = this;
      
      // start listener
      io.socket.on('role', function(message) {
      	
      	// role id of role model bound to this list item
			  var roleId = component.model.attributes.id;
			  // look for messages about this role model
			  if (
			    message 
			    && message.data 
			    && message.id === roleId
		    ) {
					switch (message.verb) {
						case 'updated': 
							component.updateAttribute(message.data);
							break;
					}
			  }
			});
		},
		updateAttribute: function(role) {
			var component = this;
			_.each(role, function(value, attribute) {
	    	component.model.set(attribute, value);
	    });	
	    
	    // update table cell with new data
	    this.$el.find("td.name").text(role.name);
		}
  }; 
});