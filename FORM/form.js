var builder = require('botbuilder');
var util = require('util');
var fs = require('fs');
var math = require('mathjs');
var replaceall = require("replaceall");

//var request = require('request');

var environment = require('../UTILS/env').createLibrary;

const OPERATIONS = {
	SELECT:        'SELECT',
	ALERT:         'ALERT',
    CAP:           'CAP',
	TEXT:          'TEXT',
    TEXTVALIDATE:  'TEXTVALIDATE',
	DATE:          'DATE',
	NOTE:          'NOTE',
    GET_EMAIL:     'GET_EMAIL',
    SEND_EMAIL:    'SEND_EMAIL',
    CHECK:         'CHECK',
    ATTACH:        'ATTACH',
    UPLOAD:        'UPLOAD',
    DOWNLOAD:      'DOWNLOAD', 
    LOGIN:         'LOGIN',
    NUMBER:        'NUMBER',
    CALCULATE:     'CALCULATE',
    GOTO:          'GOTO',
    SUMMARY:       'SUMMARY'
};


const CHANNELS_ID = environment().CHANNELS_ID;
var CURRENT_CHANNEL;

function getLabel(session, step){
    isLabelFor = step.isLabelFor;
    text = step.text;
    if(session.userData.formData && session.userData.formData["RETRY"] && step.textRetry) text = step.textRetry;
    if(isLabelFor){
        labelStepValue = session.userData.formData[isLabelFor.step];
        text = isLabelFor[labelStepValue];
    }

/*
    if(text){
        switch(CURRENT_CHANNEL){
            case CHANNELS_ID.FACEBOOK: 
                text=replaceall("**", "*", text); 
                text=replaceall("*", "", text); 
                break;
            default: text = text;
        }
    }*/
    return text;
}

function getValidationOptions(session, step){
    return {
        prompt: getLabel(session, step),
        retryPrompt: step.invalidMsg?step.invalidMsg:"Il valore non è ammissibile!",
        maxRetries: step.maxRetries?step.maxRetries:3
    }
}

function makeSelect(session, step){
    message = getLabel(session, step);
    values  = step.values;
    labels  = step.labels;
    layout  = step.layout;
    typing  = step.typing?step.typing:"postBack";
    referredStep = step.referredStep;
    isCompleted = false;

    session.userData.formCache[step.name] = {};
    selectedYet = session.userData.formCache[step.name + "_SELECTED"];

    if(referredStep){
        isCompleted = session.userData.formCache[referredStep + "_ISCOMPLETE"];
    }

    var cardList = [];
    if(!layout){
        var myButtons = [];
        if(isCompleted && step.noRetry) values = step.noRetry;
        for (var item in values) {
            myButtons.push(
                {"type": typing,
                "value": values[item],
                "title": labels?labels[item]:values[item]}
            );
        }
        var buttonsCard = new builder.HeroCard(session).buttons([]);	
        buttonsCard.data.content.buttons = myButtons;
        cardList.push(buttonsCard);
        var msg = new builder.Message(session)
                             .text(message)
                             .attachments(cardList);
    }else{
        var newValues = [];
        var buttonCount = 0;
        for (var item in values) {
            if(session.userData.formData["RETRY"] && selectedYet.indexOf(item)!=-1) continue;
            var myButtons = [];
            var options = values[item].options;
            var labels = values[item].labels;
            var urlImage = values[item].image;
            var urlVideo = values[item].video;
            var description = values[item].description;
            var title = values[item].title;
            for(option in options){
                myButtons.push(
                    {"type": typing,
                    "value": options[option],
                    "title": labels?labels[option]:options[option]}
                );
                newValues.push(options[option]);
                session.userData.formCache[step.name][buttonCount] = item;
                buttonCount++;
            } 
            var buttonsCard = new builder.HeroCard(session)
                                         .text(description)
                                         .buttons([]);

            if(urlVideo){
                 buttonsCard = new builder.VideoCard(session)
                                         .text(description)
                                         .media([{ url: urlVideo }])
                                         .buttons([]);
            }
            
            if(urlImage) buttonsCard.data.content.images = [{url: urlImage}];
            if(title)  buttonsCard.data.content.title = title;
            buttonsCard.data.content.buttons = myButtons;

            cardList.push(buttonsCard);
        }
        values = newValues;
        var msg = new builder.Message(session)
                             .text(message)
        					 .attachmentLayout(builder.AttachmentLayout[layout])
                             .attachments(cardList);
    }

   builder.Prompts.choice(
      session,
      msg.data,
      values.join("|") + "|stop",
      {
        maxRetries: step.maxRetries?step.maxRetries:3,
        listStyle: builder.ListStyle.button
      }
   );
    
}

