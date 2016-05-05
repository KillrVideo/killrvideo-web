import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';

import { Row, Col, Panel, Button } from 'react-bootstrap';
import SignInForm from './sign-in-form';
import { login } from 'actions/authentication';

class SignIn extends Component {
  componentWillReceiveProps(nextProps) {
    // Redirect once logged in
    if (this.props.isLoggedIn !== nextProps.isLoggedIn && nextProps.isLoggedIn === true) {
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
  isLoggedIn: PropTypes.bool.isRequired,
  
  // From react-router
  location: PropTypes.object.isRequired,
  
  // Actions
  login: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  let { 
    authentication: { 
      currentUser: { isLoggedIn } 
    } 
  } = state;
  
  return { isLoggedIn };
}

export default connect(mapStateToProps, { login, push: routeActions.push })(SignIn);