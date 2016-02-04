import { connect } from 'react-redux';
import classNames from 'classnames';

import React, { Component, PropTypes } from 'react';
import { Row, Col, Nav, NavItem, Button } from 'react-bootstrap';
import GeminiScrollbar from 'react-gemini-scrollbar';
import Icon from 'components/shared/icon';
import Input from 'components/shared/input';
import UserProfileImage from 'components/users/user-profile-image';

// Main chat UI
class Chat extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      activeTab: 1
    };
  }
  
  tabSelected(eventKey) {
    this.setState({ activeTab: eventKey });
  }
  
  render() {
    const { activeTab } = this.state;
    const { roomName } = this.props;
    
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
              <GeminiScrollbar>
                <ul id="chat-messages-list" className="list-unstyled">
                  <li className="chat-message clearfix">
                    <UserProfileImage email="luke.tillman@datastax.com" className="img-circle" />
                    <div className="chat-message-header">
                      Luke Tillman <small>1:35 PM</small>
                    </div>
                    <div className="chat-message-body">
                      Ut porta nulla nibh, et egestas mi lacinia eget. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                    </div>
                  </li>
                </ul>
              </GeminiScrollbar>
            </div>
            
            <Input type="text" id="chat-message-input" placeholder="Enter a chat message" 
                   buttonAfter={<Button bsStyle="primary">Send</Button>} />
          </div>
          
          {/* Chat users content pane */}
          <div id="chat-users" className={usersClass}>
            <GeminiScrollbar>
              <ul id="chat-users-list" className="list-unstyled">
                <li>Duy Hai Doan</li>
                <li>Jon Haddad</li>
                <li>Luke Tillman</li>
                <li>Patrick McFadin</li>
                <li>Rachel Pedreschi</li>
                <li>Rebecca Mills</li>
              </ul>
            </GeminiScrollbar>
          </div>
         </div>
      </div>
    );
  }
}

// Prop validation
Chat.propTypes = {
  roomName: PropTypes.string.isRequired
};

// Map redux state to props
function mapStateToProps(state, ownProps) {
  return {
    roomName: ownProps.location.query.room
  };
}

export default connect(mapStateToProps, {})(Chat);