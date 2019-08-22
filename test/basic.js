
'use strict'
const path = require('path')
const tape = require('tape')
const promisifyTape = require('tape-promise').default
const test = promisifyTape(tape)
const {fixtures, fixtures2, fs} = require('./00-setup')

const cmdShim = require('../')

test('no cmd file', function (t) {
  const src = path.resolve(fixtures, 'src.exe')
  const to = path.resolve(fixtures, 'exe.shim')
  return cmdShim(src, to, {createCmdFile: false, fs})
    .then(function () {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(`${to}.ps1`, 'utf8'))

      t.equal(fs.readFileSync(to, 'utf8'),
        '#!/bin/sh' +
        "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
        '\n' +
        '\ncase `uname` in' +
        '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
        '\nesac' +
        '\n\n' +
        '"$basedir/src.exe"   "$@"\nexit $?\n')
      t.throws(() => fs.readFileSync(to + '.cmd', 'utf8'), 'cmd file not created')
      t.equal(fs.readFileSync(`${to}.ps1`, 'utf8'),
        '#!/usr/bin/env pwsh' +
        '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
        '\n' +
        '\n$exe=""' +
        '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
        '\n  # Fix case when both the Windows and Linux builds of Node' +
        '\n  # are installed in the same directory' +
        '\n  $exe=".exe"' +
        '\n}' +
        '\n& "$basedir/src.exe"   $args' +
        '\nexit $LASTEXITCODE' +
        '\n')
    })
})

test('no shebang', function (t) {
  const src = path.resolve(fixtures, 'src.exe')
  const to = path.resolve(fixtures, 'exe.shim')
  return cmdShim(src, to, {createCmdFile: true, fs})
    .then(function () {
      t.equal(fs.readFileSync(to, 'utf8'),
        '#!/bin/sh' +
        "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
        '\n' +
        '\ncase `uname` in' +
        '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
        '\nesac' +
        '\n\n' +
        '"$basedir/src.exe"   "$@"\nexit $?\n')
      t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
        '@"%~dp0\\src.exe"   %*\r\n')
      t.equal(fs.readFileSync(`${to}.ps1`, 'utf8'),
        '#!/usr/bin/env pwsh' +
        '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
        '\n' +
        '\n$exe=""' +
        '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
        '\n  # Fix case when both the Windows and Linux builds of Node' +
        '\n  # are installed in the same directory' +
        '\n  $exe=".exe"' +
        '\n}' +
        '\n& "$basedir/src.exe"   $args' +
        '\nexit $LASTEXITCODE' +
        '\n')
    })
})

test('env shebang', function (t) {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  return cmdShim(src, to, {createCmdFile: true, fs})
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))
      console.error('%j', fs.readFileSync(`${to}.ps1`, 'utf8'))

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
      t.equal(fs.readFileSync(`${to}.ps1`, 'utf8'),
        '#!/usr/bin/env pwsh' +
        '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
        '\n' +
        '\n$exe=""' +
        '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
        '\n  # Fix case when both the Windows and Linux builds of Node' +
        '\n  # are installed in the same directory' +
        '\n  $exe=".exe"' +
        '\n}' +
        '\n$ret=0' +
        '\nif (Test-Path "$basedir/node$exe") {' +
        '\n  & "$basedir/node$exe"  "$basedir/src.env" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n} else {' +
        '\n  & "node$exe"  "$basedir/src.env" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n}' +
        '\nexit $ret' +
        '\n')
      t.end()
    })
})

