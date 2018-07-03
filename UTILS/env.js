
var builder = require('botbuilder');
var request = require('request');

var Client = require('node-rest-client').Client;

var env = (function(){
    return {
        CHANNEL: function(session){
            CURRENT_CHANNEL = session.message.address.channelId;
            console.log("CANALE =================> ", CURRENT_CHANNEL);
            return CURRENT_CHANNEL;
        },
        CHANNELS_ID:(function(){
            const CHANNELS_ID = {
                EMULATOR: "emulator",
                WEB: 'webchat',
                SKYPE: 'skype',
                FACEBOOK: 'facebook',
                TELEGRAM: 'telegram',
                DIRECTLINE: 'directline'
            };
            return CHANNELS_ID;
        })(),
        REST_CLIENT:(function(){
            var client = new Client();
            return client;
        })(),
        CONNECTOR: function(){
             return new builder.ChatConnector({
<<<<<<< HEAD
                appId: "554533f9-2182-42be-9473-bc3bd008b830",  //process.env.MICROSOFT_APP_ID,
=======
                appId: "c3cc464f-9950-4bd8-9c0a-69d97b79d4c2",  //process.env.MICROSOFT_APP_ID,
>>>>>>> a9285f630d2c8b81d6156c83f29ae0aac7a8c52e
                appPassword: process.env.MICROSOFT_APP_PASSWORD
            });
        },
        TOKEN:function(callback){
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            // Configure the request
            var options = {
                url: 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token',
                method: 'POST',
                headers: headers,
                form: {'grant_type': 'client_credentials', 'client_id': 'kmz9hdZmdFqi7VQDoe78094', 'client_secret': process.env.MICROSOFT_APP_PASSWORD, 'scope':'https://api.botframework.com/.default'}
				//form: {'grant_type': 'client_credentials', 'client_id': process.env.MICROSOFT_APP_ID, 'client_secret':process.env.MICROSOFT_APP_PASSWORD, 'scope':'https://api.botframework.com/.default'}
            }

            // Start the request
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(JSON.parse(body).access_token);
                }
            })
        }
    }
}());

module.exports.createLibrary = function () {
    return env;
};
