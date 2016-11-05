'use strict'
const tape = require('tape')
const promisifyTape = require('tape-promise').default
const test = promisifyTape(tape)
const fs = require('fs')
const path = require('path')
const fixtures = path.resolve(__dirname, 'fixtures')

const cmdShim = require('../')

test('no shebang', function (t) {
  const src = path.resolve(fixtures, 'src.exe')
  const to = path.resolve(fixtures, 'exe.shim')
  return cmdShim(src, to)
    .then(function () {
      t.equal(fs.readFileSync(to, 'utf8'),
              '"$basedir/src.exe"   "$@"\nexit $?\n')
      t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
              '@"%~dp0\\src.exe"   %*\r\n')
    })
})

test('env shebang', function (t) {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  return cmdShim(src, to)
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))

      t.equal(fs.readFileSync(to, 'utf8'),
              '#!/bin/sh' +
              "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
              '\n' +
              '\ncase `uname` in' +
              '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
              '\nesac' +
              '\n' +
              '\nif [ -x "$basedir/node" ]; then' +
              '\n  "$basedir/node"  "$basedir/src.env" "$@"' +
              '\n  ret=$?' +
              '\nelse ' +
              '\n  node  "$basedir/src.env" "$@"' +
              '\n  ret=$?' +
              '\nfi' +
              '\nexit $ret' +
              '\n')
      t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
              '@IF EXIST "%~dp0\\node.exe" (\r' +
              '\n  "%~dp0\\node.exe"  "%~dp0\\src.env" %*\r' +
              '\n) ELSE (\r' +
              '\n  @SETLOCAL\r' +
              '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
              '\n  node  "%~dp0\\src.env" %*\r' +
              '\n)')
      t.end()
    })
})

test('env shebang with default args', function (t) {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  return cmdShim(src, to, { preserveSymlinks: true })
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))

      t.equal(fs.readFileSync(to, 'utf8'),
              '#!/bin/sh' +
              "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
              '\n' +
              '\ncase `uname` in' +
              '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
              '\nesac' +
              '\n' +
              '\nif [ -x "$basedir/node" ]; then' +
              '\n  "$basedir/node" --preserve-symlinks "$basedir/src.env" "$@"' +
              '\n  ret=$?' +
              '\nelse ' +
              '\n  node --preserve-symlinks "$basedir/src.env" "$@"' +
              '\n  ret=$?' +
              '\nfi' +
              '\nexit $ret' +
              '\n')
      t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
              '@IF EXIST "%~dp0\\node.exe" (\r' +
              '\n  "%~dp0\\node.exe" --preserve-symlinks "%~dp0\\src.env" %*\r' +
              '\n) ELSE (\r' +
              '\n  @SETLOCAL\r' +
              '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
              '\n  node --preserve-symlinks "%~dp0\\src.env" %*\r' +
              '\n)')
      t.end()
    })
})

test('env shebang with args', function (t) {
  const src = path.resolve(fixtures, 'src.env.args')
  const to = path.resolve(fixtures, 'env.args.shim')
  return cmdShim(src, to)
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))

      t.equal(fs.readFileSync(to, 'utf8'),
              '#!/bin/sh' +
              "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
              '\n' +
              '\ncase `uname` in' +
              '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
              '\nesac' +
              '\n' +
              '\nif [ -x "$basedir/node" ]; then' +
              '\n  "$basedir/node"  --expose_gc "$basedir/src.env.args" "$@"' +
              '\n  ret=$?' +
              '\nelse ' +
              '\n  node  --expose_gc "$basedir/src.env.args" "$@"' +
              '\n  ret=$?' +
              '\nfi' +
              '\nexit $ret' +
              '\n')
      t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
              '@IF EXIST "%~dp0\\node.exe" (\r' +
              '\n  "%~dp0\\node.exe"  --expose_gc "%~dp0\\src.env.args" %*\r' +
              '\n) ELSE (\r' +
              '\n  @SETLOCAL\r' +
              '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
              '\n  node  --expose_gc "%~dp0\\src.env.args" %*\r' +
              '\n)')
      t.end()
    })
})

test('explicit shebang', function (t) {
  const src = path.resolve(fixtures, 'src.sh')
  const to = path.resolve(fixtures, 'sh.shim')
  return cmdShim(src, to)
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))

      t.equal(fs.readFileSync(to, 'utf8'),
              '#!/bin/sh' +
              "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
              '\n' +
              '\ncase `uname` in' +
              '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
              '\nesac' +
              '\n' +
              '\nif [ -x "$basedir//usr/bin/sh" ]; then' +
              '\n  "$basedir//usr/bin/sh"  "$basedir/src.sh" "$@"' +
              '\n  ret=$?' +
              '\nelse ' +
              '\n  /usr/bin/sh  "$basedir/src.sh" "$@"' +
              '\n  ret=$?' +
              '\nfi' +
              '\nexit $ret' +
              '\n')

      t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
              '@IF EXIST "%~dp0\\/usr/bin/sh.exe" (\r' +
              '\n  "%~dp0\\/usr/bin/sh.exe"  "%~dp0\\src.sh" %*\r' +
              '\n) ELSE (\r' +
              '\n  @SETLOCAL\r' +
              '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
              '\n  /usr/bin/sh  "%~dp0\\src.sh" %*\r' +
              '\n)')
      t.end()
    })
})

test('explicit shebang with args', function (t) {
  const src = path.resolve(fixtures, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  return cmdShim(src, to)
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))

      t.equal(fs.readFileSync(to, 'utf8'),
              '#!/bin/sh' +
              "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
              '\n' +
              '\ncase `uname` in' +
              '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
              '\nesac' +
              '\n' +
              '\nif [ -x "$basedir//usr/bin/sh" ]; then' +
              '\n  "$basedir//usr/bin/sh"  -x "$basedir/src.sh.args" "$@"' +
              '\n  ret=$?' +
              '\nelse ' +
              '\n  /usr/bin/sh  -x "$basedir/src.sh.args" "$@"' +
              '\n  ret=$?' +
              '\nfi' +
              '\nexit $ret' +
              '\n')

      t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
              '@IF EXIST "%~dp0\\/usr/bin/sh.exe" (\r' +
              '\n  "%~dp0\\/usr/bin/sh.exe"  -x "%~dp0\\src.sh.args" %*\r' +
              '\n) ELSE (\r' +
              '\n  @SETLOCAL\r' +
              '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
              '\n  /usr/bin/sh  -x "%~dp0\\src.sh.args" %*\r' +
              '\n)')
      t.end()
    })
})
