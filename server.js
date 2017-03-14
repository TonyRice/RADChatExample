var App = require("sdk").App;

module.exports.start = function(){
    App.register("package.json", function (app) {

        // This must be defined here so microbes.js can access it
        _globalAddressMap = {};

        var DustyPlates = load("dusty-plates"),
            dustyData = DustyPlates.dustyData();

        // This will handle our app data regularly..
        app.registerMethod("appData", function(msg){
            msg.reply({name: dustyData.appName});
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
            app.messageBus().publish('sdk.public._push_.publicMessages', {message: body.message, address: body.address});
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
