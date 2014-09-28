Mast.define('NavDropdown', function() {
  return {
    beforeRender: function(next) {
      
      if ( _.isEmpty(this.model) ) {
        throw new Error('Component::NavDropdown - model required.');
      }
      if ( _.isEmpty(this.model.attributes) || _.isEmpty(this.model.attributes.links) ) {
        throw new Error('Component::NavDropdown - model missing links');
      }
      if ( ! this.model.attributes.links instanceof Backbone.Collection ) {
        throw new Error('Component::NavDropdown - links attribute must be a Backbone.Collection');
      }
      
      
      this.collection = this.model.attributes.links;
      
      next();
    },
    afterRender: function() {
      // render links
      this.renderCollection(this.collection, {
				itemTemplate: 'NavLink',
				intoRegion: this.DropdownLinks
			});
		},
  }; 
});