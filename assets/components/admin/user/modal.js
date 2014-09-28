Mast.define('AdminUserModal', function() {
  return {
    beforeRender: function(next) {
      
      next();
    },
    afterRender: function() {
      
      
      this.regions.AdminUserModal.attach("WidgetModal");
		},
  }; 
});