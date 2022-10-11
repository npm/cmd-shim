# Changelog

## [6.0.0](https://github.com/npm/cmd-shim/compare/v5.0.0...v6.0.0) (2022-10-11)

### ⚠️ BREAKING CHANGES

* this module will no longer attempt to alter file ownership
* `cmd-shim` is now compatible with the following semver range for node: `^14.17.0 || ^16.13.0 || >=18.0.0`

### Features

* [`ef99e1c`](https://github.com/npm/cmd-shim/commit/ef99e1cb605c2c8c35d40d8aa771f8060540ac91) [#88](https://github.com/npm/cmd-shim/pull/88) remove ownership changing features (#88) (@nlf)
* [`d5881e8`](https://github.com/npm/cmd-shim/commit/d5881e893bd5a2405ecd6cc53bcb862b43665860) [#82](https://github.com/npm/cmd-shim/pull/82) postinstall for dependabot template-oss PR (@lukekarrys)

## [5.0.0](https://github.com/npm/cmd-shim/compare/v4.1.0...v5.0.0) (2022-04-05)


### ⚠ BREAKING CHANGES

* this drops support for node 10 and non-LTS versions of node 12 and node 14

### Bug Fixes

* replace deprecated String.prototype.substr() ([#59](https://github.com/npm/cmd-shim/issues/59)) ([383d7e9](https://github.com/npm/cmd-shim/commit/383d7e954b72b76d88fad74510204c8ed12a37c1))
* safer regex ([470678a](https://github.com/npm/cmd-shim/commit/470678a5bfbdacabda8327a3e181bbf0cbcaba12))


### Dependencies

* @npmcli/template-oss@3.2.2 ([dfb091d](https://github.com/npm/cmd-shim/commit/dfb091de0d61fa83ee1a32ceb7810565bf7ed31b))
