var builder = require('botbuilder');
var util = require('util');
var uuidV1 = require('uuid/v1');
var FORM = require('../FORM/form');

    var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/40f8c45b-c2fa-4b01-85fa-077162ca88f1?subscription-key=12341c8c2b0647aa85ff9255c0278c6e&verbose=true&timezoneOffset=0&q=';
    var recognizer = new builder.LuisRecognizer(model);
    var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

    dialog.matches("SALUTI", FORM("unicredit","remainders"));
    dialog.matches("RISTORANTI", FORM("unicredit","ristoranti"));
    dialog.matches("VEGAN", FORM("unicredit","vegan"));
    dialog.matches("EVENTI", FORM("unicredit","eventi"));
    dialog.matches("SPESA", FORM("unicredit","spesa"));
    dialog.matches("PREVENTIVO", FORM("unicredit","mutuo"));
    
    dialog.onDefault(function (session) {
            session.userData.correlationId = uuidV1();
            session.beginDialog('askme:VA');
            session.endDialog();
    });


module.exports = dialog;