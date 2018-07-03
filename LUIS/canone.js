var builder = require('botbuilder');
var util = require('util');


    var model = 'https://api.projectoxford.ai/luis/v2.0/apps/55e9b874-760d-4695-aa55-a9ea8b5531a3?subscription-key=12341c8c2b0647aa85ff9255c0278c6e&verbose=true';
    var recognizer = new builder.LuisRecognizer(model);
    var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

	dialog.matches("programmazione", [
		function (session, args) {
			console.log(args);
			pMessage =[
				new builder.HeroCard(session)
					.images([
						builder.CardImage.create(session, 'https://glacial-atoll-11053.herokuapp.com/images/logo-rai.png')
					])
					.buttons([
						builder.CardAction.openUrl(session, 'http://www.raiplay.it/guidatv/', 'I programmi di oggi')
					]),		

				new builder.HeroCard(session)
					.images([
						builder.CardImage.create(session, 'https://glacial-atoll-11053.herokuapp.com/images/logo-mediaset.png')
					])
					.buttons([
						builder.CardAction.openUrl(session, 'http://www.mediaset.it/guidatv/', 'I programmi di oggi')
					]),		

				new builder.HeroCard(session)
					.images([
						builder.CardImage.create(session, 'https://glacial-atoll-11053.herokuapp.com/images/logo-sky.png')
					])
					.buttons([
						builder.CardAction.openUrl(session, 'http://guidatv.sky.it/guidatv/', 'I programmi di oggi')
					])	

	];
			session.send(new builder.Message(session)
					.attachmentLayout(builder.AttachmentLayout.carousel)
					.attachments(pMessage));
		}
	]);
	dialog.matches('canone', function (session) {
			session.beginDialog('/VA');
			session.endDialog();
		});
	dialog.onDefault(function (session) {
			session.beginDialog('/VA');
			session.endDialog();
		});

module.exports = dialog;