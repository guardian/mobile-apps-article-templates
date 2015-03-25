module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);
    config = {};

    try {
        config = require('./config');
    }
    catch (e) {
        console.log('Config module not found, trying an empty config');
        config = { 
            base: {
                android: '',
                ios: '',
                html: ''
            },
            performance: {
                server: '',
            },
            ios: {
                sign: '',
                provisioning: ''
            }
        };
    }

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
                    'ArticleTemplates/assets/css/style.css':  'ArticleTemplates/assets/scss/style.scss',
                    'ArticleTemplates/assets/css/style-async.css':  'ArticleTemplates/assets/scss/style-async.scss',
                    'ArticleTemplates/assets/css/style-sync.css':  'ArticleTemplates/assets/scss/style-sync.scss',
                }
            },
            doc: {
                files: {
                    'DocumentationTemplates/assets/css/style.css':  'DocumentationTemplates/assets/scss/style.scss'
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
                    dir: "ArticleTemplates/assets/build",
                    optimize: 'uglify2',                 
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    useSourceUrl: false,
                    removeCombined: true,
                    modules: [
                        { name: 'audio' },
                        { name: 'football' },
                        { name: 'gallery' },
                        { name: 'liveblog' },
                        { name: 'article' },
                        { name: 'bootstraps/common'},
                        { name: 'app' },
                        { name: 'smoothScroll' }
                    ]
                }
            }
        },

        // Tests

        mocha: {
            dev: {
                options: {
                    run: false,
                    log: true,
                    urls: [ 'http://localhost:3000/root/test/unit/runner.html' ],
                    page: {
                        settings: {
                            webSecurityEnabled: false,
                        },
                    },
                },
            },
            jenkins: {
                options: {
                    run: false,
                    log: true,
                    reporter: 'XUnit',
                    urls: [ 'http://localhost:3000/root/test/unit/runner.html' ],
                    page: {
                        settings: {
                            webSecurityEnabled: false,
                        },
                    },                    
                },
                dest: 'report.xml'                
            }
        },

        // Watch

        watch: {
            js: {
                files: ['ArticleTemplates/assets/js/**/*.js'],
                tasks: ['jshint', 'requirejs','rsync']
            },
            tests: {
                files: ['ArticleTemplates/assets/js/**/*.js', 'test/unit/**/*.{js,html}'],
                tasks: ['mocha:dev']
            },
            scss: {
                files: ['ArticleTemplates/assets/scss/**/*.scss'],
                tasks: ['scsslint','sass','hologram','rsync']
            },
            copy: {
                files: ['ArticleTemplates/*.html', 'ArticleTemplates/assets/img/**'],
                tasks: ['rsync']
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
                command: function(){
                    return 'cd ' + config.base.android + '../../../../  && export BUILD_NUMBER=' + grunt.option('card') + ' && ./gradlew zipTemplates && ./gradlew assembleDebug && cp android-news-app/build/outputs/apk/android-news-app-debug.apk ' + config.base.html;
                }
            },
            ios: {
                options: {
                    execOptions: {
                        maxBuffer: 30000000
                    }
                },
                command: 'cd ' + config.base.ios + '../../GLA/ && xcodebuild clean build -sdk iphoneos8.2 -configuration Debug -workspace GLA.xcworkspace -scheme GLADebug -derivedDataPath ' + config.base.html + ' && xcrun -sdk iphoneos8.2 PackageApplication -v ' + config.base.html + 'Build/Products/Debug-iphoneos/GLA.app -o ' + config.base.html + 'guardian-debug.ipa --sign "' + config.ios.sign + '" --embed "' + config.ios.provisioning + '"'
            },
            timeline: {
                command: function(){
                    if( grunt.option('fixture') ){
                        var label = grunt.option('label') || 'no-label';
                        var baseCommand = '`which ruby` test/performance/timeline.rb ' + config.performance.server + ' ' + grunt.option('fixture') + ' ' + label;
                        var times = parseInt(grunt.option('times'),10) || 1;
                        var outputsString = '';
                        for(var x = 0; x < times; x ++){
                            outputsString += '&& ' + baseCommand;
                        }
                        return '`which adb` forward tcp:9222 localabstract:chrome_devtools_remote ' + outputsString;
                    } else {
                        return '';
                    }
                }
            },
            wraithhistory: {
                command: 'cd ' + config.base.html + 'test/visual && rm -rf shots shots_history && wraith history ' + config.base.html + 'test/visual/visual.yaml'
            },
            wraith: {
                command: 'cd ' + config.base.html + 'test/visual && wraith latest ' + config.base.html + 'test/visual/visual.yaml'
            }
        }

    });

    grunt.task.run('notify_hooks');

    grunt.registerTask('develop', ['build', 'express', 'watch']);
    grunt.registerTask('build', ['jshint', 'requirejs', 'scsslint','sass:dev']);
    grunt.registerTask('apk', ['build', 'rsync', 'shell:android']);
    grunt.registerTask('ipa', ['build', 'rsync', 'shell:ios']);
    grunt.registerTask('installer', ['build', 'rsync', 'shell:ios', 'shell:android']);
    grunt.registerTask('default', 'develop');
    grunt.registerTask('test', ['build', 'express', 'mocha:jenkins']);
};