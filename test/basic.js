'use strict'

var test = require('tap').test
var fs = require('fs')
var path = require('path')
var fixtures = path.resolve(__dirname, 'fixtures')

const matchSnapshot = (t, found, name) =>
  t.matchSnapshot(found.replace(/\r/g, '\\r'), name)

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
