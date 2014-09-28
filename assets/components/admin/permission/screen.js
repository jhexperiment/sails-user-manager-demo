Mast.define('AdminPermissionScreen', function() {
  return {
    
    beforeRender: function(next) {
      // assign screen content 
      this.model = new Mast.models.WidgetPanel({
        size: 'col-md-12',
        content: 'AdminPermissionList',
        data: {
          title: 'Permissions',
          content: 'AdminPermissionModalContent',
          modalData: {
            title: 'Permission'
          }
        }
      });
    
      next();
    },
    afterRender: function() {
      // render screen content
      this.regions.AdminPermissionScreen.attach('WidgetPanel');
    },
  }; 
});