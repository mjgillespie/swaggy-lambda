module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		options: {

		},
		simplemocha: {
			all: {
				options:{
					timeout:5000
				},
				src: ['test/**/*.js']
			},
		},
		jshint:{
			all:['*.js','test/**/*.js']
		}
	});

	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('build', ['jshint']);
	grunt.registerTask('test', ['build','simplemocha']);
};
