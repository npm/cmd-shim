var test = require('tap').test
var mkdirp = require('mkdirp')
var fs = require('fs')
var path = require('path')
var fixtures = path.resolve(__dirname, 'fixtures')

var cmdShim = require('../')

var resolveDir = "@ECHO.%0 | FINDSTR /C:\\ /C:/ >NUL && (\r\n"
               + "  SET dir=%~dp0\r\n"
               + ") || (\r\n"
               + "  FOR /F %%i IN ('where %0') DO @SET dir=%%~dpi\r\n"
               + ")\r\n"

test('no shebang', function (t) {
  var from = path.resolve(fixtures, 'from.exe')
  var to = path.resolve(fixtures, 'exe.shim')
  cmdShim(from, to, function(er) {
    if (er)
      throw er
    t.equal(fs.readFileSync(to, 'utf8'),
            "\"$basedir/from.exe\"   \"$@\"\nexit $?\n")
    t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
            resolveDir + "\"%dir%\\from.exe\"   %*\r\n")
    t.end()
  })
})

test('env shebang', function (t) {
  var from = path.resolve(fixtures, 'from.env')
  var to = path.resolve(fixtures, 'env.shim')
  cmdShim(from, to, function(er) {
    if (er)
      throw er
    console.error('%j', fs.readFileSync(to, 'utf8'))
    console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))

    t.equal(fs.readFileSync(to, 'utf8'),
            "#!/bin/sh"+
            "\nbasedir=`dirname \"$0\"`"+
            "\n"+
            "\ncase `uname` in"+
            "\n    *CYGWIN*) basedir=`cygpath -w \"$basedir\"`;;"+
            "\nesac"+
            "\n"+
            "\nif [ -x \"$basedir/node\" ]; then"+
            "\n  \"$basedir/node\"  \"$basedir/from.env\" \"$@\""+
            "\n  ret=$?"+
            "\nelse "+
            "\n  node  \"$basedir/from.env\" \"$@\""+
            "\n  ret=$?"+
            "\nfi"+
            "\nexit $ret"+
            "\n")
    t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
            resolveDir+
            "@IF EXIST \"%dir%\\node.exe\" (\r"+
            "\n  \"%dir%\\node.exe\"  \"%dir%\\from.env\" %*\r"+
            "\n) ELSE (\r"+
            "\n  @SETLOCAL\r"+
            "\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r"+
            "\n  node  \"%dir%\\from.env\" %*\r"+
            "\n)")
    t.end()
  })
})

test('env shebang with args', function (t) {
  var from = path.resolve(fixtures, 'from.env.args')
  var to = path.resolve(fixtures, 'env.args.shim')
  cmdShim(from, to, function(er) {
    if (er)
      throw er
    console.error('%j', fs.readFileSync(to, 'utf8'))
    console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))

    t.equal(fs.readFileSync(to, 'utf8'),
            "#!/bin/sh"+
            "\nbasedir=`dirname \"$0\"`"+
            "\n"+
            "\ncase `uname` in"+
            "\n    *CYGWIN*) basedir=`cygpath -w \"$basedir\"`;;"+
            "\nesac"+
            "\n"+
            "\nif [ -x \"$basedir/node\" ]; then"+
            "\n  \"$basedir/node\"  --expose_gc \"$basedir/from.env.args\" \"$@\""+
            "\n  ret=$?"+
            "\nelse "+
            "\n  node  --expose_gc \"$basedir/from.env.args\" \"$@\""+
            "\n  ret=$?"+
            "\nfi"+
            "\nexit $ret"+
            "\n")
    t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
            resolveDir+
            "@IF EXIST \"%dir%\\node.exe\" (\r"+
            "\n  \"%dir%\\node.exe\"  --expose_gc \"%dir%\\from.env.args\" %*\r"+
            "\n) ELSE (\r"+
            "\n  @SETLOCAL\r"+
            "\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r"+
            "\n  node  --expose_gc \"%dir%\\from.env.args\" %*\r"+
            "\n)")
    t.end()
  })
})

test('explicit shebang', function (t) {
  var from = path.resolve(fixtures, 'from.sh')
  var to = path.resolve(fixtures, 'sh.shim')
  cmdShim(from, to, function(er) {
    if (er)
      throw er
    console.error('%j', fs.readFileSync(to, 'utf8'))
    console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))

    t.equal(fs.readFileSync(to, 'utf8'),
            "#!/bin/sh" +
            "\nbasedir=`dirname \"$0\"`" +
            "\n" +
            "\ncase `uname` in" +
            "\n    *CYGWIN*) basedir=`cygpath -w \"$basedir\"`;;" +
            "\nesac" +
            "\n" +
            "\nif [ -x \"$basedir//usr/bin/sh\" ]; then" +
            "\n  \"$basedir//usr/bin/sh\"  \"$basedir/from.sh\" \"$@\"" +
            "\n  ret=$?" +
            "\nelse " +
            "\n  /usr/bin/sh  \"$basedir/from.sh\" \"$@\"" +
            "\n  ret=$?" +
            "\nfi" +
            "\nexit $ret" +
            "\n")

    t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
            resolveDir +
            "@IF EXIST \"%dir%\\/usr/bin/sh.exe\" (\r" +
            "\n  \"%dir%\\/usr/bin/sh.exe\"  \"%dir%\\from.sh\" %*\r" +
            "\n) ELSE (\r" +
            "\n  @SETLOCAL\r"+
            "\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r"+
            "\n  /usr/bin/sh  \"%dir%\\from.sh\" %*\r" +
            "\n)")
    t.end()
  })
})

test('explicit shebang with args', function (t) {
  var from = path.resolve(fixtures, 'from.sh.args')
  var to = path.resolve(fixtures, 'sh.args.shim')
  cmdShim(from, to, function(er) {
    if (er)
      throw er
    console.error('%j', fs.readFileSync(to, 'utf8'))
    console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))

    t.equal(fs.readFileSync(to, 'utf8'),
            "#!/bin/sh" +
            "\nbasedir=`dirname \"$0\"`" +
            "\n" +
            "\ncase `uname` in" +
            "\n    *CYGWIN*) basedir=`cygpath -w \"$basedir\"`;;" +
            "\nesac" +
            "\n" +
            "\nif [ -x \"$basedir//usr/bin/sh\" ]; then" +
            "\n  \"$basedir//usr/bin/sh\"  -x \"$basedir/from.sh.args\" \"$@\"" +
            "\n  ret=$?" +
            "\nelse " +
            "\n  /usr/bin/sh  -x \"$basedir/from.sh.args\" \"$@\"" +
            "\n  ret=$?" +
            "\nfi" +
            "\nexit $ret" +
            "\n")

    t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
            resolveDir +
            "@IF EXIST \"%dir%\\/usr/bin/sh.exe\" (\r" +
            "\n  \"%dir%\\/usr/bin/sh.exe\"  -x \"%dir%\\from.sh.args\" %*\r" +
            "\n) ELSE (\r" +
            "\n  @SETLOCAL\r"+
            "\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r"+
            "\n  /usr/bin/sh  -x \"%dir%\\from.sh.args\" %*\r" +
            "\n)")
    t.end()
  })
})
