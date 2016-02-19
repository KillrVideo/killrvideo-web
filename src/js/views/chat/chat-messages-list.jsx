import classNames from 'classnames';
import moment from 'moment';
import { transform } from 'lodash';

import React, { Component, PropTypes } from 'react';
import GeminiScrollbar from 'react-gemini-scrollbar';
import UserProfileImage from 'components/users/user-profile-image';
import LoadingSpinner from 'components/shared/loading-spinner';

function renderMessage(output, message, index, allMessages) {
  const previousMessage = index > 0 ? allMessages[index - 1] : { author: {} };
  
  // See if we need to add a date header because we've changed days between messages
  const currentMessageAddedDate = moment(message.addedDate);
  const addDateHeader = currentMessageAddedDate.isSame(previousMessage.addedDate, 'day') === false || index === 0;
  if (addDateHeader) {
    output.push(
      <li className="chat-message-date chat-message clearfix" key={currentMessageAddedDate.format('YYYYMMDD')}>
        <h4 className='section-divider'><span>{currentMessageAddedDate.format('dddd, MMMM Do YYYY')}</span></h4>
      </li>
    );
  }
  
  // If the message is not the same author as the previous message or we just output a date header,
  // include a header with the user's profile picture, name, and the message's time
  let profileImage, header;
  if (previousMessage.author.email !== message.author.email || addDateHeader === true) {
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
  constructor(props) {
    super(props);
    
    this._scrollbarComponent = null;
    this._shouldScroll = true;
  }
  
  componentWillUpdate(nextProps) {
    // See if we should scroll after this render
    if (this.props.messages !== nextProps.messages && this._scrollbarComponent) {
      // Scroll to latest message if they're at the bottom of the message list already
      const scrollableEl = this._scrollbarComponent.scrollbar.getViewElement();
      this._shouldScroll = scrollableEl.scrollTop + scrollableEl.clientHeight === scrollableEl.scrollHeight;
    } else {
      this._shouldScroll = false;
    }
  }
  
  componentDidUpdate(prevProps) {
    // When messages change, scroll to the bottom if necessary
    if (this._shouldScroll) {
      const scrollableEl = this._scrollbarComponent.scrollbar.getViewElement();
      scrollableEl.scrollTop = scrollableEl.scrollHeight;
    }
  }
  
  render() {
    const { isLoading, messages } = this.props;
    
    const loadingClasses = classNames('chat-message', 'clearfix', { 'hidden': !isLoading });
    
    return (
      <GeminiScrollbar ref={c => this._scrollbarComponent = c}>
        <ul id="chat-messages-list" className="list-unstyled">
          <li className={loadingClasses} key="loading">
            <LoadingSpinner />
          </li>
          
          {transform(messages, renderMessage, [])}
        </ul>
      </GeminiScrollbar>
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