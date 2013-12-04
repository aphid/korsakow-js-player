module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('grunt_package.json'),
        concat: {
        	player: {
        		src: [
        		      'main/src/lib/*.js',
        		      'main/src/org/korsakow/player/Main.js',
        		      'main/src/org/**/*.js'],
        		dest: 'dist/korsakow_player.js'
        	},
        	tests: {
        		src: ['tests-unit/src/**/*.js'],
        		dest: 'dist/tests-unit.js'
        	}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
  
    // Default task(s).
    grunt.registerTask('default', ['concat']);

};