module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    var config = require('./config');

    grunt.initConfig({

        rsync: {
            options: {
                recursive: true
            },
            android: {
                options: {
                    src: 'ArticleTemplates/',
                    dest: config.base.android
                }
            },
            ios: {
                options: {
                    src: 'ArticleTemplates/',
                    dest: config.base.ios
                }
            }            
        },

        // Stylesheets

        sass: {
            dev: {
                files: {
                    'ArticleTemplates/assets/css/style.css':  'ArticleTemplates/assets/scss/style.scss'
                }
            }
        },

        scsslint: {
            options: {
                bundleExec: true,
                config: 'ArticleTemplates/assets/scss/.scss-lint.yml',
                force: true
            },
            dev: [
                'ArticleTemplates/assets/scss/**/*.scss',
            ]
        },

        hologram: {
            doc: {
                options: {
                    config: 'hologram.yml'
                }
            }
        },

        // Javascript

        jshint: {
            options: {
                force: true
            },
            dev: ['Gruntfile.js', 'ArticleTemplates/assets/js/{bootstraps,modules}/*.js', 'ArticleTemplates/assets/js/*.js']
        },

        requirejs: {
            dev: {
                options: {
                    baseUrl: "ArticleTemplates/assets/js",
                    mainConfigFile: 'ArticleTemplates/assets/js/app.js',
                    name: "app",
                    out: "ArticleTemplates/assets/build/app.js",
                    optimize: 'uglify2',
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    useSourceUrl: true                    
                }
            }
        },

        // Watch

        watch: {
            js: {
                files: ['ArticleTemplates/assets/js/**/*.js'],
                tasks: ['jshint','requirejs']
            },
            scss: {
                files: ['ArticleTemplates/assets/scss/**/*.scss'],
                tasks: ['scsslint','sass']
            },
            copy: {
                files: ['ArticleTemplates/**'],
                tasks: ['shell:timeline', 'rsync']
            }
        },

        // Notify

        notify_hooks: {
            options: {
                enabled: true,
                max_jshint_notifications: 5,
                success: true, 
                duration: 3 
            }
        },

        // Test

        express: {
            test: {
                options: {
                    server: 'test/server.js'
                }
            }
        },

        // Build

        shell: {
            android: {
                command: 'cd ' + config.base.android + '../../../../  && ./gradlew zipTemplates && ./gradlew assembleDebug && cp android-news-app/build/outputs/apk/android-news-app-debug.apk ' + config.base.html
            },
            timeline: {
                command: function(){
                    if( grunt.option('fixture') ){
                        return '`which adb` forward tcp:9222 localabstract:chrome_devtools_remote && `which ruby` test/performance/timeline.rb ' + config.performance.server + ' ' + grunt.option('fixture');
                    } else {
                        return '';
                    }
                }
            }
        }

    });

    grunt.task.run('notify_hooks');

    grunt.registerTask('develop', ['express','watch']);
    grunt.registerTask('build', ['rsync', 'shell:android']);
    grunt.registerTask('default', 'develop');
};