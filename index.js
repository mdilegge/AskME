var restify = require('restify');
var builder = require('botbuilder');
var uuidV1 = require('uuid/v1');

var welcome = require('./dialogs/welcome');
var askMeVA = require('./dialogs//askMeVA').createLibrary;
var validators = require('./FORM//validators').createLibrary;
var environment = require('./UTILS/env').createLibrary;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});


var connector = environment().CONNECTOR();

/*
new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});*/
  
// Create chat bot
server.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector);
bot.library(welcome);
bot.library(validators());
bot.library(askMeVA());
bot.use(builder.Middleware.sendTyping());

//var projectName = process.env.NAME_PROJECT;
var projectName = "insurance";
if(projectName){
	/*
		Il BOT utilizza il modello LUIS associato al progetto...
	*/
	console.log("USO LUIS per " + projectName);
	var myLUIS = require('./LUIS/' + projectName);
    bot.dialog('/', myLUIS);
}else{
	/*
		Il BOT non utilizza il modello LUIS.
	*/
	bot.dialog('/', [
		function (session, args) {
            session.userData.correlationId = uuidV1();
            session.beginDialog('askme:VA');
            session.endDialog();
		}
	]);

}

bot.on('conversationUpdate', function(message){
	 if (message.membersAdded) {
        message.membersAdded.forEach((identity) => {
            if (identity.id === message.address.bot.id) {
			//	bot.beginDialog(message.address, 'welcome:/');
            }
        });
    }
});


