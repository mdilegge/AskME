var builder = require('botbuilder');
var cheerio = require("cheerio");
var environment = require('../UTILS/env').createLibrary;

var lib = new builder.Library('askme');

const CONTROL_STRING = "-ASK-";

var markDownParser = function(chatMessage, isMarkdown, session){
		anchorHREF = " href=\"[HREF]\"";
		anchorSHORT = " short=\"[SHORT]\"";

		var linkContainer = []
		var $ = cheerio.load(chatMessage);
		$("a").each(function() {
			var link = $(this);
			var text = link.text();
			var href = link.attr("href");
			var short = link.attr("short");

			var currentLink = builder.CardAction.openUrl(session, href, short?short:text);
			linkContainer.push(currentLink);

			anchorHREF = anchorHREF.replace("[HREF]", href);
			anchorSHORT = anchorSHORT.replace("[SHORT]", short);		

			replacerString = "";
			if(isMarkdown){
				chatMessage = chatMessage.replace(text+"</a>",'');
				replacerString = "[" + text + "](" + href + ")";
			}

			chatMessage = chatMessage.replace(anchorHREF, "")
										.replace(anchorSHORT, "")
										.replace("<a target=\"_blank\">", replacerString);
		});
		chatMessage = chatMessage.replace(/<\/a>/g, '')
									.replace(/<strong>/g, isMarkdown?"*":'')
									.replace(/<\/strong>/g, isMarkdown?"*":'');
		return {
			linkContainer: linkContainer,
			chatMessage: chatMessage
		}	
}

lib.dialog('VA',[
	//Questa è la funzione che invoca il VA
	function (session, args) {
		messageSent = session.message;
		
		var MAX_SIZE_BUTTON_LIST = -1;
		var CURRENT_CHANNEL = environment().CHANNEL(session);
		var REST_CLIENT = environment().REST_CLIENT;		
		const CHANNELS_ID = environment().CHANNELS_ID;

		switch(CURRENT_CHANNEL){
			case CHANNELS_ID.FACEBOOK: MAX_SIZE_BUTTON_LIST = 3; break;
			case CHANNELS_ID.SKYPE: MAX_SIZE_BUTTON_LIST = 3; break;
			default: MAX_SIZE_BUTTON_LIST = 0;
		}

		var args = {
    		data: {
    			"projectId" : "5b45e386147318553b5e22cc", //process.env.ID_PROJECT, //ID del progetto VA salvato come variabile di ambiente in HEROKU
    			"channel" : "MSSNGR",
				"question" : "BUTTON",
				"correlationId": session.userData.correlationId
	    	},
    		headers: { "Content-Type": "application/json" }
		};

		var baseUrl = "http://askme.francecentral.cloudapp.azure.com:8080/AskMeSemRest/askmesem/rest/virtualAgentService/"; //process.env.BASE_URL;//Base del servizio salvata come variabile di ambiente in HEROKU
		var url = null;

		if(messageSent["text"].endsWith(CONTROL_STRING)){
			url = baseUrl + "answerByCategory"; //process.env.ACTION_CATEGORY;
			args.data.category = messageSent["text"].replace(CONTROL_STRING,"");
		}else{
			url = baseUrl + "searchAnswer";//process.env.ACTION_ANSWER;
			args.data.question = messageSent.text;
		}

		if (CURRENT_CHANNEL === CHANNELS_ID.DIRECTLINE){
			presentation = "You are now chatting with Bibi Virtual Agent.";
			if(!args.data.question || presentation === args.data.question){
				session.send("");
				return;
			} 
		} 

		var req =  REST_CLIENT.post(url, args, function (data, response) {
	    	chatMessage = data.answer;

			//Recupero htmlAnswerStructure e il suo contenuto htmlObj
			buttonsList = [];
			try {
				if("htmlAnswerStructure" in data){
					htmlAS = data.htmlAnswerStructure;
					if("htmlObj" in htmlAS){
						buttonsList = htmlAS.htmlObj;
					}
					if("htmlStructureBefore" in htmlAS){
						chatMessage = htmlAS.htmlStructureBefore;
					}
				}
			} catch (error) {
				//				
			}
	
			if(!chatMessage) chatMessage = "Non ho capito bene....";
			chatMessage = chatMessage.replace("<div><!--block-->","")
									 .replace("<!--block--></div>","")
									 .replace("</div>","")
									 .replace(/&nbsp;/g," ")
									 .replace(/<br>/g, '\n')
									 .replace(/&amp;/g, "&");

			/*
				A questo punto la risposta potrebbe essere semplice testo, 
				o contenere pulsanti.
			*/
			if(buttonsList.length==0){
				//Si tratta di semplice testo
				if (CURRENT_CHANNEL === CHANNELS_ID.FACEBOOK || CURRENT_CHANNEL === CHANNELS_ID.EMULATOR) {
					var MDP = markDownParser(chatMessage, false, session);

					var linkContainer = MDP.linkContainer;
					var linkCard = new builder.HeroCard(session)
											  .buttons(linkContainer);	        

					currentMessage = new builder.Message(session)
											   .text(MDP.chatMessage);
					if(linkContainer.length>0){
						currentMessage.addAttachment(linkCard);
					}
					session.send(currentMessage);
				}else {
					var MDP = markDownParser(chatMessage, true, session);
					session.send(MDP.chatMessage);
				}
			}else{
				var cardList = [];

			    var buttonsCard = new builder.HeroCard(session).text("Scegli...").buttons([]);	
				
				/*
				if (CURRENT_CHANNEL === CHANNELS_ID.SKYPE) {
					buttonsCard.text(chatMessage + " Scegli...");
				}*/

				myButtons = [];
				for (var item in buttonsList) {
				   if(item>0 && item%MAX_SIZE_BUTTON_LIST==0){
						buttonsCard.data.content.buttons = myButtons;
						cardList.push(buttonsCard);

						buttonsCard = new builder.HeroCard(session).buttons([]);	
						buttonsCard.text("...oppure..."); 
						myButtons = [];
				   };
				   currentButtonDescr = buttonsList[item];
				   myButtons.push(
					   {
						"type": "postBack",
						"value": currentButtonDescr.categoryId + CONTROL_STRING,
						"title": currentButtonDescr.objLabel
					}
				   );
				}
				if(myButtons.length>0){
					buttonsCard.data.content.buttons = myButtons;
					if(MAX_SIZE_BUTTON_LIST!=0 && buttonsList.length>MAX_SIZE_BUTTON_LIST) buttonsCard.text("...infine!"); 
					cardList.push(buttonsCard);
				}

				var msg = new builder.Message(session)
									.text(chatMessage)
									.attachmentLayout(builder.AttachmentLayout.carousel)
									.attachments(cardList);
				session.send(msg)
			}			
	
		});

		req.on('error', function (err) {
   			console.log('request error', err);
			session.send("Ora sono un poco occupato, tra qualche minuto torno da te!");
		});
	}
]);

module.exports.createLibrary = function () {
    return lib.clone();
};
