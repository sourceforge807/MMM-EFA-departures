/* Magic Mirror
 * Module: MMM-EFA-departures
 *
 * By gefangenimnetz / https://github.com/gefangenimnetz/MMM-EFA-departures
 * MIT Licensed.
 * Forked and modified by sourceforge807 / https://github.com/sourceforge807
 * 
 * v0.1.0
 */

Module.register("MMM-EFA-departures", {
	requiresVersion: '2.1.0',
    defaults: {
		efaUrl: "http://efa107.efa.de/efaws2/default/XML_DM_REQUEST",
		stopID: "25000031",							//stopID offered by the provider (Hannover HBF in this case)
		stopName: "MMM-EFA is loading",						//initial module name
		lines: ['stop'],							//lines: ['DDB:92E01: :H','DDB:92E01: :R'], would only show the line S1 in both directions; ['all'] is a different option; if you will use specific lines use the stateless field in the result from the search script (except the last field :j21)
		reload: 60000,								//interval in ms (60000=60s)
		realDepTime: false,							//use real-time data
		toggleDepTime: true,							//Toggle relative/absolute time
		toggleDepTimePerReload: 6,						//Every 6 seconds
		fade: true,								//fade brightness
		fadePoint: 0.25,							//Start on 1/4th of the list. (1/maxDepartures would be ideal)
		maxDepartures: 4,							//maximum amount of departures displayed
		maxLinesOverall : 10,							//include text messages; this overrides the max departures lines
		shortenMessage: 12, 							//false or a number
		language: "ru",								//select de or en
		departureReplace: {"Hannover" : "H.-", "Hildesheim" : "HI.-"},
		lineInfos: true,							//show additional line info
		stopInfos: false,							//show additional stop info
		showTrainColor: true,
		colorStadtbahn: "#8E44AD",
		colorSBahn: "#CB4335",
		colorRBahn: "#17A589",
		colorIC: "#6495ED",
		colorICE: "#F1C40F",
		colorEC: "#A04C1A",
		colorBus: "#0404B4",
		colorErsatzverkehr: "#4B4040",
		showDelay: true,
	    	showServingLineDelay: false,
    },

    start: function () {
		var self = this;
		Log.info("Starting module: " + this.name);

		this.sendSocketNotification("CONFIG", this.config);
		setInterval(function()
		{
			self.sendSocketNotification("CONFIG", self.config);
		}, this.config.reload);

		this.sanitizeNumbers([
			"stopID",
			"reload",
			"toggleDepTimePerReload",
			"maxDepartures",
			"shortenMessage"
		]);

		this.checkColor([
			"colorStadtbahn",
			"colorSBahn",
			"colorRBahn",
			"colorIC",
			"colorICE",
			"colorEC",
			"colorBus",
			"colorErsatzverkehr"
		]);
	},

	getStyles: function ()
	{
		return ["MMM-EFA-departures.css"];
	},

	getScripts: function()
	{
		return ["classie.js", this.file("/node_modules/luxon/build/global/luxon.min.js")];
	},

	getTranslations: function ()
	{
		return {
			de: "translations/de.json",
			en: "translations/en.json"
		};
	},

	socketNotificationReceived: function (notification, payload)
	{
		if (notification === "TRAMS" + this.config.stopID)
		{
			this.efa_data = payload;
			this.config.stopName = this.translate("FROM") + payload.dm.input.input;
			this.updateDom();           
		}
	},
                    
	getDom: function ()
	{
		var wrapper = document.createElement("div");

		if ( this.config.stopID === "" )
		{
			wrapper.innerHTML = this.translate("NOSTOPID") + this.name + this.translate("DOT");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if ( this.config.efaUrl === "" )
		{
			wrapper.innerHTML = this.translate("NOEFAURL") + this.name + this.translate("DOT");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var header = document.createElement("header");
		header.innerHTML = this.config.stopName;
		wrapper.appendChild(header);

		this.loaded = true;

		if ( this.loaded === false )
		{
			var text = document.createElement("div");
			text.innerHTML = this.translate("LOADING");
			text.className = "dimmed light small";
			wrapper.appendChild(text);
		}
		else if ( !this.efa_data )
		{
			var text = document.createElement("div");
			text.innerHTML = this.translate("NODATA");
			text.className = "dimmed light small";
			wrapper.appendChild(text);
		}
		else
		{
			var departuresUL = document.createElement("ul");
			departuresUL.className = 'small';
			var departures = this.efa_data.departureList;
			var counter = 1;



			// classie ersetzen mit https://www.w3schools.com/howto/howto_js_toggle_class.asp ?!?!
			if ( this.config.toggleDepTime )
			{
				window.clearInterval(this.toggleTimeInt);
				this.toggleTimeInt = window.setInterval(function()
				{
					classie.toggle(departuresUL, 'departures__departure--show-time');
				}, (this.config.reload / this.config.toggleDepTimePerReload));
			}


			for ( var d in departures )
			{
				if ( counter > this.config.maxLinesOverall )
				{
					break;
				}

				var departuresLI = document.createElement("li");
				departuresLI.className = 'departures__departure';

				if ( this.config.realDepTime === true && departures[d].servingLine.realtime === '1' && departures[d].hasOwnProperty('realDateTime') === true )
				{
					var departureTime = luxon.DateTime.local(
														parseInt(departures[d].realDateTime.year),
														parseInt(departures[d].realDateTime.month),
														parseInt(departures[d].realDateTime.day),
														parseInt(departures[d].realDateTime.hour),
														parseInt(departures[d].realDateTime.minute)
													);
				}
				else
				{
					var departureTime = luxon.DateTime.local(
														parseInt(departures[d].dateTime.year),
														parseInt(departures[d].dateTime.month),
														parseInt(departures[d].dateTime.day),
														parseInt(departures[d].dateTime.hour),
														parseInt(departures[d].dateTime.minute)
													);
				}

				var departureTimeRelative = departureTime.setLocale(this.config.language).toRelative({ base: luxon.DateTime.now(), style: "short" });
				var departureTimeAbsolute = departureTime.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);

				// humanize seconds
				var diff = Math.round((departureTime- luxon.DateTime.now()) / (1000*60));
				if ( (diff <= 1 && diff >= 0) || (diff >= -1 && diff <= 0) )
				{
					departureTimeRelative = this.translate("NOW");
				}

				// slicing and transform departures
				var departure = departures[d].servingLine.direction;
				if ( this.config.shortenMessage && departure.length > this.config.shortenMessage )
				{
					departure = this.departureTransform(departure);
				}

				// slicing for long ice number + names
				var servingLineNumber = departures[d].servingLine.number;
				if ( servingLineNumber.length > 8 )
				{
					servingLineNumber = servingLineNumber.slice(0, 7);
				}

				var backgroundColor = "";
				var tripText = "";
				var tripCancelled = "";
				var styleTrainNumber = '';
				var styleTrainName = '';

				if ( departures[d].hasOwnProperty('realtimeStatus') === true ){
					switch (departures[d].realtimeStatus) {
						case 'TRIP_CANCELLED':
							backgroundColor = "backgroundPurple";
							tripText = this.translate("CANCELLED");
							tripCancelled = 'text-decoration:line-through\;'; //collision with style.opacity -> fading ??
							break;
						default:
							backgroundColor = "backgroundWhite";
							tripText= this.translate("UNKNOWN");
							tripCancelled = 'text-decoration:blink\;';
					}
				}

				var trainColor = '';
				if ( this.config.showTrainColor === true )
				{
					var trainColor = this.getTrainColor(departures[d].servingLine.name, departures[d].servingLine.trainType);
				}
				else
				{
					var trainColor = "";
				}

				// shows the delay as a style
				var delay = '';
				if ( this.config.showDelay === true && departures[d].servingLine.hasOwnProperty('delay') === true )
				{
					if ( departures[d].servingLine.delay > 0 && departures[d].servingLine.delay <= 5 )
					{
						delay = 'font-weight: bold\;';
					}
					else if ( departures[d].servingLine.delay > 5 && departures[d].servingLine.delay <= 10 )
					{
						delay = 'font-weight: bold; color: orange\;';
					}
					else if ( departures[d].servingLine.delay > 10 )
					{
						delay = 'font-weight: bold; color: red\;';
					}
					
					var sign = "";
					if ( departures[d].servingLine.delay > 0 && this.config.showServingLineDelay === true )
					{
						sign = "+";
						servingLineDelay = ' ( ' + sign + departures[d].servingLine.delay + ' ) ';
					}
					else if ( departures[d].servingLine.delay < 0 && this.config.showServingLineDelay === true )
					{
						sign = "-";
						servingLineDelay = ' ( ' + sign + departures[d].servingLine.delay + ' ) ';
					}
					else
					{
						sign = "";
					}

				}

				styleTrainNumber = 'style="' + tripCancelled + trainColor + '"';
				styleTrainName = 'style="' + tripCancelled + delay + '"';

				if ( this.config.realDepTime === true && departures[d].servingLine.realtime === '1' )
				{
					departuresLI.innerHTML = '<span class="departures__departure__line__realtime xsmall" ' + styleTrainNumber + '>' + servingLineNumber + '</span><span class="departures__departure__direction__realtime small' + backgroundColor + '" ' + styleTrainName + '>' + departure + tripText + '&nbsp;&nbsp;</span><span class="departures__departure__time__realtime-relative small bright" ' + styleTrainName + '>' + departureTimeRelative + '</span><span class="departures__departure__time__realtime-clock small bright" ' + styleTrainName + '>' + departureTimeAbsolute + '</span>';
					counter++;
				}
				else
				{
					departuresLI.innerHTML = '<span class="departures__departure__line xsmall" ' + styleTrainNumber + '>' + servingLineNumber + '</span><span class="departures__departure__direction small ' + backgroundColor + '" ' + styleTrainName + '>' + departure + tripText + '&nbsp;&nbsp;</span><span class="departures__departure__time-relative small bright" ' + styleTrainName + '>' + departureTimeRelative + '</span><span class="departures__departure__time-clock small bright" ' + styleTrainName + '>' + departureTimeAbsolute + '</span>';
					counter++;
				}


				if ( this.config.fade && this.config.fadePoint < 1 )
				{
					if ( this.config.fadePoint < 0 )
					{
						this.config.fadePoint = 0;
					}
					var startingPoint = departures.length * this.config.fadePoint;
					var steps = departures.length - startingPoint;
					if ( d >= startingPoint )
					{
						var currentStep = d - startingPoint;
						departuresLI.style.opacity = 1 - (1 / steps * currentStep);
					}
				}
				departuresUL.appendChild(departuresLI);

				// bahnen
				if ( departures[d].hasOwnProperty('lineInfos') === true && this.config.lineInfos === true && departures[d].lineInfos )
				{
					var lineInfoLI = document.createElement("li");
					lineInfoLI.className = 'marquee';
					lineInfoLI.innerHTML += '<span class="small" id="' + d + '">' + departures[d].lineInfos.lineInfo.infoText.subtitle + '</span>';
					lineInfoLI.style.opacity = departuresLI.style.opacity;
					departuresUL.appendChild(lineInfoLI);
					counter++;
				}


				// busse
				if ( departures[d].hasOwnProperty('stopInfos') === true && this.config.stopInfos === true && departures[d].stopInfos )
				{
					for ( var e in departures[d].stopInfos )
					{
						var stopInfoLI = document.createElement("li");
						stopInfoLI.className = 'marquee';
						stopInfoLI.innerHTML += '<span class="small" id="' + d + '">' + departures[d].stopInfos[e].infoText.subtitle + '</span>';
						stopInfoLI.style.opacity = departuresLI.style.opacity;
						departuresUL.appendChild(stopInfoLI);
						counter++;
					}
					
				}
			}
			wrapper.appendChild(departuresUL);
		}
		return wrapper;
	},

	/* shorten(string, maxLength)
	 * Shortens a string if it's longer than maxLength.
	 * Adds an ellipsis to the end.
	 *
	 * argument string string - The string to shorten.
	 * argument maxLength number - The max length of the string.
	 *
	 * return string - The shortened string.
	 */
	shorten: function (string, maxLength)
	{
		if ( string.length > maxLength )
		{
			return string.slice(0, maxLength) + "&hellip;"; // &#8230;
		}

		return string;
	},


	/* departureTransform(departure)
	 * Transforms the departure for usage.
	 * Replaces parts of the text as defined in config.departureReplace.
	 * Shortens departure based on config.shortenMessage
	 *
	 * argument departure string - The departure to transform.
	 *
	 * return string - The transformed departure.
	 */
	departureTransform: function (departure)
	{
		for ( var needle in this.config.departureReplace )
		{
			var replacement = this.config.departureReplace[needle];

			var regParts = needle.match(/^\/(.+)\/([gim]*)$/);
			if ( regParts )
			{
			  // the parsed pattern is a regexp.
			  needle = new RegExp(regParts[1], regParts[2]);
			}

			departure = departure.replace(needle, replacement);
		}
		departure = this.shorten(departure, this.config.shortenMessage);
		return departure;
	},

	/*
	 * For any config parameters that are expected as integers, this
	 * routine ensures they are numbers, and if they cannot be
	 * converted to integers, then the module defaults are used.
	 *
	 * argument key int - The keys to sanitize.
	 *
	 * return key - The sanitized or the default key.
	 */
	sanitizeNumbers: function(keys)
	{

		var self = this;
		keys.forEach(function(key)
		{
			if ( isNaN(parseInt(self.config[key])) )
			{
				self.config[key] = self.defaults[key];
			}
			else
			{
				self.config[key] = parseInt(self.config[key]);
			}
		});
	},

	checkColor: function(keys)
	{
		var self = this;
		keys.forEach(function(key)
		{
			if ( !CSS.supports("color", self.config[key]) )
			{
				self.config[key] = self.defaults[key];
			}
		});
	},

	getTrainColor: function(name, type)
	{
		var style = '';

		if ( type == "ICE" )
		{
			name = type;
		}

		switch (name) {
			case 'Stadtbahn':
				style = 'border-color:' + this.config.colorStadtbahn + '; border-style: solid; border-radius: 6px\;';
				break;
			case 'S-Bahn':
				style = 'border-color:' + this.config.colorSBahn + '\; border-style: solid\; border-radius: 6px\;"';
				break;
			case 'R-Bahn':
				style = 'border-color:' + this.config.colorRBahn + '\; border-style: solid\; border-radius: 6px\;"';
				break;
			case 'InterCity':
				style = 'border-color:' + this.config.colorIC + '\; border-style: solid\; border-radius: 6px\;"';
				break;
			case 'ICE':
			case 'InterCityExpress':
				style = 'border-color:' + this.config.colorICE + '\; border-style: solid\; border-radius: 6px\;"';
				break;
			case 'EC':
			case 'EuroCity':
				style = 'border-color:' + this.config.colorEC + '\; border-style: solid\; border-radius: 6px\;"';
				break;
			case 'Bus':
				style = 'border-color:' + this.config.colorBus + '\; border-style: solid\; border-radius: 6px\;"';
				break;Ersatzverkehr
			case 'Ersatzverkehr':
				style = 'border-color:' + this.config.colorErsatzverkehr + '\; border-style: solid\; border-radius: 6px\;"';
				break;Ersatzverkehr
			default:
				style = 'border-color:black; border-style: solid\; border-radius: 6px\;"';
		}

		return style;
	}
});
