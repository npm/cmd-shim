'use strict'
const tape = require('tape')
const promisifyTape = require('tape-promise').default
const test = promisifyTape(tape)
const mockFs = require('mock-fs')
const {fixtures1, fixtures2} = process.platform === 'win32' ? {
  fixtures1: 'C:\\cmd-shim\\fixtures',
  fixtures2: 'E:\\cmd-shim\\fixtures'
} : {
  fixtures1: '/home/foo/cmd-shim/fixtures',
  fixtures2: '/home/bar/cmd-shim/fixtures'
}

exports.fixtures1 = fixtures1
exports.fixtures2 = fixtures2

test('create fixture', async function (t) {
  mockFs({
    [fixtures1]: {
      'src.exe': 'exe',
      'src.env': '#!/usr/bin/env node\nconsole.log(/hi/)\n',
      'src.env.args': '#!/usr/bin/env node --expose_gc\ngc()\n',
      'src.sh': '#!/usr/bin/sh\necho hi\n',
      'src.sh.args': '#!/usr/bin/sh -x\necho hi\n'
    },
    [fixtures2]: {
      'src.sh.args': '#!/usr/bin/sh -x\necho hi\n'
    }
  })
})
