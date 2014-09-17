Mast.define('AdminUserModalContentRoles', function() {
  return {
    
    events: {
      'click span.label:not(.label-primary)': 'toggleRole',
      'click span.load-rest-button': 'showAllRoles',
    },
    
    toggleRole: function(e) {
      // grab role label
      var $label = $(e.target);
      var roleId = $label.attr("data-id");
      var component = this;
      
      if ($label.hasClass(this.stateClasses.active)) {
        // active role label
        $label.removeClass(component.stateClasses.active);
        
        if ( this.userId ) {
          // remove role from user
          this.updateUserRole(this.userId, roleId, 'delete');  
        }
        
      }
      else {
        // active role label
        $label.addClass(this.stateClasses.active);
        
        if ( this.userId ) {
          // add role to user
          this.updateUserRole(this.userId, roleId, 'put');
        }
      }
      
    },
    updateUserRole: function(userId, roleId, action) {
      if ( ! userId ) {
        throw new Error('Component AdminUserModalContentRoles::updateUserRole - Missing user id.')
      }
      if ( ! roleId ) {
        throw new Error('Component AdminUserModalContentRoles::updateUserRole - Missing role id.')
      }
      if ( ! action ) {
        throw new Error('Component AdminUserModalContentRoles::updateUserRole - Missing action type.')
      }
      
      switch (action) {
        // remove role
        case 'delete': 
          io.socket.delete(
            "/user/" + userId + "/removeRole/" + roleId, 
            function(user, jwres) {
              if (jwres.body && jwres.body.error) {
                // TODO: handle error delete user role
                console.log(jwres.body);
                return;
              }
            }
          );
          break;
        // assign role
        case 'put': 
          io.socket.put(
            "/user/" + userId + "/assignRole/" + roleId, 
            function(user, jwres) {
              if (jwres.body && jwres.body.error) {
                // TODO: handle error assigning user role
                console.log(jwres.body);
                return;
              }
            }
          );
          break;
      }
      
    },
    
    showAllRoles: function(e) {
      // grab roles
      var component = this;
      io.socket.get("/role", { populate: true }, function(roles, jwres) {
        if (jwres.body && jwres.body.error) {
          // TODO: handle error getting roles
          console.log(jwres.body);
          return;
        }
        
        // remove 'rest' button
        var loadRestButtonComponent = _.filter(
          component.AdminUserModalContentRolesCollection._children, 
          function(obj) {
            return obj.classes 
              && (obj.classes.indexOf("load-rest-button") !== -1);
          }
        );
        if (loadRestButtonComponent.length > 0) {
          loadRestButtonComponent = loadRestButtonComponent.pop();
          loadRestButtonComponent.remove();
        }
        
        // get existing roles
        var oldRoles = component.collection;
        oldRoles = oldRoles.map(function(role) {
          return role.attributes.name;
        });
        
        // sort new roles by name
        // TODO: sort including existing rows 
        roles = _.sortBy(roles, function(role) {
      		return role.name;
      	});
      
        // render roles
        _.each(roles, function(role) {
          if (oldRoles.indexOf(role.name) === -1) {
            // render role label if it doesn't already exist
            component
              .AdminUserModalContentRolesCollection
              .append(
                'WidgetLabel', 
                {
                  id: role.id,
                  name: role.name,
                  classes: 'new',
                  closeButton: false
                }
              );
          }
        });
      });
    },
    
    renderRole: function(model) {
      if ( ! model ) {
        throw new Error('Componenet AdminUserModalContentRolesCollection::renderRole - Missing model.');
      }
      if ( ! model.id ) {
        throw new Error('Componenet AdminUserModalContentRolesCollection::renderRole - Missing model id.');
      }
      if ( ! model.name ) {
        throw new Error('Componenet AdminUserModalContentRolesCollection::renderRole - Missing model name.');
      }
      if ( ! this.stateClasses ) {
        throw new Error('Componenet AdminUserModalContentRolesCollection::renderRole - Missing state classes.');
      }
      // TODO: move this.stateClasses to global
      
      // render role by adding it to the collectoin
      this.collection.add(new Mast.models.WidgetLabel({
        id: model.id,
		    name: model.name,
		    classes: this.stateClasses.active,
		    closeButton: false
      }));
      
    },
    addRoleHighlight: function(model) {
      if ( ! model ) {
        throw new Error('Componenet AdminUserModalContentRolesCollection::addRoleHighlight - Missing model.');
      }
      if ( ! model.id ) {
        throw new Error('Componenet AdminUserModalContentRolesCollection::addRoleHighlight - Missing model id.');
      }
      if ( ! this.stateClasses ) {
        throw new Error('Componenet AdminUserModalContentRolesCollection::addRoleHighlight - Missing state classes.');
      }
      
      // get role label
      var $label = Mast.regions
                    .AdminUserModalContentRoles
                    .$el.find("span.label[data-id=" + model.id + "]");
                          
      if ( ! _.isEmpty($label) ) {
        // activate role label if it exists
        $label.addClass(this.stateClasses.active);
      }
      else {
        // render new role label if it doesn't exist
        this.renderRole(model);
      }
    },
    removeRoleHighlight: function(model) {
      // grab role label
      var $label = this.$outlet.find("span.label[data-id=" + model.id + "]");
      
      // remove active status
      if ( ! _.isEmpty($label) ) {
        $label.removeClass(this.stateClasses.active);
      }
      
    },
    
    beforeRender: function(next) {
      next();
    },
    afterRender: function() {
      if ( ! this.collection ) {
        throw new Error('Componenet AdminUserModalContentRolesCollection::afterRender - Missing collection.');
      }
      
      // render role labels
      this.renderCollection(this.collection, {
				itemTemplate: 'WidgetLabel',
				intoRegion: this.AdminUserModalContentRolesCollection
			});
      
			if (this.userId) {
			  // render 'reset' button
				this.AdminUserModalContentRolesCollection.append(
  			  'WidgetLabel', 
  			  {
  			    name: 'Rest &gt;',
  			    classes: 'label-primary load-rest-button pull-right',
  			    closeButton: false
          }
        );
			}
      else {
        // render all roles for new users
        this.showAllRoles();  
      }
      
      this.listenForUserChanges();
      
		},
		listenForUserChanges: function() {
		  var component = this;
      io.socket.on('user', function(message) {
        var userId = component.id;
			  if (
			    message 
			    && message.data 
			    && message.data.role // has role change
			    && message.data.role.verb
			    && message.id === userId // current user
		    ) {
			    if ( _.isEmpty(message.data.role.id) ) {
			      throw new Error('Componenet AdminUserModalContentRolesCollection::listenForUserChanges - Missing role id.');
			    }
			    
			    switch (message.data.role.verb) {
			      // new role assigned to user
			      case 'assigned':
			        component.addRoleHighlight(message.data.role);
			        break;
		        // role removed from user
		        case 'removed':
		          component.removeRoleHighlight(message.data.role);
		          break;
			    }
			  }
			});
		},
		
  }; 
});