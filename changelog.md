# MMM-EFA-departures changelog
This module adheres to [Semantic Versioning](http://semver.org/).

## [0.1.0] - 2021-09-07

### Added
- `maxLinesOverall` to limit the max rows. It overrules the maxDepartures
- `departureTransform()` to replace not required text in departures saved in `departureReplace: {}`
- `shortenMessage()` to short the departures by using `shortenMessage`. used by `departureTransform()`
- `lineInfos` option to show additional line infos
- `stopInfos` option to show additional stop infos
- `showTrainColor` option for show collored train types an define there color by `colorStadtbahn`,`colorSBahn`,`colorRBahn`,`colorIC`,`colorICE`,`colorEC`,`colorBus`,`colorErsatzverkehr`,
- `showDelay` option to show the delay as a `style=""` element (bold an bold + color)
- humanize seconds to "now"
- `sanitizeNumbers()` in the config
- `checkColor()` for the colored train type
- Check if is the `stopID` and `efaURL` is empty
- Add `text-decoration` to `line-through` if the trip ist cancelled
- Add some css attributes 

### Fixed
- Fixed some smaller bugs
- Fixed the translations (de, en)
- Fixed the css toggle attributes

### Changed
- Remove moment.js and use luxon instead

## [0.0.1] - 2021-08-24 
### Initial release
