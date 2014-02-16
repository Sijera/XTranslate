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
        buildPath: 'build/<%= pkg.name %>-<%= manifest.version %>',

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
            img: {
                expand: true,
                dest: '<%= buildPath %>',
                src: ['img/**', '!img/*source*']
            },
            text: {
                expand: true,
                dest: '<%= buildPath %>',
                src: ['_*/**', '*.html', 'js/libs/jquery.min.*'],
                options: {
                    process: function (content, filePath) {
                        if (filePath.match(/\.html$/i)) return content
                            .replace(/data-entry="(.*?)"/i, 'src="js/$1"')
                            .replace(/\s*src="js\/require.js"/i, '');
                        return content;
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
    grunt.registerTask('copyManifest', 'Clean up and copy manifest.json', function () {
        var manifest = grunt.config.get('manifest');
        var destFile = grunt.config.get('buildPath') + '/manifest.json';
        manifest.background.scripts.splice(0, 1); // remove development version of require.js
        manifest.content_scripts.forEach(function (content) { content.js.splice(0, 1) });
        manifest.web_accessible_resources = ['img/*'];
        grunt.file.write(destFile, JSON.stringify(manifest, null, 4));
    });

    grunt.registerTask('default', function () {
        var header = grunt.config.get('manifest').name + ' building started.';
        var line = grunt.util.repeat(header.length, '-');
        grunt.log.writeln(header);
        grunt.log.writeln(line);
        grunt.task.run(['clean', 'browserify', 'uglify', 'sass', 'copy', 'copyManifest']);
    });
};