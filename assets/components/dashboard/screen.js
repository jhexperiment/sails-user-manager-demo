Mast.define('DashboardScreen', function() {
  return {
    beforeRender: function(next) {
      
      this.collection = new Mast.Collection([
        new Mast.models.WidgetPanel(),
        new Mast.models.WidgetPanel({
          title: 'Users',
          size: 'flex-2',
          classes: 'panel-primary',
          content: 'WidgetAttributeStatus',
          data: {
            title: 'Users:'
          }
        }),
        new Mast.models.WidgetPanel({
          title: 'Sessions',
          
        }),
        new Mast.models.WidgetPanel({
          title: 'Sessions',
          context: 'danger'
        }),
        new Mast.models.WidgetPanel({
          title: 'Staff',
        }),
        new Mast.models.WidgetPanel({
          title: 'Core Goals & Objectives',
          size: 'col-md-4',
        })
      ]);
      
      next();
    },
    afterRender: function() {
      
      this.renderCollection(this.collection, {
				itemTemplate: 'WidgetPanel',
				intoRegion: this.DashboardTopRow
			});
			
		},
  }; 
});