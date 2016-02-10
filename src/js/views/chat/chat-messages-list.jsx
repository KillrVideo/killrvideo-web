import classNames from 'classnames';
import moment from 'moment';

import React, { Component, PropTypes } from 'react';
import UserProfileImage from 'components/users/user-profile-image';
import LoadingSpinner from 'components/shared/loading-spinner';

function renderMessage(message) {
  return (
    <li className="chat-message clearfix">
      <UserProfileImage email={message.author.email} className="img-circle" />
      <div className="chat-message-header">
        {message.author.firstName} {message.author.lastName} <small>{message.addedDate}</small>
      </div>
      <div className="chat-message-body">
        {message.message}
      </div>
    </li>
  );
}

class ChatMessagesList extends Component {
  render() {
    const { messageHistory, messages } = this.props;
    
    const loadingClasses = classNames('chat-message', 'clearfix', { 'hidden': !messageHistory.isLoading });
    
    return (
      <ul id="chat-messages-list" className="list-unstyled">
        <li className={loadingClasses} key="loading">
          <LoadingSpinner />
        </li>
        
        { /* Show message history first */ }
        {messageHistory.data.map(renderMessage)}
        
        {/* Then show any new messages since we've been in the chat room */}
        {messages.data.map(renderMessage)}
      </ul>
    );
  }
}

// Falcor queries
ChatMessagesList.queries = {
  message() {
    return [
      [ 'author', [ 'firstName', 'lastName', 'email' ] ],
      [ [ 'message', 'addedDate' ] ]
    ];
  }
};

// Prop validation
ChatMessagesList.propTypes = {
  messageHistory: PropTypes.object.isRequired,
  messages: PropTypes.object.isRequired,
  getMessages: PropTypes.func.isRequired
};

export default ChatMessagesList;