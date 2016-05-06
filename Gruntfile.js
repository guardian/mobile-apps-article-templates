module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);
    
    config = {};

    try {
        config = require('./config');
    }
    catch (e) {
        console.log('Empty config will be used as config file failed to load with error:\n' + e);
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
            },
            sentry: {
                dsn: null
            }
        };
    }

    grunt.registerTask('initRequireJS', function() {
        var done = this.async();
        var sys = require('sys');
        var exec = require('child_process').exec;
        exec("git rev-parse HEAD", function(err, out){
            grunt.config(['requirejs'], {
                dev: {
                    options: {
                        baseUrl: "ArticleTemplates/assets/js",
                        mainConfigFile: 'ArticleTemplates/assets/js/main.js',
                        dir: "ArticleTemplates/assets/build",
                        optimize: 'uglify2',
                        uglify2: {
                            compress: {
                                global_defs: {
                                    GRUNT_LAST_GIT_COMMIT: out.replace(/\n/,''),
                                    GRUNT_SENTRY_DSN: grunt.option('sentry') ? config.sentry.dsn : null
                                }
                            }
                        },
                        generateSourceMaps: false,
                        preserveLicenseComments: false,
                        useSourceUrl: false,
                        removeCombined: true,
                        modules: [
                            { name: 'audio' },
                            { name: 'football' },
                            { name: 'gallery' },
                            { name: 'liveblog' },
                            { name: 'cricket' },
                            { name: 'bootstraps/common'},
                            { name: 'app' },
                            { name: 'smoothScroll' },
                            // DES-52
                            { name: 'layouts/Layout'},
                            { name: 'layouts/Article'}
                        ]
                    }
                }
            });
            done();
        });
    });

    grunt.initConfig({
        // sync templates to local ios/android projects
        rsync: {
            options: {
                recursive: true,
                delete: true
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
        // stylesheets
        sass: {
            dev: {
                options: {
                    sourcemap: 'none'
                },
                files: {
                    'ArticleTemplates/assets/scss/fonts-android.css':  'ArticleTemplates/assets/scss/fonts-android.scss',
                    'ArticleTemplates/assets/scss/fonts-ios.css':  'ArticleTemplates/assets/scss/fonts-ios.scss',
                    'ArticleTemplates/assets/scss/fonts-windows.css':  'ArticleTemplates/assets/scss/fonts-windows.scss',
                    'ArticleTemplates/assets/scss/interactive.css':  'ArticleTemplates/assets/scss/interactive.scss',
                    'ArticleTemplates/assets/scss/outbrain.css':  'ArticleTemplates/assets/scss/outbrain.scss',
                    'ArticleTemplates/assets/scss/style-async.css':  'ArticleTemplates/assets/scss/style-async.scss',
                    'ArticleTemplates/assets/scss/style-sync.css':  'ArticleTemplates/assets/scss/style-sync.scss',
                    'test/unit/test.css':  'ArticleTemplates/assets/scss/test.scss'
                } 
            },
            doc: {
                files: {
                    'DocumentationTemplates/assets/css/style.css':  'DocumentationTemplates/assets/scss/style.scss'
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'ArticleTemplates/assets/scss',
                    src: ['*.css', '!*.min.css'],
                    dest: 'ArticleTemplates/assets/css',
                    ext: '.css'
                }]
            }
        },
        scsslint: {
            options: {
                bundleExec: true,
                config: 'ArticleTemplates/assets/scss/.scss-lint.yml',
                force: true,
                maxBuffer: 300 * 1024
            },
            dev: [
                'ArticleTemplates/assets/scss/**/*.scss',
            ]
        },
        // jshint
        jshint: {
            options: {
                reporter: require('jshint-summary'),
                force: true
            },
            uses_defaults: ['Gruntfile.js', 'ArticleTemplates/assets/js/{bootstraps,modules}/*.js', 'ArticleTemplates/assets/js/*.js'],
            with_overrides: {
                options: {
                    "bitwise": true,
                    "browser": true,
                    "camelcase": true,
                    "curly": true,
                    "eqeqeq": true,
                    "expr": true,
                    "forin": true,
                    "immed": true,
                    "indent": false,
                    "latedef": true,
                    "maxerr": 9999,
                    "mocha": true,
                    "newcap": true,
                    "noarg": true,
                    "noempty": true,
                    "nonew": true,
                    "quotmark": false,
                    "regexp": true,
                    "strict": true,
                    "trailing": true,
                    "undef": true,
                    "unused": true,
                    "white": true,
                    "predef": [ "-Promise" ],
                    "globals": {
                        "Class": true,
                        "console": true
                    }
                },
                files: {
                    src: ['ArticleTemplates/assets/js/app.js', 'ArticleTemplates/assets/js/layouts/*.js']
                }
            }
        },
        // unit tests
        karma: {
            unit: {
                options: {
                    basePath: './',
                    frameworks: ['mocha', 'requirejs', 'chai-sinon'],
                    files: [
                        {pattern: 'ArticleTemplates/assets/js/**/*.js' , included: false},
                        {pattern: 'test/spec/unit/**/*.js', included: false},
                        {pattern: 'node_modules/bonzo/bonzo.js', included: false},
                        {pattern: 'node_modules/bean/bean.js', included: false},
                        {pattern: 'node_modules/d3/d3.js', included: false},
                        {pattern: 'node_modules/domready/ready.js', included: false},
                        {pattern: 'node_modules/fastclick/lib/fastclick.js', included: false},
                        {pattern: 'node_modules/qwery/qwery.js', included: false},
                        {pattern: 'node_modules/fence/fence.js', included: false},
                        {pattern: 'node_modules/smooth-scroll/dist/js/smooth-scroll.js', included: false},
                        {pattern: 'node_modules/raven-js/dist/raven.js', included: false},
                        {pattern: 'node_modules/squirejs/src/Squire.js', included: false},
                        'test/spec/unit/test-main.js'
                    ],
                    exclude: [
                        'ArticleTemplates/assets/js/main.js'
                    ],
                    reporters: ['mocha', 'coverage'],
                    preprocessors: {
                        'ArticleTemplates/assets/js/**/*.js': ['coverage']
                    },
                    coverageReporter: {
                        reporters: [{
                            type: "cobertura",
                            dir: "test/output/coverage/",
                            file: "summary.xml"
                        }, {
                            type : 'html',
                            dir : 'test/output/coverage/'
                        }]
                    },
                    port: 9876,
                    colors: true,
                    autoWatch: true,
                    singleRun: true,
                    logLevel: 'ERROR',
                    browsers: ['PhantomJS']
                }
            }
        },
        // watch
        watch: {
            js: {
                files: ['ArticleTemplates/assets/js/**/*.js'],
                tasks: ['buildJS','rsync']
            },
            tests: {
                files: ['ArticleTemplates/assets/js/**/*.js', 'test/unit/**/*.{js,html}'],
                tasks: ['karma']
            },
            scss: {
                files: ['ArticleTemplates/assets/scss/**/*.scss'],
                tasks: ['buildCSS','rsync']
            },
            copy: {
                files: ['ArticleTemplates/*.html', 'ArticleTemplates/assets/img/**'],
                tasks: ['rsync']
            }
        },
        // build
        lodash: {
            build: {
                dest: 'ArticleTemplates/assets/js/components/lodash',
                options: {
                    modifier: 'modularize',
                    modularize: true,
                    exports: ['amd'],
                    include: ['debounce']
                }
            }
        }
        // // scss
        // hologram: {
        //     doc: {
        //         options: {
        //             config: 'hologram.yml'
        //         }
        //     }
        // },
        // // unit tests
        // mocha: {
        //     dev: {
        //         options: {
        //             run: false,
        //             log: true,
        //             urls: [ 'http://localhost:3000/root/test/unit/runner.html' ],
        //             page: {
        //                 settings: {
        //                     webSecurityEnabled: false,
        //                 },
        //             },
        //         },
        //     },
        //     jenkins: {
        //         options: {
        //             run: false,
        //             log: true,
        //             reporter: 'XUnit',
        //             urls: [ 'http://localhost:3000/root/test/unit/runner.html' ],
        //             page: {
        //                 settings: {
        //                     webSecurityEnabled: false,
        //                 },
        //             },
        //         },
        //         dest: 'report.xml'
        //     }
        // },
        // // notify
        // notify_hooks: {
        //     options: {
        //         enabled: true,
        //         max_jshint_notifications: 5,
        //         success: true,
        //         duration: 3
        //     }
        // },
        // // test
        // express: {
        //     test: {
        //         options: {
        //             server: 'test/server.js'
        //         }
        //     }
        // },
        // shell: {
        //     android: {
        //         command: function(){
        //             return 'echo "Building Android app with gradle" && cd ' + config.base.android + '../../../../../../ && export BUILD_NUMBER=' + (grunt.option('card') || "000") + '  && ./gradlew zipTemplates > android-build.log && ./gradlew assembleDebug >> android-build.log && cp android-news-app/build/outputs/apk/android-news-app-debug.apk ' + config.base.html;
        //         }
        //     },
        //     ios: {
        //         options: {
        //             execOptions: {
        //                 maxBuffer: 30000000
        //             }
        //         },
        //         command: ' echo "Building iOS app with xcodebuild" && cd ' + config.base.ios + '../../GLA/ && xcodebuild clean build -configuration Debug -workspace GLA.xcworkspace -scheme GLADebug -derivedDataPath ' + config.base.html + ' > ios-build.log && xcrun -sdk iphoneos9.0 PackageApplication -v ' + config.base.html + 'Build/Products/Debug-iphoneos/GLA.app -o ' + config.base.html + 'guardian-debug.ipa' + ' --embed "' + config.ios.provisioning + '" >> ios-build.log'
        //     },
        //     timeline: {
        //         command: function(){
        //             if( grunt.option('fixture') ){
        //                 var label = grunt.option('label') || 'no-label';
        //                 var baseCommand = '`which ruby` test/performance/timeline.rb ' + config.performance.server + ' ' + grunt.option('fixture') + ' ' + label;
        //                 var times = parseInt(grunt.option('times'),10) || 1;
        //                 var outputsString = '';
        //                 for(var x = 0; x < times; x ++){
        //                     outputsString += '&& ' + baseCommand;
        //                 }
        //                 return '`which adb` forward tcp:9222 localabstract:chrome_devtools_remote ' + outputsString;
        //             } else {
        //                 return '';
        //             }
        //         }
        //     },
        //     wraithhistory: {
        //         command: 'cd ' + config.base.html + 'test/visual && rm -rf shots shots_history && wraith history ' + config.base.html + 'test/visual/visual.yaml'
        //     },
        //     wraith: {
        //         command: 'cd ' + config.base.html + 'test/visual && wraith latest ' + config.base.html + 'test/visual/visual.yaml'
        //     },
        //     clean: {
        //         command: 'git checkout ArticleTemplates/assets/build ArticleTemplates/assets/css ArticleTemplates/assets/scss/*.css DocumentationTemplates test'
        //     },
        //     ziptemplates: {
        //         command: 'cd ArticleTemplates && zip -q -r ArticleTemplates.zip ./* -x "./assets/scss/*" "./assets/js/*" "*.DS_Store" "*.map" && mv ArticleTemplates.zip ../'
        //     },
        //     deployandroid: {
        //         command: 'adb push ArticleTemplates.zip /sdcard/ArticleTemplates.zip && adb shell am startservice -n "com.guardian/.templates.UpdateTemplatesService"'
        //     }
        // }
    });

    // grunt.task.run('notify_hooks');
    // grunt.registerTask('develop', ['build', 'express', 'watch']);

    grunt.registerTask('buildJS', ['jshint', 'karma', 'initRequireJS','jshint', 'lodash', 'requirejs']);

    grunt.registerTask('buildCSS', ['scsslint','sass:dev','cssmin']);

    grunt.registerTask('build', ['buildJS', 'buildCSS']);

    grunt.registerTask('default', 'watch');

    // grunt.registerTask('deploy', ['build','shell:ziptemplates', 'shell:deployandroid']);
    // grunt.registerTask('apk', ['build', 'rsync', 'shell:android']);
    // grunt.registerTask('ipa', ['build', 'rsync', 'shell:ios']);
    // grunt.registerTask('installer', ['build', 'rsync', 'shell:ios', 'shell:android']);
    // grunt.registerTask('default', 'develop');
    // grunt.registerTask('test', ['build', 'express', 'mocha:jenkins']);
};
