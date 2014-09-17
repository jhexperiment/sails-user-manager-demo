Mast.define('AdminUserList', function() {
  return {
    
    '#admin/user/create': function() {
      // render create/edit modal conent
      Mast.regions.ModalContent.attach('AdminUserModalContent', {
        modal: {},
        user: {}
      });
      // render create/edit modal footer
      Mast.regions.ModalFooter.attach('AdminUserModalFooter', {
        modal: {},
        user: {}
      });
      
      // display modal
      var $modal = this.$el.find("region[data-id=AdminUserModal] div.modal");
      this.displayModal($modal);
    },
    '#admin/user/edit/:id': function(id) {
      var component = this;
      component.user = id;
      
      // grab user
      io.socket.get("/user/" + id, function(user, jwres) {
        
        if (jwres.body && jwres.body.error) {
          // TODO: handle error getting user
          console.log(jwres.body);
          return;
        }
        
        // render create/edit modal content
        Mast.regions.ModalContent.attach('AdminUserModalContent', {
          user: user, 
        });
        // render create/edit modal footer
        Mast.regions.ModalFooter.attach('AdminUserModalFooter', {
          user: user, 
        });
        
        // display modal
        var $modal = component.$el.find("region[data-id=AdminUserModal] div.modal");
        component.displayModal($modal);
      });
      
    },
    
    events: {
      'click button.save': 'createUser',
      'click ul.pagination li:not(.disabled)': 'paginate',
      'click ul.pagination li.prev:not(.disabled)': 'prevPage',
      'click ul.pagination li.next:not(.disabled)': 'nextPage',
    },
    
    displayModal: function($modal) {
      $modal.modal();
      $modal.on("hide.bs.modal", function() {
        // remove jquery modal object but leave html
        $(this).data('bs.modal', null);
        // navigate site state to user listing page
        Mast.history.navigate("#admin/user");
      });  
    },
    prevPage: function(e) {
      // find active li
      var $li = $(e.currentTarget).parent().find("li.active");
      // determine current page number
      var page = parseInt($li[0].dataset.page);
      // load previous page
      page -= 1;
      if (page < 1) {
        page = 1;
      }
      this.loadPage(page);
      // activate previous li
      $li.removeClass("active");
      $li.prev().addClass("active");
      
    },
    nextPage: function(e) {
      // find active li
      var $li = $(e.currentTarget).parent().find("li.active");
      // determine current page number
      var page = parseInt($li[0].dataset.page);
      // load next page
      page += 1;
      this.loadPage(page);
      // activate next li
      $li.removeClass("active");
      $li.next().addClass("active");
      
    },
    loadPage: function(page) {
      var limit = 10;
      var skip = (page - 1) * limit;
      var component = this;
      
      this.parentRegion.$el.addClass("loading");
      
      // grab page of users
      io.socket.get(
        "/user", 
        { 
          populate: false,
          skip: skip,
          limit: limit,
          sort: 'lastName ASC'
        }, 
        function(users, jwres) {
          if (jwres.body && jwres.body.error) {
            // TODO: handle error getting users
            console.log(jwres.body);
            return;
          }
          
          // set collection and render
          component.collection = new Mast.Collection(users);  
          component.renderItems();
          
        }
      );
    },
    paginate: function(e) {
      var page = parseInt(e.currentTarget.dataset.page);
      this.loadPage(page);
    },
    
    createUser: function(e) {
      // grab form
      var $form = this.$el.find("region[data-id=AdminUserModal] div.modal form");
      // validate form
      // TODO: replace jquery validation with anchor
      if ($form.valid())  {
        
        // digest form data
        var data = {};
        _.each($form.serializeArray(), function(attrib) {
          data[attrib.name] = attrib.value;
        });
        delete data['passwordConfirm'];
        
        // try to create user
        io.socket.post('/user', data, function(user, jwres) {
          
          if (jwres.body && jwres.body.error) {
            // TODO: handle error creating user
            console.log(jwres.body);
            return;
          }
          // grab selected roles
          var $roles = $form.find("region[data-id=AdminUserModalContentRolesCollection] span.label-success");
          
          _.each($roles, function($role) {
            // attempt to assign role to user
            io.socket.put('/user/' + user.id + '/assignRole/' + $role.dataset.id, function(role, jwres) {
              
              if (jwres.body && jwres.body.error) {
                // TODO: handle error assigning role
                console.log(jwres.body);
                return;
              }
              
            });
          });
          // trigger modal's hide event which should destroy the 
          // jquery modal object but leave the html behind
          $form.closest("div.modal").modal("hide");
        });
        
      }
    },
    
    beforeRender: function(next) {
      
      this.parentRegion.$el.addClass("loading");
      
      // grab users
      var component = this;
      io.socket.get(
        "/user", 
        { 
          populate: false,
          limit: 10,
          sort: 'lastName ASC'
        }, 
        function(users, jwres) {
          if (jwres.body && jwres.body.error) {
            // TODO: handle error getting users
            console.log(jwres.body);
            return;
          }
          
          
          component.collection = new Mast.Collection(users);  
          next();
        }
      );
    },
    afterRender: function() {
      // render rows
      this.renderItems();
			
			// render create/edit modal
			this.regions.AdminUserListEditModal.attach('AdminUserModal');
			
			var component = this;
			// grab user count
			io.socket.get('/user/count', function(data, jwres) {
			  if (jwres.body && jwres.body.error) {
          // TODO: handle error getting user count
          console.log(jwres.body);
          return;
        }
                      
			  // render paginator
			  component.regions.AdminUserListPaginator.attach('WidgetPaginator', {
			    skip: 0,
			    limit: 10,
			    total: data.count
			  });
			});
			
			// listen for user changes
			var component = this;
			io.socket.on('user', function(message) {
			  if ( message && message.data ) {
			    switch(message.verb) {
			  
			      case 'created': // user created  
			        // render newly created user into list
			        component.collection.add(
			          [ message.data ], 
			          {
  			          itemTemplate: 'AdminUserListItem',
  				        intoRegion: this.TableBody
			          }
		          );
			        break;
			    }
			  }
			});
		},
		renderItems: function() {
		  this.parentRegion.$el.removeClass("loading");
		  
      // render list items
      this.renderCollection(this.collection, {  
				itemTemplate: 'AdminUserListItem',
				intoRegion: this.TableBody
			});
			
		}
  }; 
});