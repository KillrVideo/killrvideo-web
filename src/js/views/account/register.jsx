import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Alert } from 'react-bootstrap';
import RegistrationForm from 'components/account/registration-form';

class Register extends Component {
  register(vals) {
    // TODO: Register the user
    console.log('Registering user!');
    console.log(vals);
  }
  
  render() {
    return (
      <Row>
        <Col md={6} mdOffset={3}>
          <h2>Register</h2>
          
          <Alert bsStyle="info">
            Register for an account to upload and comment on videos.
          </Alert>
          
          { /* TODO: Success/fail messages
            <uimessages params="queues: registerUrl"></uimessages>
          
            <p class="alert alert-success" style="display: none" data-bind="visible: registeredUserId()">
              Your account has been created successfully.  <a class="alert-link" href="/">Click here</a> to return to the home page.
            </p>
          */}
          
          <RegistrationForm onSubmit={vals => this.register(vals)} />
        </Col>
      </Row>
    );
  }
}

// Prop validation
Register.propTypes = {
  
};

function mapStateToProps(state) {
  // TODO: Select the pieces of state we need in props
  return {};
}

export default connect(mapStateToProps)(Register);