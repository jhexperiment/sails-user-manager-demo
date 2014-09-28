Mast.define('AdminRoleModal', function() {
  return {
    beforeRender: function(next) {
      
      next();
    },
    afterRender: function() {
      
      
      this.regions.AdminRoleModal.attach("WidgetModal");
		},
  }; 
});