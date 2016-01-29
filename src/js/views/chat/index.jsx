import { connect } from 'react-redux';

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
    // Only mobile, hide content that isn't for the currently active tab
    const messageClass = this.state.activeTab === 1 ? undefined : 'hidden-xs';
    const peopleClass = this.state.activeTab === 2 ? undefined : 'hidden-xs';
    
    return (
      <div className="body-content container">
        {/* Tabs for mobile (extra small screens) only */}
        <Row className="visible-xs-block">
          <Col xs={12}>
            <Tabs activeKey={this.state.activeTab} onSelect={eventKey => this.tabSelected(eventKey)}>
              <Tab eventKey={1} title={<Icon name="comment" />}></Tab>
              <Tab eventKey={2} title={<Icon name="users" />}></Tab>
            </Tabs>
          </Col>
        </Row>
        
        <Row>
          <Col sm={8} md={9} lg={10} className={messageClass}>
            Chat messages here
          </Col>
          <Col sm={4} md={3} lg={2} className={peopleClass}>
            People here
          </Col>
        </Row>
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