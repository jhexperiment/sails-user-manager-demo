module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'jst:dev',
		'sails-to-mast-model:dev',
		'less:dev',
		'copy:dev',
		'coffee:dev'
	]);
};
