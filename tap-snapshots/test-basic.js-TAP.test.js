/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/basic.js TAP env shebang > cmd 1`] = `
@ECHO off\\r
GOTO start\\r
:find_dp0\\r
SET dp0=%~dp0\\r
EXIT /b\\r
:start\\r
SETLOCAL\\r
CALL :find_dp0\\r
\\r
IF EXIST "%dp0%\\node.exe" (\\r
  SET "_prog=%dp0%\\node.exe"\\r
) ELSE (\\r
  SET "_prog=node"\\r
  SET PATHEXT=%PATHEXT:;.JS;=;%\\r
)\\r
\\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\from.env" %*\\r

`

exports[`test/basic.js TAP env shebang > ps1 1`] = `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
$ret=0
if (Test-Path "$basedir/node$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir/node$exe"  "$basedir/from.env" $args
  } else {
    & "$basedir/node$exe"  "$basedir/from.env" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "node$exe"  "$basedir/from.env" $args
  } else {
    & "node$exe"  "$basedir/from.env" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret

`

exports[`test/basic.js TAP env shebang > shell 1`] = `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

if [ -x "$basedir/node" ]; then
  exec "$basedir/node"  "$basedir/from.env" "$@"
else 
  exec node  "$basedir/from.env" "$@"
fi

`

exports[`test/basic.js TAP env shebang with args > cmd 1`] = `
@ECHO off\\r
GOTO start\\r
:find_dp0\\r
SET dp0=%~dp0\\r
EXIT /b\\r
:start\\r
SETLOCAL\\r
CALL :find_dp0\\r
\\r
IF EXIST "%dp0%\\node.exe" (\\r
  SET "_prog=%dp0%\\node.exe"\\r
) ELSE (\\r
  SET "_prog=node"\\r
  SET PATHEXT=%PATHEXT:;.JS;=;%\\r
)\\r
\\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" --expose_gc "%dp0%\\from.env.args" %*\\r

`

exports[`test/basic.js TAP env shebang with args > ps1 1`] = `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
$ret=0
if (Test-Path "$basedir/node$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir/node$exe" --expose_gc "$basedir/from.env.args" $args
  } else {
    & "$basedir/node$exe" --expose_gc "$basedir/from.env.args" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "node$exe" --expose_gc "$basedir/from.env.args" $args
  } else {
    & "node$exe" --expose_gc "$basedir/from.env.args" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret

`

exports[`test/basic.js TAP env shebang with args > shell 1`] = `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

if [ -x "$basedir/node" ]; then
  exec "$basedir/node" --expose_gc "$basedir/from.env.args" "$@"
else 
  exec node --expose_gc "$basedir/from.env.args" "$@"
fi

`

exports[`test/basic.js TAP env shebang with variables > cmd 1`] = `
@ECHO off\\r
GOTO start\\r
:find_dp0\\r
SET dp0=%~dp0\\r
EXIT /b\\r
:start\\r
SETLOCAL\\r
CALL :find_dp0\\r
@SET NODE_PATH=./lib:%NODE_PATH%\\r
\\r
IF EXIST "%dp0%\\node.exe" (\\r
  SET "_prog=%dp0%\\node.exe"\\r
) ELSE (\\r
  SET "_prog=node"\\r
  SET PATHEXT=%PATHEXT:;.JS;=;%\\r
)\\r
\\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\from.env.variables" %*\\r

`

exports[`test/basic.js TAP env shebang with variables > ps1 1`] = `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
$ret=0
if (Test-Path "$basedir/node$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir/node$exe"  "$basedir/from.env.variables" $args
  } else {
    & "$basedir/node$exe"  "$basedir/from.env.variables" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "node$exe"  "$basedir/from.env.variables" $args
  } else {
    & "node$exe"  "$basedir/from.env.variables" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret

`

exports[`test/basic.js TAP env shebang with variables > shell 1`] = `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

if [ -x "$basedir/node" ]; then
  exec NODE_PATH=./lib:$NODE_PATH "$basedir/node"  "$basedir/from.env.variables" "$@"
else 
  exec NODE_PATH=./lib:$NODE_PATH node  "$basedir/from.env.variables" "$@"
fi

`

exports[`test/basic.js TAP explicit shebang > cmd 1`] = `
@ECHO off\\r
GOTO start\\r
:find_dp0\\r
SET dp0=%~dp0\\r
EXIT /b\\r
:start\\r
SETLOCAL\\r
CALL :find_dp0\\r
\\r
IF EXIST "%dp0%\\/usr/bin/sh.exe" (\\r
  SET "_prog=%dp0%\\/usr/bin/sh.exe"\\r
) ELSE (\\r
  SET "_prog=/usr/bin/sh"\\r
  SET PATHEXT=%PATHEXT:;.JS;=;%\\r
)\\r
\\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\from.sh" %*\\r

`

exports[`test/basic.js TAP explicit shebang > ps1 1`] = `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
$ret=0
if (Test-Path "$basedir//usr/bin/sh$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir//usr/bin/sh$exe"  "$basedir/from.sh" $args
  } else {
    & "$basedir//usr/bin/sh$exe"  "$basedir/from.sh" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "/usr/bin/sh$exe"  "$basedir/from.sh" $args
  } else {
    & "/usr/bin/sh$exe"  "$basedir/from.sh" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret

`

exports[`test/basic.js TAP explicit shebang > shell 1`] = `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

if [ -x "$basedir//usr/bin/sh" ]; then
  exec "$basedir//usr/bin/sh"  "$basedir/from.sh" "$@"
else 
  exec /usr/bin/sh  "$basedir/from.sh" "$@"
fi

`

exports[`test/basic.js TAP explicit shebang with args > cmd 1`] = `
@ECHO off\\r
GOTO start\\r
:find_dp0\\r
SET dp0=%~dp0\\r
EXIT /b\\r
:start\\r
SETLOCAL\\r
CALL :find_dp0\\r
\\r
IF EXIST "%dp0%\\/usr/bin/sh.exe" (\\r
  SET "_prog=%dp0%\\/usr/bin/sh.exe"\\r
) ELSE (\\r
  SET "_prog=/usr/bin/sh"\\r
  SET PATHEXT=%PATHEXT:;.JS;=;%\\r
)\\r
\\r
endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%" -x "%dp0%\\from.sh.args" %*\\r

`

exports[`test/basic.js TAP explicit shebang with args > ps1 1`] = `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
$ret=0
if (Test-Path "$basedir//usr/bin/sh$exe") {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "$basedir//usr/bin/sh$exe" -x "$basedir/from.sh.args" $args
  } else {
    & "$basedir//usr/bin/sh$exe" -x "$basedir/from.sh.args" $args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & "/usr/bin/sh$exe" -x "$basedir/from.sh.args" $args
  } else {
    & "/usr/bin/sh$exe" -x "$basedir/from.sh.args" $args
  }
  $ret=$LASTEXITCODE
}
exit $ret

`

exports[`test/basic.js TAP explicit shebang with args > shell 1`] = `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

if [ -x "$basedir//usr/bin/sh" ]; then
  exec "$basedir//usr/bin/sh" -x "$basedir/from.sh.args" "$@"
else 
  exec /usr/bin/sh -x "$basedir/from.sh.args" "$@"
fi

`

exports[`test/basic.js TAP if exists (it does exist) > cmd 1`] = `
@ECHO off\\r
GOTO start\\r
:find_dp0\\r
SET dp0=%~dp0\\r
EXIT /b\\r
:start\\r
SETLOCAL\\r
CALL :find_dp0\\r
"%dp0%\\from.exe"   %*\\r

`

exports[`test/basic.js TAP if exists (it does exist) > ps1 1`] = `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/from.exe"   $args
} else {
  & "$basedir/from.exe"   $args
}
exit $LASTEXITCODE

`

exports[`test/basic.js TAP if exists (it does exist) > shell 1`] = `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

exec "$basedir/from.exe"   "$@"

`

exports[`test/basic.js TAP just proceed if reading fails > cmd 1`] = `
@ECHO off\\r
GOTO start\\r
:find_dp0\\r
SET dp0=%~dp0\\r
EXIT /b\\r
:start\\r
SETLOCAL\\r
CALL :find_dp0\\r
"%dp0%\\"   %*\\r

`

exports[`test/basic.js TAP just proceed if reading fails > ps1 1`] = `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/"   $args
} else {
  & "$basedir/"   $args
}
exit $LASTEXITCODE

`

exports[`test/basic.js TAP just proceed if reading fails > shell 1`] = `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

exec "$basedir/"   "$@"

`

exports[`test/basic.js TAP no shebang > cmd 1`] = `
@ECHO off\\r
GOTO start\\r
:find_dp0\\r
SET dp0=%~dp0\\r
EXIT /b\\r
:start\\r
SETLOCAL\\r
CALL :find_dp0\\r
"%dp0%\\from.exe"   %*\\r

`

exports[`test/basic.js TAP no shebang > ps1 1`] = `
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
}
# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & "$basedir/from.exe"   $args
} else {
  & "$basedir/from.exe"   $args
}
exit $LASTEXITCODE

`

exports[`test/basic.js TAP no shebang > shell 1`] = `
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*|*MINGW*|*MSYS*) basedir=\`cygpath -w "$basedir"\`;;
esac

exec "$basedir/from.exe"   "$@"

`
