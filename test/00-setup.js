const {
  mkdirSync,
  writeFileSync,
} = require('fs')

const fixtures = require('path').join(__dirname, '/fixtures')

const froms = {
  'from.exe': 'exe',
  'from.env': '#!/usr/bin/env node\nconsole.log(/hi/)\n',
  'from.env.args': '#!/usr/bin/env node --expose_gc\ngc()\n',
  'from.env.variables': '#!/usr/bin/env NODE_PATH=./lib:$NODE_PATH node',
  'from.sh': '#!/usr/bin/sh\necho hi\n',
  'from.sh.args': '#!/usr/bin/sh -x\necho hi\n',
  'from.env.multiple.variables': '#!/usr/bin/env key=value key2=value2 node --flag-one --flag-two',
}

mkdirSync(fixtures, { recursive: true })
for (const [f, content] of Object.entries(froms)) {
  writeFileSync(`${fixtures}/${f}`, content)
}
