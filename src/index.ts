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

namespace cmdShim {
  export interface Options {
    /**
     * If a PowerShell script should be created.
     *
     * @default true
     */
    createPwshFile?: boolean

    /**
     * If a Windows Command Prompt script should be created.
     *
     * @default false
     */
    createCmdFile?: boolean

    /**
     * If symbolic links should be preserved.
     *
     * @default false
     */
    preserveSymlinks?: boolean

    /**
     * The path to the executable file.
     */
    prog?: string

    /**
     * The arguments to initialize the `node` process with.
     */
    args?: string

    /**
     * The arguments to initialize the target process with, before the actual CLI arguments
     */
    progArgs?: string[]

    /**
     * The value of the $NODE_PATH environment variable.
     *
     * The single `string` format is only kept for legacy compatibility,
     * and the array form should be preferred.
     */
    nodePath?: string | string[]

    /**
     * fs implementation to use.  Must implement node's `fs` module interface.
     */
    fs?: typeof import('fs')

    /*
     * Path to the Node.js executable
     */
    nodeExecPath?: string

    prependToPath?: string
  }
}
type Options = cmdShim.Options

export = cmdShim
cmdShim.ifExists = cmdShimIfExists

/**
 * @internal
 */
type InternalOptions = Options & Required<Pick<Options, keyof typeof DEFAULT_OPTIONS>> & {
  fs_: FsPromisified
}

type Fs_= Pick<typeof import('fs'), 'stat' | 'unlink' | 'readFile' | 'writeFile' | 'chmod' | 'mkdir'>
type FsPromisified = {[K in keyof Fs_]: Fs_[K]['__promisify__']}

/**
 * Callback functions to generate scripts for shims.
 * @param src Path to the executable or script.
 * @param to Path to the shim(s) that is going to be created.
 * @param opts Options.
 * @return Generated script for shim.
 */
type ShimGenerator = (src: string, to: string, opts: InternalOptions) => string

interface ShimGenExtTuple {
  /** The shim generator function. */
  generator: ShimGenerator
  /** The file extension for the shim. */
  extension: string
}

import {promisify} from 'util'

import path = require('path')
import isWindows = require('is-windows')
import CMD_EXTENSION = require('cmd-extension')
const shebangExpr = /^#!\s*(?:\/usr\/bin\/env)?\s*([^ \t]+)(.*)$/
const DEFAULT_OPTIONS = {
  // Create PowerShell file by default if the option hasn't been specified
  createPwshFile: true,
  createCmdFile: isWindows(),
  fs: require('fs')
}
/**
 * Map from extensions of files that this module is frequently used for to their runtime.
 * @type {Map<string, string>}
 */
const extensionToProgramMap = new Map([
  ['.js', 'node'],
  ['.cjs', 'node'],
  ['.mjs', 'node'],
  ['.cmd', 'cmd'],
  ['.bat', 'cmd'],
  ['.ps1', 'pwsh'], // not 'powershell'
  ['.sh', 'sh']
])

function ingestOptions (opts?: Options): InternalOptions {
  const opts_ = {...DEFAULT_OPTIONS, ...opts} as InternalOptions
  const fs = opts_.fs
  opts_.fs_ = {
    chmod: fs.chmod ? promisify(fs.chmod) : (async () => { /* noop */ }) as any,
    mkdir: promisify(fs.mkdir),
    readFile: promisify(fs.readFile),
    stat: promisify(fs.stat),
    unlink: promisify(fs.unlink),
    writeFile: promisify(fs.writeFile)
  }
  return opts_
}

/**
 * Try to create shims.
 *
 * @param src Path to program (executable or script).
 * @param to Path to shims.
 * Don't add an extension if you will create multiple types of shims.
 * @param opts Options.
 * @throws If `src` is missing.
 */
async function cmdShim (src: string, to: string, opts?: Options): Promise<void> {
  const opts_ = ingestOptions(opts)
  await opts_.fs_.stat(src)
  await cmdShim_(src, to, opts_)
}

/**
 * Try to create shims.
 *
 * Does nothing if `src` doesn't exist.
 *
 * @param src Path to program (executable or script).
 * @param to Path to shims.
 * Don't add an extension if you will create multiple types of shims.
 * @param opts Options.
 */
