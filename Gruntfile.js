module.exports = function (grunt) {

    var pkg = grunt.file.readJSON('package.json');
    var manifest = grunt.file.readJSON('manifest.json');
    var projectUrl = 'https://github.com/ixrock/XTranslate';
    var banner = [
        '/*!',
        'Project: '+ manifest.name,
        'Version: ' + manifest.version,
        'URL: '+ projectUrl,
        'Build date: ' + grunt.template.today("dd.mm.yyyy HH:MM"),
        '*/'
    ].join('\n * ').replace('* *', '*') + '\n';

    grunt.initConfig({
        pkg : pkg,
        manifest : manifest,
        env: process.env,
        buildPath: 'build/<%= pkg.name %>-<%= manifest.version %>',
        chromeLocations: [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            'c:\\Users\\<%=env.USERNAME%>\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
        ],
        "browserify": {
            dist: {
                files  : [
                    {
                        expand: true,
                        cwd   : 'js',
                        dest  : '<%= buildPath %>/js',
                        src   : ['background.js', 'injected.js', 'options.js']
                    }
                ]
            }
        },

        "uglify": {
            options: {
                banner: banner,
                preserveComments: 'some'
            },
            dist: {
                expand: true,
                src: '<%= buildPath %>/js/*'
            }
        },

        "sass": {
            options: {
                banner: banner,
                style : 'compressed'
            },
            dist: {
                files  : [
                    {
                        expand: true,
                        cwd   : 'scss',
                        src   : ['*.scss'],
                        dest  : '<%= buildPath %>/css',
                        ext   : '.css'
                    }
                ]
            }
        },

        "clean": {
            src: ['<%= buildPath %>']
        },

        "copy": {
            common: {
                expand: true,
                src: [
                    '_*/**', 'fonts/**',
                    'img/**', '!img/**/*.svg',
                    'js/libs/jquery.min.js'
                ],
                dest: '<%= buildPath %>'
            },
            manifest: {
                expand : true,
                src    : 'manifest.json',
                dest   : '<%= buildPath %>',
                options: {
                    process: function () {
                        var manifest = grunt.config.get('manifest');
                        manifest.background.scripts.splice(0, 1); // remove development version of require.js
                        manifest.content_scripts.forEach(function (content) { content.js.splice(0, 1) });
                        return JSON.stringify(manifest, null, 4);
                    }
                }
            },
            html: {
                expand : true,
                src    : '*.html',
                dest   : '<%= buildPath %>',
                options: {
                    process: function (content) {
                        return content
                            .replace(/data-entry="(.*?)"/i, 'src="js/$1"')
                            .replace(/\s*src="js\/require.js"/i, '');
                    }
                }
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Register tasks
    grunt.registerTask('build', function (param) {
        var tasks = ['browserify', 'sass', 'copy'];
        if (param !== 'nocompress') tasks.splice(1, 0, 'uglify');
        grunt.task.run(tasks);
    });

    grunt.registerTask('pack', 'Pack the files in one file chrome extension format (*.crx)', function (pemPath) {
        var done = this.async(),
            buildPath = [__dirname, grunt.config.get('buildPath')].join('/'),
            chromePath = grunt.config.get('chromeLocations').reduce(function (resolvedPath, chromePath) {
                if (grunt.file.isFile(chromePath)) return chromePath;
                return resolvedPath;
            }, ''),
            args = [
                '--pack-extension=' + buildPath,
                '--pack-extension-key=' + (pemPath || '')
            ];

        if (!grunt.file.isDir(buildPath)) {
            grunt.log.error('Build the project before packing!');
            return;
        }

        if (!chromePath) {
            grunt.log.warn('Grunt builder cannot resolve a file path to the chrome.');
            grunt.log.warn('Add full path to the executable chrome file in Grunfile.js in the config and try again.');
            grunt.log.warn('Or.. pack the extension manually on chrome://extensions page.');
            return;
        }

        grunt.util.spawn({cmd: chromePath, args: args}, function (error, result) {
            if (error) grunt.log.error(result.stderr);
            else grunt.log.writeln('Packed file can be obtained from here: ', buildPath + '.crx');
            done(!error);
        });
    });

    grunt.registerTask('default', function () {
        var header = grunt.config.get('manifest').name + ' building started.';
        var line = grunt.util.repeat(header.length, '-');
        grunt.log.writeln(header);
        grunt.log.writeln(line);
        grunt.task.run(['build', 'pack', 'clean']);
    });
};