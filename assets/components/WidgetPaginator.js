Mast.define('WidgetPaginator', function() {
  return {
    
    events: {
      'click li:not(.next):not(.prev):not(.disabled)': 'paginate'
    },
    paginate: function(e) {
      var $li = $(e.currentTarget);
      var $ul = $li.closest("ul.pagination");
      var $next = $ul.find("li.next");
      var $prev = $ul.find("li.prev");
      
      // activate this page
      $ul.find("li.active").removeClass('active');
      $li.addClass("active");
      // TODO: find better way to determine last page that
      // is in sync with backend data. io.socket.get() seems too laggy
      var curPage = parseInt(e.currentTarget.dataset.page);
      var lastPage = parseInt($next.prev()[0].dataset.page);
      
      if (curPage === 1) {
        $prev.addClass("disabled");
      }
      else {
        $prev.removeClass("disabled");
      }
      
      if (curPage === lastPage) {
        $next.addClass("disabled");
      }
      else {
        $next.removeClass("disabled");
      }
      
      
      
    },
    beforeRender: function(next) {
      next();
    },
    afterRender: function() {
      
     
		},
  }; 
});