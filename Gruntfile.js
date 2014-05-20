module.exports = function (grunt) {
  var browsers = [
    {
      browserName: "firefox",
      version: "19",
      platform: "XP"
    },
    {
      browserName: "googlechrome",
      platform: "XP"
    },
    {
      browserName: "googlechrome",
      platform: "linux"
    },
    {
      browserName: "internet explorer",
      platform: "WIN8",
      version: "10"
    }
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['build/temp/*.js', 'build/temp/*.css'],

    browserify: {
      vendor: {
        src: [],
        dest: 'build/temp/vendor.js',
        options: {
          require: [],
          alias: ['src/vendor/sorttable.js:sorttableWrapper']
        }
      },
      client: {
        src: ['src/lib/index.js'],
        dest: 'build/temp/joola.io.js',
        options: {
          external: []
        }
      }
    },

    jshint: {
      all: ['src/lib/**/*.js']
    },

    csslint: {
      base_theme: {
        src: 'src/css/**/*.css',
        rules: {
          "import": false,
          "overqualified-elements": 2
        }
      }
    },

    concat: {
      'build/release/joola.io.js': [ 'build/temp/joola.io.js', 'build/temp/vendor.js'],
      'build/temp/joola.io.css': ['src/css/**/*.css']
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle: true,
        compress: true,
        sourceMap: true,
        sourceMapName: 'build/release/joola.io.min.js.map'
      },
      build: {
        src: 'build/release/joola.io.js',
        dest: 'build/release/joola.io.min.js'
      }
    },

    cssmin: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */',
        keepSpecialComments: 0
      },
      my_target: {
        options: {
          keepSpecialComments: 1
        },
        src: 'build/temp/joola.io.css',
        dest: 'build/release/joola.io.min.css'
      }
    },

    copy: {
      main: {
        src: 'build/temp/joola.io.css',
        dest: 'build/release/joola.io.css'
      }
    },


    connect: {
      server: {
        options: {
          protocol: 'http',
          base: '',
          port: 9999
        }
      }
    },
    watch: {},

    mocha: {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:9999/test/browser/common.spec.html'
          ],
          run: false,
          log: true,
          timeout: 5000
        }
      }
    },

    'saucelabs-mocha': {
      all: {
        options: {
          urls: [
            'http://127.0.0.1:9999/test/browser/common.spec.html'
          ],
          tunnelTimeout: 5,
          build: process.env.TRAVIS_JOB_ID,
          concurrency: 2,
          throttled: 2,
          browsers: browsers,
          testname: "joola.io.sdk tests",
          tags: ["develop"]
        }
      }
    }

  });

  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key.indexOf("grunt") === 0)
      grunt.loadNpmTasks(key);
  }

  grunt.registerTask('default', ['clean', 'jshint', 'browserify', 'uglify', 'concat', 'cssmin', 'copy']); //'csslint',
  grunt.registerTask('dev', ['connect', 'watch']);
  grunt.registerTask('test', ['default', 'connect', 'mocha']);
  grunt.registerTask('test:sauce', ['default', 'connect', 'mocha', 'saucelabs-mocha']);
};