var createFactory = React.createFactory;
var DOM = React.DOM;

/**
 * This function just checks if there are any Automately Core functions available and if there are it is clearly not a client.
 * @returns {boolean} returns true if it is a browser client
 */
function isClient() {
    try {
        if (print && Automately && Automately.job() && Automately.job().token) {
            return false;
        }
    } catch (ignored) {
    }
    return true;
}

var WelcomeText = React.createClass({
    render: function () {
        return DOM.h2(null, this.props.text, DOM.br(null));
    }
});

var MessageBox = React.createClass({
    render: function () {
        var messages = this.props.messages;
        var messagesToDisplay = messages.map(function (message, index) {
            return DOM.li({key: index}, DOM.span({className: "messageIp"}, "[" + message.address + "] :: "), message.message);
        });
        return DOM.div({className: "messageBox", ref: "messageBox"}, DOM.ul(null, messagesToDisplay));
    },
    componentDidUpdate: function () {
        this.refs.messageBox.scrollTop = this.refs.messageBox.scrollHeight;
    }
});

var MessageBar = React.createClass({
    render: function () {
        var self = this;
        return DOM.input({
            className: "messageBar",
            onKeyUp: function (e) {
                if (e.keyCode == 13) {
                    self.props.sendMessage(e.target.value);
                    e.target.value = "";
                }
            }
        });
    }
});

var ChatApp = React.createClass({
    propTypes: {
        name: React.PropTypes.string
    },
    getDefaultProps: function () {
        return {
            name: 'My App'
        }
    },
    getInitialState: function () {
        return {
            connected: false,
            localApp: null,
            messages: [],
            mb: null
        }
    },
    sendMessage: function (msg) {
        this.state.localApp.method("secureMessage", {message: msg, address: window.my_address, token: window.my_token});
    },
    bindApp: function (app) {
        console.log("Binding local Automately App...");

        var self = this;
        app.method("appData", {}, function () {

            var mb = app.messageBus();

            // When we run bindApp we need
            // to make sure to clear the state
            var state = self.state;

            state.connected = true;
            state.localApp = app;
            state.mb = mb;
            state.messages = [];

            self.setState(state);

            console.log("Bind complete for local Automately App...");

            // Let's go ahead and register a push handler on the
            // messagebus
            mb.registerHandler('sdk.public._push_.publicMessages', function (msg) {
                state.messages.push(msg);
                self.setState(state);
            });
        });
    },
    connected: function () {
        return this.state.connected
    },
    render: function () {
        return DOM.div(null, createFactory(WelcomeText)({
            "text": this.props.name,
            "id": "welcome"
        }), DOM.br(null), createFactory(MessageBox)({messages: this.state.messages}), createFactory(MessageBar)({"sendMessage": this.sendMessage}));
    }
});

if (isClient()) {
    App.initialize(function (app) {
        app.method("appData", {}, function (msg) {
            ReactDOM.render(
                React.createElement(ChatApp, msg),
                document.getElementById('root')
            ).bindApp(app);
        });
    });
}
