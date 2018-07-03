var builder = require('botbuilder');

const library = new builder.Library('welcome');

    const MainOptions = {
        a: 'Vorrei informazioni sull\'assicurazione auto',
        b: 'Come posso tutelare la mia Impresa?',
        c: 'Ci sono soluzioni anche per la nautica?',
    };

    library.dialog('/', [
        function (session) {
                var welcomeCard = new builder.ThumbnailCard(session)
                            .text("Mi puoi chiedere informazioni sul mondo delle assicurazioni, come negli esempi che riporto sotto! ")
                            .title('Benvenuto nel BOT DELLE ASSICURAZIONI!')
                            .subtitle('Io rispondo a domande sulle assicurazioni')
                            .buttons([
                                builder.CardAction.imBack(session, MainOptions.a, MainOptions.a),
                                builder.CardAction.imBack(session, MainOptions.b, MainOptions.b),
                                builder.CardAction.imBack(session, MainOptions.c, MainOptions.c)
                                    ]);	        
                session.send(new builder.Message(session)
                            .addAttachment(welcomeCard));
                session.endDialog();
            
        }
    ]);

module.exports = library;