test('env shebang with NODE_PATH', function (t) {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  return cmdShim(src, to, {nodePath: ['/john/src/node_modules', '/bin/node/node_modules'], createCmdFile: true, fs})
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))
      console.error('%j', fs.readFileSync(`${to}.ps1`, 'utf8'))

      t.equal(fs.readFileSync(to, 'utf8'),
        '#!/bin/sh' +
        "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
        '\n' +
        '\ncase `uname` in' +
        '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
        '\nesac' +
        '\n' +
        '\nif [ -x "$basedir/node" ]; then' +
        '\n  NODE_PATH="/john/src/node_modules:/bin/node/node_modules" "$basedir/node"  "$basedir/src.env" "$@"' +
        '\n  ret=$?' +
        '\nelse ' +
        '\n  NODE_PATH="/john/src/node_modules:/bin/node/node_modules" node  "$basedir/src.env" "$@"' +
        '\n  ret=$?' +
        '\nfi' +
        '\nexit $ret' +
        '\n')
      t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
        '@SET NODE_PATH=\\john\\src\\node_modules;\\bin\\node\\node_modules\r' +
        '\n@IF EXIST "%~dp0\\node.exe" (\r' +
        '\n  "%~dp0\\node.exe"  "%~dp0\\src.env" %*\r' +
        '\n) ELSE (\r' +
        '\n  @SETLOCAL\r' +
        '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
        '\n  node  "%~dp0\\src.env" %*\r' +
        '\n)')
      t.equal(fs.readFileSync(`${to}.ps1`, 'utf8'),
        '#!/usr/bin/env pwsh' +
        '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
        '\n' +
        '\n$exe=""' +
        '\n$env_node_path=$env:NODE_PATH' +
        '\n$env:NODE_PATH="\\john\\src\\node_modules;\\bin\\node\\node_modules"' +
        '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
        '\n  # Fix case when both the Windows and Linux builds of Node' +
        '\n  # are installed in the same directory' +
        '\n  $exe=".exe"' +
        '\n} else {' +
        '\n  $env:NODE_PATH="/john/src/node_modules:/bin/node/node_modules"' +
        '\n}' +
        '\n$ret=0' +
        '\nif (Test-Path "$basedir/node$exe") {' +
        '\n  & "$basedir/node$exe"  "$basedir/src.env" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n} else {' +
        '\n  & "node$exe"  "$basedir/src.env" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n}' +
        '\n$env:NODE_PATH=$env_node_path' +
        '\nexit $ret' +
        '\n')
      t.end()
    })
})

test('env shebang with default args', function (t) {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  return cmdShim(src, to, { preserveSymlinks: true, createCmdFile: true, fs })
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))
      console.error('%j', fs.readFileSync(`${to}.ps1`, 'utf8'))

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
      t.equal(fs.readFileSync(`${to}.ps1`, 'utf8'),
        '#!/usr/bin/env pwsh' +
        '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
        '\n' +
        '\n$exe=""' +
        '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
        '\n  # Fix case when both the Windows and Linux builds of Node' +
        '\n  # are installed in the same directory' +
        '\n  $exe=".exe"' +
        '\n}' +
        '\n$ret=0' +
        '\nif (Test-Path "$basedir/node$exe") {' +
        '\n  & "$basedir/node$exe" --preserve-symlinks "$basedir/src.env" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n} else {' +
        '\n  & "node$exe" --preserve-symlinks "$basedir/src.env" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n}' +
        '\nexit $ret' +
        '\n')
      t.end()
    })
})

test('env shebang with args', function (t) {
  const src = path.resolve(fixtures, 'src.env.args')
  const to = path.resolve(fixtures, 'env.args.shim')
  return cmdShim(src, to, {createCmdFile: true, fs})
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))
      console.error('%j', fs.readFileSync(`${to}.ps1`, 'utf8'))

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
      t.equal(fs.readFileSync(`${to}.ps1`, 'utf8'),
        '#!/usr/bin/env pwsh' +
        '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
        '\n' +
        '\n$exe=""' +
        '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
        '\n  # Fix case when both the Windows and Linux builds of Node' +
        '\n  # are installed in the same directory' +
        '\n  $exe=".exe"' +
        '\n}' +
        '\n$ret=0' +
        '\nif (Test-Path "$basedir/node$exe") {' +
        '\n  & "$basedir/node$exe"  --expose_gc "$basedir/src.env.args" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n} else {' +
        '\n  & "node$exe"  --expose_gc "$basedir/src.env.args" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n}' +
        '\nexit $ret' +
        '\n')
      t.end()
    })
})

