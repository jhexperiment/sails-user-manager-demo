Mast.define('AdminPermissionModalContent', function() {
  return {
    stateClasses: {
      'active': 'label-success',
      'disabled': 'label-disabled'
    },
    
    events: {
      'blur input[name=name]': 'changedAttribute',
      'click button.save': 'createPermission'
    },
    
    changedAttribute: function(e) {
      
      if ( ! this.permission) {
        throw new Error('Componenet::AdminPermissionModalContent - Missing permission.')
        return;
      }
      
      // grab input
      var $input = $(e.target);
      var attribute = e.target.name;
      var data = {};
      // prep update data package
      data[attribute] = $input.val();
      
      // try to update permission
      var component = this;
      io.socket.put(
        "/permission/" + this.permission.id, 
        data, 
        function(permission, jwres) {
          if (jwres.body && jwres.body.error) {
            // TODO: handle error updating permission
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
      
      this.listenForPermissionChanges();
		},
		
		listenForPermissionChanges: function() {
		  var component = this;
		  
		  if ( ! this.permission ) {
		    throw new Error('Component AdminPermissionModalContent::listenForPermissionChanges - missing permission.');
		  }
		  
		  if ( ! this.permission || this.permission.length === 0 ) {
		    return;
		  }
		  
		  io.socket.on('permission', function(message) {
        var permissionId = component.permission.id;
			  if (
			    message 
			    && message.data 
			    && message.id === permissionId // current permission being edited
			    && ! message.data.permission // ignore permission changes
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
		bindValidation: function() {
		  // validation options
      // TODO: switch from jquery validate to anchor
      var validationOptions = {
        rules: {
          name: {
            required: true
          }
          
        }
      };
      
      // bind validation
      this.$el.validate(validationOptions);
		}
  }; 
});