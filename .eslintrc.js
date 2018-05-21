"use strict";
/* eslint sort-keys: ["error", "asc"] */

module.exports = {
  "env": {
    "node": true
  },
  "extends": "eslint:recommended",
  "rules": {
    "indent": "off",
    "linebreak-style": [
      "error",
      "unix",
    ],
    "no-console": "off",
    "no-octal": "off",
    "no-unused-vars": "warn",
    "quotes": [
      "error",
      "double",
    ],
    "semi": [
      "error",
      "never",
    ],
  }
}
