'use strict'
const tape = require('tape')
const promisifyTape = require('tape-promise').default
const test = promisifyTape(tape)
const path = require('path')
const fixtures = path.resolve(__dirname, 'fixtures')
const rimraf = require('rimraf')

test('cleanup', function (t) {
  rimraf(fixtures, function (er) {
    if (er) { throw er }
    t.pass('cleaned up')
    t.end()
  })
})