function makeDate(session, step){
   session.beginDialog('validators:date', getValidationOptions(session, step));
}

function makeSummary(session, step, next){
    var text = step.text;
    var USER_DATA = step.costraint?step.costraint:"";
    Object.keys(session.userData.formData).forEach(function(key) {
        if("ATTACHINFO"!=key){
            var value = session.userData.formData[key];
            if(value) USER_DATA = USER_DATA + "**" + key + "**: " + value + "<br/>";
        }
    });

    var reply = new builder.Message().text(text + USER_DATA)
    builder.Prompts.text(session, reply);
    next();

}

function sendMail(session, steps, step, customer){
    var REST_CLIENT = environment().REST_CLIENT;
    var TEMPLATE = 'FORM/' + customer + '/' + step.template;
    var body = fs.readFileSync(TEMPLATE, 'utf8');
    var USER_DATA = step.costraint?step.costraint:"";;

    receiver = step.receiver;
    subject = session.userData.formData[step.subject]?session.userData.formData[step.subject]:step.subject;
    sendToOwner = step.sendToOwner;
    mailService = step.mailService?step.mailService:"http://151.9.67.38:9001/VARS/sendMail";

    Object.keys(session.userData.formData).forEach(function(key) {
        if("ATTACHINFO"!=key){
            var value = session.userData.formData[key];
            if(value) USER_DATA = USER_DATA + "<p><b>" + key + ": </b>" + value + "</p>";
        }
    });
    body = util.format(body, USER_DATA); 

    var args = {
        data: {
            "receiver" : receiver?receiver:session.userData.formData.EMAIL,
            "subject": subject,
            "attach": session.userData.formData["ATTACHINFO"],
            "channel": CURRENT_CHANNEL,
            "body" : body
        },
        headers: { "Content-Type": "application/json" }
    };

    if(sendToOwner) args.data.copy = session.userData.formData.EMAIL;

    environment().TOKEN(function(token){
        if(args.data.attach){
            args.data.attach.authorization = "Bearer " + token;
            console.log("INVIO ============> ", args.data.attach);
        }
        var req =  REST_CLIENT.post(mailService, args, function (data, response) {});
    });
}

function getEMail(session, step){
    session.beginDialog('validators:email', getValidationOptions(session, step));
}

function makeNote(session, step){
    session.beginDialog('validators:notes', getValidationOptions(session, step));
}

function makeCAP(session, step){
    session.beginDialog('validators:CAP', getValidationOptions(session, step));
}

function makeValidField(session, step){
    session.beginDialog(step.validators, getValidationOptions(session, step));
}

function addAttach(session, step){
    builder.Prompts.attachment(
        session, 
        getLabel(session, step),
        {
            retryPrompt: step.invalidMsg?step.invalidMsg:"Il valore non è ammissibile!",
            maxRetries: step.maxRetries?step.maxRetries:1
        }
    );
}

function upload(session, response, next){
    if(response) session.userData.formData["ATTACHINFO"] =  response[0];
    next();
}

function download(session, response, next){
    contentType = step.contentType;
    contentUrl = step.contentUrl;
    fileName = step.fileName;

    var reply = new builder.Message()
        .text(step.text)
        .attachments([{ 
            name: fileName,
            contentType: contentType, 
            contentUrl: contentUrl }]);
     builder.Prompts.text(session, reply);
}

function check(session, step, next){
    isCheckFor = step.isCheckFor;
    checkValue = session.userData.formData[isCheckFor.step];
    if(!checkValue){
        if(isCheckFor.stop){
            session.send(isCheckFor.text);
            session.endDialog();
        }else{
            builder.Prompts.text(session, isCheckFor.text);
            if(isCheckFor.pushValue) session.userData.formData[isCheckFor.step] = isCheckFor.pushValue;
            next();
        }
    }else{
        next();
    }  
}

function login(session,step){
    var signMSG = new builder.SigninCard(session)
        .text(step.text)
        .button(step.button, step.url);
    builder.Prompts.text(session, new builder.Message(session).addAttachment(signMSG));
}

