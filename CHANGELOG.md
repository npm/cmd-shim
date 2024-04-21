# Changelog

## [6.0.3](https://github.com/npm/cmd-shim/compare/v6.0.2...v6.0.3) (2024-04-21)

### Documentation

* [`5598b4b`](https://github.com/npm/cmd-shim/commit/5598b4b5d04d42201543dc67b459f0a7db78c211) [#137](https://github.com/npm/cmd-shim/pull/137) readme: fix broken badge URLs (#137) (@10xLaCroixDrinker)

### Chores

* [`29770fa`](https://github.com/npm/cmd-shim/commit/29770fa89a981c0b79330e0162faf03d92741011) [#139](https://github.com/npm/cmd-shim/pull/139) postinstall for dependabot template-oss PR (@lukekarrys)
* [`fa3f56b`](https://github.com/npm/cmd-shim/commit/fa3f56b3ab022523f59cae4081912a8b535ac234) [#139](https://github.com/npm/cmd-shim/pull/139) bump @npmcli/template-oss from 4.21.3 to 4.21.4 (@dependabot[bot])

## [6.0.2](https://github.com/npm/cmd-shim/compare/v6.0.1...v6.0.2) (2023-10-18)

### Bug Fixes

* [`3bdb518`](https://github.com/npm/cmd-shim/commit/3bdb518db21ec6ae64cda74405c7025ee76ccd76) [#117](https://github.com/npm/cmd-shim/pull/117) don't assume cygpath is available (#117) (@davhdavh)

## [6.0.1](https://github.com/npm/cmd-shim/compare/v6.0.0...v6.0.1) (2022-12-13)

### Bug Fixes

* [`a32b3a0`](https://github.com/npm/cmd-shim/commit/a32b3a06615ed60afaa0441015fb1a456b6be488) [#96](https://github.com/npm/cmd-shim/pull/96) drop the -S flag from env (#96) (@nlf, @yeldiRium)

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
