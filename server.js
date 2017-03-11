var App = require("sdk").App;

module.exports.start = function(){
    App.register("package.json", function (app) {

        app.setHttpRequestHandler(function(req){

            var res = req.response();
            res.setContentType("text/html");
            res.setStatusCode(200);
            res.end("Hello World");

            // return true to ensure the request is handled
            return true;
        });

        // Start the httpServer
        app.startHttpServer();
        app.start();
    });
};
