'use strict'

// https://github.com/npm/cmd-shim/issues/71
//
// cmd.exe resolves an extensionless command by searching cwd first, then PATH,
// appending each PATHEXT entry. Default Windows PATHEXT includes .JS, so a
// file named node.js (cwd or earlier PATH entry) is executed instead of node.
//
// %PATHEXT:;.JS;=;% only deletes a *middle* ;.JS; entry. It misses .JS when it
// is first or last. Invoking prog.exe avoids PATHEXT entirely.

const test = require('tap').test
const fs = require('fs')
const path = require('path')
const cmdShim = require('..')

const fixtures = path.resolve(__dirname, 'fixtures')

// Default Win10/11 PATHEXT (see issue #71).
const DEFAULT_PATHEXT = '.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC'

// What today's shim substitution produces on the default list.
const STRIPPED_MIDDLE_JS = '.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JSE;.WSF;.WSH;.MSC'

const applyShimPathextStrip = (pathext) =>
  pathext.split(';.JS;').join(';')

// cmd.exe: for each directory (cwd first), try name+each PATHEXT entry.
// A name that already has a PATHEXT extension is used as-is.
const resolveCmdName = (name, cwdEntries, pathext) => {
  const exts = pathext.split(';').filter(Boolean)
  const upper = (s) => s.toUpperCase()
  const nameHasExt = exts.some((ext) => upper(name).endsWith(upper(ext)))
  const candidates = nameHasExt ? [name] : exts.map((ext) => name + ext)
  const cwdUpper = cwdEntries.map(upper)
  for (const candidate of candidates) {
    const i = cwdUpper.indexOf(upper(candidate))
    if (i !== -1) {
      return cwdEntries[i]
    }
  }
  return nameHasExt ? name : `${name}.exe`
}

const pathFallbackProg = (cmdText) => {
  const m = cmdText.match(/ELSE \(\r?\n {2}SET "_prog=([^"]+)"/)
  return m ? m[1] : null
}

test('PATHEXT mock: extensionless node is shadowed by cwd node.js', (t) => {
  t.equal(
    resolveCmdName('node', ['node.js'], DEFAULT_PATHEXT),
    'node.js',
    'bare node + default PATHEXT picks cwd node.js'
  )
  t.equal(
    resolveCmdName('node', ['node.js'], STRIPPED_MIDDLE_JS),
    'node.exe',
    'removing a middle ;.JS; avoids the shadow on the default list'
  )
  t.equal(
    applyShimPathextStrip('.JS;.COM;.EXE'),
    '.JS;.COM;.EXE',
    '%PATHEXT:;.JS;=;% does not remove .JS when it is first'
  )
  t.equal(
    resolveCmdName('node', ['node.js'], applyShimPathextStrip('.JS;.COM;.EXE')),
    'node.js',
    'first-entry .JS still shadows node'
  )
  t.equal(
    applyShimPathextStrip('.COM;.EXE;.JS'),
    '.COM;.EXE;.JS',
    '%PATHEXT:;.JS;=;% does not remove .JS when it is last'
  )
  t.equal(
    resolveCmdName('node', ['node.js'], applyShimPathextStrip('.COM;.EXE;.JS')),
    'node.js',
    'last-entry .JS still shadows node'
  )
  t.equal(
    resolveCmdName('node.exe', ['node.js'], DEFAULT_PATHEXT),
    'node.exe',
    'node.exe is not shadowed by node.js at any PATHEXT position'
  )
  t.equal(
    resolveCmdName('python', ['python.js'], DEFAULT_PATHEXT),
    'python.js',
    'same root cause for other interpreter names'
  )
  t.equal(
    resolveCmdName('python.exe', ['python.js'], DEFAULT_PATHEXT),
    'python.exe',
    'python.exe is not shadowed by python.js'
  )
  t.end()
})

test('cmd shim PATH fallback is node.exe so cwd node.js cannot shadow', async (t) => {
  const from = path.resolve(fixtures, 'from.env')
  const to = path.resolve(fixtures, 'pathext-node.shim')
  await cmdShim(from, to)
  const cmd = fs.readFileSync(`${to}.cmd`, 'utf8')

  t.match(
    cmd,
    /SET "_prog=node\.exe"/,
    'PATH fallback is node.exe, not extensionless node'
  )
  t.notMatch(
    cmd,
    /SET "_prog=node"\r/,
    'does not fall back to bare node (PATHEXT-vulnerable)'
  )

  const fallback = pathFallbackProg(cmd)
  t.equal(fallback, 'node.exe')
  t.equal(
    resolveCmdName(fallback, ['node.js'], DEFAULT_PATHEXT),
    'node.exe',
    'generated fallback does not resolve to cwd node.js'
  )
  t.equal(
    resolveCmdName(fallback, ['node.js'], '.JS;.COM;.EXE'),
    'node.exe',
    'generated fallback is safe when .JS is first in PATHEXT'
  )
  t.equal(
    resolveCmdName(fallback, ['node.js'], '.COM;.EXE;.JS'),
    'node.exe',
    'generated fallback is safe when .JS is last in PATHEXT'
  )
})

test('cmd shim does not append a second .exe when shebang is already node.exe', async (t) => {
  const from = path.resolve(fixtures, 'from.env.nodeexe')
  const to = path.resolve(fixtures, 'pathext-nodeexe.shim')
  await cmdShim(from, to)
  const cmd = fs.readFileSync(`${to}.cmd`, 'utf8')
  t.match(cmd, /SET "_prog=node\.exe"/)
  t.notMatch(cmd, /SET "_prog=node\.exe\.exe"/)
  t.equal(pathFallbackProg(cmd), 'node.exe')
})

test('cmd shim leaves pathed interpreters unchanged', async (t) => {
  const from = path.resolve(fixtures, 'from.sh')
  const to = path.resolve(fixtures, 'pathext-sh.shim')
  await cmdShim(from, to)
  const cmd = fs.readFileSync(`${to}.cmd`, 'utf8')
  t.equal(pathFallbackProg(cmd), '/usr/bin/sh')
  t.notMatch(cmd, /SET "_prog=\/usr\/bin\/sh\.exe"/)
})

test('cmd shim PATH fallback uses .exe for non-node env bins too', async (t) => {
  const from = path.resolve(fixtures, 'from.env.python')
  const to = path.resolve(fixtures, 'pathext-python.shim')
  await cmdShim(from, to)
  const cmd = fs.readFileSync(`${to}.cmd`, 'utf8')

  t.match(cmd, /SET "_prog=python\.exe"/)
  const fallback = pathFallbackProg(cmd)
  t.equal(fallback, 'python.exe')
  t.equal(
    resolveCmdName(fallback, ['python.js'], DEFAULT_PATHEXT),
    'python.exe'
  )
})
