import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { pushState } from 'redux-router';

import { Row, Col, Panel, Alert } from 'react-bootstrap';
import SignInForm from 'components/account/sign-in-form';
import ErrorAlert from 'components/shared/error-alert';
import { login, loginReset, getCurrentUser } from 'actions/authentication';

class SignIn extends Component {
  componentWillMount() {
    if (this.props.currentUser.isFromServer && this.props.currentUser.isLoggedIn) {
      this.redirectToHomePage();
    } else {
      this.props.getCurrentUser(SignIn.queries.currentUser());
    }
    
    // Reset login page when loading
    this.props.loginReset();
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUser.isLoggedIn) {
      this.redirectToHomePage();
    }
  }
  
  redirectToHomePage() {
    this.props.pushState(null, '/');
  }
  
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
  // State from redux
  loginState: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  
  // Actions
  login: PropTypes.func.isRequired,
  loginReset: PropTypes.func.isRequired,
  getCurrentUser: PropTypes.func.isRequired,
  pushState: PropTypes.func.isRequired
};

// Falcor queries
SignIn.queries = {
  currentUser() {
    return [
      [ 'userId' ]
    ];
  }
};

function mapStateToProps(state) {
  let { authentication: { login: loginState, currentUser } } = state;
  return { loginState, currentUser };
}

export default connect(mapStateToProps, { login, loginReset, getCurrentUser, pushState })(SignIn);