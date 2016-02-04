import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import Input from 'components/shared/input';

class ChatMessageInput extends Component {
  render() {
    return (
      <Input type="text" id="chat-message-input" placeholder="Enter a chat message" 
                   buttonAfter={<Button bsStyle="primary">Send</Button>} />
    );
  }
}

// Prop validation
ChatMessageInput.propTypes = {
  sendMessage: PropTypes.func.isRequired
};

export default ChatMessageInput;