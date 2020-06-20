
'use strict'
const path = require('path')
const { fixtures, fixtures2, fs } = require('./setup')

const cmdShim = require('../')

/**
 * @param {string} fileName
 * @param {'\n' | '\r\n'} lineEnding
 */
function testFile (fileName, lineEnding = '\n') {
  test(path.basename(fileName), async () => {
    const invalidLineEnding = lineEnding === '\r\n' ? /$(?<!\r)\n/ugm : /$\r\n/ugm
    const content = await fs.promises.readFile(fileName, 'utf8')

    expect(content).not.toMatch(invalidLineEnding)
    expect(content).toMatchSnapshot()
  })
}

describe('no cmd file', () => {
  const src = path.resolve(fixtures, 'src.exe')
  const to = path.resolve(fixtures, 'exe.shim')
  beforeAll(() => {
    return cmdShim(src, to, { createCmdFile: false, fs })
  })

  testFile(to)
  test(`${to}.cmd`, () => {
    expect(() => fs.readFileSync(`${to}.cmd`, 'utf8')).toThrow('no such file or directory')
  })
  testFile(`${to}.ps1`)
})

describe('no shebang', () => {
  const src = path.resolve(fixtures, 'src.exe')
  const to = path.resolve(fixtures, 'exe.shim')
  beforeAll(() => {
    return cmdShim(src, to, { createCmdFile: true, fs })
  })

  testFile(to)
  testFile(`${to}.cmd`, '\r\n')
  testFile(`${to}.ps1`)
})

describe('env shebang', () => {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  beforeAll(() => {
    return cmdShim(src, to, { createCmdFile: true, fs })
  })

  testFile(to)
  testFile(`${to}.cmd`, '\r\n')
  testFile(`${to}.ps1`)
})

describe('env shebang with NODE_PATH', () => {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  beforeAll(() => {
    return cmdShim(src, to, { nodePath: ['/john/src/node_modules', '/bin/node/node_modules'], createCmdFile: true, fs })
  })

  testFile(to)
  testFile(`${to}.cmd`, '\r\n')
  testFile(`${to}.ps1`)
})

describe('env shebang with default args', () => {
  const src = path.resolve(fixtures, 'src.env')
  const to = path.resolve(fixtures, 'env.shim')
  beforeAll(() => {
    return cmdShim(src, to, { preserveSymlinks: true, createCmdFile: true, fs })
  })

  testFile(to)
  testFile(`${to}.cmd`, '\r\n')
  testFile(`${to}.ps1`)
})

describe('env shebang with args', () => {
  const src = path.resolve(fixtures, 'src.env.args')
  const to = path.resolve(fixtures, 'env.args.shim')
  beforeAll(() => {
    return cmdShim(src, to, { createCmdFile: true, fs })
  })

  testFile(to)
  testFile(`${to}.cmd`, '\r\n')
  testFile(`${to}.ps1`)
})

describe('explicit shebang', () => {
  const src = path.resolve(fixtures, 'src.sh')
  const to = path.resolve(fixtures, 'sh.shim')
  beforeAll(() => {
    return cmdShim(src, to, { createCmdFile: true, fs })
  })

  testFile(to)
  testFile(`${to}.cmd`, '\r\n')
  testFile(`${to}.ps1`)
})

describe('explicit shebang with args', () => {
  const src = path.resolve(fixtures, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  beforeAll(() => {
    return cmdShim(src, to, { createCmdFile: true, fs })
  })

  testFile(to)
  testFile(`${to}.cmd`, '\r\n')
  testFile(`${to}.ps1`)
})

describe('explicit shebang with prog args', () => {
  const src = path.resolve(fixtures, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  beforeAll(() => {
    return cmdShim(src, to, { createCmdFile: true, progArgs: ['hello'], fs })
  })

  testFile(to)
  testFile(`${to}.cmd`, '\r\n')
  testFile(`${to}.ps1`)
})

;(process.platform === 'win32' ? describe : describe.skip)('explicit shebang with args, linking to another drive on Windows', () => {
  const src = path.resolve(fixtures2, 'src.sh.args')
  const to = path.resolve(fixtures, 'sh.args.shim')
  beforeAll(() => {
    return cmdShim(src, to, { createCmdFile: true, fs })
  })

  testFile(to)
  testFile(`${to}.cmd`, '\r\n')
  testFile(`${to}.ps1`)
})
