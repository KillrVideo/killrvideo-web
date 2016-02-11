import classNames from 'classnames';
import moment from 'moment';
import { transform } from 'lodash';

import React, { Component, PropTypes } from 'react';
import UserProfileImage from 'components/users/user-profile-image';
import LoadingSpinner from 'components/shared/loading-spinner';

function getMessages(messageHistory, messages) {
  
}

function renderMessage(output, message, index, allMessages) {
  const previousMessage = index > 0 ? allMessages[index - 1] : { author: {} };
  
  // See if we need to add a date header because we've changed days between messages
  const currentMessageAddedDate = moment(message.addedDate);
  if (currentMessageAddedDate.isSame(previousMessage.addedDate, 'day') === false || index === 0) {
    output.push(
      <li className="chat-message-date chat-message clearfix" key={currentMessageAddedDate.format('YYYYMMDD')}>
        <h4 className='section-divider'><span>{currentMessageAddedDate.format('dddd, MMMM Do YYYY')}</span></h4>
      </li>
    );
  }
  
  let profileImage, header;
  if (previousMessage.author.email !== message.author.email) {
    profileImage = <UserProfileImage email={message.author.email} className="img-circle" />;
    header = (
      <div className="chat-message-header">
        {message.author.firstName} {message.author.lastName} &#8226; <small>{currentMessageAddedDate.format('LT')}</small>
      </div>
    );
  }
  
  // Add element for current message
  output.push(
    <li className="chat-message clearfix" key={message.messageId}>
      {profileImage}
      {header}
      <div className="chat-message-body">
        {message.message}
      </div>
    </li>
  );
}

class ChatMessagesList extends Component {
  render() {
    const { isLoading, messages } = this.props;
    
    const loadingClasses = classNames('chat-message', 'clearfix', { 'hidden': !isLoading });
    
    return (
      <ul id="chat-messages-list" className="list-unstyled">
        <li className={loadingClasses} key="loading">
          <LoadingSpinner />
        </li>
        
        { /* Show message history first, followed by new messages since we've been in the chat room */ }
        {transform(messages, renderMessage, [])}
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
  isLoading: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  getMessages: PropTypes.func.isRequired
};

export default ChatMessagesList;