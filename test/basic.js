var test = require('tap').test
var mkdirp = require('mkdirp')
var fs = require('fs')
var path = require('path')
var fixtures = path.resolve(__dirname, 'fixtures')

var cmdShim = require('../')

test('no shebang', function (t) {
  var from = path.resolve(fixtures, 'from.exe')
  var to = path.resolve(fixtures, 'exe.shim')
  cmdShim(from, to, function(er) {
    if (er)
      throw er
    t.equal(fs.readFileSync(to, 'utf8'),
            "\"$basedir/from.exe\"   \"$@\"\nexit $?\n")
    t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
            "@\"%~dp0\\from.exe\"   %*\r\n")
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
            "#!/bin/sh" +
            "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
            "\n" +
            "\ncase `uname` in" +
            "\n    *CYGWIN*) basedir=`cygpath -w \"$basedir\"`;;" +
            "\nesac" +
            "\n" +
            "\nif [ -x \"$basedir/node\" ]; then" +
            "\n  \"$basedir/node\"  \"$basedir/from.env\" \"$@\"" +
            "\n  ret=$?" +
            "\nelse " +
            "\n  node  \"$basedir/from.env\" \"$@\"" +
            "\n  ret=$?" +
            "\nfi" +
            "\nexit $ret" +
            "\n")
    t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
            "@SETLOCAL\r" +
            "\n\r" +
            "\n@IF EXIST \"%~dp0\\node.exe\" (\r" +
            "\n  @SET \"_prog=%~dp0\\node.exe\"\r" +
            "\n) ELSE (\r" +
            "\n  @SET \"_prog=node\"\r" +
            "\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r" +
            "\n)\r" +
            "\n\r" +
            "\n\"%_prog%\"  \"%~dp0\\from.env\" %*\r" +
            "\n")
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
            "#!/bin/sh" +
            "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
            "\n" +
            "\ncase `uname` in" +
            "\n    *CYGWIN*) basedir=`cygpath -w \"$basedir\"`;;" +
            "\nesac" +
            "\n" +
            "\nif [ -x \"$basedir/node\" ]; then" +
            "\n  \"$basedir/node\"  --expose_gc \"$basedir/from.env.args\" \"$@\"" +
            "\n  ret=$?" +
            "\nelse " +
            "\n  node  --expose_gc \"$basedir/from.env.args\" \"$@\"" +
            "\n  ret=$?" +
            "\nfi" +
            "\nexit $ret" +
            "\n")
    t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
            "@SETLOCAL\r" +
            "\n\r" +
            "\n@IF EXIST \"%~dp0\\node.exe\" (\r" +
            "\n  @SET \"_prog=%~dp0\\node.exe\"\r" +
            "\n) ELSE (\r" +
            "\n  @SET \"_prog=node\"\r" +
            "\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r" +
            "\n)\r" +
            "\n\r" +
            "\n\"%_prog%\"  --expose_gc \"%~dp0\\from.env.args\" %*\r" +
            "\n")
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
            "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
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
            "@SETLOCAL\r" +
            "\n\r" +
            "\n@IF EXIST \"%~dp0\\/usr/bin/sh.exe\" (\r" +
            "\n  @SET \"_prog=%~dp0\\/usr/bin/sh.exe\"\r" +
            "\n) ELSE (\r" +
            "\n  @SET \"_prog=/usr/bin/sh\"\r" +
            "\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r" +
            "\n)\r" +
            "\n\r" +
            "\n\"%_prog%\"  \"%~dp0\\from.sh\" %*\r" +
            "\n")
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
            "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
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
            "@SETLOCAL\r" +
            "\n\r" +
            "\n@IF EXIST \"%~dp0\\/usr/bin/sh.exe\" (\r" +
            "\n  @SET \"_prog=%~dp0\\/usr/bin/sh.exe\"\r" +
            "\n) ELSE (\r" +
            "\n  @SET \"_prog=/usr/bin/sh\"\r" +
            "\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r" +
            "\n)\r" +
            "\n\r" +
            "\n\"%_prog%\"  -x \"%~dp0\\from.sh.args\" %*\r" +
            "\n")
    t.end()
  })
})
