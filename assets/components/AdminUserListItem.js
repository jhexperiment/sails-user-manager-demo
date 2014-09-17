Mast.define('AdminUserListItem', function() {
  return {
    
    beforeRender: function(next) {
    	if ( ! this.model ) {
    		throw new Error('Componenet::AdminUserListItem - missing user model');
    	}
    	
    	if ( ! this.model.attributes ) {
    		throw new Error('Componenet::AdminUserListItem - user model missing attributes');
    	}
    	
    	// have roles
    	if (this.model.attributes.roles.length) {
    		// sort roles by name
	    	this.model.attributes.roles = _.sortBy(this.model.attributes.roles, function(role) {
	    		return role.name;
	    	});
	    	this.model.attributes.roles = new Mast.Collection(this.model.attributes.roles);  
    	}
    	
      next();
      
    },
    afterRender: function() {
    	// have roles
    	if (this.model.attributes.roles.length) {
    		// render roles as badges
	      this.renderCollection(this.model.attributes.roles, {
					itemTemplate: 'WidgetBadge',
					intoRegion: this.regions.AdminUserListItemRoles
				});
    	}
			
			this.listenForUserChanges();
		},
		listenForUserChanges: function() {
			var component = this;
      
      // start listener
      io.socket.on('user', function(message) {
      	
      	// user id of user model bound to this list item
			  var userId = component.model.attributes.id;
			  // look for messages about this user model
			  if (
			    message 
			    && message.data 
			    && message.id === userId
		    ) {
			    
			    
			    if ( // Role changes
			    	message.data.role 
			    	&& message.data.role.verb
			    ) {
			    	if ( _.isEmpty(message.data.role.id) ) {
				      throw new Error('Componenet::AdminUserListItem - Missing role id.');
				    }
				    
				  	switch (message.data.role.verb) {
				      case 'assigned':
				        component.assignRole(message.data.role);
				        break;
			        case 'removed':
			          component.removeRole(message.data.role);
				        break;
				    } 	
			    }
			    else { // Attribute changes
			    	switch (message.verb) {
			    		case 'updated': 
		    				component.updateAttribute(message.data);
			    			break;
			    	}
				    
			    }
			    
			  }
			});
		},
		updateAttribute: function(user) {
			var component = this;
			_.each(user, function(value, attribute) {
	    	component.model.set(attribute, value);
	    });	
	    
	    // set full name
	    // TODO: update to use User model brought in from sails that has the
	    // fullName() function
	    if (user.givenName || user.middleName || user.lastName) {
	    	var name = [];
	      if ( ! _.isEmpty(this.model.attributes.givenName) ) {
	        name.push(this.model.attributes.givenName);
	      }
	      if ( ! _.isEmpty(this.model.attributes.middleName) ) {
	        name.push(this.model.attributes.middleName);
	      }
	      if ( ! _.isEmpty(this.model.attributes.lastName) ) {
	        name.push(this.model.attributes.lastName);
	      }
	      name = name.join(' ');
		    this.model.set('fullName', name);
		    
		    // update table cell with new data
		    this.$el.find("td.name").text(name);
	    }
		},
		assignRole: function(role) {
			// render new role badge
		  this.regions.AdminUserListItemRoles.append('WidgetBadge', role);
		},
		removeRole: function(role) {
			// remove role badge
		  this.$el.find("span.badge[data-id=" + role.id + "]").remove();
		}
  }; 
});