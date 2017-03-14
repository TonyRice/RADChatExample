var App = require("sdk").App;

module.exports.start = function(){
    App.register("package.json", function (app) {

        // This must be defined here so microbes.js can access it
        _globalAddressMap = {};

        var _lastMessages = [];

        var DustyPlates = load("dusty-plates"),
            dustyData = DustyPlates.dustyData();

        // This will handle our app data regularly..
        app.registerMethod("appData", function(msg){
            msg.reply({name: dustyData.appName, messages: _lastMessages});
        });

        // This will handle secure messages..
        app.registerMethod("secureMessage", function(msg){
            var body = msg.body();
            if(body.message.trim() == '' || !body.hasOwnProperty('token') || !body.hasOwnProperty('address')){
                return;
            }
            if(!_globalAddressMap.hasOwnProperty(body.address) || _globalAddressMap[body.address] != body.token){
                return;
            }
            var message = {message: body.message, address: body.address};

            // TODO we need to probably not save messages that should be filtered out..
            if(_lastMessages.length >= 5){
                _lastMessages = _lastMessages.slice(1, 5);
            }
            _lastMessages.push(message);
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
