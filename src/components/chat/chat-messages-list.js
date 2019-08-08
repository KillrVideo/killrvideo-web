import moment from 'moment';
import { transform, debounce } from 'lodash';
import React from 'react';
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

class ChatMessagesList extends React.Component {
  constructor(props) {
    super(props);
    
    this._scrollbarComponent = null;
    this._scroll = {
      to: null,
      previousScrollTop: null,
      previousScrollHeight: null
    };
    
    this.handleScroll = debounce(() => this.getMoreMessages(), 250);
  }
  
  componentWillUpdate(nextProps) {
    // See if we should scroll after this render
    if (this.props.messages !== nextProps.messages && this._scrollbarComponent) {
      const scrollableEl = this._scrollbarComponent.scrollbar.getViewElement();
      
      // Was this additional chat history added to the beginning of the messages array?
      if (this.props.messages.length > 0 && this.props.messages[0] !== nextProps.messages[0]) {
        // Scroll to the same position in the message list after the new messages are added
        this._scroll.to = 'position';
        this._scroll.previousScrollTop = scrollableEl.scrollTop;
        this._scroll.previousScrollHeight = scrollableEl.scrollHeight;
      } else {
        // Scroll to latest message if they're at the bottom of the message list already
        this._scroll.to = scrollableEl.scrollTop + scrollableEl.clientHeight === scrollableEl.scrollHeight
          ? 'bottom'
          : null; 
      }
    } else {
      this._scroll.to = null;
    }
  }
  
  componentDidUpdate(prevProps) {
    // When messages change, scroll if necessary
    if (this._scroll.to !== null) {
      const scrollableEl = this._scrollbarComponent.scrollbar.getViewElement();
      
      switch(this._scroll.to) {
        case 'bottom':
          scrollableEl.scrollTop = scrollableEl.scrollHeight;
          break;
        case 'position':
          scrollableEl.scrollTop = (scrollableEl.scrollHeight - this._scroll.previousScrollHeight) + this._scroll.previousScrollTop;
          break;
      }
    }
  }
  
  getMoreMessages() {
    if (this._scrollbarComponent) {
      const scrollableEl = this._scrollbarComponent.scrollbar.getViewElement();
      // If we're getting close to scrolling to the top, load more message history if we're not already loading
      if (scrollableEl.scrollTop < 100 && this.props.isLoading === false) {
        this.props.getMessages(ChatMessagesList.queries.message());
      }
    }
  }
  
  render() {
    const { isLoading, messages } = this.props;
    
    return (
      <GeminiScrollbar ref={c => this._scrollbarComponent = c} onScroll={() => this.handleScroll()}>
        <ul id="chat-messages-list" className="list-unstyled">
          <li className="chat-message clearfix" key="loading">
            <LoadingSpinner hidden={!isLoading} />
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

export default ChatMessagesList;