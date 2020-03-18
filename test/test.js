
'use strict'
const path = require('path')
const { fixtures, fixtures2, fs } = require('./setup')

const cmdShim = require('../')

test('no cmd file', async () => {
  const src = path.resolve(fixtures, 'src.exe')
  const to = path.resolve(fixtures, 'exe.shim')
  await cmdShim(src, to, { createCmdFile: false, fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
    '#!/bin/sh' +
    "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
    '\n' +
    '\ncase `uname` in' +
    '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
    '\nesac' +
    '\n\n' +
    '"$basedir/src.exe"   "$@"\nexit $?\n')
  expect(() => fs.readFileSync(to + '.cmd', 'utf8')).toThrow('no such file or directory')
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
    '#!/usr/bin/env pwsh' +
    '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
    '\n' +
    '\n$exe=""' +
    '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
    '\n  # Fix case when both the Windows and Linux builds of Node' +
    '\n  # are installed in the same directory' +
    '\n  $exe=".exe"' +
    '\n}' +
    '\n# Support pipeline input' +
    '\nif ($MyInvocation.ExpectingInput) {' +
    '\n  $input | & "$basedir/src.exe"   $args' +
    '\n} else {' +
    '\n  & "$basedir/src.exe"   $args' +
    '\n}' +
    '\nexit $LASTEXITCODE' +
    '\n')
})

test('no shebang', async () => {
  const src = path.resolve(fixtures, 'src.exe')
  const to = path.resolve(fixtures, 'exe.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
    '#!/bin/sh' +
    "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
    '\n' +
    '\ncase `uname` in' +
    '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
    '\nesac' +
    '\n\n' +
    '"$basedir/src.exe"   "$@"\nexit $?\n')
  expect(fs.readFileSync(to + '.cmd', 'utf8')).toBe('@"%~dp0\\src.exe"   %*\r\n')
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
    '#!/usr/bin/env pwsh' +
    '\n$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent' +
    '\n' +
    '\n$exe=""' +
    '\nif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {' +
    '\n  # Fix case when both the Windows and Linux builds of Node' +
    '\n  # are installed in the same directory' +
    '\n  $exe=".exe"' +
    '\n}' +
    '\n# Support pipeline input' +
    '\nif ($MyInvocation.ExpectingInput) {' +
    '\n  $input | & "$basedir/src.exe"   $args' +
    '\n} else {' +
    '\n  & "$basedir/src.exe"   $args' +
    '\n}' +
    '\nexit $LASTEXITCODE' +
    '\n')
})

test('env shebang', async () => {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
    '#!/bin/sh' +
    "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
    '\n' +
    '\ncase `uname` in' +
    '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
    '\nesac' +
    '\n' +
    '\nif [ -x "$basedir/node" ]; then' +
    '\n  exec "$basedir/node"  "$basedir/src.env" "$@"' +
    '\nelse ' +
    '\n  exec node  "$basedir/src.env" "$@"' +
    '\nfi' +
    '\n')
  expect(fs.readFileSync(to + '.cmd', 'utf8')).toBe(
    '@IF EXIST "%~dp0\\node.exe" (\r' +
    '\n  "%~dp0\\node.exe"  "%~dp0\\src.env" %*\r' +
    '\n) ELSE (\r' +
    '\n  @SETLOCAL\r' +
    '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
    '\n  node  "%~dp0\\src.env" %*\r' +
    '\n)')
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
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
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "$basedir/node$exe"  "$basedir/src.env" $args' +
    '\n  } else {' +
    '\n    & "$basedir/node$exe"  "$basedir/src.env" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n} else {' +
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "node$exe"  "$basedir/src.env" $args' +
    '\n  } else {' +
    '\n    & "node$exe"  "$basedir/src.env" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n}' +
    '\nexit $ret' +
    '\n')
})

test('env shebang with NODE_PATH', async () => {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  await cmdShim(src, to, { nodePath: ['/john/src/node_modules', '/bin/node/node_modules'], createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
    '#!/bin/sh' +
    "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
    '\n' +
    '\ncase `uname` in' +
    '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
    '\nesac' +
    '\n' +
    '\nexport NODE_PATH="/john/src/node_modules:/bin/node/node_modules"' +
    '\nif [ -x "$basedir/node" ]; then' +
    '\n  exec "$basedir/node"  "$basedir/src.env" "$@"' +
    '\nelse ' +
    '\n  exec node  "$basedir/src.env" "$@"' +
    '\nfi' +
    '\n')
  expect(fs.readFileSync(to + '.cmd', 'utf8')).toBe(
    '@SET NODE_PATH=\\john\\src\\node_modules;\\bin\\node\\node_modules\r' +
    '\n@IF EXIST "%~dp0\\node.exe" (\r' +
    '\n  "%~dp0\\node.exe"  "%~dp0\\src.env" %*\r' +
    '\n) ELSE (\r' +
    '\n  @SETLOCAL\r' +
    '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
    '\n  node  "%~dp0\\src.env" %*\r' +
    '\n)')
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
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
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "$basedir/node$exe"  "$basedir/src.env" $args' +
    '\n  } else {' +
    '\n    & "$basedir/node$exe"  "$basedir/src.env" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n} else {' +
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "node$exe"  "$basedir/src.env" $args' +
    '\n  } else {' +
    '\n    & "node$exe"  "$basedir/src.env" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n}' +
    '\n$env:NODE_PATH=$env_node_path' +
    '\nexit $ret' +
    '\n')
})

