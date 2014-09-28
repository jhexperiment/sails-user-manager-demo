Mast.define('AdminUserModalContentPermissions', function() {
  return {
    
    events: {
      'click span.label:not(.label-primary)': 'togglePermission',
      'click span.load-rest-button': 'showAllPermissions',
    },
    
    togglePermission: function(e) {
      // grab permission label
      var $label = $(e.target);
      var permissionId = $label.attr("data-id");
      var component = this;
      
      if ($label.hasClass(this.stateClasses.active)) {
        // active permission label
        $label.removeClass(component.stateClasses.active);
        
        if ( this.userId ) {
          // remove permission from user
          this.updateUserPermission(this.userId, permissionId, 'delete');  
        }
        
      }
      else {
        // active permission label
        $label.addClass(this.stateClasses.active);
        
        if ( this.userId ) {
          // add permission to user
          this.updateUserPermission(this.userId, permissionId, 'put');
        }
      }
      
    },
    updateUserPermission: function(userId, permissionId, action) {
      if ( ! userId ) {
        throw new Error('Component AdminUserModalContentPermissions::updateUserPermission - Missing user id.')
      }
      if ( ! permissionId ) {
        throw new Error('Component AdminUserModalContentPermissions::updateUserPermission - Missing permission id.')
      }
      if ( ! action ) {
        throw new Error('Component AdminUserModalContentPermissions::updateUserPermission - Missing action type.')
      }
      
      switch (action) {
        // remove permission
        case 'delete': 
          io.socket.delete(
            "/user/" + userId + "/removePermission/" + permissionId, 
            function(user, jwres) {
              if (jwres.body && jwres.body.error) {
                // TODO: handle error delete user permission
                console.log(jwres.body);
                return;
              }
            }
          );
          break;
        // assign permission
        case 'put': 
          io.socket.put(
            "/user/" + userId + "/assignPermission/" + permissionId, 
            function(user, jwres) {
              if (jwres.body && jwres.body.error) {
                // TODO: handle error assigning user permission
                console.log(jwres.body);
                return;
              }
            }
          );
          break;
      }
      
    },
    
    showAllPermissions: function(e) {
      
      // remove 'rest' button
      var loadRestButtonComponent = _.filter(
        this.AdminUserModalContentPermissionsCollection._children, 
        function(obj) {
          return obj.classes 
            && (obj.classes.indexOf("load-rest-button") !== -1);
        }
      );
      if (loadRestButtonComponent.length > 0) {
        loadRestButtonComponent = loadRestButtonComponent.pop();
        loadRestButtonComponent.remove();
      }
      
      if (e) {
        var $h3 = $(e.target).closest("h3.permissions");
        $h3.addClass('loading');
      }
      
      // grab permissions
      var component = this;
      io.socket.get("/permission", { populate: true }, function(permissions, jwres) {
        if (jwres.body && jwres.body.error) {
          // TODO: handle error getting permissions
          console.log(jwres.body);
          return;
        }
        
        
        
        // get existing permissions
        var oldPermissions = component.collection;
        oldPermissions = oldPermissions.map(function(permission) {
          return permission.attributes.name;
        });
        
        // sort new permissions by name
        // TODO: sort including existing rows 
        permissions = _.sortBy(permissions, function(permission) {
      		return permission.name;
      	});
        
        if (e) {
          $h3.removeClass('loading');
        }
        
        // render permissions
        _.each(permissions, function(permission) {
          if (oldPermissions.indexOf(permission.name) === -1) {
            // render permission label if it doesn't already exist
            component
              .AdminUserModalContentPermissionsCollection
              .append(
                'WidgetLabel', 
                {
                  id: permission.id,
                  name: permission.name,
                  classes: 'new',
                  closeButton: false
                }
              );
          }
        });
      });
    },
    
    renderPermission: function(model) {
      if ( ! model ) {
        throw new Error('Componenet AdminUserModalContentPermissionsCollection::renderPermission - Missing model.');
      }
      if ( ! model.id ) {
        throw new Error('Componenet AdminUserModalContentPermissionsCollection::renderPermission - Missing model id.');
      }
      if ( ! model.name ) {
        throw new Error('Componenet AdminUserModalContentPermissionsCollection::renderPermission - Missing model name.');
      }
      if ( ! this.stateClasses ) {
        throw new Error('Componenet AdminUserModalContentPermissionsCollection::renderPermission - Missing state classes.');
      }
      // TODO: move this.stateClasses to global
      
      // render permission by adding it to the collectoin
      this.collection.add(new Mast.models.WidgetLabel({
        id: model.id,
		    name: model.name,
		    classes: this.stateClasses.active,
		    closeButton: false
      }));
      
    },
    addPermissionHighlight: function(model) {
      if ( ! model ) {
        throw new Error('Componenet AdminUserModalContentPermissionsCollection::addPermissionHighlight - Missing model.');
      }
      if ( ! model.id ) {
        throw new Error('Componenet AdminUserModalContentPermissionsCollection::addPermissionHighlight - Missing model id.');
      }
      if ( ! this.stateClasses ) {
        throw new Error('Componenet AdminUserModalContentPermissionsCollection::addPermissionHighlight - Missing state classes.');
      }
      
      // get permission label
      var $label = Mast.regions
                    .AdminUserModalContentPermissions
                    .$el.find("span.label[data-id=" + model.id + "]");
                          
      if ( ! _.isEmpty($label) ) {
        // activate permission label if it exists
        $label.addClass(this.stateClasses.active);
      }
      else {
        // render new permission label if it doesn't exist
        this.renderPermission(model);
      }
    },
    removePermissionHighlight: function(model) {
      // grab permission label
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
        throw new Error('Componenet AdminUserModalContentPermissionsCollection::afterRender - Missing collection.');
      }
      
      // render permission labels
      this.renderCollection(this.collection, {
				itemTemplate: 'WidgetLabel',
				intoRegion: this.AdminUserModalContentPermissionsCollection
			});
      
			if (this.userId) {
			  // render 'reset' button
				this.AdminUserModalContentPermissionsCollection.append(
  			  'WidgetLabel', 
  			  {
  			    name: 'Rest &gt;',
  			    classes: 'label-primary load-rest-button pull-right',
  			    closeButton: false
          }
        );
			}
      else {
        // render all permissions for new users
        this.showAllPermissions();  
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
			    && message.data.permission // has permission change
			    && message.data.permission.verb
			    && message.id === userId // current user
		    ) {
			    if ( _.isEmpty(message.data.permission.id) ) {
			      throw new Error('Componenet AdminUserModalContentPermissionsCollection::listenForUserChanges - Missing permission id.');
			    }
			    
			    switch (message.data.permission.verb) {
			      // new permission assigned to user
			      case 'assigned':
			        component.addPermissionHighlight(message.data.permission);
			        break;
		        // permission removed from user
		        case 'removed':
		          component.removePermissionHighlight(message.data.permission);
		          break;
			    }
			  }
			});
		},
		
  }; 
});