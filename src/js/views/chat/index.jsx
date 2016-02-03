import { connect } from 'react-redux';
import classNames from 'classnames';

import React, { Component, PropTypes } from 'react';
import { Row, Col, Nav, NavItem } from 'react-bootstrap';
import Icon from 'components/shared/icon';

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
          <div id="chat-messages" className={messagesClass}>
            Chat messages here
          </div>
          
          <div id="chat-users" className={usersClass}>
            Users here
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