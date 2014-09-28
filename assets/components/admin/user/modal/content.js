Mast.define('AdminUserModalContent', function() {
  return {
    stateClasses: {
      'active': 'label-success',
      'disabled': 'label-disabled'
    },
    
    events: {
      'blur input[name=givenName]': 'changedAttribute',
      'blur input[name=middleName]': 'changedAttribute',
      'blur input[name=lastName]': 'changedAttribute',
      'blur input[name=username]': 'changedAttribute',
      'blur input[name=email]': 'changedAttribute',
      'click button.save': 'createUser'
    },
    
    changedAttribute: function(e) {
      
      if ( ! this.user) {
        throw new Error('Componenet::AdminUserModalContent - Missing user.')
        return;
      }
      
      // grab input
      var $input = $(e.target);
      var attribute = e.target.name;
      var data = {};
      // prep update data package
      data[attribute] = $input.val();
      
      // try to update user
      var component = this;
      io.socket.put(
        "/user/" + this.user.id, 
        data, 
        function(user, jwres) {
          if (jwres.body && jwres.body.error) {
            // TODO: handle error updating user
            console.log(jwres.body);
            return;
          }
          
        }
      );
    },
    
    beforeRender: function(next) {
      next();
    },
    afterRender: function() {
      var component = this;
      
      this.bindValidation();
      
      // stop here if creating user
      if ( ! this.user ) {
        return; 
      }
        
      // continue on for user roles and permissions
        
      this.renderRoles();
      
      this.renderPermissions();
      
      this.listenForUserChanges();
  		
		},
		
		listenForUserChanges: function() {
		  var component = this;
		  
		  if ( ! this.user ) {
		    throw new Error('Component AdminUserModalContent::listenForUserChanges - missing user.');
		  }
		  
		  if ( ! this.user.permissions || this.user.permissions.length === 0 ) {
		    return;
		  }
		  
		  io.socket.on('user', function(message) {
        var userId = component.user.id;
			  if (
			    message 
			    && message.data 
			    && message.id === userId // current user being edited
			    && ! message.data.role // ignore role changes
		    ) {
			    
			    // Attribute changes
			    _.each(message.data, function(value, attribute) {
			      
			      // update inputs with new data
			      var $input = component.$el.find("input[name=" + attribute + "]");
			      if ( ! _.isEmpty($input) ) {
			        $input.val(value);
			      }
			      
			    });
			  }
			});
		},
		renderPermissions: function() {
		  var component = this;
		  
		  if ( ! this.user ) {
		    throw new Error('Component AdminUserModalContent::renderRoles - missing user.');
		  }
		  
		  // convert permissions to collection of label widgets
      this.user.permissions = _.map(this.user.permissions, function(permission) {
        permission.classes = component.stateClasses.active;
        return new Mast.models.WidgetLabel(permission);
      });
      this.user.permissions = new Mast.Collection(this.user.permissions);  
      
      // render permissions
      this.AdminUserModalContentPermissions
        .attach('AdminUserModalContentPermissions', {
          stateClasses: this.stateClasses,
          collection: this.user.permissions,
          userId: this.user.id
        });
			
		},
		renderRoles: function() {
		  var component = this;
		  
		  if ( ! this.user ) {
		    throw new Error('Component AdminUserModalContent::renderRoles - missing user.');
		  }
		  
		  // convert roles to collection of label widgets
      this.user.roles = _.map(this.user.roles, function(role) {
        role.classes = component.stateClasses.active;
        return new Mast.models.WidgetLabel(role);
      });
      this.user.roles = new Mast.Collection(this.user.roles);  
      
      // render roles
      this.AdminUserModalContentRoles
        .attach('AdminUserModalContentRoles', {
          stateClasses: this.stateClasses,
          collection: this.user.roles,
          userId: this.user.id
        });
		},
		bindValidation: function() {
		  // validation options
      // TODO: switch from jquery validate to anchor
      var validationOptions = {
        rules: {
          givenName: {
            required: true
          },
          lastName: {
            required: true
          },
          username: {
            required: true
          },
          email: {
            required: true,
            email: true
          }
        }
      };
      
      // Add password and confirm
      if ( ! this.user ) {
        validationOptions.rules.password = {
          minlength: 6,
          required: true
        };
        validationOptions.rules.passwordConfirm = {
          minlength: 6,
          required: true,
          equalTo: "form[data-template-id=AdminUserModalContent] input[name=password]"
        };
      }	
      
      // bind validation
      this.$el.validate(validationOptions);
		}
  }; 
});