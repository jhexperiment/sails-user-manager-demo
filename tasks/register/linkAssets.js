module.exports = function (grunt) {
	grunt.registerTask('linkAssets', [
		'sails-linker:devModels',
		'sails-linker:devSailsModels',
		'sails-linker:devComponents',
		'sails-linker:devJs',
		'sails-linker:devStyles',
		'sails-linker:devTpl',
		'sails-linker:devJsJade',
		'sails-linker:devStylesJade',
		'sails-linker:devTplJade'
	]);
};
