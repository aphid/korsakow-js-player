module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
        },
        watch: {
		    scripts: {
			    files: ['main/src/**/*.*', 'tests-unit/src/**/*.*'],
			    tasks: ['concat'],
			    options: {
				    interrupt: true,
			    },
		    },
    	},
	});

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
  
    // Default task(s).
    grunt.registerTask('default', ['concat']);

};