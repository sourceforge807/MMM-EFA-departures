/* Magic Mirror
 * Module: MMM-EFA-departures
 *
 * By gefangenimnetz / https://github.com/gefangenimnetz/MMM-EFA-departures
 * MIT Licensed.
 * Forked and modified by sourceforge807 / https://github.com/sourceforge807
 * 
 * v0.0.1
 */

Module.register("MMM-EFA-departures", {

    defaults: {
		efaUrl: "http://efa107.efa.de/efaws2/default/XML_DM_REQUEST",
		stopID: "25000031",									//stopID offered by the provider (Hannover HBF in this case)
		stopName: "MMM-EFA is loading",						//initial module name
		lines: ['stop'],									//lines: ['DDB:92E01: :H','DDB:92E01: :R'], would only show the line S1 in both directions; ['all'] is a different option; if you will use specific lines use the stateless field in the result from the search script (except the last field :j21)
		reload: 60000,										//interval in ms (60000=60s)
		realDepTime: false,									//use real-time data
		toggleDepTime: true,								//Toggle relative/absolute time
		toggleDepTimePerReload: 6,							//Every 6 seconds
		fade: true,											//fade brightness
		fadePoint: 0.25,									//Start on 1/4th of the list. (1/maxDepartures would be ideal)
		maxDepartures: 4,									//maximum amount of departures displayed
		shortenMessage: 12, 								//false or a number
		language: "de",										//select de or en
    },

    start: function () {
		var self = this;
		Log.info("Starting module: " + this.name);

		this.sendSocketNotification("CONFIG", this.config);
		setInterval(function()
		{
			self.sendSocketNotification("CONFIG", self.config);
		}, this.config.reload);

        moment.updateLocale(this.config.language,
		{
			relativeTime :
			{
				future : '%s',
				past : '%s',
				s : this.translate("NOW"),
				m : "1 " + this.translate("MINUTE"),
				mm : "%d " + this.translate("MINUTE"),
				h : "+1 " + this.translate("HOUR"),
				hh : "%d " + this.translate("HOUR"),
				d : "+1 " + this.translate("DAY"),
				dd : "%d " + this.translate("DAYS"),
				M : "+1 " + this.translate("MONTH"),
				MM : "%s " + this.translate("MONTHS"),
				y : "+1 " + this.translate("YEAR"),
				yy : "%s " + this.translate("YEARS"),
			}
		});
	},

	getStyles: function ()
	{
		return ["MMM-EFA-departures.css"];
	},

	getScripts: function()
	{
		return ["moment.js", "classie.js"];
	},

	getTranslations: function ()
	{
		return {
			en: "translations/en.json",
			de: "translations/de.json"
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
                    
	getDom: function () {
		var wrapper = document.createElement("div");
		var header = document.createElement("header");
		header.innerHTML = this.config.stopName;
		wrapper.appendChild(header);
		this.loaded = true;

		if (this.loaded === false)
		{
			var text = document.createElement("div");
			text.innerHTML = this.translate("LOADING");
			text.className = "dimmed light small";
			wrapper.appendChild(text);
		}
		else if (!this.efa_data)
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

			if (this.config.toggleDepTime)
			{
				window.clearInterval(this.toggleTimeInt);
				this.toggleTimeInt = window.setInterval(function()
				{
					classie.toggle(departuresUL, 'departures__departure--show-time');
				}, (this.config.reload / this.config.toggleDepTimePerReload));
			}

			for (var d in departures)
			{
				var departuresLI = document.createElement("li");
				departuresLI.className = 'departures__departure';

				if (this.config.realDepTime === true && departures[d].servingLine.realtime === '1' && departures[d].hasOwnProperty('realDateTime') === true)
				{
					var departureTime = new Date(departures[d].realDateTime.year, departures[d].realDateTime.month-1, departures[d].realDateTime.day, departures[d].realDateTime.hour, departures[d].realDateTime.minute, 0);
				}
				else
				{
					var departureTime = new Date(departures[d].dateTime.year, departures[d].dateTime.month-1, departures[d].dateTime.day, departures[d].dateTime.hour, departures[d].dateTime.minute, 0);
				}

				var message = departures[d].servingLine.direction;
				if(this.config.shortenMessage && message.length > this.config.shortenMessage)
				{
					//message = message.slice(0, this.config.shortenMessage) + "&#8230;";
					message = message.slice(0, 20) + "&#8230;";
				}

				// slicing for long ice number + names
				var servingLineNumber = departures[d].servingLine.number;
				if(servingLineNumber.length > 8)
				{
					servingLineNumber = servingLineNumber.slice(0, 7);
				}

				var backgroundColor = "";
				var tripText = "";
				var tripCancelled = "";

				if (departures[d].hasOwnProperty('realtimeStatus') === true){

					switch (departures[d].realtimeStatus) {
            			case 'TRIP_CANCELLED':
							backgroundColor = "backgroundPurple";
							tripText = this.translate("CANCELLED");
							tripCancelled = "style=\"text-decoration:line-through;\""; //collision with style.opacity -> fading ??
						default:
							backgroundColor = "backgroundWhite";
							tripText= this.translate("UNKNOWN");
							tripCancelled = "style=\"text-decoration:blink;\"";
					}
				}

                if (this.config.realDepTime === true && departures[d].servingLine.realtime === '1')
				{
					departuresLI.innerHTML = '<span class="departures__departure__line__realtime xsmall" ' + tripCancelled + '>'+ servingLineNumber +'</span><span class="departures__departure__direction__realtime small' + backgroundColor + '" ' + tripCancelled + '>' + message + tripText + '&nbsp;&nbsp;</span><span class="departures__departure__time-relative small bright">' + moment(departureTime).fromNow() + '</span><span class="departures__departure__time-clock small bright">' + moment(departureTime).format('HH:mm') + '</span>';
                }
				else
				{
					departuresLI.innerHTML = '<span class="departures__departure__line xsmall" ' + tripCancelled + '>'+ servingLineNumber +'</span><span class="departures__departure__direction small ' + backgroundColor + '" ' + tripCancelled + '>' + message + tripText + '&nbsp;&nbsp;</span><span class="departures__departure__time-relative small bright">' + moment(departureTime).fromNow() + '</span><span class="departures__departure__time-clock small bright">' + moment(departureTime).format('HH:mm') + '</span>';
				}

				if (this.config.fade && this.config.fadePoint < 1)
				{
					if (this.config.fadePoint < 0)
					{
						this.config.fadePoint = 0;
					}
					var startingPoint = departures.length * this.config.fadePoint;
					var steps = departures.length - startingPoint;
					if (d >= startingPoint)
					{
						var currentStep = d - startingPoint;
						departuresLI.style.opacity = 1 - (1 / steps * currentStep);
					}
				}
				departuresUL.appendChild(departuresLI);

				if ( departures[d].hasOwnProperty('lineInfos') === true )
				{
					var lineInfoLI = document.createElement("li");
					lineInfoLI.className = 'marquee';
					lineInfoLI.innerHTML += '<span class="small" id="' + d + '">' + departures[d].lineInfos.lineInfo.infoText.subtitle + '</span>';
					lineInfoLI.style.opacity = departuresLI.style.opacity;
					departuresUL.appendChild(lineInfoLI);
				}
            }

			wrapper.appendChild(departuresUL);
		}
		return wrapper;
	}
});
