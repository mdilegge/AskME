var builder = require('botbuilder');
var util = require('util');
var uuidV1 = require('uuid/v1');
var FORM = require('../FORM/form');

    var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/4b6ccc39-bcac-4ee8-8f41-51279a9001bb?subscription-key=12341c8c2b0647aa85ff9255c0278c6e&verbose=true';
    var recognizer = new builder.LuisRecognizer(model);
    var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

    dialog.matches("SALUTI", [
        function (session) {
            session.send("Salve!");
            session.endDialog();
        }
    ]);

    dialog.matches("INSULTI", [
        function (session) {
            session.send("Smettila per cortesia!");
            session.endDialog();
        }
    ]);

    dialog.matches("RINGRAZIAMENTI", [
        function (session) {
            //console.log(util.inspect(session, false, null));
            session.send("Grazie a te, torna presto a trovarci!");
            session.endDialog();
        }
    ]);

    dialog.matches("PREVENTIVO", FORM("insurance","preventivo"));
    dialog.matches("REACT", FORM("insurance","react"));
    dialog.matches("TESTUPLOAD", FORM("insurance","uploadFile"));

    dialog.onDefault(function (session) {
            session.userData.correlationId = uuidV1();
            session.beginDialog('askme:VA');
            session.endDialog();
    });


module.exports = dialog;