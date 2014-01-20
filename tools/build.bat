::=============================================================================================
::
:: (1) Working with SASS
:: Install Ruby if you don't have it yet (https://www.ruby-lang.org/en/downloads/)
:: Install SASS-processor by command "gem install sass"

:: (2) JavaScript packing modules inside one file
:: Download and install NodeJS (http://nodejs.org/)
:: Make install from console "npm install -g browserify"

:: (3) Compress JavaScript
:: Download and install Java (http://www.oracle.com/technetwork/java/javase/downloads/index.html)
:: Download Google Closure Compiler (https://code.google.com/p/closure-compiler)
:: Copy file compiler.jar from zip-package in "tools" directory
::
::=============================================================================================

@echo off
echo ===== compiling sass
    call sass --no-cache --update -f --style compressed ../scss/styles.scss:../css/c.css

echo ===== packing js files
    call browserify ../js/entry.js > ../js/c.js

echo ===== compressing js files
    call java -jar compiler.jar --js ../js/c.js --js_output_file ../js/c.js

echo done!