function cmdShimIfExists (src: string, to: string, opts?: Options): Promise<void> {
  return cmdShim(src, to, opts).catch(() => {})
}

/**
 * Try to unlink, but ignore errors.
 * Any problems will surface later.
 *
 * @param path File to be removed.
 */
function rm (path: string, opts: InternalOptions): Promise<void> {
  return opts.fs_.unlink(path).catch(() => {})
}

/**
 * Try to create shims **even if `src` is missing**.
 *
 * @param src Path to program (executable or script).
 * @param to Path to shims.
 * Don't add an extension if you will create multiple types of shims.
 * @param opts Options.
 */
async function cmdShim_ (src: string, to: string, opts: InternalOptions) {
  const srcRuntimeInfo = await searchScriptRuntime(src, opts)
  // Always tries to create all types of shims by calling `writeAllShims` as of now.
  // Append your code here to change the behavior in response to `srcRuntimeInfo`.

  // Create 3 shims for (Ba)sh in Cygwin / MSYS, no extension) & CMD (.cmd) & PowerShell (.ps1)
  await writeShimsPreCommon(to, opts)
  return writeAllShims(src, to, srcRuntimeInfo, opts)
}

/**
 * Do processes before **all** shims are created.
 * This must be called **only once** for one call of `cmdShim(IfExists)`.
 *
 * @param target Path of shims that are going to be created.
 */
function writeShimsPreCommon (target: string, opts: InternalOptions) {
  return opts.fs_.mkdir(path.dirname(target), { recursive: true })
}

/**
 * Write all types (sh & cmd & pwsh) of shims to files.
 * Extensions (`.cmd` and `.ps1`) are appended to cmd and pwsh shims.
 *
 *
 * @param src Path to program (executable or script).
 * @param to Path to shims **without extensions**.
 * Extensions are added for CMD and PowerShell shims.
 * @param srcRuntimeInfo Return value of `await searchScriptRuntime(src)`.
 * @param opts Options.
 */
function writeAllShims (src: string, to: string, srcRuntimeInfo: RuntimeInfo, opts: Options) {
  const opts_ = ingestOptions(opts)
  const generatorAndExts: ShimGenExtTuple[] = [{ generator: generateShShim, extension: '' }]
  if (opts_.createCmdFile) {
    generatorAndExts.push({ generator: generateCmdShim, extension: CMD_EXTENSION })
  }
  if (opts_.createPwshFile) {
    generatorAndExts.push({ generator: generatePwshShim, extension: '.ps1' })
  }
  return Promise.all(
    generatorAndExts.map((generatorAndExt) => writeShim(src, to + generatorAndExt.extension, srcRuntimeInfo, generatorAndExt.generator, opts_))
  )
}

/**
 * Do processes before writing shim.
 *
 * @param target Path to shim that is going to be created.
 */
function writeShimPre (target: string, opts: InternalOptions) {
  return rm(target, opts)
}

/**
 * Do processes after writing the shim.
 *
 * @param target Path to just created shim.
 */
function writeShimPost (target: string, opts: InternalOptions) {
  // Only chmoding shims as of now.
  // Some other processes may be appended.
  return chmodShim(target, opts)
}

interface RuntimeInfo {
  program: string | null
  additionalArgs: string
}

/**
 * Look into runtime (e.g. `node` & `sh` & `pwsh`) and its arguments
 * of the target program (script or executable).
 *
 * @param target Path to the executable or script.
 * @return Promise of infomation of runtime of `target`.
 */
async function searchScriptRuntime (target: string, opts: InternalOptions): Promise<RuntimeInfo> {
  const data = await opts.fs_.readFile(target, 'utf8')

  // First, check if the bin is a #! of some sort.
  const firstLine = data.trim().split(/\r*\n/)[0]
  const shebang = firstLine.match(shebangExpr)
  if (!shebang) {
    // If not, infer script type from its extension.
    // If the inference fails, it's something that'll be compiled, or some other
    // sort of script, and just call it directly.
    const targetExtension = path.extname(target).toLowerCase()
    return {
      // undefined if extension is unknown but it's converted to null.
      program: extensionToProgramMap.get(targetExtension) || null,
      additionalArgs: ''
    }
  }
  return {
    program: shebang[1],
    additionalArgs: shebang[2]
  }
}

