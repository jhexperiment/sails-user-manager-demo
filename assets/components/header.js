Mast.define('Header', function() {
  return {
  	
    
    beforeRender: function(next) {
    	next();
		},
    afterRender: function() {
    	// grab user from session
    	if (sessionStorage.user) {
    		var user = JSON.parse(sessionStorage.user);
    		this.Nav.attach('Nav', {
	    		username: user.fullName
	    	});		
    	}	
    	else {
    		// grab user from api
    		var component = this;
    		io.socket.get("/whoami", function(user, jwres) {
    			if (jwres.body && jwres.body.error) {
            // TODO: handle error getting user
            console.log(jwres.body);
            return;
          }
    			// render Nav
    			component.Nav.attach('Nav', {
		    		username: user.fullName
		    	});		
		    	
		    	// save user to session
		    	sessionStorage.user = JSON.stringify(user);
    		});
    	}
		},
		
	};
}); 


