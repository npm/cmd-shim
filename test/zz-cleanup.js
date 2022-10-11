const { join } = require('path')
const { rmSync } = require('fs')

rmSync(join(__dirname, 'fixtures'), { recursive: true, force: true })
rmSync(join(__dirname, 'fixtures.ps1'))
