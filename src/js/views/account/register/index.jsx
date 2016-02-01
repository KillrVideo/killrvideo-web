import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux';

import { Link } from 'react-router';
import { Row, Col, Alert } from 'react-bootstrap';
import RegistrationForm from './registration-form';
import ErrorAlert from 'components/shared/error-alert';
import { register, registerReset, getCurrentUser } from 'actions/authentication';

class Register extends Component {
  componentWillMount() {
    // If already logged in when first loaded, just redirect to home page
    if (this.props.currentUser.isLoggedIn) {
      this.redirectToHomePage();
      return;
    }
    
    // If we don't know yet if the user is logged in, ask the server
    if (this.props.currentUser.isFromServer === false) {
      this.props.getCurrentUser(Register.queries.currentUser());
    }
    
    // Reset page validation when loading
    this.props.registerReset();
  }
  
  componentWillReceiveProps(nextProps) {
    // If we're just now finding out the user was already logged in, send them to the home page
    if (nextProps.registerState.wasSuccessful === false && nextProps.currentUser.isLoggedIn) {
      this.redirectToHomePage();
    }
  }
  
  redirectToHomePage() {
    this.props.push('/');
  }
  
  render() {
    return (
      <div className="body-content container">
        <Row>
          <Col md={6} mdOffset={3}>
            <h2>Register</h2>
            
            <Alert bsStyle="info" className={this.props.registerState.wasSuccessful ? 'hidden' : undefined}>
              Register for an account to upload and comment on videos.
            </Alert>
            
            <ErrorAlert errors={this.props.registerState.errors} />
            
            <Alert bsStyle="success" className={this.props.registerState.wasSuccessful ? undefined : 'hidden'}>
              Your account has been created successfully. <Link to="/" className="alert-link">Click here</Link> to return to the home page.
            </Alert>
            
            <RegistrationForm onSubmit={vals => this.props.register(vals.firstName, vals.lastName, vals.email, vals.password)}
                              hideForm={this.props.registerState.wasSuccessful} />
          </Col>
        </Row>
      </div>
    );
  }
}

// Prop validation
Register.propTypes = {
  // State from redux
  registerState: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  
  // Actions
  register: PropTypes.func.isRequired,
  registerReset: PropTypes.func.isRequired,
  getCurrentUser: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired
};

// Falcor queries
Register.queries = {
  currentUser() {
    return [
      [ 'userId' ]
    ];
  }
};

function mapStateToProps(state) {
  let { authentication: { register: registerState, currentUser } } = state;
  return { registerState, currentUser };
}

export default connect(mapStateToProps, { register, registerReset, getCurrentUser, push: routeActions.push })(Register);