import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';

import { Row, Col, Panel, Alert, Button } from 'react-bootstrap';
import SignInForm from './sign-in-form';
import ErrorAlert from 'components/shared/error-alert';
import { login, loginReset } from 'actions/authentication';

class SignIn extends Component {
  componentWillMount() {
    // Reset page when loading
    this.props.loginReset();
  }
  
  componentWillReceiveProps(nextProps) {
    // Redirect once logged in
    if (this.props.isLoggedIn === false && nextProps.isLoggedIn === true) {
      const { location: { state } } = this.props;
      if (state && state.redirectAfterLogin) {
        this.props.push(state.redirectAfterLogin);
      } else {
        this.props.push('/');
      }
    }
  }
  
  redirectToRegister() {
    // Redirect and pass along any state in case we need to redirect after login
    const { location: { state } } = this.props;
    this.props.push({
      pathname: '/account/register',
      state
    });
  }
  
  render() {
    return (
      <div className="body-content container">
        <Row>
          <Col md={4} mdOffset={4}>
            <Panel header="Sign In" id="signin-account">
              <Alert bsStyle="info">
                If you've already got an account, sign in with your username and password below.
              </Alert>
              
              <ErrorAlert errors={this.props.loginState.errors} />
              
              <SignInForm onSubmit={vals => this.props.login(vals.email, vals.password)} />
              
              <div className="section-divider text-center muted">
                <span>New to KillrVideo?</span>
              </div>
              
              <Button bsStyle="default" block onClick={() => this.redirectToRegister()}>
                Register for an Account
              </Button>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}

// Prop validation
SignIn.propTypes = {
  // State from redux
  loginState: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  
  // From react-router
  location: PropTypes.object.isRequired,
  
  // Actions
  login: PropTypes.func.isRequired,
  loginReset: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  let { 
    authentication: { 
      login: loginState, 
      currentUser: { isLoggedIn } 
    } 
  } = state;
  
  return { loginState, isLoggedIn };
}

export default connect(mapStateToProps, { login, loginReset, push: routeActions.push })(SignIn);