/**
 * Write shim to the file system while executing the pre- and post-processes
 * defined in `WriteShimPre` and `WriteShimPost`.
 *
 * @param src Path to the executable or script.
 * @param to Path to the (sh) shim(s) that is going to be created.
 * @param srcRuntimeInfo Result of `await searchScriptRuntime(src)`.
 * @param generateShimScript Generator of shim script.
 * @param opts Other options.
 */
async function writeShim (src: string, to: string, srcRuntimeInfo: RuntimeInfo, generateShimScript: ShimGenerator, opts: InternalOptions) {
  const defaultArgs = opts.preserveSymlinks ? '--preserve-symlinks' : ''
  // `Array.prototype.filter` removes ''.
  // ['--foo', '--bar'].join(' ') and [].join(' ') returns '--foo --bar' and '' respectively.
  const args = [srcRuntimeInfo.additionalArgs, defaultArgs].filter(arg => arg).join(' ')
  opts = Object.assign({}, opts, {
    prog: srcRuntimeInfo.program,
    args: args
  })

  await writeShimPre(to, opts)
  await opts.fs_.writeFile(to, generateShimScript(src, to, opts), 'utf8')
  return writeShimPost(to, opts)
}

/**
 * Generate the content of a shim for CMD.
 *
 * @param src Path to the executable or script.
 * @param to Path to the shim to be created.
 * It is highly recommended to end with `.cmd` (or `.bat`).
 * @param opts Options.
 * @return The content of shim.
 */
function generateCmdShim (src: string, to: string, opts: InternalOptions): string {
  // `shTarget` is not used to generate the content.
  const shTarget = path.relative(path.dirname(to), src)
  let target = shTarget.split('/').join('\\')
  const quotedPathToTarget = path.isAbsolute(target) ? `"${target}"` : `"%~dp0\\${target}"`
  let longProg
  let prog = opts.prog
  let args = opts.args || ''
  const nodePath = normalizePathEnvVar(opts.nodePath).win32
  const prependToPath = normalizePathEnvVar(opts.prependToPath).win32
  if (!prog) {
    prog = quotedPathToTarget
    args = ''
    target = ''
  } else if (prog === 'node' && opts.nodeExecPath) {
    prog = `"${opts.nodeExecPath}"`
    target = quotedPathToTarget
  } else {
    longProg = `"%~dp0\\${prog}.exe"`
    target = quotedPathToTarget
  }

  let progArgs = opts.progArgs ? `${opts.progArgs.join(` `)} ` : ''

  // @IF EXIST "%~dp0\node.exe" (
  //   "%~dp0\node.exe" "%~dp0\.\node_modules\npm\bin\npm-cli.js" %*
  // ) ELSE (
  //   SETLOCAL
  //   SET PATHEXT=%PATHEXT:;.JS;=;%
  //   node "%~dp0\.\node_modules\npm\bin\npm-cli.js" %*
  // )
  let cmd = '@SETLOCAL\r\n'
  if (prependToPath) {
    cmd += `@SET "PATH=${prependToPath}:%PATH%"\r\n`
  }
  if (nodePath) {
      cmd += `\
@IF NOT DEFINED NODE_PATH (\r
  @SET "NODE_PATH=${nodePath}"\r
) ELSE (\r
  @SET "NODE_PATH=%NODE_PATH%;${nodePath}"\r
)\r
`
  }
  if (longProg) {
    cmd += `\
@IF EXIST ${longProg} (\r
  ${longProg} ${args} ${target} ${progArgs}%*\r
) ELSE (\r
  @SET PATHEXT=%PATHEXT:;.JS;=;%\r
  ${prog} ${args} ${target} ${progArgs}%*\r
)\r
`
  } else {
    cmd += `@${prog} ${args} ${target} ${progArgs}%*\r\n`
  }

  return cmd
}

/**
 * Generate the content of a shim for (Ba)sh in, for example, Cygwin and MSYS(2).
 *
 * @param src Path to the executable or script.
 * @param to Path to the shim to be created.
 * It is highly recommended to end with `.sh` or to contain no extension.
 * @param opts Options.
 * @return The content of shim.
 */
