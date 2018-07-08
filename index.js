'use strict'
// On windows, create a .cmd file.
// Read the #! in the file to see what it uses.  The vast majority
// of the time, this will be either:
// "#!/usr/bin/env <prog> <args...>"
// or:
// "#!<prog> <args...>"
//
// Write a binroot/pkg.bin + ".cmd" file that has this line in it:
// @<prog> <args...> %~dp0<target> %*

module.exports = cmdShim
cmdShim.ifExists = cmdShimIfExists

const fs = require('mz/fs')

const mkdir = require('mkdirp-promise')
const path = require('path')
const isWindows = require('is-windows')
const shebangExpr = /^#!\s*(?:\/usr\/bin\/env)?\s*([^ \t]+)(.*)$/
const DEFAULT_OPTIONS = {
  createCmdFile: isWindows()
}

function cmdShimIfExists (src, to, opts) {
  opts = Object.assign({}, DEFAULT_OPTIONS, opts)
  return fs.stat(src)
    .then(() => cmdShim(src, to, opts))
    .catch(() => {})
}

// Try to unlink, but ignore errors.
// Any problems will surface later.
function rm (path) {
  return fs.unlink(path).catch(() => {})
}

function cmdShim (src, to, opts) {
  opts = Object.assign({}, DEFAULT_OPTIONS, opts)
  return fs.stat(src)
    .then(() => cmdShim_(src, to, opts))
}

function cmdShim_ (src, to, opts) {
  return Promise.all([
    rm(to),
    rm(`${to}.ps1`),
    opts.createCmdFile && rm(`${to}.cmd`)
  ])
  .then(() => writeShim(src, to, opts))
}

function writeShim (src, to, opts) {
  opts = opts || {}
  const defaultArgs = opts.preserveSymlinks ? '--preserve-symlinks' : ''
  // make a cmd file and a sh script
  // First, check if the bin is a #! of some sort.
  // If not, then assume it's something that'll be compiled, or some other
  // sort of script, and just call it directly.
  return mkdir(path.dirname(to))
    .then(() => {
      return fs.readFile(src, 'utf8')
        .then(data => {
          const firstLine = data.trim().split(/\r*\n/)[0]
          const shebang = firstLine.match(shebangExpr)
          if (!shebang) return writeShim_(src, to, Object.assign({}, opts, {args: defaultArgs}))
          const prog = shebang[1]
          const args = shebang[2] && (defaultArgs && (shebang[2] + ' ' + defaultArgs) || shebang[2]) || defaultArgs
          return writeShim_(src, to, Object.assign({}, opts, {prog, args}))
        })
        .catch(() => writeShim_(src, to, Object.assign({}, opts, {args: defaultArgs})))
    })
}

