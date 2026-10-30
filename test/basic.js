'use strict'

var test = require('tap').test
var fs = require('fs')
var path = require('path')
var fixtures = path.resolve(__dirname, 'fixtures')

const matchSnapshot = (t, found, name) =>
  t.matchSnapshot(found.replace(/^\uFEFF/, '').replace(/\r/g, '\\r'), name)

const UTF8_BOM = Buffer.from([0xEF, 0xBB, 0xBF])

const startsWithUtf8Bom = buf =>
  buf.length >= 3 && buf.subarray(0, 3).equals(UTF8_BOM)

var cmdShim = require('..')

test('no shebang', async t => {
  var from = path.resolve(fixtures, 'from.exe')
  var to = path.resolve(fixtures, 'exe.shim')
  await cmdShim(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'ps1')
})

test('if exists (it does exist)', async t => {
  var from = path.resolve(fixtures, 'from.exe')
  var to = path.resolve(fixtures, 'exe.shim')
  await cmdShim.ifExists(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'ps1')
})

test('if exists (it does not exist)', async t => {
  var from = path.resolve(fixtures, 'argle bargle we like to sparkle')
  var to = path.resolve(fixtures, 'argle-bargle-shim')
  await cmdShim.ifExists(from, to)
  t.throws(() => fs.statSync(to))
  t.throws(() => fs.statSync(to + '.cmd'))
  t.throws(() => fs.statSync(to + '.ps1'))
})

test('fails if from doesnt exist', async t => {
  var from = path.resolve(fixtures, 'argle bargle we like to sparkle')
  var to = path.resolve(fixtures, 'argle-bargle-shim')
  await t.rejects(cmdShim(from, to), { code: 'ENOENT' })
})

test('fails if mkdir fails', async t => {
  var from = path.resolve(fixtures, 'from.env')
  var to = path.resolve(fixtures, 'from.env/a/b/c')
  await t.rejects(cmdShim(from, to), { code: /^(ENOTDIR|EEXIST|ENOENT)$/ })
})

test('fails if to is a dir', async t => {
  var from = path.resolve(fixtures, 'from.env')
  var to = path.resolve(fixtures)
  t.teardown(() => {
    fs.rmSync(to + '.cmd', { recursive: true, force: true })
  })
  await t.rejects(cmdShim(from, to), { code: 'EISDIR' })
})

test('just proceed if reading fails', async t => {
  var from = fixtures
  var to = path.resolve(fixtures, 'env.shim')
  await cmdShim(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'ps1')
})

test('env shebang', async t => {
  var from = path.resolve(fixtures, 'from.env')
  var to = path.resolve(fixtures, 'env.shim')
  await cmdShim(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'ps1')
})

test('env shebang with args', async t => {
  var from = path.resolve(fixtures, 'from.env.args')
  var to = path.resolve(fixtures, 'env.args.shim')
  await cmdShim(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'ps1')
})

test('env shebang with variables', async t => {
  var from = path.resolve(fixtures, 'from.env.variables')
  var to = path.resolve(fixtures, 'env.variables.shim')
  await cmdShim(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'ps1')
})

test('explicit shebang', async t => {
  var from = path.resolve(fixtures, 'from.sh')
  var to = path.resolve(fixtures, 'sh.shim')
  await cmdShim(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'ps1')
})

test('explicit shebang with args', async t => {
  var from = path.resolve(fixtures, 'from.sh.args')
  var to = path.resolve(fixtures, 'sh.args.shim')
  await cmdShim(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'ps1')
})

test('multiple variables', async t => {
  var from = path.resolve(fixtures, 'from.env.multiple.variables')
  var to = path.resolve(fixtures, 'sh.multiple.shim')
  await cmdShim(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'ps1')
})

test('shebang with env -S', async t => {
  var from = path.resolve(fixtures, 'from.env.S')
  var to = path.resolve(fixtures, 'sh.env.S.shim')
  await cmdShim(from, to)
  matchSnapshot(t, fs.readFileSync(to, 'utf8'), 'shell')
  matchSnapshot(t, fs.readFileSync(to + '.cmd', 'utf8'), 'cmd')
  matchSnapshot(t, fs.readFileSync(to + '.ps1', 'utf8'), 'cmd')
})

test('ps1 shim is written with a UTF-8 BOM for ASCII paths', async t => {
  var from = path.resolve(fixtures, 'from.env')
  var to = path.resolve(fixtures, 'ascii.bom.shim')
  await cmdShim(from, to)

  const ps1 = fs.readFileSync(to + '.ps1')
  t.ok(startsWithUtf8Bom(ps1), 'ps1 starts with UTF-8 BOM')
  t.equal(
    ps1.subarray(3).toString('utf8').indexOf('\uFEFF'),
    -1,
    'ps1 body has no extra BOM'
  )
  t.match(ps1.subarray(3).toString('utf8'), /^#!\/usr\/bin\/env pwsh\n/)

  t.notOk(startsWithUtf8Bom(fs.readFileSync(to + '.cmd')), 'cmd has no BOM')
  t.notOk(startsWithUtf8Bom(fs.readFileSync(to)), 'sh has no BOM')
})

test('ps1 shim with non-ASCII path is UTF-8 with BOM', async t => {
  const fromDir = path.resolve(fixtures, 'Gérard')
  fs.mkdirSync(fromDir, { recursive: true })
  const from = path.resolve(fromDir, 'from.env')
  fs.copyFileSync(path.resolve(fixtures, 'from.env'), from)
  const to = path.resolve(fixtures, 'non-ascii.shim')
  await cmdShim(from, to)

  const ps1 = fs.readFileSync(to + '.ps1')
  t.ok(startsWithUtf8Bom(ps1), 'ps1 starts with UTF-8 BOM')
  const body = ps1.subarray(3).toString('utf8')
  t.match(body, /Gérard/, 'ps1 body keeps non-ASCII path as UTF-8')

  const cmd = fs.readFileSync(to + '.cmd')
  t.notOk(startsWithUtf8Bom(cmd), 'cmd has no BOM')
  t.match(cmd.toString('utf8'), /Gérard/)

  const sh = fs.readFileSync(to)
  t.notOk(startsWithUtf8Bom(sh), 'sh has no BOM')
  t.match(sh.toString('utf8'), /Gérard/)
})
