## 0.5.1 (05-28-2018)

### Bug fixes

* JSON export of map nodes now includes labelText and labelTitle
 
## 0.5 (04-13-2018)

### Breaking Changes

*   Removed DotToSvgExport from package, moved it to argdown-cli to keep package size small (Viz.js is huge)

## 0.4.1 (04-10-2018)

### Minor Changes

*   Implemented new configuration pattern for plugins (see Readme of argdown-parser for details)

### Bug fixes

*   Support relations resulting from conclusion-premise equivalences are no longer ignored if no equivalent statement is represented as statement node in map.

## 0.4.0 (03-22-2018)

### Breaking changes

*   Changed plugins to request/response syntax (requires argdown-parser 0.8.0)

### Bug fixes

*   Groups that only contain other groups are now also added to the map

## 0.3.1 (02-21-2018)

#### Bug fixes

*   Fixed argdown-parser peer dependency in package.json

## 0.3.0 (02-21-2018)

#### Major Changes

*   plugin that exports dot to svg

#### Minor Changes

*   Upgrade to argdown-parser 0.7.0
