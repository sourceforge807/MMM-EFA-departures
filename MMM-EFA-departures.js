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
        stopID: "25001691",                                //stopID offered by the provider (Düsseldorf HBF in this case)
        stopName: "MMM-EFA is loading",                    //initial module name
        lines: ['stop'],                                    //lines: ['DDB:92E01: :H','DDB:92E01: :R'], would only show the line S1 in both directions; ['all'] is a different option; if you will use specific lines use the stateless field in the result from the search script (except the last field :j21)
        reload: 60000,                                     //interval in ms (60000=60s)
        realDepTime: false,                                 //use real-time data
        toggleDepTime: true,                              //Toggle relative/absolute time
        toggleDepTimePerReload: 6,                         //Every 10 seconds
        fade: true,                                        //fade brightness
        fadePoint: 0.25,                                   //Start on 1/4th of the list. (1/maxDepartures would be ideal)
        maxDepartures: 4,                                   //maximum amount of departures displayed
		shortenMessage: 12, //false or a number
    },

    start: function () {
        var self = this;
        Log.info("Starting module: " + this.name);

        this.sendSocketNotification("CONFIG", this.config);
        setInterval(function() {
            self.sendSocketNotification("CONFIG", self.config);
        }, this.config.reload);

        moment.updateLocale('de', {
            relativeTime : {
                future : 'in %s',
                past : 'vor %s',
                s : 'ein paar Sek.',
                m : '1 Min.',
                mm : '%d Min.',
                h : '1 Std.',
                hh : '%d Std.',
                d : '1 Tag',
                dd : '%d Tagen',
                M : '1 Mon.',
                MM : '%s Mon.',
                y : '1 Jahr',
                yy : '%s Jahren'
            }
        });
    },

    getStyles: function () {
        return ["MMM-EFA-departures.css"];
    },

    getScripts: function() {
        return ["moment.js", "classie.js"];
    },
   
    socketNotificationReceived: function (notification, payload) {
        if (notification === "TRAMS" + this.config.stopID) {
            this.efa_data = payload;
			this.config.stopName = "von " + payload.dm.input.input;
            this.updateDom();           
        }
    },
                    
    getDom: function () {
        var wrapper = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = this.config.stopName;
        wrapper.appendChild(header);
		this.loaded = true;

		if (this.loaded === false) {
            var text = document.createElement("div");
            //text.innerHTML = this.translate("LOADING");
            text.innerHTML = "LOADING......";
			text.className = "dimmed light small";
            wrapper.appendChild(text);
		} else if (!this.efa_data) {
			var text = document.createElement("div");
            //text.innerHTML = this.translate("NO DATA");
            text.innerHTML = "NO DATA";
			text.className = "dimmed light small";
            wrapper.appendChild(text);
		} else {
            var departuresUL = document.createElement("ul");
            departuresUL.className = 'small';
            var departures = this.efa_data.departureList;

            if (this.config.toggleDepTime){
                window.clearInterval(this.toggleTimeInt);
                this.toggleTimeInt = window.setInterval(function(){
                    classie.toggle(departuresUL, 'departures__departure--show-time');
                }, (this.config.reload / this.config.toggleDepTimePerReload));
            }

            for (var d in departures) {
                var departuresLI = document.createElement("li");
                departuresLI.className = 'departures__departure';

				if (this.config.realDepTime === true && departures[d].servingLine.realtime === '1') {
	                var departureTime = new Date(departures[d].realDateTime.year, departures[d].realDateTime.month-1, departures[d].realDateTime.day, departures[d].realDateTime.hour, departures[d].realDateTime.minute, 0);
					//console.log("Realtime in departures['" + d + "'].servingLine.realtime = '" + departures[d].servingLine.realtime + "' ");
				}else{
                    var departureTime = new Date(departures[d].dateTime.year, departures[d].dateTime.month-1, departures[d].dateTime.day, departures[d].dateTime.hour, departures[d].dateTime.minute, 0);
					//console.log("Realtime in departures['" + d + "'].servingLine.realtime = '" + departures[d].servingLine.realtime + "' ");
				}
				var delay = 0;
				var hidden = "hidden";
				var backgroundColor = "backgroundWhite";
				var sign = "";

				if (this.config.realDepTime === true && departures[d].servingLine.realtime === '1') {
					if (departures[d].servingLine.delay > 0){
						sign = "+";
						backgroundColor = "backgroundRed";
						hidden = "unhidden";
					}else if (departures[d].servingLine.delay < 0){
						backgroundColor = "backgroundGreen";
						hidden = "unhidden";
					}
				}

				var message = departures[d].servingLine.direction;
				if(this.config.shortenMessage && message.length > this.config.shortenMessage){
					message = message.slice(0, this.config.shortenMessage) + "&#8230;";
				}

                if (this.config.realDepTime === true && departures[d].servingLine.realtime === '1') {
                    departuresLI.innerHTML = '<span class="departures__departure__line__realtime xsmall">'+ departures[d].servingLine.number +'</span><span class="departures__departure__direction small">' + message + '&nbsp;&nbsp;</span><span class="departures__departure__time-relative small bright">' + moment(departureTime).fromNow() + '</span><span class="departures__departure__time-clock small bright">' + moment(departureTime).format('HH:mm') + '</span><span class="departures__departure__delay__time small bright ' + hidden + ' ' + backgroundColor + '">' + sign + '' + departures[d].servingLine.delay + '</span>';
                }else{
                    departuresLI.innerHTML = '<span class="departures__departure__line xsmall">'+ departures[d].servingLine.number +'</span><span class="departures__departure__direction small">' + message + '&nbsp;&nbsp;</span><span class="departures__departure__time-relative small bright">' + moment(departureTime).fromNow() + '</span><span class="departures__departure__time-clock small bright">' + moment(departureTime).format('HH:mm') + '</span><span class="departures__departure__delay__time small bright ' + hidden + ' ' + backgroundColor + '">' + sign + '' + departures[d].servingLine.delay + '</span>';
				}



                if (this.config.fade && this.config.fadePoint < 1) {
                    if (this.config.fadePoint < 0) {
                        this.config.fadePoint = 0;
                    }
                    var startingPoint = departures.length * this.config.fadePoint;
                    var steps = departures.length - startingPoint;
                    if (d >= startingPoint) {
                        var currentStep = d - startingPoint;
                        departuresLI.style.opacity = 1 - (1 / steps * currentStep);
                    }
                }

                departuresUL.appendChild(departuresLI);
            }





            wrapper.appendChild(departuresUL);
        }
        return wrapper;
    }
});
