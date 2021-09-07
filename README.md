# MMM-EFA-departures
MagicMirror² module to show departures for public transport stations using the EFA system. It will work for all Traffic Companys wich use this service.
This is a fork from https://github.com/Dom1n1c/MMM-EFA-departures.
Thanks for the incredible basics.

## Installing the module

To install the module, assuming you have MagicMirror installed with the default configuration:

```shell
cd ~/MagicMirror/modules
git clone https://github.com/sourceforge807/MMM-EFA-departures.git
cd MMM-EFA-departures/
npm install
```

## Updating the module

Navigate to your module folder:
```shell
cd ~/MagicMirror/modules/MMM-EFA-departures
```
use command to pull new git from:
```shell
git pull
```
If you are experiencing the following message “your local changes to the following files would be overwritten by merge” because you have done local edits run this before (NOTE! backup the files you have edited in case you will need to pull some edits back, for exampel the CSS file if you have customized the look of the module:
```shell
git reset --hard
```

## Dependencies
* luxon<br>
Because moment.js is in maintenance mode I change to luxon.
Install luxon in modules/MMM-EFA-departures with:
```shell
npm install --save luxon
```
* node.js<br>
You also need node.js 13+ vor full ICU support. For older versions of node.js you need this guide: https://moment.github.io/luxon/#/install
hint: run
```shell
npm run rebuild
```
after update the node.js
* npm<br>
* [request](https://www.npmjs.com/package/request)<br>

## Languages
As of version 0.1.0, MMM-EFA-departures features language support for `German (de)` and `English (en)` mirrors.

## Prerequisite
A working installation of [MagicMirror<sup>2</sup>](https://github.com/MichMich/MagicMirror)

## Example Configuration for Hannover HBF/Main Station:
```
...
{
	disabled: false,
	module: "MMM-EFA-departures",
	header: "N&auml;chste Bahn",
	position: "top_right",
	config:
	{
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
		departureReplace:
		{
			"Hannover" : "H.-",
			"Hildesheim" : "HI.-",
			"Langenhagen" : "Lgh.-"
		}, //wich names will be replaced and shorten?
		lineInfos: true,				//show additional line info

 	}
}
...
```

**Getting Station and Line IDs**  
you can get the information by viewing the source (in Chrome for instance) of the EFA-Page  
**view-source:http://efa107.efa.de/efaws2/default/XML_DM_REQUEST**  
To extract and search the line info, use the searchStation.sh script. 

## Screenshot
![grafik](https://user-images.githubusercontent.com/30810603/132315707-edf2e469-0bba-4ed2-8ea4-be5c8114b2f5.png)
![grafik](https://user-images.githubusercontent.com/30810603/132316131-7b1c753e-c612-46bb-88eb-eb5072f9c97f.png)

## Confguration Options

| Name           | Optional | Description |
|----------------|---------------|---------------------------------|
| `efaUrl`|| Url to the efa page for the XML_DM_REQUEST. Do not change this url!! <br><br> **Default value:** _http://efa107.efa.de/efaws2/default/XML_DM_REQUEST_ |
| `stopID`|| stopID offered by the provider or using the searchStation.sh script. |
| `stopName`|X| initial module name. You can change it...or not.<br><br>**Possible values:** [text] <br> **Default value:** `MMM-EFA is loading`
| `lines`|X| Whitch lines needs to be fetched? If you will use spicific lines, use the stateless field in the result from the search script (except the last field :j21)<br><br> **Possible values:** `['all']`,`['stop']` or maybe `['DDB:92E01: :H','DDB:92E01: :R']`  <br> **Default value:** `['stop']`
| `reload`|X| Reloadintervall in seconds. <br><br> **Possible values:**  <br> **Default value:** `60`
| `realDepTime`|X| Use realtimedata or not. If there is no realtime data available, it will be shown in italic.<br><br> **Possible values:** `true` or `false` <br> **Default value:** `false`
| `toggleDepTime`|X| Toggle between relativ/ absolute time.<br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `toggleDepTimePerReload`|X| Intervall for toggeling the departuretime. <br><br> **Possible values:** `0` - `?` <br> **Default value:** `6` (seconds) |
| `fade`|X| Fade the departures?<br><br> **Possible values:** `true` or `false` <br> **Default value:** `true`
| `fadePoint`|X| Where to start fade? <br><br> **Possible values:** `0` (top of the list) - `1` (bottom of list) <br> **Default value:** `0.25`
| `maxDepartures`|X| How many departures will be shown? <br><br>**Possible values:** `0` - `?` <br> **Default value:** `4` |
| `shortenMessage`|X| Shortens the name of the targets. <br><br> **Possible values:** `0` - `?` <br> **Default value:** `12` |
| `language`|X| Select the Language. <br><br> **Possible values:** `de`, `en` <br> **Default value:** `de` |
| `departureReplace`|X| Names wich will be replaced with something you want an the departures will be shorten. <br><br> **Possible values:** `[text]` <br> **Default value:** `{"Hannover" : "H.-", "Hildesheim" : "HI.-", "Langenhagen" : "Lgh.-"}` |
| `linieInfos`|X| Show additional line info. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true` |
| `stopInfos`|X| Show additional stop info. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false` |
| `showDelay`|X| Show the delay, Delays of up to 5 minutes are shown in bold. Delays between 5 and 10 minutes are shown in bold and orange. Delays of 10 minutes or more are displayed in bold and red.  <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true` |
| `showTrainColor`|X| Shows the train type in color. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `true` |
| `colorStadtbahn`|X| Color of the type. <br><br> **Possible values:** All of CSS.supports() colors. <br> **Default value:** `#8E44AD` |
| `colorSBahn`|X| Color of the type. <br><br> **Possible values:** All of CSS.supports() colors. <br> **Default value:** `#CB4335` |
| `colorRBahn`|X| Color of the type. <br><br> **Possible values:** All of CSS.supports() colors. <br> **Default value:** `#17A589` |
| `colorIC`|X| Color of the type. <br><br> **Possible values:** All of CSS.supports() colors. <br> **Default value:** `#6495ED` |
| `colorICE`|X| Color of the type. <br><br> **Possible values:** All of CSS.supports() colors. <br> **Default value:** `#F1C40F` |
| `colorEC`|X| Color of the type. <br><br> **Possible values:** All of CSS.supports() colors. <br> **Default value:** `#A04C1A` |
| `colorBus`|X| Color of the type. <br><br> **Possible values:** All of CSS.supports() colors. <br> **Default value:** `#0404B4` |
| `colorErsatzverkehr`|X| Color of the type. <br><br> **Possible values:** All of CSS.supports() colors. <br> **Default value:** `#4B4040` |
| `showServingLineDelay`|X| Shows the servingLine delay. <br><br> **Possible values:** `true` or `false` <br> **Default value:** `false` |

## Licence
MIT License

Copyright (c) 2021 sourceforge807 (https://github.com/sourceforge807/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Versions
| Version           | Description |
|----------------|---------------|
| `0.0.1`|initial|
| `0.1.0`|Some bugfixes an new features.|
