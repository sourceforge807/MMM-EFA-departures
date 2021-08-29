# MMM-EFA-departures
MagicMirror² module to show departures for public transport stations using the EFA system.
This is a fork from https://github.com/Dom1n1c/MMM-EFA-departures.
Thanks for the incredible basics.

**Example Configuration for Hannover HBF/Main Station:**
```
{
	disabled: false,
	module: "MMM-EFA-departures",
	header: "N&auml;chste Bahn",
	position: "top_right",
	config: {
		efaUrl: "http://efa107.efa.de/efaws2/default/XML_DM_REQUEST",
		stopID: "25000031",
		stopName: "MMM-EFA is loading", 		//initial module name
		lines: ["all"], 				//lines: ['DDB:92E01: :H','DDB:92E01: :R'], would only show the line S1 in both directions; ['stop'] is a different option; if you will use specific lines use the stateless field in the result from the search script (except the last field :j21)
		reload: 60000, 					//interval in ms (60000=60s)
		realDepTime: true, 				//use real-time data; if there is no realtime data, you have italic formatet messages
		toggleDepTime: true, 				//Toggle relative/absolute time
		toggleDepTimePerReload: 6, 			//Every 6 seconds
		fade: true, 					//fade brightness
		fadePoint: 0.25, 				//Start on 1/4th of the list. (1/maxDepartures would be ideal)
		maxDepartures: 10, 				//maximum amount of departures displayed
		shortenMessage: 12, 				//false or a number
 		}
},

```



**Getting Station and Line IDs**  
you can get the information by viewing the source (in Chrome for instance) of the EFA-Page  
**view-source:http://efa107.efa.de/efaws2/default/XML_DM_REQUEST**  
To extract and search the line info, use the searchStation.sh script. 

# Confguration Options

| Name           | Description |
|----------------|---------------------------------|
| `efaUrl`      | Url to the efa page for the XML_DM_REQUEST. Do not Cchange this url!! <br><br> **Default value:** _http://efa107.efa.de/efaws2/default/XML_DM_REQUEST_ |
| `stopID`    | stopID offered by the provider or using the searchStation.sh script. |
| `stopName`     | initial module name. You can change it...or not.<br><br>**Possible values:** [text] <br> **Default value:** _MMM-EFA is loading_
| `lines` | Whitch lines needs to be fetched? If you will use spicific lines, use the stateless field in the result from the search script (except the last field :j21)<br><br> **Possible values:** `['all']`,`['stop']` or maybe `['DDB:92E01: :H','DDB:92E01: :R']`  <br> **Default value:** `['stop']`
| `reload`     | Reloadintervall in seconds <br><br> **Possible values:**  <br> **Default value:** `60`
| `realDepTime` | Use realtimedata or not. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `toggleDepTime`     | Toggle between relativ/ absolute time.<br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `toggleDepTimePerReload`           | Intervall for toggeling the departuretime. <br><br> **Possible values:** `0` - `?` <br> **Default value:** `6` (seconds) |
| `fade` | Fade the departures?.<br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `fadePoint`      | Where to start fade? <br><br> **Possible values:** `0` (top of the list) - `1` (bottom of list) <br> **Default value:** `0.25`
| `maxDepartures`   | How many departures will be shown? **Possible values:** `0` - `?` <br> **Default value:** `4` |
| `shortenMessage`  | Shortens the name of the targets. <br><br> **Possible values:** `0` - `?` <br> **Default value:** `12` |
| `language`          | Select the Language. <br><br> **Possible values:** `de`, `en` <br> **Default value:** `de` |

