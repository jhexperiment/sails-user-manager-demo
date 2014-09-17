/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = {

  attributes: {
    displayName: {
      type: 'string'  
    },
    givenName: {
      type: 'string'  
    },
    middleName: {
      type: 'string'  
    },
    lastName: {
      type: 'string'  
    },
    
    
    username: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
      email: true,
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      minLength: 6,
      required: true,
      columnName: 'encryptedPassword'
    },
    roles: {
      collection: 'role',
      via: 'users'
    },
    permissions: {
      collection: 'permission',
      via: 'users'
    },
    
    online: {
      type: 'boolean'
    },
    
    fullName: function() {
      var name = [];
      if ( ! _.isEmpty(this.givenName) ) {
        name.push(this.givenName);
      }
      if ( ! _.isEmpty(this.middleName) ) {
        name.push(this.middleName);
      }
      if ( ! _.isEmpty(this.lastName) ) {
        name.push(this.lastName);
      }
      
      return name.join(" ");
    },
    
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      
      obj.fullName = this.fullName();
      
      return obj;
    },
  },
  
  
  
  assignRole: function(user, role, next) {
    if ( ! user ) {
      throw new Error('Model::User::assignRole - Missing user.');
    }
    if ( ! role ) {
      throw new Error('Model::User::assignRole - Missing role.');
    }
    
    user.roles.add(role.id);
    user.save(function(err, user) {
      User.publishUpdate(user.id, {
        role: {
          id: role.id,
          name: role.name,
          verb: 'assigned'
        }
      });
    });
    
    return;
  },
  removeRole: function(user, role, next) {
    if ( ! user ) {
      throw new Error('Model::User::removeRole - Missing user.');
    }
    if ( ! role ) {
      throw new Error('Model::User::removeRole - Missing role.');
    }
    
    user.roles.remove(role.id);
    user.save(function(err, user) {
      User.publishUpdate(user.id, {
        role: {
          id: role.id,
          verb: 'removed'
        }
      });
    });
    
    return;
  },
    
  beforeCreate: function(attrs, next) {
    if ( ! attrs ) {
      throw new Error('Model::User::beforeCreate - Missing attributes.');
    }
    
    
    var bcrypt = require('bcrypt');
    if ( ! bcrypt ) {
      throw new Error('Model::User::beforeCreate - Missing bcrypt.');
    }
    
    // encrypt password
    bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);

      bcrypt.hash(attrs.password, salt, function(err, hash) {
        if (err) return next(err);

        attrs.password = hash;
        next();
      });
    });
  },

  
  signup: function (inputs, cb) {
    if ( ! inputs ) {
      throw new Error('Model::User::signup - Missing inputs.');
    }
    
    // Create a user
    User.create({
      givenName: inputs.givenName,
      middleName: inputs.middleName,
      lastName: inputs.lastName,
      username: inputs.username,
      email: inputs.email,
      password: inputs.password
    })
    .exec(cb);
  },
  attemptLogin: function (inputs, next) {
    if ( ! inputs ) {
      throw new Error('Model::User::attemptLogin - Missing inputs.');
    }
    
    // grab user by either username or email
    User
      .findOne({
        or : [
            { 'username' : inputs.username },
            { 'email' : inputs.username }
          ]
      })
      .exec(function(err, user) {
        if(err) return next(err);
        
        if ( ! user ) {
          next(new Error('Missing user.'));
          return;
        }
        
        var bcrypt = require('bcrypt');
        if ( ! bcrypt ) {
          throw new Error('Model::User::attemptLogin - Missing bcrypt.');
        }
        
        // test password
        bcrypt.compare(inputs.password, user.password, function(err, valid) {
          if (err) return next(err);
          
          if ( ! valid ) {
            return;
          }
          
          next(err, user);
        });
      });
      
    
    
  },
  findByRole: function(role, next) {
    if ( ! role ) {
      throw new Error('Model::User::findByRole - Missing role.');
    }
    
    // grab users having role
    User
      .find()
      .populate('roles', { name: role })
      .exec(function(err, users) {
        next(users);
  	  });
  },
  findWithRoles: function(roles, next) {
    if ( ! _.isArray(roles) ) {
      throw new Error('User::findWithRoles - roles must be an array.');
    }
    
    if ( roles.length === 0 ) {
      throw new Error('User::findWithRoles - roles must not be empty.');
    }
    
    // grab users having all roles
    User
      .find()
      .populate('roles', { name: roles })
      .exec(function(err, users) {
        
        // filter users that have all roles
        var filteredUsers = _.filter(users, function(user) {
          
          var hasAllRoles = true;
          var i, l, role;
          for (i = 0, l = roles.length; i < l; i++) {
            role = roles[i];
            
            hasAllRoles = 
              hasAllRoles && (_.where(user.roles, { name : role }).length === 1);
            
            if ( ! hasAllRoles ) {
              break;  
            }
          }
          
          return hasAllRoles;
        });
        
        next(filteredUsers);
  	  });
  }
};

