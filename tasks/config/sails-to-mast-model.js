'use strict';

module.exports = function(grunt) {
  // filename conversion for templates
  var defaultProcessName = function(name) {
    return name;
  };

	grunt.config.set('sails-to-mast-model', {
		dev: {

			files: {
				// e.g.
				// 'relative/path/from/gruntfile/to/compiled/template/destination'  : ['relative/path/to/sourcefiles/**/*.html']
				'.tmp/public/sails-models.js': require('../pipeline').sailsModelFilesToInject
			}
		}
	});
	

  grunt.registerMultiTask('sails-to-mast-model', 'Compile Sails.js models to Mast.js models.', function() {
    
    var lf = grunt.util.linefeed;
    var options = this.options({
      namespace: 'STMM',
      separator: lf + lf
    });
    this.files.forEach(function(f) {
      var output = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file ' + filepath + ' not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        //console.log(filepath);
        var modalName = filepath.split("/").pop().split(".").shift();
        var model = require("../../" + filepath);
        var defaults = {};
        grunt.util._.each(model.attributes, function(attrib, name) {
          //console.log(attrib);
          switch (typeof attrib) {
            case 'object':
              
              if (attrib.model || attrib.collection) {
                defaults[name] = attrib;
              }
              else {
                defaults[name] = '';
              }
              
              break;
            case 'function':
              defaults[name] = attrib.toString();
              break;
          }
        });
      
        return 'Mast.models.' + modalName + ' = Mast.Model.extend({ ' + lf +
            "  defaults:" + JSON.stringify(defaults) + lf +
          '});';
      });
      
      output.unshift('Mast.models = Mast.models || {};' + lf);
      
      if (output.length < 1) {
        grunt.log.warn('Destination not written because compiled files were empty.');
      } else {
        grunt.file.write(f.dest, output.join(grunt.util.normalizelf(options.separator)));
        grunt.log.writeln('File ' + f.dest + ' created.');
      }
    });
    
  });
};