'use strict'

// https://github.com/npm/cmd-shim/issues/69
//
// On Windows, SETLOCAL saves cwd as well as the environment. The shebang
// shim then does `endLocal & goto #_undefined_#` so Node is not a child of
// the batch file (no "Terminate Batch Job?"). That goto exits batch context
// and implied-ENDLOCALs remaining frames — including a parent
// `setlocal` + `cd` — so process.cwd() is the pre-cd directory.
//
// cmd.exe expands %CD% for the whole line before endLocal runs, so
// `cd /d "%CD%"` after the goto re-applies the directory Node should see.

const test = require('tap').test
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')
const cmdShim = require('..')

const fixtures = path.resolve(__dirname, 'fixtures')

// Issue #69 reporter's launch line (no cwd restore).
const ISSUE69_LAUNCH =
  'endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\aaaa.js" %*'

const launchLine = (cmdText) => {
  const line = cmdText.split(/\r?\n/).find((l) => /^endLocal\b/i.test(l))
  return line ? line.replace(/\r$/, '') : null
}

// Percent-expand one cmd.exe line (parse-before-execute).
const expandPercents = (line, cwd) =>
  line.replace(/%([^%]+)%/g, (match, name) => {
    if (name.toUpperCase() === 'CD') {
      return cwd
    }
    return match
  })

// Issue pattern:
//   test.bat: setlocal / cd <desired> / test.cmd (no CALL)
//   test.cmd: SETLOCAL / CALL :find_dp0 / <launch line>
// goto #_undefined_# leaves batch context; leftover SETLOCAL frames pop.
const cwdAtNodeLaunch = (rawLaunchLine, initialCwd, desiredCwd) => {
  const stack = []
  let cwd = initialCwd

  // parent test.bat
  stack.push(cwd)
  cwd = desiredCwd

  // shim SETLOCAL (find_dp0 does not cd)
  stack.push(cwd)

  const expanded = expandPercents(rawLaunchLine, cwd)

  const commands = expanded
    .split(/\s*(?:\|\||&)\s*/)
    .map((c) => c.trim())
    .filter(Boolean)

  for (const command of commands) {
    if (/^endLocal\b/i.test(command)) {
      if (stack.length) {
        cwd = stack.pop()
      }
      continue
    }
    if (/^goto\s+#/.test(command)) {
      while (stack.length) {
        cwd = stack.pop()
      }
      continue
    }
    const cd = command.match(/^cd\s+\/d\s+"([^"]*)"$/i) ||
      command.match(/^cd\s+\/d\s+(\S+)/i)
    if (cd) {
      cwd = cd[1]
    }
  }

  return cwd
}

test('issue #69: endLocal+goto without re-cd loses a parent setlocal+cd', (t) => {
  t.equal(
    cwdAtNodeLaunch(ISSUE69_LAUNCH, 'C:\\Users\\reporter', 'C:\\abcdefg'),
    'C:\\Users\\reporter',
    'Node sees the directory from before the parent cd'
  )
  t.end()
})

test('issue #69: re-cd after goto keeps the parent cd', (t) => {
  const fixed = ISSUE69_LAUNCH.replace(
    '|| title %COMSPEC% & ',
    '|| title %COMSPEC% & cd /d "%CD%" & '
  )
  t.equal(
    cwdAtNodeLaunch(fixed, 'C:\\Users\\reporter', 'C:\\abcdefg'),
    'C:\\abcdefg'
  )
  t.end()
})

test('shebang cmd shim re-cds after endLocal+goto', async (t) => {
  const from = path.resolve(fixtures, 'from.env')
  const to = path.resolve(fixtures, 'setlocal-cwd.shim')
  await cmdShim(from, to)
  const cmd = fs.readFileSync(`${to}.cmd`, 'utf8')
  const launch = launchLine(cmd)

  t.match(
    cmd,
    /SETLOCAL/,
    'still uses SETLOCAL (find_dp0 / _prog isolation)'
  )
  t.match(
    cmd,
    /endLocal & goto #_undefined_# 2>NUL \|\| title %COMSPEC% & cd \/d "%CD%" & /,
    'restores cwd on the same line, after the batch-exit goto'
  )
  t.ok(launch, 'has the endLocal launch line')
  t.match(launch, /cd \/d "%CD%"/)
  t.notMatch(
    launch,
    /cd \/d "%CD%" & goto /,
    'cd must run after goto, or implied ENDLOCAL undoes it'
  )
  t.equal(
    cwdAtNodeLaunch(launch, 'C:\\Users\\reporter', 'C:\\abcdefg'),
    'C:\\abcdefg',
    'generated launch line keeps the issue #69 parent cd'
  )
})

test('no-shebang cmd shim does not use the endLocal goto launch', async (t) => {
  const from = path.resolve(fixtures, 'from.exe')
  const to = path.resolve(fixtures, 'setlocal-cwd-exe.shim')
  await cmdShim(from, to)
  const cmd = fs.readFileSync(`${to}.cmd`, 'utf8')
  t.equal(launchLine(cmd), null)
  t.notMatch(cmd, /cd \/d "%CD%"/)
})

test('Windows: parent setlocal+cd is process.cwd() through the shim', {
  skip: process.platform !== 'win32' ? 'cmd.exe reproduction is Windows-only' : false,
}, async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cmd-shim-cwd-'))
  t.teardown(() => fs.rmSync(root, { recursive: true, force: true }))

  const desired = path.join(root, 'abcdefg')
  fs.mkdirSync(desired)

  const cwdOut = path.join(root, 'cwd.txt')
  const from = path.join(root, 'aaaa.js')
  fs.writeFileSync(
    from,
    '#!/usr/bin/env node\n' +
      'require(\'fs\').writeFileSync(' +
      JSON.stringify(cwdOut) +
      ', process.cwd())\n'
  )

  const to = path.join(root, 'test')
  await cmdShim(from, to)

  const parentBat = path.join(root, 'test.bat')
  fs.writeFileSync(
    parentBat,
    [
      '@echo off',
      'setlocal',
      `cd /d "${desired}"`,
      `"${to}.cmd"`,
      'endlocal',
      '',
    ].join('\r\n')
  )

  const result = spawnSync(process.env.COMSPEC || 'cmd.exe', ['/c', parentBat], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  })
  t.equal(result.status, 0, result.stderr || result.stdout)
  t.ok(fs.existsSync(cwdOut), 'aaaa.js wrote process.cwd()')
  t.equal(
    path.resolve(fs.readFileSync(cwdOut, 'utf8')),
    path.resolve(desired)
  )
})
