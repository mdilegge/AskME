var builder = require('botbuilder');
var util = require('util');

var PhoneRegex = new RegExp(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/);
var EmailRegex = new RegExp(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
var DateRegex  = new RegExp(/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/);
var ShortDateRegex = new RegExp(/^(0[1-9]{1}|1[0-2]{1})\/\d{4}$/);
var CAPRegex   = new RegExp(/^\d{5}$/);
var CODERegex  = new RegExp(/^C.{8}$/);
var TAXCODERegex = new RegExp(/^([A-Za-z]{6}[0-9lmnpqrstuvLMNPQRSTUV]{2}[abcdehlmprstABCDEHLMPRST]{1}[0-9lmnpqrstuvLMNPQRSTUV]{2}[A-Za-z]{1}[0-9lmnpqrstuvLMNPQRSTUV]{3}[A-Za-z]{1})|([0-9]{11})$/);

var lib = new builder.Library('validators');

lib.dialog('notes',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return "stop" === response.toLowerCase() || (response && response.length <= 200);
    }));

lib.dialog('phonenumber',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return "stop" === response.toLowerCase() || PhoneRegex.test(response);
    }));

lib.dialog('email',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return "stop" === response.toLowerCase() || EmailRegex.test(response);
    }));

lib.dialog('date',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return "stop" === response.toLowerCase() || DateRegex.test(response) || ShortDateRegex.test(response);
    }));

lib.dialog('CAP',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return "stop" === response.toLowerCase() || CAPRegex.test(response);
    }));

lib.dialog('code',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return "stop" === response.toLowerCase() || CODERegex.test(response);
    }));

lib.dialog('taxCode',
    builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
        return "stop" === response.toLowerCase() || TAXCODERegex.test(response);
    }));

// Export createLibrary() function
module.exports.createLibrary = function () {
    return lib.clone();
};

module.exports.PhoneRegex = PhoneRegex;
module.exports.EmailRegex = EmailRegex;