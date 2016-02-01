import { connect } from 'react-redux';
import classNames from 'classnames';

import React, { Component, PropTypes } from 'react';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
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
    
    // Mark the content div that's active based on the active tab
    const messagesClass = classNames('chat-tab-content', { active: activeTab === 1 });
    const usersClass = classNames('chat-tab-content', { active: activeTab === 2 });
    
    return (
      <div className="body-content container">
        {/* Tabs for mobile (extra small screens) only */}
        <Tabs id="chat-tabs" activeKey={this.state.activeTab} onSelect={eventKey => this.tabSelected(eventKey)}>
          <Tab eventKey={1} title={<Icon name="comment" />}></Tab>
          <Tab eventKey={2} title={<Icon name="users" />}></Tab>
        </Tabs>
        
        <div id="chat-messages" className={messagesClass}>
          Chat messages here
        </div>
        
        <div id="chat-users" className={usersClass}>
          Users here
        </div>
      </div>
    );
  }
}

// Prop validation
Chat.propTypes = {
  
};

// Map redux state to props
function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps, {})(Chat);