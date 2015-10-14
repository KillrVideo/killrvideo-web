import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Panel, Alert } from 'react-bootstrap';
import SignInForm from 'components/account/sign-in-form';

class SignIn extends Component {
  signIn(vals) {
    // TODO: Sign the user in
    console.log('Signing in!');
    console.log(vals);
  }
  
  render() {
    return (
      <Row>
        <Col md={4} mdOffset={4}>
          <Panel header="Sign In" id="signin-account">
            <Alert bsStyle="info">
              If you've already got an account, sign in with your username and password below.
            </Alert>
            
            { /* TODO: <uimessages params="queues: signInUrl"></uimessages> */ }
              
            <SignInForm onSubmit={vals => this.signIn(vals)} />
          </Panel>
        </Col>
      </Row>
    );
  }
}

// Prop validation
SignIn.propTypes = {
  
};

function mapStateToProps(state) {
  // TODO: Select the pieces of state we need in props
  return {};
}

export default connect(mapStateToProps)(SignIn);