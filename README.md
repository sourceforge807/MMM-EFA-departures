# MMM-EFA-departures
MagicMirror² module to show departures for public transport stations using the EFA system.

**Example Configuration for Düsseldorf HBF/Main Station:**
```
{
	disabled: false,
	module: "MMM-EFA-departures",
	header: "N&auml;chste Bahn",
	position: "top_right",
	config: {
		efaUrl: "http://efa107.efa.de/efaws2/default/XML_DM_REQUEST",
		stopID: "25000011",
		stopName: "MMM-EFA is loading", //initial module name
		lines: ["all"], //lines: ['DDB:92E01: :H','DDB:92E01: :R'], would only show the line S1 in both directions
		reload: 60000, //interval in ms (60000=60s)
		realDepTime: true, //use real-time data
		toggleDepTime: true, //Toggle relative/absolute time
		toggleDepTimePerReload: 6, //Every 6 seconds
		fade: true, //fade brightness
		fadePoint: 0.25, //Start on 1/4th of the list. (1/maxDepartures would be ideal)
		maxDepartures: 10, //maximum amount of departures displayed
		shortenMessage: 12, //false or a number
 		}
},

```



**Getting Station and Line IDs**  
you can get the information by viewing the source (in Chrome for instance) of the EFA-Page  
**view-source:http://efa107.efa.de/efaws2/default/XML_DM_REQUEST**  
To extract and search the line info, use the searchStation.sh script. 