test('env shebang with default args', async () => {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  await cmdShim(src, to, { preserveSymlinks: true, createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
    '#!/bin/sh' +
    "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
    '\n' +
    '\ncase `uname` in' +
    '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
    '\nesac' +
    '\n' +
    '\nif [ -x "$basedir/node" ]; then' +
    '\n  exec "$basedir/node" --preserve-symlinks "$basedir/src.env" "$@"' +
    '\nelse ' +
    '\n  exec node --preserve-symlinks "$basedir/src.env" "$@"' +
    '\nfi' +
    '\n')
  expect(fs.readFileSync(to + '.cmd', 'utf8')).toBe(
    '@IF EXIST "%~dp0\\node.exe" (\r' +
    '\n  "%~dp0\\node.exe" --preserve-symlinks "%~dp0\\src.env" %*\r' +
    '\n) ELSE (\r' +
    '\n  @SETLOCAL\r' +
    '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
    '\n  node --preserve-symlinks "%~dp0\\src.env" %*\r' +
    '\n)')
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
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
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "$basedir/node$exe" --preserve-symlinks "$basedir/src.env" $args' +
    '\n  } else {' +
    '\n    & "$basedir/node$exe" --preserve-symlinks "$basedir/src.env" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n} else {' +
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "node$exe" --preserve-symlinks "$basedir/src.env" $args' +
    '\n  } else {' +
    '\n    & "node$exe" --preserve-symlinks "$basedir/src.env" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n}' +
    '\nexit $ret' +
    '\n')
})

test('env shebang with args', async () => {
  const src = path.resolve(fixtures, 'src.env.args')
  const to = path.resolve(fixtures, 'env.args.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
    '#!/bin/sh' +
    "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
    '\n' +
    '\ncase `uname` in' +
    '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
    '\nesac' +
    '\n' +
    '\nif [ -x "$basedir/node" ]; then' +
    '\n  exec "$basedir/node"  --expose_gc "$basedir/src.env.args" "$@"' +
    '\nelse ' +
    '\n  exec node  --expose_gc "$basedir/src.env.args" "$@"' +
    '\nfi' +
    '\n')
  expect(fs.readFileSync(to + '.cmd', 'utf8')).toBe(
    '@IF EXIST "%~dp0\\node.exe" (\r' +
    '\n  "%~dp0\\node.exe"  --expose_gc "%~dp0\\src.env.args" %*\r' +
    '\n) ELSE (\r' +
    '\n  @SETLOCAL\r' +
    '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
    '\n  node  --expose_gc "%~dp0\\src.env.args" %*\r' +
    '\n)')
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
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
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "$basedir/node$exe"  --expose_gc "$basedir/src.env.args" $args' +
    '\n  } else {' +
    '\n    & "$basedir/node$exe"  --expose_gc "$basedir/src.env.args" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n} else {' +
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "node$exe"  --expose_gc "$basedir/src.env.args" $args' +
    '\n  } else {' +
    '\n    & "node$exe"  --expose_gc "$basedir/src.env.args" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n}' +
    '\nexit $ret' +
    '\n')
})

test('explicit shebang', async () => {
  const src = path.resolve(fixtures, 'src.sh')
  const to = path.resolve(fixtures, 'sh.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
    '#!/bin/sh' +
    "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
    '\n' +
    '\ncase `uname` in' +
    '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
    '\nesac' +
    '\n' +
    '\nif [ -x "$basedir//usr/bin/sh" ]; then' +
    '\n  exec "$basedir//usr/bin/sh"  "$basedir/src.sh" "$@"' +
    '\nelse ' +
    '\n  exec /usr/bin/sh  "$basedir/src.sh" "$@"' +
    '\nfi' +
    '\n')

  expect(fs.readFileSync(to + '.cmd', 'utf8')).toBe(
    '@IF EXIST "%~dp0\\/usr/bin/sh.exe" (\r' +
    '\n  "%~dp0\\/usr/bin/sh.exe"  "%~dp0\\src.sh" %*\r' +
    '\n) ELSE (\r' +
    '\n  @SETLOCAL\r' +
    '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
    '\n  /usr/bin/sh  "%~dp0\\src.sh" %*\r' +
    '\n)')

  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
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
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "$basedir//usr/bin/sh$exe"  "$basedir/src.sh" $args' +
    '\n  } else {' +
    '\n    & "$basedir//usr/bin/sh$exe"  "$basedir/src.sh" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n} else {' +
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "/usr/bin/sh$exe"  "$basedir/src.sh" $args' +
    '\n  } else {' +
    '\n    & "/usr/bin/sh$exe"  "$basedir/src.sh" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n}' +
    '\nexit $ret' +
    '\n')
})

