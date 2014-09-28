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
    '#admin/user/create': function() {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminUserScreen');
    },
    '#admin/user/edit/:id': function(id) {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminUserScreen');
    },
    '#admin/user/edit': function() {
    	window.location.hash = '#admin/user';
    },
    '#admin/user/delete': function() {
      window.location.hash = '#admin/user';
    },
    '#admin/user/delete/:id': function() {
      window.location.hash = '#admin/user';
    },
    
    '#admin/role': function() {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminRoleScreen');
    },
    '#admin/role/create': function() {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminRoleScreen');
    },
    '#admin/role/edit/:id': function(id) {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminRoleScreen');
    },
    '#admin/role/edit': function() {
    	window.location.hash = '#admin/role';
    },
    '#admin/role/delete': function() {
      window.location.hash = '#admin/role';
    },
    '#admin/role/delete/:id': function() {
      window.location.hash = '#admin/role';
    },
    
    '#admin/permission': function() {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminPermissionScreen');
    },
    '#admin/permission/create': function() {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminPermissionScreen');
    },
    '#admin/permission/edit/:id': function(id) {
      this.activateNav("li#page-nav-admin");
      this.loadPageTemplate('AdminPermissionScreen');
    },
    '#admin/permission/edit': function() {
    	window.location.hash = '#admin/permission';
    },
    '#admin/permission/delete': function() {
      window.location.hash = '#admin/permission';
    },
    '#admin/permission/delete/:id': function() {
      window.location.hash = '#admin/permission';
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
				      url: '#admin/role',
				      name: 'Role Manager',
				    },
				    {
				      url: '#admin/permission',
				      name: 'Permission Manager',
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
			console.log("trying to load " + template);
			
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