function generateShShim (src: string, to: string, opts: InternalOptions): string {
  let shTarget = path.relative(path.dirname(to), src)
  let shProg = opts.prog && opts.prog.split('\\').join('/')
  let shLongProg
  shTarget = shTarget.split('\\').join('/')
  const quotedPathToTarget = path.isAbsolute(shTarget) ? `"${shTarget}"` : `"$basedir/${shTarget}"`
  let args = opts.args || ''
  const shNodePath = normalizePathEnvVar(opts.nodePath).posix
  if (!shProg) {
    shProg = quotedPathToTarget
    args = ''
    shTarget = ''
  } else if (opts.prog === 'node' && opts.nodeExecPath) {
    shProg = `"${opts.nodeExecPath}"`
    shTarget = quotedPathToTarget
  } else {
    shLongProg = `"$basedir/${opts.prog}"`
    shTarget = quotedPathToTarget
  }

  let progArgs = opts.progArgs ? `${opts.progArgs.join(` `)} ` : ''

  // #!/bin/sh
  // basedir=`dirname "$0"`
  //
  // case `uname` in
  //     *CYGWIN*) basedir=`cygpath -w "$basedir"`;;
  // esac
  //
  // export NODE_PATH="<nodepath>"
  //
  // if [ -x "$basedir/node.exe" ]; then
  //   exec "$basedir/node.exe" "$basedir/node_modules/npm/bin/npm-cli.js" "$@"
  // else
  //   exec node "$basedir/node_modules/npm/bin/npm-cli.js" "$@"
  // fi

  let sh = `\
#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\\\,/,g')")

case \`uname\` in
    *CYGWIN*) basedir=\`cygpath -w "$basedir"\`;;
esac

`
  if (opts.prependToPath) {
    sh += `\
export PATH="${opts.prependToPath}:$PATH"
`
  }
  if (shNodePath) {
      sh += `\
if [ -z "$NODE_PATH" ]; then
  export NODE_PATH="${shNodePath}"
else
  export NODE_PATH="$NODE_PATH:${shNodePath}"
fi
`
  }

  if (shLongProg) {
    sh += `\
if [ -x ${shLongProg} ]; then
  exec ${shLongProg} ${args} ${shTarget} ${progArgs}"$@"
else
  exec ${shProg} ${args} ${shTarget} ${progArgs}"$@"
fi
`
  } else {
    sh += `\
${shProg} ${args} ${shTarget} ${progArgs}"$@"
exit $?
`
  }

  return sh
}

/**
 * Generate the content of a shim for PowerShell.
 *
 * @param src Path to the executable or script.
 * @param to Path to the shim to be created.
 * It is highly recommended to end with `.ps1`.
 * @param opts Options.
 * @return The content of shim.
 */
