Mast.define('AdminRoleScreen', function() {
  return {
    
    beforeRender: function(next) {
      // assign screen content 
      this.model = new Mast.models.WidgetPanel({
        size: 'col-md-12',
        content: 'AdminRoleList',
        data: {
          title: 'Roles',
          content: 'AdminRoleModalContent',
          modalData: {
            title: 'Role'
          }
        }
      });
    
      next();
    },
    afterRender: function() {
      // render screen content
      this.regions.AdminRoleScreen.attach('WidgetPanel');
    },
  }; 
});