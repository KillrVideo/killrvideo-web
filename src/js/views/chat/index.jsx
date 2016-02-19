import { connect } from 'react-redux';
import classNames from 'classnames';
import { createSelector } from 'reselect';
import { joinRoom, getMessages, sendMessage, leaveRoom } from 'actions/chat';

import React, { Component, PropTypes } from 'react';
import { Row, Col, Nav, NavItem } from 'react-bootstrap';
import Icon from 'components/shared/icon';

import ChatMessagesList from './chat-messages-list';
import ChatMessageInput from './chat-message-input';
import ChatUsersList from './chat-users-list';

// Main chat UI
class Chat extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      activeTab: 1
    };
  }
  
  componentDidMount() {
    this.props.joinRoom(this.props.roomName, Chat.queries.message(), Chat.queries.user());
  }
  
  componentDidUpdate(prevProps) {
    // If room changes, leave old room and join new room
    if (this.props.roomName !== prevProps.roomName) {
      this.props.leaveRoom(prevProps.roomName);
      this.props.joinRoom(this.props.roomName, Chat.queries.message(), Chat.queries.user());
    }
  }
  
  componentWillUnmount() {
    this.props.leaveRoom(this.props.roomName);
  }
  
  tabSelected(eventKey) {
    this.setState({ activeTab: eventKey });
  }
  
  render() {
    const { activeTab } = this.state;
    const { roomName, users, messages } = this.props;
    
    // Mark the content div that's active based on the active tab
    const messagesClass = classNames('chat-tab-content', { active: activeTab === 1 });
    const usersClass = classNames('chat-tab-content', { active: activeTab === 2 });
    
    return (
      <div className="body-content">
        {/* Tabs for mobile (extra small screens) only */}
        <Nav bsStyle="pills" id="chat-tabs" activeKey={this.state.activeTab} onSelect={eventKey => this.tabSelected(eventKey)}>
          <NavItem eventKey={1} title="Chat messages"><Icon name="comment" /></NavItem>
          <NavItem eventKey={2} title="Chat users"><Icon name="users" /></NavItem>
        </Nav>
        
        <div id="chat-title" className="bg-primary">
          <h4 className="container"><strong>{roomName}</strong> Videos Chat</h4>
        </div>
        
        <div id="chat-content" className="container">
          { /* Chat messages content pane */ }
          <div id="chat-messages" className={messagesClass}>
            <div id="chat-messages-window">
              <ChatMessagesList messages={messages.data} isLoading={messages.isLoading} getMessages={this.props.getMessages} />
            </div>
            
            <ChatMessageInput onSubmit={vals => this.props.sendMessage(roomName, vals.message)} />
          </div>
          
          {/* Chat users content pane */}
          <div id="chat-users" className={usersClass}>
            <ChatUsersList users={users} />
          </div>
         </div>
      </div>
    );
  }
}

// Falcor queries
Chat.queries = {
  message() {
    return ChatMessagesList.queries.message();
  },
  
  user() {
    return ChatUsersList.queries.user();
  }
};

// Prop validation
Chat.propTypes = {
  // State
  roomName: PropTypes.string.isRequired,
  users: PropTypes.object.isRequired,
  messages: PropTypes.object.isRequired,
  
  // Actions
  joinRoom: PropTypes.func.isRequired,
  getMessages: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
  leaveRoom: PropTypes.func.isRequired
};

// Some selectors for mapping redux state to props
const usersSelector = state => state.chat.users;
const isSendingSelector = state => state.chat.messages.sending;
const isLoadingSelector = state => state.chat.messageHistory.isLoading;
const roomNameSelector = (state, props) => props.location.query.room;

const messagesDataSelector = state => state.chat.messages.data;
const messageHistoryDataSelector = state => state.chat.messageHistory.data;
const allMessagesDataSelector = createSelector(
  messagesDataSelector,
  messageHistoryDataSelector,
  (messages, messageHistory) => {
    const allMessages = [];

    // Display history in reverse order
    for (let i = messageHistory.length - 1; i >= 0; i--) {
      allMessages.push(messageHistory[i]);
    }
    
    // Display new messages in order
    for (let i = 0; i < messages.length; i++) {
      allMessages.push(messages[i]);
    }
    
    return allMessages;
  }
);

const messagesSelector = createSelector(
  allMessagesDataSelector,
  isSendingSelector,
  isLoadingSelector,
  (data, isSending, isLoading) => {
    return {
      data,
      isSending,
      isLoading
    };
  }
);

const mapStateToProps = createSelector(
  roomNameSelector,
  usersSelector,
  messagesSelector,
  (roomName, users, messages) => {
    return {
      roomName,
      users,
      messages
    };
  }
);

export default connect(mapStateToProps, { joinRoom, getMessages, sendMessage, leaveRoom })(Chat);