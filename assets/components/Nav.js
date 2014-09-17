Mast.define('Nav', function() {
  return {
  	currentPage: '',
    
    '#': function() {
    	this.loadPageTemplate('DashboardScreen');
    	this.$el.find("li.active").removeClass("active");
    },
    
	  // Dashboard
		'#dashboard': function() {
		  this.loadPageTemplate('DashboardScreen');
		  this.$el.find("li.active").removeClass("active");
    },
    
    // Admin
    '#admin/user': function() {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminUserScreen');
    },
    '#admin/user/edit': function() {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminUserScreen');
    },
    '#admin/user/edit/:id': function(id) {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminUserScreen');
    },
    '#admin/user/delete': function() {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminUserScreen');
    },
    '#admin/user/delete/:id': function(id) {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminUserScreen');
    },
    
    activateNav: function(navId) {
      this.$el.find("li.active").removeClass("active");
		  this.$el.find(navId).addClass("active");
    },
    
    beforeRender: function(next) {
    	// set collection of nav items
      this.collection = new Mast.Collection([
				{
				  componentId: 'page-nav-admin',
				  name: 'Admin',
				  links: new Mast.Collection([
				    {
				      url: '#admin',
				      name: 'Dashboard',
				    },
				    {
				      url: '#admin/user',
				      name: 'User Manager',
				    },
				    {
				      url: '#admin/group',
				      name: 'Group Manager',
				    }
			    ])
				}
			]);
			
			next();
		},
    afterRender: function() {
    	// render nav items
      this.renderCollection(this.collection, {
				itemTemplate: 'NavDropdown',
				intoRegion: this.Links
			});
		},
		
		loadPageTemplate: function(template) {
			// already on this page silly
			if (this.currentPage === template) {
				return;
			}
			
			if ( _.isEmpty(Mast.regions) ) {
        throw new Error ("Component::Nav - No global regions found.");
      }
      
      // render template
      Mast.regions['PageBody'].attach(template);
      this.currentPage = template;
		}
	};
}); 


