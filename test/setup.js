'use strict'
/** @type {typeof import("fs")} */
// @ts-ignore
const memfs = require('memfs')
const path = require('path')

const { fixtures, fixtures2 } = process.platform === 'win32' ? {
  fixtures: 'I:\\cmd-shim\\fixtures',
  fixtures2: 'J:\\cmd-shim\\fixtures'
} : {
  fixtures: '/foo/cmd-shim/fixtures',
  fixtures2: '/bar/cmd-shim/fixtures'
}

exports.fixtures = fixtures
exports.fixtures2 = fixtures2
exports.fs = memfs

/** @type {{ [dir: string]: { [filename: string]: string } }} */
const fixtureFiles = {
  [fixtures]: {
    'src.exe': 'exe',
    'src.env': '#!/usr/bin/env node\nconsole.log(/hi/)\n',
    'src.env.args': '#!/usr/bin/env node --expose_gc\ngc()\n',
    'src.sh': '#!/usr/bin/sh\necho hi\n',
    'src.sh.args': '#!/usr/bin/sh -x\necho hi\n'
  },
  [fixtures2]: {
    'src.sh.args': '#!/usr/bin/sh -x\necho hi\n'
  }
}

beforeAll(() => {
  const fs = memfs.promises
  return Promise.all(
    Object.entries(fixtureFiles).map(async ([dir, files]) => {
      await fs.mkdir(dir, { recursive: true })
      return Promise.all(
        Object.entries(files).map(([filename, contents]) => {
          return fs.writeFile(path.join(dir, filename), contents)
        })
      )
    })
  )
})