function writeShim_ (src, to, opts) {
  opts = opts || {}
  // Create PowerShell file by default if the option hasn't been specified
  opts.createPwshFile = (typeof opts.createPwshFile !== 'undefined' ? opts.createPwshFile : true)
  let shTarget = path.relative(path.dirname(to), src)
  let target = shTarget.split('/').join('\\')
  let longProg
  let prog = opts.prog
  let shProg = prog && prog.split('\\').join('/')
  let shLongProg
  let pwshProg = shProg && `"${shProg}$exe"`
  let pwshLongProg
  shTarget = shTarget.split('\\').join('/')
  let args = opts.args || ''
  if (!prog) {
    prog = `"%~dp0\\${target}"`
    shProg = `"$basedir/${shTarget}"`
    pwshProg = shProg
    args = ''
    target = ''
    shTarget = ''
  } else {
    longProg = `"%~dp0\\${prog}.exe"`
    shLongProg = '"$basedir/' + prog + '"'
    pwshLongProg = `"$basedir/${prog}$exe"`
    target = `"%~dp0\\${target}"`
    shTarget = `"$basedir/${shTarget}"`
  }

  let cmd
  if (opts.createCmdFile) {
    // @IF EXIST "%~dp0\node.exe" (
    //   "%~dp0\node.exe" "%~dp0\.\node_modules\npm\bin\npm-cli.js" %*
    // ) ELSE (
    //   SETLOCAL
    //   SET PATHEXT=%PATHEXT:;.JS;=;%
    //   node "%~dp0\.\node_modules\npm\bin\npm-cli.js" %*
    // )
    cmd = opts.nodePath ? `@SET NODE_PATH=${opts.nodePath}\r\n` : ''
    if (longProg) {
      cmd += '@IF EXIST ' + longProg + ' (\r\n' +
        '  ' + longProg + ' ' + args + ' ' + target + ' %*\r\n' +
        ') ELSE (\r\n' +
        '  @SETLOCAL\r\n' +
        '  @SET PATHEXT=%PATHEXT:;.JS;=;%\r\n' +
        '  ' + prog + ' ' + args + ' ' + target + ' %*\r\n' +
        ')'
    } else {
      cmd += `@${prog} ${args} ${target} %*\r\n`
    }
  }

  // #!/bin/sh
  // basedir=`dirname "$0"`
  //
  // case `uname` in
  //     *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
  // esac
  //
  // if [ -x "$basedir/node.exe" ]; then
  //   "$basedir/node.exe" "$basedir/node_modules/npm/bin/npm-cli.js" "$@"
  //   ret=$?
  // else
  //   node "$basedir/node_modules/npm/bin/npm-cli.js" "$@"
  //   ret=$?
  // fi
  // exit $ret

  let sh = '#!/bin/sh\n'
  sh = sh +
    "basedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")\n" +
    '\n' +
    'case `uname` in\n' +
    '    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;\n' +
    'esac\n' +
    '\n'
  const env = opts.nodePath ? `NODE_PATH="${opts.nodePath}" ` : ''

  if (shLongProg) {
    sh = sh +
      'if [ -x ' + shLongProg + ' ]; then\n' +
      '  ' + env + shLongProg + ' ' + args + ' ' + shTarget + ' "$@"\n' +
      '  ret=$?\n' +
      'else \n' +
      '  ' + env + shProg + ' ' + args + ' ' + shTarget + ' "$@"\n' +
      '  ret=$?\n' +
      'fi\n' +
      'exit $ret\n'
  } else {
    sh = sh + env + shProg + ' ' + args + ' ' + shTarget + ' "$@"\n' +
      'exit $?\n'
  }

  // #!/usr/bin/env pwsh
  // $basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent
  //
  // $ret=0
  // $exe = ""
  // if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  //   # Fix case when both the Windows and Linux builds of Node
  //   # are installed in the same directory
  //   $exe = ".exe"
  // }
  // if (Test-Path "$basedir/node") {
  //   & "$basedir/node$exe" "$basedir/node_modules/npm/bin/npm-cli.js" $args
  //   $ret=$LASTEXITCODE
  // } else {
  //   & "node$exe" "$basedir/node_modules/npm/bin/npm-cli.js" $args
  //   $ret=$LASTEXITCODE
  // }
  // exit $ret
  let pwsh = '#!/usr/bin/env pwsh\n' +
    '$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n' +
    '\n' +
    '$exe=""\n' +
    'if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {\n' +
    '  # Fix case when both the Windows and Linux builds of Node\n' +
    '  # are installed in the same directory\n' +
    '  $exe=".exe"\n' +
    '}\n'
  if (shLongProg) {
    pwsh = pwsh +
      '$ret=0\n' +
      `if (Test-Path ${pwshLongProg}) {\n` +
      `  & ${pwshLongProg} ${args} ${shTarget} $args\n` +
      '  $ret=$LASTEXITCODE\n' +
      '} else {\n' +
      `  & ${pwshProg} ${args} ${shTarget} $args\n` +
      '  $ret=$LASTEXITCODE\n' +
      '}\n' +
      'exit $ret\n'
  } else {
    pwsh = pwsh +
      `& ${pwshProg} ${args} ${shTarget} $args\n` +
      'exit $LASTEXITCODE\n'
  }

  return Promise.all([
    opts.createCmdFile && fs.writeFile(to + '.cmd', cmd, 'utf8'),
    opts.createPwshFile && fs.writeFile(`${to}.ps1`, pwsh, 'utf8'),
    fs.writeFile(to, sh, 'utf8')
  ])
  .then(() => chmodShim(to, opts))
}

function chmodShim (to, {createCmdFile, createPwshFile}) {
  return Promise.all([
    fs.chmod(to, 0o755),
    createPwshFile && fs.chmod(`${to}.ps1`, 0o755),
    createCmdFile && fs.chmod(`${to}.cmd`, 0o755)
  ])
}
