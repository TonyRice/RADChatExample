// This is where we will do our server-side ReactJS rendering. To accomplish this we must first load
// some libraries.

load('./lib/react/polyfill.js');
load('./lib/react/react.js');
load('./lib/react/react-dom-server.js');

// This loads the ReactJS classes and other resources needed
load('./lib/app/app.js');

var UUID = require('uuid');

// This will help us load some data from dustJS so we can
// easily retrieve the appNames
var dustyData = load('dusty-plates').dustyData();

// Here we finally pre-render the ChatApp so that we can have faster page loads
var preRenderReact = ReactDOMServer.renderToString(createFactory(ChatApp)({name : dustyData.appName}));

// Here we export renderDustyReact, and getRequestAddress which make it so our app.tl.html template
// can retrieve the ReactJS app html and the proper IP address for the client. We retrieve the X-Forwarded-For
// header since this app running on Automately Cloud will behind a load balancer
module.exports = {
    renderDustyReact: function(chk, ctx){
        ctx.stack.head.last_error = "Something went wrong :/...";
        ctx.stack.head.react_content = preRenderReact;
        return true;
    },
    getRequestAddress: function(chk, ctx){
        var address = ctx.currentRequest().headers()["X-Forwarded-For"][0];

        if(!_globalAddressMap.hasOwnProperty(address)){
            _globalAddressMap[address] = UUID.generate();
        }

        ctx.stack.head.request_address = address;
        ctx.stack.head.request_token = _globalAddressMap[address];
        return true;
    }
};