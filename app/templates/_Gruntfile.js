(function(){
  /*global require:false, module:false*/
  'use strict';

  module.exports = function(grunt) {

    require('matchdep').filterDev(['grunt-*', '!grunt-template-*']).forEach(grunt.loadNpmTasks);

    var readJSON = function(path){
      return JSON.parse(grunt.file.read(path).
        replace(/(\/\/.*)/gm, '').
        replace(/([\/][*](?:[^*]*|[*](?=[^\/]))*[*][\/])/g, ''));
    };

    var jshintrc = readJSON('.jshintrc');
    jshintrc.reporter = require('jshint-stylish');

    require('time-grunt')(grunt);

    grunt.initConfig({

      // Load pack infos
      pkg: grunt.file.readJSON('package.json'),

      // Configuration directories remapped
      dirs: {
        tmp: '<%%= pkg.directories.tmp %>',
        src: '<%%= pkg.directories.src %>',
        tests: '<%%= pkg.directories.tests %>',
        dist: '<%%= pkg.directories.dist %>',
        doc: '<%%= pkg.directories.doc %>',
        build: '<%%= pkg.directories.build %>'
      },

      files: {
        images: 'png,gif,jpg',
        web: 'js,css,html,txt,json,ico,<%%= files.images %>',
        pcss: 'scss',
        hbs: 'hbs,handlebars'
      },

      // Banner
      banner:
      '/*\n' +
       ' * -------------------------------------------------------\n' +
       ' * Project:  <%%= pkg.name %>\n' +
       ' * Version:  <%%= pkg.version %>\n' +
       ' * Homepage: <%%= pkg.homepage %>\n' +
       ' *\n' +
       ' * Author:   <%%= pkg.author.name %>\n' +
       ' * Contact:  <%%= pkg.author.email %>\n' +
       ' * Homepage: <%%= pkg.author.url %>\n' +
       ' *\n' +
       ' * Copyright (c) <%%= grunt.template.today("dd-mm-yyyy") %> <%%= pkg.author.name %> ' +
       'under <%%= pkg.license %> all rights reserved.\n' +
       ' * -------------------------------------------------------\n' +
       ' */\n' +
       '\n',

      // Copy what needs be
      copy:    {
        options: {
            processContentExclude: ['**/*.{<%%= files.images %>,ico}'],
            processContent: function (content, srcpath) {
            return (/[.](?:html|js|css|txt|json)$/).test(srcpath) ?
                grunt.template.process(content) :
                content;
          }
        },
        lib:  {
          files: [
            {
              expand: true,
              cwd: '<%%= dirs.src %>',
              src: ['**/*.{<%%= files.web %>}'],
              filter: 'isFile',
              dest: '<%%= dirs.build %>'
            }
          ]
        },
        doc:  {
          files: [
            {
              expand: true,
              cwd: '<%%= dirs.doc %>',
              src: ['**/*.{<%%= files.web %>}'],
              filter: 'isFile',
              dest: '<%%= dirs.build %>/doc'
            }
          ]
        },
        tests:  {
          files: [
            {
              expand: true,
              cwd: '<%%= dirs.tests %>',
              src: ['**/*.{<%%= files.web %>}'],
              filter: 'isFile',
              dest: '<%%= dirs.build %>/tests'
            }
          ]
        }
      },


      // Use source maps
      uglify: {
        options: {
          mangle: false,
          banner: '<%%= banner %>',
          report: 'min',
          sourceMap: '<%%= dirs.build %>/js.map'
        },
        all: {
          files: [{
              expand: true,
              cwd: '<%%= dirs.build %>',
              src: ['**/*.js', '!**/*-min.js'],
              filter: 'isFile',
              dest: '<%%= dirs.build %>/',
              ext: '-min.js'
/*                rename: function(dest, src){
                return dest + '/' + src.replace(/[.]js$/, '-min.js');
              }*/
          }]
        }
      },

      imagemin: {
        options: {
          optimizationLevel: 7
        },
        all: {
          files: [{
            expand: true,
            cwd: '<%%= dirs.build %>',
            src: ['**/*.{<%%= files.images %>}', '!**/*-min.{<%%= files.images %>'],
            filter: 'isFile',
            dest: '<%%= dirs.build %>/',
            rename: function(dest, src){
              return dest + '/' + src.replace(/([.][^.]+)$/, '-min$1');
            }
          }]
        }
      },

      htmlmin: {
        options: {
          removeComments: true,
          removeCommentsFromCDATA: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
          useShortDoctype: true
        },
        all: {
          files: [{
            expand:true,
            cwd: '<%%= dirs.build %>',
            src: ['**/*.html', '!**/*-min.html'],
            filter: 'isFile',
            dest: '<%%= dirs.build %>',
            ext: '-min.html'
          }]
        }
      },


      // Hinting on stuff
      jshint: {
        options: jshintrc,
        self: {
          src: ['*.js']
        },
        lib: {
          src: ['<%%= dirs.src %>/**/*.js']
        },
        doc: {
          src: ['<%%= dirs.doc %>/**/*.js']
        },
        tests: {
          src: ['<%%= dirs.tests %>/**/*.js']
        }
      },

      // http://2002-2012.mattwilcox.net/archive/entry/id/1054/
      csslint: {
        options: {
          csslintrc: '.csslintrc'
        },
        all: {
          src: ['<%%= dirs.build %>/**/*.css']
        }
      },

      yuidoc: {
          compile: {
              name: '<%= pkg.name %>',
              description: '<%= pkg.description %>',
              version: '<%= pkg.version %>',
              url: '<%= pkg.homepage %>',
              options: {
                  paths: '<%%= dirs.build %>/**/*.js',
                  outdir: 'doc/yui',
                  themedir: 'dependencies/yuidoc-bootstrap-theme',
                  helpers: ['dependencies/yuidoc-bootstrap-theme/helpers/helpers.js']
              }
          }
      },

      // scss
      sass: {
        options: {
          trace: true,
          unixNewlines: true,
          cacheLocation: '<%%= dirs.tmp %>',
          compass: true,
          sourcemap: true,
          banner: '<%%= banner %>',
          style: 'compressed'

        },

        assets:  {
          files: [{
              src: ['<%%= dirs.src %>/assets/style/**/*.<%%= files.pcss %>'],
              filter: 'isFile',
              dest: '<%%= dirs.build %>/style.css'
          }]
        }
      },


      // hbs
      ember_handlebars: {
        options: {
          processName: function(filePath) {
            return filePath.replace(/^(.*\/app\/templates\/)/, '').replace(/[.][^.]+$/, '');
          }
        },
        app: {
          files: [{
            src: ['<%%= dirs.src %>/app/templates/**/*.{<%%= files.hbs %>}'],
            filter: 'isFile',
            dest: '<%%= dirs.build %>/templates.js'
          }]
        }
      },

      watch: {
        // Watch sass to process into css
        sasslib: {
          files: '<%%= dirs.src %>/<%%= files.pcss %>',
          tasks: ['sass:lib']
        },

        sassdoc: {
          files: '<%%= dirs.doc %>/<%%= files.pcss %>',
          tasks: ['sass:doc']
        },

        sasstests: {
          files: '<%%= dirs.tests %>/<%%= files.pcss %>',
          tasks: ['sass:tests']
        },

        // Watch copyable
        copylib: {
          files: '<%%= dirs.src %>/**/*.{<%%= files.web %>}',
          tasks: ['copy:lib']
        },

        copydoc: {
          files: '<%%= dirs.doc %>/**/*.{<%%= files.web %>}',
          tasks: ['copy:doc']
        },

        copytests: {
          files: '<%%= dirs.tests %>/**/*.{<%%= files.web %>}',
          tasks: ['copy:tests']
        },

        // Watch build for minification
        uglify: {
          files: [
              '<%%= dirs.build %>/**/*.js',
              '!<%%= dirs.build %>/**/*-min.js'
          ],
          tasks: ['uglify']
        },

        imagemin: {
          files: [
              '<%%= dirs.build %>/**/*.{<%%= files.images %>}',
              '!<%%= dirs.build %>/**/*-min.{<%%= files.images %>}'
          ],
          tasks: ['imagemin']
        },

        htmlmin: {
          files: [
              '<%%= dirs.build %>/**/*.html',
              '!<%%= dirs.build %>/**/*-min.html'
          ],
          tasks: ['htmlmin']
        },

        // Csslinting
        csslint: {
          files: '<%%= csslint.all.src %>',
          tasks: ['csslint']
        },

        // Watch javascript inside source for hinting - maybe move to elsewhere?
        self: {
          files: '<%%= jshint.self.src %>',
          tasks: ['jshint:self']
        },

        jslintlib: {
          files: '<%%= jshint.lib.src %>',
          tasks: ['jshint:lib']
        },
        jslintdoc: {
          files: '<%%= jshint.doc.src %>',
          tasks: ['jshint:doc']
        },
        jslinttests: {
          files: '<%%= jshint.tests.src %>',
          tasks: ['jshint:tests']
        }

      },


      clean: {
          all: [
              '<%%= dirs.tmp %>',
              '<%%= dirs.build %>',
              '<%%= dirs.dist %>'
          ],
          options: { 'no-write': false }
      },


      // notify: {
      //   hint: {
      //     options: {
      //       title: 'SomeWatched!',
      //       message: 'Hinting OK!'
      //     }
      //   }
      // },







      // cssmin: {
      //   options: {
      //     banner: '<%%= banner %>',
      //     report: 'min'
      //   },
      //   all: {
      //     files: [{
      //         expand: true,
      //         cwd: '<%%= dirs.build %>',
      //         src: ['**/*.css', '!**/*-min.css'],
      //         dest: '<%%= dirs.build %>',
      //         ext: '-min.css'
      //     }]
      //   }
      // },





      // handlebars: {
      //   options: {
      //     namespace: "JST",
      //     processName: function(filePath) {
      //       console.warn('GOTTA NAME >> ', filePath);
      //       return filePath.toUpperCase();
      //     }
      //   },
      //   lib: {
      //     files: [{
      //         expand: true,
      //         cwd: '<%%= dirs.src %>/app/templates',
      //         src: ['**/*.{<%%= files.hbs %>}'],
      //         filter: 'isFile',
      //         ext: '.js',
      //         dest: '<%%= dirs.build %>'
      //     }]
      //   }
      // },



      concat: {
        options: {
          separator: '\n\n'
        },
        dist: {
          src: [
            'src/_intro.js',
            'src/main.js',
            'src/_outro.js'
          ],
          dest: 'dist/<%%= pkg.name.replace(".js", "") %>.js'
        }
      },

      // Compile CoffeeScript
      coffee: {
          compileBare: {
            options: {
              bare: true
            },
            files: {
              '<%%= dirs.js %>/yourLibrary.js' : '<%%= dirs.coffee %>/yourLibrary.coffee'
            }
          }
      },

      // bower: {
      //     install: {},
      //     // options: {
      //     //     verbose: isVerboseEnabled,
      //     //     cleanBowerDir: true,
      //     //     targetDir: 'third-party'
      //     // }
      // },

        // jasmine: {
        //     test: { src: 'src/controller/controller_v2.js' },
        //     testmin: { src: 'build/js/min/widemotion.min.js' },
        //     options: { specs: 'testing/tests_01.js' }
        // },

      // qunit: {
      //   files: ['test/*.html']
      // },

      jasmine: {
        customTemplate: {
          src: 'build/*.js',
          options: {
            specs: '<%%= dirs.tests %>/specs/*.js',
            helpers: '<%%= dirs.tests %>/helpers/*.js'
            // template: 'custom.tmpl'
          }
        }
      }
    });

    grunt.registerTask('default', ['jshint', 'copy']);

    // Build doesn't minify or run any hinting
    grunt.registerTask('build', ['copy', 'sass']);

    grunt.registerTask('mint', ['uglify', 'imagemin', 'htmlmin']);

    grunt.registerTask('hint', ['jshint']);

    // grunt.registerTask('pack', ['sass', 'copy']);

    // grunt.registerTask('release', ['default'])

    // grunt.registerTask('test', ['jshint', 'qunit']);
    // grunt.registerTask('default', ['concat', 'jshint', 'qunit', 'uglify']);
    // grunt.registerTask( "default", [ "coffee", "notify:coffee", "uglify", "notify:js" ]);

  };
})();

