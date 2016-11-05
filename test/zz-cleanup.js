var test = require('tape')
var path = require('path')
var fixtures = path.resolve(__dirname, 'fixtures')
var rimraf = require('rimraf')

test('cleanup', function(t) {
  rimraf(fixtures, function(er) {
    if (er)
      throw er
    t.pass('cleaned up')
    t.end()
  })
})
