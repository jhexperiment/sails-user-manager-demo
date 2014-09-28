/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
  /**
   * `UserController.login()`
   */
  login: function (req, res) {
    // attempt login
    return res.login({
      username: req.param('username'),
      email: req.param('email'),
      password: req.param('password'),
      successRedirect: '/',
      invalidRedirect: '/login'
    });
  },


  /**
   * `UserController.logout()`
   */
  logout: function (req, res) {
    
    User.findOne({ id: req.session.me }, function(err, user) {
      if (err) {
        // TODO: better error handling
        console.log(err);
        return;
      }
      // update user as offline
      user.online = false;
      user.save(function(err, user) {
        // broadcast change
        // TODO: better publish message syntax
        User.publishUpdate(user.id, {
            loggedIn: false,
            id: user.id,
            action: ' has logged out'
        });
      });
    });
    
    // "Forget" the user from the session.
    // Subsequent requests from this user agent will NOT have `req.session.me`.
    req.session.me = null;
    
    // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
    // send a simple response letting the user agent know they were logged out
    // successfully.
    if (req.wantsJSON) {
      return res.ok('Logged out successfully!');
    }

    // Otherwise if this is an HTML-wanting browser, do a redirect.
    return res.redirect('/');
  },


  /**
   * `UserController.signup()`
   */
  signup: function (req, res) {
    // Attempt to signup a user using the provided parameters
    User.signup({
      givenName: req.param('givenName'),
      middleName: req.param('middleName'),
      lastName: req.param('lastName'),
      username: req.param('username'),
      email: req.param('email'),
      password: req.param('password')
    }, function (err, user) {
      // res.negotiate() will determine if this is a validation error
      // or some kind of unexpected server error, then call `res.badRequest()`
      // or `res.serverError()` accordingly.
      if (err) {
        return res.negotiate(err);
      }

      // Go ahead and log this user in as well.
      // We do this by "remembering" the user in the session.
      // Subsequent requests from this user agent will have `req.session.me` set.
      req.session.me = user.id;

      // If this is not an HTML-wanting browser, e.g. AJAX/sockets/cURL/etc.,
      // send a 200 response letting the user agent know the signup was successful.
      if (req.wantsJSON) {
        return res.ok('Signup successful!');
      }

      // Otherwise if this is an HTML-wanting browser, redirect to /welcome.
      return res.redirect('/welcome');
    });
  },
  
  
  whoami: function(req, res) {
    if ( ! req.session || ! req.session.me ) {
      return res.forbidden('You are not permitted to perform this action.');
    }
    // grab current user
    User.findOneById(req.session.me, function(err, user) {
      res.json(user);
    });
  },
  count: function(req, res) {
    var options = req.params.all();
    // grab user count
    User.count(options, function(err, num) {
      res.json({
        err: err, 
        count: num
      });
    });
  },
  
  assignRole: function(req, res) {
    var userId = req.param('userId');
    var roleId = req.param('roleId');
    if ( ! userId ) {
      throw new Error('UserController::assignRole - Missing user id.');
    }
    if ( ! roleId ) {
      throw new Error('UserController::assignRole - Missing role id.');
    }
    
    // grab user
    User.findOneById(userId, {}, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }
      
      // grab role
      Role.findOneById(roleId, {}, function(err, role) {
        if (err) {
          return res.negotiate(err);
        }
        
        // assing role to user
        User.assignRole(user, role, function() {
          res.json({ msg: 'Role assigned.'});
        });
      });
      
    });
    
    
    
  },
	removeRole: function(req, res) {
	  var userId = req.param('userId');
    var roleId = req.param('roleId');
    if ( ! userId ) {
      throw new Error('UserController::removeRole - Missing user id.');
    }
    if ( ! roleId ) {
      throw new Error('UserController::removeRole - Missing role id.');
    }
    //grab user
	  User.findOneById(userId, {}, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }
      // grab role
      Role.findOneById(roleId, {}, function(err, role) {
        if (err) {
          return res.negotiate(err);
        }
        // remove role from user
        User.removeRole(user, role, function() {
          res.json({ msg: 'Role removed.'});
        });
        
      });
      
    });
    
    
    
  },
	
	assignPermission: function(req, res) {
    var userId = req.param('userId');
    var permissionId = req.param('permissionId');
    if ( ! userId ) {
      throw new Error('UserController::assignPermission - Missing user id.');
    }
    if ( ! permissionId ) {
      throw new Error('UserController::assignPermission - Missing permission id.');
    }
    
    // grab user
    User.findOneById(userId, {}, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }
      
      // grab permission
      Permission.findOneById(permissionId, {}, function(err, permission) {
        if (err) {
          return res.negotiate(err);
        }
        
        // assing role to user
        User.assignPermission(user, permission, function() {
          res.json({ msg: 'Permission assigned.'});
        });
      });
      
    });
  },
	removePermission: function(req, res) {
	  var userId = req.param('userId');
    var permissionId = req.param('permissionId');
    if ( ! userId ) {
      throw new Error('UserController::removePermission - Missing user id.');
    }
    if ( ! permissionId ) {
      throw new Error('UserController::removePermission - Missing permission id.');
    }
    //grab user
	  User.findOneById(userId, {}, function(err, user) {
      if (err) {
        return res.negotiate(err);
      }
      // grab permission
      Permission.findOneById(permissionId, {}, function(err, permission) {
        if (err) {
          return res.negotiate(err);
        }
        // remove permission from user
        User.removePermission(user, permission, function() {
          res.json({ msg: 'Permission removed.'});
        });
        
      });
      
    });
  },
	
	
	getIepStudents: function(req, res) {
	  User.findWithRoles(['Student', 'IEP Member'], function(users) {
	    res.json(users);
	  });
	  
	 
  }
  
};

