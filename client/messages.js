var History = React.createClass({
    getInitialState: function() {
        return {
            messages: []
        };
    },
    componentDidMount: function() {
        var self = this;

        wrapper = $('.history-wrapper');

        $.getJSON('/api/messages/' + channel, function(messages) {
            self.setState({
                // we must reverse the messages, as they are given to us in
                // reverse chronological order by the history API
                messages: messages.reverse()
            });
        });

        socket.on('message', function(data) {
            if (ready && data.target == channel) {
                var newState = React.addons.update(
                    self.state, {
                        messages: {
                            $push: [data]
                        }
                    }
                );
                self.setState(newState);

                if (!active) {
                    ++unread;
                    updateTitle();
                }

                scrollDown();
            }
        });
    },
    render: function() {
        var messageNodes = this.state.messages.map(function (message) {
            return (
                <Message username={message.username}
                         text={message.text} />
            );
        });
        return (
            <div className='history'>
                <div className='history-wrapper' id='scroller'>
                    <ul id='message-list'>
                        {messageNodes}
                    </ul>
                </div>
            </div>
        )
    },
    componentDidUpdate: function() {
        scrollDown();
    }
});

var Message = React.createClass({
    render: function() {
        var className;

        if (this.props.username == myUsername) {
            className = 'self';
        }
        else {
            className = 'other';
        }

        return (
            <li>
                <Avatar username={this.props.username} />
                <strong>{this.props.username}</strong>

                <div className={className}>
                    {formatMessage(this.props.text)}
                </div>
            </li>
        )
    }
});

var MessageForm = React.createClass({
    getInitialState: function() {
        return {
            message: ''
        };
    },
    handleSubmit: function(event) {
        event.preventDefault();

        var message = this.state.message;

        if (message.trim().length > 0) {
            if (first) {
                ga('send', 'event', {
                    eventCategory: 'chat',
                    eventAction: 'chat_form_submit',
                    eventLabel: 'send',
                    eventValue: 1
                });
                first = false;
            }

            data = { type: 'channel', target: channel, text: message };
            socket.emit('message', data);

            React.findDOMNode(this.refs.inputField).value = '';
        }
    },
    handleChange: function(event) {
        this.setState({
            message: event.target.value
        });
    },
    render: function() {
        return (
            <div className='textarea'>
                <form id='message'
                      onSubmit={this.handleSubmit}>
                    <input type='text'
                           className='form-control'
                           placeholder='Γράψε ένα μήνυμα...'
                           value={this.state.message}
                           onChange={this.handleChange}
                           ref='inputField' />
                </form>
            </div>
        );
    }
});

React.render(
    (
        <div>
            <History />
            <MessageForm />
        </div>
    ),
    document.getElementsByClassName('chat')[0]
);
