Mast.define('AdminPermissionModal', function() {
  return {
    beforeRender: function(next) {
      
      next();
    },
    afterRender: function() {
      
      
      this.regions.AdminPermissionModal.attach("WidgetModal");
		},
  }; 
});