function generatePwshShim (src: string, to: string, opts: InternalOptions): string {
  let shTarget = path.relative(path.dirname(to), src)
  const shProg = opts.prog && opts.prog.split('\\').join('/')
  let pwshProg = shProg && `"${shProg}$exe"`
  let pwshLongProg
  shTarget = shTarget.split('\\').join('/')
  const quotedPathToTarget = path.isAbsolute(shTarget) ? `"${shTarget}"` : `"$basedir/${shTarget}"`
  let args = opts.args || ''
  let normalizedNodePathEnvVar = normalizePathEnvVar(opts.nodePath)
  const nodePath = normalizedNodePathEnvVar.win32
  const shNodePath = normalizedNodePathEnvVar.posix
  let normalizedPrependPathEnvVar = normalizePathEnvVar(opts.prependToPath)
  const prependPath = normalizedPrependPathEnvVar.win32
  const shPrependPath = normalizedPrependPathEnvVar.posix
  if (!pwshProg) {
    pwshProg = quotedPathToTarget
    args = ''
    shTarget = ''
  } else if (opts.prog === 'node' && opts.nodeExecPath) {
    pwshProg = `"${opts.nodeExecPath}"`
    shTarget = quotedPathToTarget
  } else {
    pwshLongProg = `"$basedir/${opts.prog}$exe"`
    shTarget = quotedPathToTarget
  }

  let progArgs = opts.progArgs ? `${opts.progArgs.join(` `)} ` : ''

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
  //   # Support pipeline input
  //   if ($MyInvocation.ExpectingInput) {
  //     $input | & "$basedir/node$exe" "$basedir/node_modules/npm/bin/npm-cli.js" $args
  //   } else {
  //     & "$basedir/node$exe" "$basedir/node_modules/npm/bin/npm-cli.js" $args
  //   }
  //   $ret=$LASTEXITCODE
  // } else {
  //   # Support pipeline input
  //   if ($MyInvocation.ExpectingInput) {
  //     $input | & "node$exe" "$basedir/node_modules/npm/bin/npm-cli.js" $args
  //   } else {
  //     & "node$exe" "$basedir/node_modules/npm/bin/npm-cli.js" $args
  //   }
  //   $ret=$LASTEXITCODE
  // }
  // exit $ret
  let pwsh = `\
#!/usr/bin/env pwsh
$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent

$exe=""
${(nodePath || prependPath) ? '$pathsep=":"\n' : ''}\
${nodePath ? `\
$env_node_path=$env:NODE_PATH
$new_node_path="${nodePath}"
` : ''}\
${prependPath ? `\
$env_path=$env:PATH
$prepend_path="${prependPath}"
` : ''}\
if ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {
  # Fix case when both the Windows and Linux builds of Node
  # are installed in the same directory
  $exe=".exe"
${(nodePath || prependPath) ? '  $pathsep=";"\n' : ''}\
}`
  if (shNodePath || shPrependPath) {
    pwsh += `\
 else {
${shNodePath ? `  $new_node_path="${shNodePath}"\n` : ''}\
${shPrependPath ? `  $prepend_path="${shPrependPath}"\n` : ''}\
}
`
  }
  if (shNodePath) {
    pwsh += `\
if ([string]::IsNullOrEmpty($env_node_path)) {
  $env:NODE_PATH=$new_node_path
} else {
  $env:NODE_PATH="$env_node_path$pathsep$new_node_path"
}
`
  }
  if (opts.prependToPath) {
    pwsh += `
$env:PATH="$prepend_path$pathsep$env:PATH"
`
  }
  if (pwshLongProg) {
    pwsh += `
$ret=0
if (Test-Path ${pwshLongProg}) {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${pwshLongProg} ${args} ${shTarget} ${progArgs}$args
  } else {
    & ${pwshLongProg} ${args} ${shTarget} ${progArgs}$args
  }
  $ret=$LASTEXITCODE
} else {
  # Support pipeline input
  if ($MyInvocation.ExpectingInput) {
    $input | & ${pwshProg} ${args} ${shTarget} ${progArgs}$args
  } else {
    & ${pwshProg} ${args} ${shTarget} ${progArgs}$args
  }
  $ret=$LASTEXITCODE
}
${nodePath ? '$env:NODE_PATH=$env_node_path\n' : ''}\
${prependPath ? '$env:PATH=$env_path\n' : ''}\
exit $ret
`
  } else {
    pwsh += `
# Support pipeline input
if ($MyInvocation.ExpectingInput) {
  $input | & ${pwshProg} ${args} ${shTarget} ${progArgs}$args
} else {
  & ${pwshProg} ${args} ${shTarget} ${progArgs}$args
}
${nodePath ? '$env:NODE_PATH=$env_node_path\n' : ''}\
${prependPath ? '$env:PATH=$env_path\n' : ''}\
exit $LASTEXITCODE
`
  }

  return pwsh
}

/**
 * Chmod just created shim and make it executable
 *
 * @param to Path to shim.
 */
function chmodShim (to: string, opts: InternalOptions) {
  return opts.fs_.chmod(to, 0o755)
}

interface NormalizedPathEnvVar {
  win32: string
  posix: string
  [index:number]: {win32:string,posix:string}
}
function normalizePathEnvVar (nodePath: undefined | string | string[]): NormalizedPathEnvVar {
  if (!nodePath || !nodePath.length) {
    return {
      win32: '',
      posix: ''
    }
  }
  let split = (typeof nodePath === 'string' ? nodePath.split(path.delimiter) : Array.from(nodePath))
  let result = {} as NormalizedPathEnvVar
  for (let i = 0; i < split.length; i++) {
    const win32 = split[i].split('/').join('\\')
    const posix = isWindows() ? split[i].split('\\').join('/').replace(/^([^:\\/]*):/, (_, $1) => `/mnt/${$1.toLowerCase()}`) : split[i]

    result.win32 = result.win32 ? `${result.win32};${win32}` : win32
    result.posix = result.posix ? `${result.posix}:${posix}` : posix

    result[i] = {win32, posix}
  }
  return result
}
