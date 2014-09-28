Mast.define('WidgetPanel', function() {
  return {
    
    events: {
      
    },
    beforeRender: function(next) {
      next();
    },
    afterRender: function() {
      
      if ( _.isEmpty(this.model) ) {
        throw new Error ("Component::WidgetPanel - Model empty.");
      }
      if ( _.isEmpty(this.model.attributes.content) ) {
        throw new Error ("Component::WidgetPanel - Content not defined.");
      }
      
      // render panel content
      // TODO: find better way to render these components
      this.regions.PanelContent.attach(this.model.attributes.content);
      
		},
  }; 
});