test('explicit shebang', function (t) {
  const src = path.resolve(fixtures, 'src.sh')
  const to = path.resolve(fixtures, 'sh.shim')
  return cmdShim(src, to, {createCmdFile: true, fs})
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))
      console.error('%j', fs.readFileSync(`${to}.ps1`, 'utf8'))

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

      t.equal(fs.readFileSync(`${to}.ps1`, 'utf8'),
        '#!/usr/bin/env pwsh' +
        '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
        '\n' +
        '\n$exe=""' +
        '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
        '\n  # Fix case when both the Windows and Linux builds of Node' +
        '\n  # are installed in the same directory' +
        '\n  $exe=".exe"' +
        '\n}' +
        '\n$ret=0' +
        '\nif (Test-Path "$basedir//usr/bin/sh$exe") {' +
        '\n  & "$basedir//usr/bin/sh$exe"  "$basedir/src.sh" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n} else {' +
        '\n  & "/usr/bin/sh$exe"  "$basedir/src.sh" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n}' +
        '\nexit $ret' +
        '\n')
      t.end()
    })
})

test('explicit shebang with args', function (t) {
  const src = path.resolve(fixtures, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  return cmdShim(src, to, {createCmdFile: true, fs})
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))
      console.error('%j', fs.readFileSync(`${to}.ps1`, 'utf8'))

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

      t.equal(fs.readFileSync(`${to}.ps1`, 'utf8'),
        '#!/usr/bin/env pwsh' +
        '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
        '\n' +
        '\n$exe=""' +
        '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
        '\n  # Fix case when both the Windows and Linux builds of Node' +
        '\n  # are installed in the same directory' +
        '\n  $exe=".exe"' +
        '\n}' +
        '\n$ret=0' +
        '\nif (Test-Path "$basedir//usr/bin/sh$exe") {' +
        '\n  & "$basedir//usr/bin/sh$exe"  -x "$basedir/src.sh.args" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n} else {' +
        '\n  & "/usr/bin/sh$exe"  -x "$basedir/src.sh.args" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n}' +
        '\nexit $ret' +
        '\n')
      t.end()
    })
})

;(process.platform === 'win32' ? test : test.skip)('explicit shebang with args, linking to another drive on Windows', function (t) {
  const src = path.resolve(fixtures2, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  return cmdShim(src, to, {createCmdFile: true, fs})
    .then(() => {
      console.error('%j', fs.readFileSync(to, 'utf8'))
      console.error('%j', fs.readFileSync(to + '.cmd', 'utf8'))
      console.error('%j', fs.readFileSync(`${to}.ps1`, 'utf8'))

      t.equal(fs.readFileSync(to, 'utf8'),
        '#!/bin/sh' +
        "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
        '\n' +
        '\ncase `uname` in' +
        '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
        '\nesac' +
        '\n' +
        '\nif [ -x "$basedir//usr/bin/sh" ]; then' +
        '\n  "$basedir//usr/bin/sh"  -x "J:/cmd-shim/fixtures/src.sh.args" "$@"' +
        '\n  ret=$?' +
        '\nelse ' +
        '\n  /usr/bin/sh  -x "J:/cmd-shim/fixtures/src.sh.args" "$@"' +
        '\n  ret=$?' +
        '\nfi' +
        '\nexit $ret' +
        '\n')

      t.equal(fs.readFileSync(to + '.cmd', 'utf8'),
        '@IF EXIST "%~dp0\\/usr/bin/sh.exe" (\r' +
        '\n  "%~dp0\\/usr/bin/sh.exe"  -x "J:\\cmd-shim\\fixtures\\src.sh.args" %*\r' +
        '\n) ELSE (\r' +
        '\n  @SETLOCAL\r' +
        '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
        '\n  /usr/bin/sh  -x "J:\\cmd-shim\\fixtures\\src.sh.args" %*\r' +
        '\n)')

      t.equal(fs.readFileSync(`${to}.ps1`, 'utf8'),
        '#!/usr/bin/env pwsh' +
        '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
        '\n' +
        '\n$exe=""' +
        '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
        '\n  # Fix case when both the Windows and Linux builds of Node' +
        '\n  # are installed in the same directory' +
        '\n  $exe=".exe"' +
        '\n}' +
        '\n$ret=0' +
        '\nif (Test-Path "$basedir//usr/bin/sh$exe") {' +
        '\n  & "$basedir//usr/bin/sh$exe"  -x "J:/cmd-shim/fixtures/src.sh.args" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n} else {' +
        '\n  & "/usr/bin/sh$exe"  -x "J:/cmd-shim/fixtures/src.sh.args" $args' +
        '\n  $ret=$LASTEXITCODE' +
        '\n}' +
        '\nexit $ret' +
        '\n')
      t.end()
    })
})
