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

var fs = require("graceful-fs")

var mkdir = require("mkdirp")
  , path = require("path")
  , shebangExpr = /^#\!\s*(?:\/usr\/bin\/env)?\s*([^ \t]+)(.*)$/

function cmdShimIfExists (from, to, cb) {
  fs.stat(from, function (er) {
    if (er) return cb()
    cmdShim(from, to, cb)
  })
}

// Try to unlink, but ignore errors.
// Any problems will surface later.
function rm (path, cb) {
  fs.unlink(path, function(er) {
    cb()
  })
}

function cmdShim (from, to, cb) {
  fs.stat(from, function (er, stat) {
    if (er)
      return cb(er)

    cmdShim_(from, to, cb)
  })
}

function cmdShim_ (from, to, cb) {
  var then = times(2, next, cb)
  rm(to, then)
  rm(to + ".cmd", then)

  function next(er) {
    writeShim(from, to, cb)
  }
}

function writeShim (from, to, cb) {
  // make a cmd file and a sh script
  // First, check if the bin is a #! of some sort.
  // If not, then assume it's something that'll be compiled, or some other
  // sort of script, and just call it directly.
  mkdir(path.dirname(to), function (er) {
    if (er)
      return cb(er)
    fs.readFile(from, "utf8", function (er, data) {
      if (er) return writeShim_(from, to, null, null, cb)
      var firstLine = data.trim().split(/\r*\n/)[0]
        , shebang = firstLine.match(shebangExpr)
      if (!shebang) return writeShim_(from, to, null, null, cb)
      var prog = shebang[1]
        , args = shebang[2] || ""
      return writeShim_(from, to, prog, args, cb)
    })
  })
}

function writeShim_ (from, to, prog, args, cb) {
  var shTarget = path.relative(path.dirname(to), from)
    , target = shTarget.split("/").join("\\")
    , longProg
    , shProg = prog && prog.split("\\").join("/")
    , shLongProg
    , pwshProg = shProg && "\"" + shProg + "$exe\""
    , pwshLongProg
  shTarget = shTarget.split("\\").join("/")
  args = args || ""
  if (!prog) {
    prog = "\"%~dp0\\" + target + "\""
    shProg = "\"$basedir/" + shTarget + "\""
    pwshProg = shProg
    args = ""
    target = ""
    shTarget = ""
  } else {
    longProg = "\"%~dp0\\" + prog + ".exe\""
    shLongProg = "\"$basedir/" + prog + "\""
    pwshLongProg = "\"$basedir/" + prog + "$exe\""
    target = "\"%~dp0\\" + target + "\""
    shTarget = "\"$basedir/" + shTarget + "\""
  }

  // @IF EXIST "%~dp0\node.exe" (
  //   "%~dp0\node.exe" "%~dp0\.\node_modules\npm\bin\npm-cli.js" %*
  // ) ELSE (
  //   SETLOCAL
  //   SET PATHEXT=%PATHEXT:;.JS;=;%
  //   node "%~dp0\.\node_modules\npm\bin\npm-cli.js" %*
  // )
  var cmd
  if (longProg) {
    cmd = "@IF EXIST " + longProg + " (\r\n"
        + "  " + longProg + " " + args + " " + target + " %*\r\n"
        + ") ELSE (\r\n"
        + "  @SETLOCAL\r\n"
        + "  @SET PATHEXT=%PATHEXT:;.JS;=;%\r\n"
        + "  " + prog + " " + args + " " + target + " %*\r\n"
        + ")"
  } else {
    cmd = "@" + prog + " " + args + " " + target + " %*\r\n"
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

  var sh = "#!/bin/sh\n"

  if (shLongProg) {
    sh = sh
        + "basedir=$(dirname \"$(echo \"$0\" | sed -e 's,\\\\,/,g')\")\n"
        + "\n"
        + "case `uname` in\n"
        + "    *CYGWIN*) basedir=`cygpath -w \"$basedir\"`;;\n"
        + "esac\n"
        + "\n"

    sh = sh
       + "if [ -x "+shLongProg+" ]; then\n"
       + "  " + shLongProg + " " + args + " " + shTarget + " \"$@\"\n"
       + "  ret=$?\n"
       + "else \n"
       + "  " + shProg + " " + args + " " + shTarget + " \"$@\"\n"
       + "  ret=$?\n"
       + "fi\n"
       + "exit $ret\n"
  } else {
    sh = shProg + " " + args + " " + shTarget + " \"$@\"\n"
       + "exit $?\n"
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
  var pwsh = "#!/usr/bin/env pwsh\n"
           + "$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent\n"
           + "\n"
           + "$exe=\"\"\n"
           + "if ($PSVersionTable.PSVersion -lt \"6.0\" -or $IsWindows) {\n"
           + "  # Fix case when both the Windows and Linux builds of Node\n"
           + "  # are installed in the same directory\n"
           + "  $exe=\".exe\"\n"
           + "}\n"
  if (shLongProg) {
    pwsh = pwsh
         + "$ret=0\n"
         + "if (Test-Path " + pwshLongProg + ") {\n"
         + "  & " + pwshLongProg + " " + args + " " + shTarget + " $args\n"
         + "  $ret=$LASTEXITCODE\n"
         + "} else {\n"
         + "  & " + pwshProg + " " + args + " " + shTarget + " $args\n"
         + "  $ret=$LASTEXITCODE\n"
         + "}\n"
         + "exit $ret\n"
  } else {
    pwsh = pwsh
         + "& " + pwshProg + " " + args + " " + shTarget + " $args\n"
         + "exit $LASTEXITCODE\n"
  }

  var then = times(3, next, cb)
  fs.writeFile(to + ".ps1", pwsh, "utf8", then)
  fs.writeFile(to + ".cmd", cmd, "utf8", then)
  fs.writeFile(to, sh, "utf8", then)
  function next () {
    chmodShim(to, cb)
  }
}

function chmodShim (to, cb) {
  var then = times(2, cb, cb)
  fs.chmod(to, 0755, then)
  fs.chmod(to + ".cmd", 0755, then)
  fs.chmod(to + ".ps1", 0755, then)
}

function times(n, ok, cb) {
  var errState = null
  return function(er) {
    if (!errState) {
      if (er)
        cb(errState = er)
      else if (--n === 0)
        ok()
    }
  }
}
