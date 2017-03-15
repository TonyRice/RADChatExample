var App = require("sdk").App;

module.exports.start = function(){
    App.register("package.json", function (app) {

        var DataBus = require('databus').create();

        var addressTokens = DataBus.getMap('private.radchat.auth_tokens');

        var dataMap = DataBus.getMap('private.radchat.data');

        if(!dataMap.hasOwnProperty('_lastMessages')){
            dataMap['_lastMessages'] = [];
        }

        var DustyPlates = load("dusty-plates"),
            dustyData = DustyPlates.dustyData();

        // This will handle our app data regularly..
        app.registerMethod("appData", function(msg){
            msg.reply({name: dustyData.appName, messages: dataMap['_lastMessages']});
        });

        // This will handle secure messages..
        app.registerMethod("secureMessage", function(msg){
            var body = msg.body();
            if(body.message.trim() == '' || !body.hasOwnProperty('token') || !body.hasOwnProperty('address')){
                return;
            }
            if(!addressTokens.hasOwnProperty(body.address) || addressTokens[body.address] != body.token){
                print("Blocking message from " + body.address + " Token (" + body.token + ") Needed Token (" + addressTokens[body.address] + ")");
                return;
            }
            var message = {message: body.message, address: body.address};

            var _lastMessages = dataMap['_lastMessages'];

            // TODO we need to probably not save messages that should be filtered out..
            if(_lastMessages.length >= 5){
                _lastMessages = _lastMessages.slice(1, 5);
            }
            _lastMessages.push(message);
            dataMap['_lastMessages'] = _lastMessages;

            app.messageBus().publish('sdk.public._push_.publicMessages', message);
        });

        var dustyPlates = DustyPlates.initialize(true);

        app.handleCustomRequest(function(req){
            req.response().disableWebProcessing();
            return dustyPlates(req);
        });

        app.startHttpServer();

        app.start();
    });
};
