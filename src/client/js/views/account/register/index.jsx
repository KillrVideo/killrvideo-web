import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';

import { Row, Col } from 'react-bootstrap';
import RegistrationForm from './registration-form';
import { register } from 'actions/authentication';

class Register extends Component {
  componentWillReceiveProps(nextProps) {
    // Redirect the user after registering and being logged in
    if (this.props.isLoggedIn !== nextProps.isLoggedIn && nextProps.isLoggedIn === true) {
      const { location: { state } } = this.props;
      if (state && state.redirectAfterLogin) {
        this.props.push(state.redirectAfterLogin);
      } else {
        this.props.push('/');
      }
    }
  }
    
  render() {
    return (
      <div id="register-account" className="body-content container">
        <Row>
          <Col md={6} mdOffset={3}>
            <h2>Register</h2>
            <RegistrationForm onSubmit={vals => this.props.register(vals.firstName, vals.lastName, vals.email, vals.password)} />
          </Col>
        </Row>
      </div>
    );
  }
}

// Prop validation
Register.propTypes = {
  // State from redux
  isLoggedIn: PropTypes.bool.isRequired,
  
  // From react-router
  location: PropTypes.object.isRequired,
  
  // Actions
  register: PropTypes.func.isRequired,
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

export default connect(mapStateToProps, { register, push: routeActions.push })(Register);