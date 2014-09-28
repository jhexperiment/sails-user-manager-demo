Mast.define('AdminRoleModalContent', function() {
  return {
    stateClasses: {
      'active': 'label-success',
      'disabled': 'label-disabled'
    },
    
    events: {
      'blur input[name=name]': 'changedAttribute',
      'click button.save': 'createRole'
    },
    
    changedAttribute: function(e) {
      
      if ( ! this.role) {
        throw new Error('Componenet::AdminRoleModalContent - Missing role.')
        return;
      }
      
      // grab input
      var $input = $(e.target);
      var attribute = e.target.name;
      var data = {};
      // prep update data package
      data[attribute] = $input.val();
      
      // try to update role
      var component = this;
      io.socket.put(
        "/role/" + this.role.id, 
        data, 
        function(role, jwres) {
          if (jwres.body && jwres.body.error) {
            // TODO: handle error updating role
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
      
      this.listenForRoleChanges();
		},
		
		listenForRoleChanges: function() {
		  var component = this;
		  
		  if ( ! this.role ) {
		    throw new Error('Component AdminRoleModalContent::listenForRoleChanges - missing role.');
		  }
		  
		  if ( ! this.role.permissions || this.role.permissions.length === 0 ) {
		    return;
		  }
		  
		  io.socket.on('role', function(message) {
        var roleId = component.role.id;
			  if (
			    message 
			    && message.data 
			    && message.id === roleId // current role being edited
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