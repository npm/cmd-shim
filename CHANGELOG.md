# Changelog

## [9.0.2](https://github.com/npm/cmd-shim/compare/v9.0.1...v9.0.2) (2026-06-19)
### Bug Fixes
* [`1c2f94c`](https://github.com/npm/cmd-shim/commit/1c2f94cc146c7a76112bc23f255ea75afbf30420) [#64](https://github.com/npm/cmd-shim/pull/64) Fixed an issue with files named node.js on Windows (#64) (@giovannicalo)
### Chores
* [`4f2209b`](https://github.com/npm/cmd-shim/commit/4f2209b18d81fd13169ebfd24b0da95d0d04b357) [#185](https://github.com/npm/cmd-shim/pull/185) bump @npmcli/template-oss from 5.1.0 to 5.1.1 (#185) (@dependabot[bot], @npm-cli-bot)

## [9.0.1](https://github.com/npm/cmd-shim/compare/v9.0.0...v9.0.1) (2026-06-08)
### Bug Fixes
* [`1ca32a3`](https://github.com/npm/cmd-shim/commit/1ca32a3695a45fad94264845596dd1fe8a9ff8cc) [#178](https://github.com/npm/cmd-shim/pull/178) support running sh shim from wsl (#178) (@nadalaba)
### Chores
* [`30cad4d`](https://github.com/npm/cmd-shim/commit/30cad4d86e5ead4e9a0af3a8721558dccb74253b) [#183](https://github.com/npm/cmd-shim/pull/183) bump @npmcli/eslint-config from 6.0.1 to 7.0.0 (@dependabot[bot])
* [`3b7e7dc`](https://github.com/npm/cmd-shim/commit/3b7e7dc49931e69b1f2d866f0d3031d2d39fcb5d) [#182](https://github.com/npm/cmd-shim/pull/182) postinstall for dependabot template-oss PR (@npm-cli-bot)
* [`c64c525`](https://github.com/npm/cmd-shim/commit/c64c525ace25be9e8b725fe48042c96e1035dcdf) [#182](https://github.com/npm/cmd-shim/pull/182) bump @npmcli/template-oss from 5.0.0 to 5.1.0 (@dependabot[bot])

## [9.0.0](https://github.com/npm/cmd-shim/compare/v8.0.0...v9.0.0) (2026-05-08)
### ⚠️ BREAKING CHANGES
* `cmd-shim` now supports node `^22.22.2 || ^24.15.0 || >=26.0.0`
* template-oss-apply
### Features
* [`cafe52c`](https://github.com/npm/cmd-shim/commit/cafe52c183d7df07df7e89d6606c3891d40142ec) [#180](https://github.com/npm/cmd-shim/pull/180) bump to new node engine range (@owlstronaut)
* [`144590a`](https://github.com/npm/cmd-shim/commit/144590aa1fa25ce10df49e8d0b62f04f4e5984db) [#180](https://github.com/npm/cmd-shim/pull/180) template-oss-apply (@owlstronaut)
### Chores
* [`1cad536`](https://github.com/npm/cmd-shim/commit/1cad53657b10bb730cdddac01ea17b78587b7158) [#180](https://github.com/npm/cmd-shim/pull/180) template-oss-apply (@owlstronaut)
* [`c6bf555`](https://github.com/npm/cmd-shim/commit/c6bf555da3034dc4d0ef18f8f2f95756d1b9df85) [#170](https://github.com/npm/cmd-shim/pull/170) bump @npmcli/eslint-config from 5.1.0 to 6.0.0 (#170) (@dependabot[bot])
* [`39c2c01`](https://github.com/npm/cmd-shim/commit/39c2c014ca83bd719b48079b6920177a89c67f95) [#175](https://github.com/npm/cmd-shim/pull/175) bump @npmcli/template-oss from 4.29.0 to 4.30.0 (#175) (@dependabot[bot], @npm-cli-bot)

## [8.0.0](https://github.com/npm/cmd-shim/compare/v7.0.0...v8.0.0) (2025-10-22)
### ⚠️ BREAKING CHANGES
* align to npm 11 node engine range (#167)
### Bug Fixes
* [`561cb68`](https://github.com/npm/cmd-shim/commit/561cb6875be5b55adeee2cdbba24db62f7d86fc4) [#167](https://github.com/npm/cmd-shim/pull/167) align to npm 11 node engine range (#167) (@owlstronaut)
### Chores
* [`c254bd7`](https://github.com/npm/cmd-shim/commit/c254bd721e0ea82f5838e84eb185b75176b72dd0) [#161](https://github.com/npm/cmd-shim/pull/161) postinstall workflow updates (#161) (@owlstronaut)
* [`3dfe3ed`](https://github.com/npm/cmd-shim/commit/3dfe3ed17e44dbd2724665cbb7ad406b5bf1ba1d) [#168](https://github.com/npm/cmd-shim/pull/168) bump @npmcli/template-oss from 4.26.0 to 4.27.1 (#168) (@dependabot[bot], @npm-cli-bot)
* [`7a64d84`](https://github.com/npm/cmd-shim/commit/7a64d844e293d36046727d5acec9e7f7ea755219) [#158](https://github.com/npm/cmd-shim/pull/158) postinstall for dependabot template-oss PR (@hashtagchris)

## [7.0.0](https://github.com/npm/cmd-shim/compare/v6.0.3...v7.0.0) (2024-08-26)

### ⚠️ BREAKING CHANGES

* `cmd-shim` now supports node `^18.17.0 || >=20.5.0`

### Bug Fixes

* [`aaf6016`](https://github.com/npm/cmd-shim/commit/aaf601687a131bec7eb94ff06d8fb417f95eed6e) [#154](https://github.com/npm/cmd-shim/pull/154) align to npm 10 node engine range (@hashtagchris)

### Chores

* [`926af07`](https://github.com/npm/cmd-shim/commit/926af0785a59e512d3ea9316b58f98bbe9fb2a88) [#154](https://github.com/npm/cmd-shim/pull/154) run template-oss-apply (@hashtagchris)
* [`7c154f3`](https://github.com/npm/cmd-shim/commit/7c154f30af2c4e52d34320d044e1201017cbcea2) [#151](https://github.com/npm/cmd-shim/pull/151) postinstall for dependabot template-oss PR (@hashtagchris)
* [`21178ef`](https://github.com/npm/cmd-shim/commit/21178ef7fc0d087c3071451547e5c635cc19271e) [#151](https://github.com/npm/cmd-shim/pull/151) bump @npmcli/template-oss from 4.22.0 to 4.23.1 (@dependabot[bot])

## [6.0.3](https://github.com/npm/cmd-shim/compare/v6.0.2...v6.0.3) (2024-05-04)

### Bug Fixes

* [`dbe91b4`](https://github.com/npm/cmd-shim/commit/dbe91b4433990e0566903b29a2a17d81ded5890b) [#140](https://github.com/npm/cmd-shim/pull/140) linting: no-unused-vars (@lukekarrys)

### Documentation

* [`5598b4b`](https://github.com/npm/cmd-shim/commit/5598b4b5d04d42201543dc67b459f0a7db78c211) [#137](https://github.com/npm/cmd-shim/pull/137) readme: fix broken badge URLs (#137) (@10xLaCroixDrinker)

### Chores

* [`3140bb1`](https://github.com/npm/cmd-shim/commit/3140bb131f84ac8fc284f1120c5a963621cd001f) [#140](https://github.com/npm/cmd-shim/pull/140) bump @npmcli/template-oss to 4.22.0 (@lukekarrys)
* [`c944f6b`](https://github.com/npm/cmd-shim/commit/c944f6bb60f10b0c2aa803427233a7c76169a8c1) [#140](https://github.com/npm/cmd-shim/pull/140) postinstall for dependabot template-oss PR (@lukekarrys)
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