var replaceArgs = function(session,currentExpr, currentArgs){
    for(i in currentArgs){
        thisArg = currentArgs[i];
        thisArgsValue = session.userData.formData[thisArg] + "";
        currentExpr = replaceall("$"+i, thisArgsValue, currentExpr); 
    }
    return currentExpr;
}

function calculate(session, step){
    currentName = step.name;
    currentFunction = step.function;
    currentArgs = currentFunction.arguments;
    currentExpr = replaceArgs(session, currentFunction.expression, currentArgs);
    result = math.eval(currentExpr);
    session.userData.formData[currentName] = result;
}

function alert(session, step){
    currentAlert = getLabel(session, step);
    if(step.arguments){
        currentAlert = replaceArgs(session, currentAlert, step.arguments);
    }
    builder.Prompts.text(session, currentAlert);
}

function gotoStep(session, step, steps){
    receiverStep = step.to;
    for(i in steps){
        currentName = steps[i].name;
        if(currentName === receiverStep){
            session.dialogData['BotBuilder.Data.WaterfallStep'] = i - 1;
            session.userData.formData["RETRY"] = true;
            break;
        }
    }
}

/*
* Questa funzione di fatto non serve a nulla, ma è stata utilissima per capire come si estrae il contenuto
* dell'attach di skype.
*/
function TEST(){
    var buffers = [];
    var headers = {};
    headers['Authorization'] = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImEzUU4wQlpTN3M0bk4tQmRyamJGMFlfTGRNTSIsImtpZCI6ImEzUU4wQlpTN3M0bk4tQmRyamJGMFlfTGRNTSJ9.eyJhdWQiOiJodHRwczovL2FwaS5ib3RmcmFtZXdvcmsuY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZDZkNDk0MjAtZjM5Yi00ZGY3LWExZGMtZDU5YTkzNTg3MWRiLyIsImlhdCI6MTQ5MDE3ODMyMywibmJmIjoxNDkwMTc4MzIzLCJleHAiOjE0OTAxODIyMjMsImFpbyI6IkFRQUJBQUVBQUFEUk5ZUlEzZGhSU3JtLTRLLWFkcENKRXJpUUNTTldieXJjT3lRZU5LdHBWcmhaM3pMRDhtbDFVaDB6QTduUldYQ3BrOW1FcDM2U1dRSURTMmZaNGtMLXY0d3V6dERZSXlZeEgxM2tMZTc1VFNBQSIsImFwcGlkIjoiYzNjYzQ2NGYtOTk1MC00YmQ4LTljMGEtNjlkOTdiNzlkNGMyIiwiYXBwaWRhY3IiOiIxIiwiaWRwIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZDZkNDk0MjAtZjM5Yi00ZGY3LWExZGMtZDU5YTkzNTg3MWRiLyIsInRpZCI6ImQ2ZDQ5NDIwLWYzOWItNGRmNy1hMWRjLWQ1OWE5MzU4NzFkYiIsInZlciI6IjEuMCJ9.JXTe3t5GU-DuNwoehPRMFBZN0C_MhV5q-OJLTNZZcJjAQdQztEosWkcuZMDRYpFTE-DMF2zToblsFnNtnlKQaLykCyldoMu2fMtsKnd0QJHbMz359a9lqbaTVAll7VbRvuIcFbUZ-Yvwtp4_v7eHDzFkfbcpGlnbODwEECCBlst9DMB4N7pKSl0HH3RNI5TJmNK2FwqdgVqDdPilcvlkDC42TrfHZLRVhJw9_GVvHKnBRG_fH5yAH-IOXRrIKfLGo8NcmlcnKtU28DfNgbRGQ3x5kmsI2NweHZQuriAFrNKaMXW-SYXmJ8Bm79P1UFc4LGvSCKwjac2GCHT1sggCMw';
    headers['Content-Type'] = 'application/octet-stream';
    
    request({
        url: 'https://apis.skype.com/v2/attachments/0-weu-d3-dd577386f4cf3836e0a1fe7b8ff6860d/views/original',
        headers: headers,
        encoding: null
    }, function (err, res, body) {
        if (!err && res.statusCode == 200) {
            buffers.push(body);
        }
        console.log(buffers);
    });
}

