# MMM-EFA-departures changelog
This module adheres to [Semantic Versioning](http://semver.org/).

## [0.1.0] - 2021-09-07

### Added
- maxLinesOverall to limit the max rows. It overrules the maxDepartures 
- shortenMessage to short an filter the destination
- departureReplace to deplace not required text in departures
- Option to show additional line infos
- Option to show additional stop infos
- Option for show collored train types an define there color
- Option to show the delay as a style="" element (bold an bold + color)
- humanize seconds
- sanitize numbers in the config
- checkColor for the colored train type
- check if is the stopID and efaURL is empty
- add text-decoration to line-through if the trip ist cancelled

### Fixed
- Fixed some smaller bugs

### Changed
- Remove moment.js and use luxon instead

## [0.0.1] - 2021-08-24 
### Initial release