test('explicit shebang with args', async () => {
  const src = path.resolve(fixtures, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
    '#!/bin/sh' +
    "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
    '\n' +
    '\ncase `uname` in' +
    '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
    '\nesac' +
    '\n' +
    '\nif [ -x "$basedir//usr/bin/sh" ]; then' +
    '\n  exec "$basedir//usr/bin/sh"  -x "$basedir/src.sh.args" "$@"' +
    '\nelse ' +
    '\n  exec /usr/bin/sh  -x "$basedir/src.sh.args" "$@"' +
    '\nfi' +
    '\n')

  expect(fs.readFileSync(to + '.cmd', 'utf8')).toBe(
    '@IF EXIST "%~dp0\\/usr/bin/sh.exe" (\r' +
    '\n  "%~dp0\\/usr/bin/sh.exe"  -x "%~dp0\\src.sh.args" %*\r' +
    '\n) ELSE (\r' +
    '\n  @SETLOCAL\r' +
    '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
    '\n  /usr/bin/sh  -x "%~dp0\\src.sh.args" %*\r' +
    '\n)')

  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
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
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "$basedir//usr/bin/sh$exe"  -x "$basedir/src.sh.args" $args' +
    '\n  } else {' +
    '\n    & "$basedir//usr/bin/sh$exe"  -x "$basedir/src.sh.args" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n} else {' +
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "/usr/bin/sh$exe"  -x "$basedir/src.sh.args" $args' +
    '\n  } else {' +
    '\n    & "/usr/bin/sh$exe"  -x "$basedir/src.sh.args" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n}' +
    '\nexit $ret' +
    '\n')
})

test('explicit shebang with prog args', async () => {
  const src = path.resolve(fixtures, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  await cmdShim(src, to, { createCmdFile: true, progArgs: ['hello'], fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
    '#!/bin/sh' +
    "\nbasedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")" +
    '\n' +
    '\ncase `uname` in' +
    '\n    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;' +
    '\nesac' +
    '\n' +
    '\nif [ -x "$basedir//usr/bin/sh" ]; then' +
    '\n  exec "$basedir//usr/bin/sh"  -x "$basedir/src.sh.args" hello "$@"' +
    '\nelse ' +
    '\n  exec /usr/bin/sh  -x "$basedir/src.sh.args" hello "$@"' +
    '\nfi' +
    '\n')

  expect(fs.readFileSync(to + '.cmd', 'utf8')).toBe(
    '@IF EXIST "%~dp0\\/usr/bin/sh.exe" (\r' +
    '\n  "%~dp0\\/usr/bin/sh.exe"  -x "%~dp0\\src.sh.args" hello %*\r' +
    '\n) ELSE (\r' +
    '\n  @SETLOCAL\r' +
    '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
    '\n  /usr/bin/sh  -x "%~dp0\\src.sh.args" hello %*\r' +
    '\n)')

  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
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
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "$basedir//usr/bin/sh$exe"  -x "$basedir/src.sh.args" hello $args' +
    '\n  } else {' +
    '\n    & "$basedir//usr/bin/sh$exe"  -x "$basedir/src.sh.args" hello $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n} else {' +
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "/usr/bin/sh$exe"  -x "$basedir/src.sh.args" hello $args' +
    '\n  } else {' +
    '\n    & "/usr/bin/sh$exe"  -x "$basedir/src.sh.args" hello $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n}' +
    '\nexit $ret' +
    '\n')
})

;(process.platform === 'win32' ? test : test.skip)('explicit shebang with args, linking to another drive on Windows', async () => {
  const src = path.resolve(fixtures2, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toBe(
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

  expect(fs.readFileSync(to + '.cmd', 'utf8')).toBe(
    '@IF EXIST "%~dp0\\/usr/bin/sh.exe" (\r' +
    '\n  "%~dp0\\/usr/bin/sh.exe"  -x "J:\\cmd-shim\\fixtures\\src.sh.args" %*\r' +
    '\n) ELSE (\r' +
    '\n  @SETLOCAL\r' +
    '\n  @SET PATHEXT=%PATHEXT:;.JS;=;%\r' +
    '\n  /usr/bin/sh  -x "J:\\cmd-shim\\fixtures\\src.sh.args" %*\r' +
    '\n)')

  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toBe(
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
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "$basedir//usr/bin/sh$exe"  -x "J:/cmd-shim/fixtures/src.sh.args" $args' +
    '\n  } else {' +
    '\n    & "$basedir//usr/bin/sh$exe"  -x "J:/cmd-shim/fixtures/src.sh.args" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n} else {' +
    '\n  # Support pipeline input' +
    '\n  if ($MyInvocation.ExpectingInput) {' +
    '\n    $input | & "/usr/bin/sh$exe"  -x "J:/cmd-shim/fixtures/src.sh.args" $args' +
    '\n  } else {' +
    '\n    & "/usr/bin/sh$exe"  -x "J:/cmd-shim/fixtures/src.sh.args" $args' +
    '\n  }' +
    '\n  $ret=$LASTEXITCODE' +
    '\n}' +
    '\nexit $ret' +
    '\n')
})
