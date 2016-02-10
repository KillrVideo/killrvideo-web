import classNames from 'classnames';
import moment from 'moment';
import { _ } from 'lodash';

import React, { Component, PropTypes } from 'react';
import UserProfileImage from 'components/users/user-profile-image';
import LoadingSpinner from 'components/shared/loading-spinner';

function renderMessage(output, message, index, allMessages) {
  // See if we need to add a date header because we've changed days between messages
  let currentMessageAddedDate = moment(message.addedDate);
  let prevMessageAddedDate = index > 0
    ? moment(allMessages[index - 1].addedDate)
    : currentMessageAddedDate;
    
  if (currentMessageAddedDate.isSame(prevMessageAddedDate, 'day') === false) {
    output.push(
      <li className="chat-message-date chat-message clearfix" key={currentMessageAddedDate.format('YYYYMMDD')}>
        <h4 className='section-divider'><span>{currentMessageAddedDate.format('dddd, MMMM Do YYYY')}</span></h4>
      </li>
    );
  }
  
  // Add element for current message
  output.push(
    <li className="chat-message clearfix" key={message.messageId}>
      <UserProfileImage email={message.author.email} className="img-circle" />
      <div className="chat-message-header">
        {message.author.firstName} {message.author.lastName} &#8226; <small>{currentMessageAddedDate.format('LT')}</small>
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
        
        { /* Show message history first, followed by new messages since we've been in the chat room */ }
        { _(messageHistory.data).concat(messages.data).transform(renderMessage, []).value()}
      </ul>
    );
  }
}

// Falcor queries
ChatMessagesList.queries = {
  message() {
    return [
      [ 'author', [ 'firstName', 'lastName', 'email' ] ],
      [ [ 'messageId', 'message', 'addedDate' ] ]
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