Mast.define('AdminUserScreen', function() {
  return {
    
    beforeRender: function(next) {
      // assign screen content 
      this.model = new Mast.models.WidgetPanel({
        size: 'col-md-12',
        content: 'AdminUserList',
        data: {
          title: 'Users',
          content: 'AdminUserModalContent',
          modalData: {
            title: 'User'
          }
        }
      });
    
      next();
    },
    afterRender: function() {
      // render screen content
      this.regions.AdminUserScreen.attach('WidgetPanel');
    },
  }; 
});