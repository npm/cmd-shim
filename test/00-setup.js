const mkdirp = require('mkdirp')
const fs = require('fs')
const fixtures = __dirname + '/fixtures'

const froms = {
  'from.exe': 'exe',
  'from.env': '#!/usr/bin/env node\nconsole.log(/hi/)\n',
  'from.env.args': '#!/usr/bin/env node --expose_gc\ngc()\n',
  'from.env.variables': '#!/usr/bin/env NODE_PATH=./lib:$NODE_PATH node',
  'from.sh': '#!/usr/bin/sh\necho hi\n',
  'from.sh.args': '#!/usr/bin/sh -x\necho hi\n'
}

mkdirp.sync(__dirname + '/fixtures')
for (const [f, content] of Object.entries(froms)) {
  fs.writeFileSync(`${fixtures}/${f}`, content)
}
