var builder = require('botbuilder');
var util = require('util');
var uuidV1 = require('uuid/v1');
var FORM = require('../FORM/form');

    var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/d9d90781-20e5-4ae3-aac2-1aaac0a19a58?subscription-key=e32845e73a0e4e08802623d425ec2b65&verbose=true&timezoneOffset=0&q=';
    var recognizer = new builder.LuisRecognizer(model);
    var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

    dialog.matches("POSTURALE", FORM("reload","posturale"));
    dialog.matches("AEROBICA", FORM("reload","aerobica"));
    dialog.matches("MUSCOLARE", FORM("reload","muscolare"));

    dialog.matches("ALL_GAMBE", FORM("reload","gambe"));
    dialog.matches("LEG_LOW", FORM("reload","LEG_LOW"));
    dialog.matches("LEG_MEDIUM", FORM("reload","LEG_MEDIUM"));
    dialog.matches("LEG_HARD", FORM("reload","LEG_HARD"));

    dialog.matches("ALL_CHEST", FORM("reload","chest"));

    dialog.onDefault(function (session) {
            session.userData.correlationId = uuidV1();
            session.beginDialog('askme:VA');
            session.endDialog();
    });


module.exports = dialog;