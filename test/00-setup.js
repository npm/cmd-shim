'use strict'
const tape = require('tape')
const promisifyTape = require('tape-promise').default
const test = promisifyTape(tape)
const mkdirp = require('mkdirp-promise')
const fs = require('fs')
const path = require('path')
const fixtures = path.resolve(__dirname, 'fixtures')

const srcs = {
  'src.exe': 'exe',
  'src.env': '#!/usr/bin/env node\nconsole.log(/hi/)\n',
  'src.env.args': '#!/usr/bin/env node --expose_gc\ngc()\n',
  'src.sh': '#!/usr/bin/sh\necho hi\n',
  'src.sh.args': '#!/usr/bin/sh -x\necho hi\n'
}

test('create fixture', function (t) {
  return mkdirp(fixtures)
    .then(() => {
      t.pass('made dir')
      Object.keys(srcs).forEach(function (f) {
        t.test('write ' + f, function (t) {
          fs.writeFile(path.resolve(fixtures, f), srcs[f], function (er) {
            if (er) { throw er }
            t.pass('wrote ' + f)
            t.end()
          })
        })
      })
    })
})
