module.exports = function(grunt) {

	grunt.initConfig({

		// Import package manifest
		pkg: grunt.file.readJSON("boilerplate.jquery.json"),

		// Banner definitions
		meta: {
			banner:""
		},

		// Concat definitions
		concat: {
			dist: {
				src: ["src/jquery.ytapi3.js"],
				dest: "demo/dist/jquery.ytapi3.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		// Lint definitions
		jshint: {
			files: ["src/jquery.ytapi3.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		// Minify definitions
		uglify: {
			my_target: {
				src: ["demo/dist/jquery.ytapi3.js"],
				dest: "demo/dist/jquery.ytapi3.min.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		// CoffeeScript compilation
		coffee: {
			compile: {
				files: {
					"demo/dist/jquery.ytapi3.js": "src/jquery.ytapi3.coffee"
				}
			}
		},
		
		sass: {
      options: {
        includePaths: ['demo/css/scss/foundation']
      },
      dev: {
        files: {
          'demo/css/main.css': 'demo/css/scss/main.scss',
          'demo/css/ytapi3.css': 'demo/css/scss/main.scss'
        }        
      },
      dist: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          'demo/css/main.min.css': 'demo/css/scss/main.scss',
          'demo/css/ytapi3.min.css': 'demo/css/scss/main.scss',
          'demo/css/foundation.min.css': 'demo/css/scss/foundation.scss'
        }        
      }
    },
		
		watch: {
      grunt: { files: ["Gruntfile.js"] },
      jshint: {
        files: ["src/jquery.ytapi3.js"],
        tasks: ["jshint"]
      },
      concat: {
        files: ["src/jquery.ytapi3.js"],
        tasks: ["concat"]
      },
      uglify: {
        files: ["demo/dist/jquery.ytapi3.js"],
        tasks: ["uglify"]
      },
      sass: {
        files: ['demo/css/scss/*.scss','demo/css/scss/*/*.scss'],
        tasks: ['sass']
      }
    }
	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-coffee");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks('grunt-sass');

	grunt.registerTask("default", ["jshint", "concat", "uglify", "sass", "watch"]);
	grunt.registerTask("travis", ["jshint"]);

};
