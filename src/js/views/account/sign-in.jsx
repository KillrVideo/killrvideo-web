import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Row, Col, Panel, Alert } from 'react-bootstrap';
import SignInForm from 'components/account/sign-in-form';
import ErrorAlert from 'components/shared/error-alert';
import { login } from 'actions/authentication';

class SignIn extends Component {
  render() {
    return (
      <Row>
        <Col md={4} mdOffset={4}>
          <Panel header="Sign In" id="signin-account">
            <Alert bsStyle="info">
              If you've already got an account, sign in with your username and password below.
            </Alert>
            
            <ErrorAlert errors={this.props.loginState.errors} />
            
            <SignInForm onSubmit={vals => this.props.login(vals.email, vals.password)} />
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
  let { authentication: { login: loginState } } = state;
  return { loginState };
}

export default connect(mapStateToProps, { login })(SignIn);