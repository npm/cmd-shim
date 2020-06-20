
'use strict'
const path = require('path')
const { fixtures, fixtures2, fs } = require('./setup')

const cmdShim = require('../')

test('no cmd file', async () => {
  const src = path.resolve(fixtures, 'src.exe')
  const to = path.resolve(fixtures, 'exe.shim')
  await cmdShim(src, to, { createCmdFile: false, fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(() => fs.readFileSync(`${to}.cmd`, 'utf8')).toThrow('no such file or directory')
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})

test('no shebang', async () => {
  const src = path.resolve(fixtures, 'src.exe')
  const to = path.resolve(fixtures, 'exe.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.cmd`, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})

test('env shebang', async () => {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.cmd`, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})

test('env shebang with NODE_PATH', async () => {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  await cmdShim(src, to, { nodePath: ['/john/src/node_modules', '/bin/node/node_modules'], createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.cmd`, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})

test('env shebang with default args', async () => {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  await cmdShim(src, to, { preserveSymlinks: true, createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.cmd`, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})

test('env shebang with args', async () => {
  const src = path.resolve(fixtures, 'src.env.args')
  const to = path.resolve(fixtures, 'env.args.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.cmd`, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})

test('explicit shebang', async () => {
  const src = path.resolve(fixtures, 'src.sh')
  const to = path.resolve(fixtures, 'sh.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.cmd`, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})

test('explicit shebang with args', async () => {
  const src = path.resolve(fixtures, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.cmd`, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})

test('explicit shebang with prog args', async () => {
  const src = path.resolve(fixtures, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  await cmdShim(src, to, { createCmdFile: true, progArgs: ['hello'], fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.cmd`, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})

;(process.platform === 'win32' ? test : test.skip)('explicit shebang with args, linking to another drive on Windows', async () => {
  const src = path.resolve(fixtures2, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  await cmdShim(src, to, { createCmdFile: true, fs })
  expect(fs.readFileSync(to, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.cmd`, 'utf8')).toMatchSnapshot()
  expect(fs.readFileSync(`${to}.ps1`, 'utf8')).toMatchSnapshot()
})