var getForm = function(customer,formName){
    var CONF = require('./' + customer + '/conf.json');
    thisForm = [];
    var arr =  CONF[formName].steps;
    for (var i = 0, len = arr.length; i < len; i++) {
        thisForm.push(function (session, args, next) {
            CURRENT_CHANNEL = environment().CHANNEL(session);
            if(args.response && ("stop" === args.response || "stop" === args.response.entity)){
                session.send("Va bene, ci fermiamo qui; arrivederci!");
                session.endDialog();
                return;
            }

            maxSize = CONF[formName].steps.length;
            currentIndex = session.dialogData['BotBuilder.Data.WaterfallStep'];
            step = CONF[formName].steps[currentIndex];

            text            = getLabel(session, step);
            isValidFor      = step.isValidFor;
            stop            = step.stop;
            escapeInRetry   = step.escapeInRetry;

            if(currentIndex === 0){
                session.userData.formData = {};
                session.userData.formCache = {};
            }else{
                previous = CONF[formName].steps[currentIndex-1];
                if(args.response && previous.isFormField) session.userData.formData[previous.name] = args.response;
                if(previous.operation === OPERATIONS.SELECT){
                   // console.log(util.inspect(args, false, null));
                    if(args.response){
                        buttonIndex = args.response.index;
                        if(!session.userData.formCache[previous.name + "_SELECTED"]) session.userData.formCache[previous.name + "_SELECTED"] = [];
                        if(session.userData.formCache[previous.name][buttonIndex]) session.userData.formCache[previous.name + "_SELECTED"].push(session.userData.formCache[previous.name][buttonIndex]);
                        session.userData.formCache[previous.name + "_ISCOMPLETE"] = session.userData.formCache[previous.name + "_SELECTED"].length === previous.values.length;
                    }
                    session.userData.formData[previous.name] = session.message["text"];
                }
            }

            escape = false
            if(isValidFor){
                validStepValue = session.userData.formData[isValidFor.step];
                validValues = [isValidFor.value];
                if(Array.isArray(isValidFor.value)) validValues = isValidFor.value;
                if(validValues.indexOf(validStepValue) === -1){
                    escape = true; 
                }
            }

            if(session.userData.formData["RETRY"] && escapeInRetry){
                if(step.replaceWith) session.userData.formData[step.name] = session.userData.formData[step.replaceWith];
                escape = true; 
            }

            if(escape){
                next();
            }else{
                CURRENT_OPERATION = step.operation;
                switch (CURRENT_OPERATION) {
                    case OPERATIONS.SELECT:
                        makeSelect(session, step);
                        break;
                    case OPERATIONS.DATE:
                        makeDate(session, step);
                        break;
                    case OPERATIONS.GET_EMAIL:
                        getEMail(session, step);
                        break;
                    case OPERATIONS.SEND_EMAIL:
                        builder.Prompts.text(session, text);
                        sendMail(session, CONF[formName].steps, step, customer);
                        next();
                        break;
                    case OPERATIONS.CAP:
                        makeCAP(session, step);
                        break;
                    case OPERATIONS.TEXTVALIDATE:
                        makeValidField(session, step);
                        break;
                    case OPERATIONS.NOTE:
                        makeNote(session, step);
                        break;
                    case OPERATIONS.ALERT:
                        alert(session,step);
                        if(!stop) next();
                        break;
                    case OPERATIONS.CHECK:
                        check(session, step, next);
                        break;
                    case OPERATIONS.ATTACH:
                        addAttach(session, step, next);
                        break;
                    case OPERATIONS.UPLOAD:
                        upload(session, args.response, next);
                        break;
                    case OPERATIONS.DOWNLOAD:
                        download(session, args.response, next);
                        break;
                    case OPERATIONS.LOGIN:
                        login(session, step);
                        break;
                    case OPERATIONS.CALCULATE:
                        calculate(session, step);
                        break;
                    case OPERATIONS.GOTO:
                        gotoStep(session, step, CONF[formName].steps);
                        break;
                    case OPERATIONS.SUMMARY:
                        makeSummary(session, step, next);
                        break;
                    case OPERATIONS.NUMBER:
                        builder.Prompts.number(session, text);
                        break;
                    default:
                        builder.Prompts.text(session, text);
                        break;
                }

                if(step.forward){
                    next();
                }else if(currentIndex==maxSize-1 || stop){
                    session.endDialog();
                    return;
                } 
            } 
        });
    }

    return thisForm;
}

module.exports = getForm;