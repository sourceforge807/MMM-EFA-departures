const request = require('request');
const moment = require('moment');
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create(
{

    start: function()
	{
        console.log("Starting node helper for: " + this.name);
        this.config = null;
    },

    socketNotificationReceived: function(notification, payload)
    {
        var self = this;
        if(notification === 'CONFIG')
        {
            this.config = payload;

            var efa_url = this.config.efaUrl;
            efa_url += '?sessionID=0';				
            efa_url += '&requestID=0';
            efa_url += '&language=de';
            efa_url += '&useRealtime=' + this.config.realDepTime;
            efa_url += '&mode=direct';
            efa_url += '&dmLineSelectionAll=1';
            efa_url += '&name_dm=' + this.config.stopID;
            efa_url += '&type_dm=stop';
            efa_url += '&line=' + this.config.lines.join('&line=');
            efa_url += '&outputFormat=json';
            efa_url += '&limit=' + this.config.maxDepartures;
            efa_url += '&itdTime=' + moment().format('HHmm');
            efa_url += '&itdDate=' + moment().format('YYYYMMDD');
            efa_url += '&outputEncoding=UTF-8';
            efa_url += '&inputEncoding=UTF-8';
            efa_url += '&mId=efa_www';

            console.log("Efa url '" + efa_url + "' for stop '" + this.config.stopID + "' created.");

            this.getData(efa_url, this.config.stopID);
        }
    },

    getData: function(options, stopID)
    {
        var error = 0;

        request(options, (error, response, body) =>
        {

            if(!response || response === undefined || response.statusCode != 200)
            {
                console.log("Error getting response");
                error = 1;
            }

            if (!error || response.statusCode === 200)
            {

                console.log("Socket notification TRAMS with '" + this.config.stopID + "' status code ==> '" + response.statusCode + "'");

                this.sendSocketNotification("TRAMS" + stopID, JSON.parse(body));

            }
            else if (response === undefined)
            {
                console.log("Error getting tram connections; Response undefined");
            }
            else
            {
                console.log("Error getting tram connections " + response.statusCode); // ${response.statusCode} ??
            }
        });
    }
});
