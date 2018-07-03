var builder = require('botbuilder');
var util = require('util');
var uuidV1 = require('uuid/v1');
var FORM = require('../FORM/form');

    var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/811d8cdf-8063-44ec-88fa-67ade509319f?subscription-key=12341c8c2b0647aa85ff9255c0278c6e&verbose=true&timezoneOffset=0&q=';
    var recognizer = new builder.LuisRecognizer(model);
    var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

    dialog.matches("CREDITCARD", FORM("demowind","creditCard"));
    dialog.matches("LINEA", FORM("demowind","linea"));

    dialog.onDefault(function (session) {
            session.userData.correlationId = uuidV1();
            session.beginDialog('askme:VA');
            session.endDialog();
    });


module.exports = dialog;