module.exports = function(grunt) {

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
        	player: {
        		src: [
        		      // TODO: review where order of concat matters
        		      'main/src/org/korsakow/player/Polyfill.js',
        		      'main/src/org/korsakow/player/Main.js',
        		      'main/src/org/korsakow/player/model/Model.js',
        		      'main/src/org/korsakow/player/controller/Controller.js',
        		      'main/src/org/**/*.js'],
        		dest: 'dist/lib/korsakow_player.js'
        	},
        	tests: {
        		src: ['tests-unit/src/**/*.js'],
        		dest: 'dist/tests-unit/lib/korsakow-tests-unit.js'
        	}
        },
        copy: {
        	main: {
        		files: [{
        			expand: true,
        			cwd: 'main/src',
    				src: 'lib/*',
    				dest: 'dist/'
    			}, {
        			expand: true,
        			cwd: 'main/src',
    				src: 'css/*',
    				dest: 'dist/'
    			}, {
        			expand: true,
        			cwd: 'main/src',
    				src: 'images/*',
    				dest: 'dist/'
    			}, {
        			expand: true,
        			cwd: 'main/src',
    				src: 'index.html',
    				dest: 'dist/'
    			}]
        	},
        	tests: {
        		files: [{
        			expand: true,
        			cwd: 'tests-unit',
    				src: 'lib/**/*',
    				dest: 'dist/tests-unit'
    			}, {
        			expand: true,
        			cwd: 'tests-unit',
    				src: '*.html',
    				dest: 'dist'
    			}]
        	}
        },
        watch: {
		    scripts: {
			    files: ['main/**/*', 'tests-unit/**/*'],
			    tasks: ['concat', 'copy'],
			    options: {
				    interrupt: true,
			    },
		    },
    	},
	});

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
  
    // Default task(s).
    grunt.registerTask('default', ['concat', 'copy']);

};