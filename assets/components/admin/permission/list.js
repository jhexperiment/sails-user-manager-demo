Mast.define('AdminPermissionList', function() {
  return {
    skip: 0,
    limit: 10,
    listCount: 10,
    sorting: {
      attrib: 'name',
      dir: 'asc'
    },
    
    '#admin/permission/create': function() {
      // render create/edit modal conent
      Mast.regions.ModalContent.attach('AdminPermissionModalContent', {
        modal: {},
        permission: {}
      });
      // render create/edit modal footer
      Mast.regions.ModalFooter.attach('AdminPermissionModalFooter', {
        modal: {},
        permission: {}
      });
      
      // display modal
      var $modal = this.$el.find("region[data-id=AdminPermissionModal] div.modal");
      this.displayModal($modal);
    },
    '#admin/permission/edit/:id': function(id) {
      var component = this;
      component.permission = id;
      
      // grab permission
      io.socket.get("/permission/" + id, function(permission, jwres) {
        
        if (jwres.body && jwres.body.error) {
          // TODO: handle error getting permission
          console.log(jwres.body);
          return;
        }
        
        // render create/edit modal content
        Mast.regions.ModalContent.attach('AdminPermissionModalContent', {
          permission: permission, 
        });
        // render create/edit modal footer
        Mast.regions.ModalFooter.attach('AdminPermissionModalFooter', {
          permission: permission, 
        });
        
        // display modal
        var $modal = component.$el.find("region[data-id=AdminPermissionModal] div.modal");
        component.displayModal($modal);
      });
      
    },
    '#admin/permission/delete/:id': function(id) {
      var component = this;
      component.permission = id;
      
      // display modal
      var $modal = this.$el.find("region[data-id=AdminPermissionListDeleteModal] div.modal");
      this.displayModal($modal);
      
    },
    
    events: {
      'click region[data-id=AdminPermissionListEditModal] button.save': 'createPermission',
      'click region[data-id=AdminPermissionListDeleteModal] button.delete': 'deletePermission',
      'click ul.pagination li:not(.disabled):not(.prev):not(.next)': 'paginate',
      'click ul.pagination li.prev:not(.disabled)': 'prevPage',
      'click ul.pagination li.next:not(.disabled)': 'nextPage',
      'change span.limit-selector select': 'changeLimit',
      'click th.sortable': 'sortTableCol',
      'click button.search': 'searchPermissions',
      'keyup input[name=search]': 'searchKeypress',
      'click span.search-container button.close': 'clearSearch'
    },
    clearSearch: function(e) {
      var $input = $(e.currentTarget).parent().find("input[name=search]");
      if ($input.val() !== '') {
        $input.val('');  
        this.loadPage(1);
        this.renderPaginator();
      }
    },
    searchKeypress: function(e) {
      if (e.keyCode === 13) {
        this.loadPage(1);
        this.renderPaginator();
      }
    },
    searchPermissions: function(e) {
      this.loadPage(1);
      this.renderPaginator();
    },
    sortTableCol: function(e) {
      var $th = $(e.currentTarget);
      var attrib = $th[0].dataset.attrib;
      if ( ! attrib ) {
        throw new Error('Component AdminPermissionList::sortTableCol - Missing attribute.');
      }
      
      this.sorting.attrib = attrib;
      
      if ($th.hasClass('asc')) {
        $th.parent().find("th.sorting").removeClass("sorting asc desc");
        $th.removeClass('asc').addClass('desc').addClass('sorting');
        this.sorting.dir = 'desc';
      }
      else {
        $th.parent().find("th.sorting").removeClass("sorting asc desc");
        $th.removeClass('desc').addClass('asc').addClass('sorting');
        this.sorting.dir = 'asc';
      }
      
      this.loadPage(1);
    },
    changeLimit: function(e) {
      this.limit = parseInt($(e.target).val());
      this.loadPage(1);
      this.renderPaginator();
    },
    displayModal: function($modal, options) {
      $modal.modal(options || {});
      $modal.on("hide.bs.modal", function() {
        // remove jquery modal object but leave html
        $(this).data('bs.modal', null);
        // navigate site state to permission listing page
        Mast.history.navigate("#admin/permission");
      });  
    },
    prevPage: function(e) {
      var $ul = $(e.currentTarget).parent();
      // find active li
      var $li = $ul.find("li.active");
      
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
      
      $ul.find("li.next").removeClass("disabled");
      
      if (page === 1) {
        $ul.find("li.prev").addClass("disabled");
      }
      else {
        $ul.find("li.prev").removeClass("disabled");
      }
      
    },
    nextPage: function(e) {
      var $ul = $(e.currentTarget).parent();
      // find active li
      var $li = $ul.find("li.active");
      
      // determine current page number
      var page = parseInt($li[0].dataset.page);
      // load next page
      page += 1;
      this.loadPage(page);
      // activate next li
      $li.removeClass("active");
      $li.next().addClass("active");
      
      $ul.find("li.prev").removeClass("disabled");
      
      var $next = $ul.find("li.next");
      var lastPage = parseInt($next.prev()[0].dataset.page);
      if (page === lastPage) {
        $next.addClass("disabled");
      }
      else {
        $next.removeClass("disabled");
      }
      
    },
    loadPage: function(page) {
      var search = this.$el.find("input[name=search]").val();
      this.skip = (page - 1) * this.limit;
      var component = this;
      var $container = this.$el.find("div.table-container");
      $container.addClass("loading");
      
      var options = { 
        populate: false,
        skip: component.skip,
        limit: component.limit,
        sort: component.sorting.attrib + ' ' + component.sorting.dir,
      }; 
      
      if (search) {
        options.where = { 
          name : { contains: search }
        };
      }
        
      // grab page of permissions
      io.socket.get(
        "/permission", 
        options,
        function(permissions, jwres) {
          if (jwres.body && jwres.body.error) {
            // TODO: handle error getting permissions
            console.log(jwres.body);
            return;
          }
          
          component.listCount = permissions.length;
          
          if (permissions.length) {
          
            // set collection and render
            component.collection = new Mast.Collection(permissions);  
            component.renderItems();
            
          }
          else {
            component.collection.reset();
            component.TableBody.attach('AdminPermissionListNoRecords');
            $container.find("th.sorting").removeClass('sorting desc asc');
          }
          
          component.updatePaginationInfo();
          $container.removeClass("loading");
        }
      );
      

    },
    updatePaginationInfo: function() {
      var $paginationInfo = this.$el.find("tr.pagination-info th");
      var text = '';
      if (this.listCount > 0) {
        text = (this.skip + 1) + ' to ' + (this.skip + this.listCount);
      }
      $paginationInfo.text( text );
    },
    paginate: function(e) {
      var page = parseInt(e.currentTarget.dataset.page);
      this.loadPage(page);
    },
    createPermission: function(e) {
      // grab form
      var $form = this.$el.find("region[data-id=AdminPermissionModal] div.modal form");
      // validate form
      // TODO: replace jquery validation with anchor
      if ($form.valid())  {
        
        // digest form data
        var data = {};
        _.each($form.serializeArray(), function(attrib) {
          data[attrib.name] = attrib.value;
        });
        
        // try to create permission
        io.socket.post('/permission', data, function(permission, jwres) {
          
          if (jwres.body && jwres.body.error) {
            // TODO: handle error creating permission
            console.log(jwres.body);
            return;
          }
          
          // trigger modal's hide event which should destroy the 
          // jquery modal object but leave the html behind
          $form.closest("div.modal").modal("hide");
        });
        
      }
    },
    deletePermission: function(e) {
      var component = this;
      var $modal = $(e.currentTarget).closest("div.modal");
      // try to delete permission
      io.socket.delete('/permission/' + this.permission, {}, function(permission, jwres) {
        
        if (jwres.body && jwres.body.error) {
          // TODO: handle error creating permission
          console.log(jwres.body);
          return;
        }
        
        // trigger modal's hide event which should destroy the 
        // jquery modal object but leave the html behind
        $modal.modal("hide");
        
        // remove permission row
        component.collection.remove(permission.id)
      });
    },
    
    beforeRender: function(next) {
      
      this.parentRegion.$el.addClass("loading");
      
      // grab permissions
      var component = this;
      io.socket.get(
        "/permission", 
        { 
          populate: false,
          limit: component.limit,
          sort: 'name ASC'
        }, 
        function(permissions, jwres) {
          if (jwres.body && jwres.body.error) {
            // TODO: handle error getting permissions
            console.log(jwres.body);
            return;
          }
          
          component.collection = new Mast.Collection(permissions);  
          next();
        }
      );
    },
    afterRender: function() {
      // render rows
      this.renderItems();
      
			// render create/edit modal
			this.regions.AdminPermissionListEditModal.attach('AdminPermissionModal');
			// render delete modal
			this.regions.AdminPermissionListDeleteModal.attach('WidgetConfirmModal', {
			  title: 'Confirm',
			  message: 'This permission will be permanently removed. Are you sure?'
			});
			
			this.renderPaginator();
			this.updatePaginationInfo();
			
			this.listenForPermissionChanges();
			
			this.checkForRoutes(window.location.hash);
		},
		
		checkForRoutes: function(route) {
		  var self = this;
		  _.each(self.subscriptions, function(handler, matchPattern) {
		    // Grab regex and param parsing logic from Backbone core
  			var extractParams = Backbone.Router.prototype._extractParameters,
  				calculateRegex = Backbone.Router.prototype._routeToRegExp;
  
  			// Trim trailing
  			matchPattern = matchPattern.replace(/\/*$/g, '');
  			// and er sort of.. leading.. slashes
  			matchPattern = matchPattern.replace(/^([#~%])\/*/g, '$1');
  			
  			// Come up with regex for this matchPattern
  			var regex = calculateRegex(matchPattern);
        // If this matchPatern is this is not a match for the event,
  			// `continue` it along to it can try the next matchPattern
  			if ( ! route.match(regex) ) return;
  			
  			// Parse parameters for use as args to the handler
  			// (or an empty list if none exist)
  			var params = extractParams(regex, route);
  
  			// Handle string redirects to function names
  			if (!_.isFunction(handler)) {
  				handler = self[handler];
  
  				if (!handler) {
  					throw new Error('Cannot trigger subscription because of unknown handler: ' + handler);
  				}
  			}
  
  			// Bind context and arguments to subscription handler
			  handler.apply(self, _.union({}, params));
		  });
		},
		renderPaginator: function() {
		  var search = this.$el.find("input[name=search]").val();
      var component = this;
      var options = {}; 
      
      if (search) {
        options.where = { 
          name : { contains: search }
        };
      }
      
			// grab permission count
			io.socket.get('/permission/count', options, function(data, jwres) {
			  if (jwres.body && jwres.body.error) {
          // TODO: handle error getting permission count
          console.log(jwres.body);
          return;
        }
                      
			  // render paginator
			  component.regions.AdminPermissionListPaginator.attach('WidgetPaginator', {
			    skip: 0,
			    limit: component.limit,
			    total: data.count
			  });
			});
		},
		listenForPermissionChanges: function() {
		  // listen for permission changes
			var component = this;
			io.socket.on('permission', function(message) {
			  if ( message ) {
			    switch(message.verb) {
			  
			      case 'created': // permission created  
			        // render newly created permission into list
			        component.collection.add(
			          [ message.data ], 
			          {
  			          itemTemplate: 'AdminPermissionListItem',
  				        intoRegion: component.TableBody
			          }
		          );
			        break;
			      
			      case 'destroyed': // permission deleted
			        // remove permission row
			        component.collection.remove(
			          [
			            {
			              id: message.id
			            }
		            ]
	            )
			        break;
			    }
			  }
			});
		},
		renderItems: function() {
		  this.parentRegion.$el.removeClass("loading");
		  
      // render list items
      this.renderCollection(this.collection, {  
				itemTemplate: 'AdminPermissionListItem',
				intoRegion: this.TableBody
			});
			
		}
  }; 
});