var builder = require('botbuilder');
var util = require('util');
var uuidV1 = require('uuid/v1');
var FORM = require('../FORM/form');

    var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/f4b4c08f-c83b-49b1-9b42-1663fc95ef0e?subscription-key=e32845e73a0e4e08802623d425ec2b65&timezoneOffset=0&verbose=true&q=';
    var recognizer = new builder.LuisRecognizer(model);
    var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

    dialog.matches("SCOMMESSA", FORM("novomatic","gioco"));

    dialog.onDefault(function (session) {
            session.userData.correlationId = uuidV1();
            session.beginDialog('askme:VA');
            session.endDialog();
    });


module.exports = dialog;