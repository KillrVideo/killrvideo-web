import React, { Component, PropTypes } from 'react';
import { ButtonInput } from 'react-bootstrap';
import { connectReduxForm } from 'redux-form';
import validate from 'validate.js';

import Input from 'components/shared/input';

class SignInForm extends Component {
  componentWillMount() {
    this.props.resetForm();
  }
  
  render() {
    const { fields: { email, password }, handleSubmit } = this.props;
    
    return (
      <form role="form" onSubmit={handleSubmit}>
        <Input {...email} id="signin-email" type="email" placeholder="Enter email address" label="Email address" focusOnMount />
        <Input {...password} id="signin-password" type="password" placeholder="Password" label="Password" />
        <ButtonInput type="submit" value="Sign In" bsStyle="primary" />
      </form>
    );
  }
}

// Prop validation
SignInForm.propTypes = {
  // Provided by redux-form
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

// Validation constraints
const constraints = {
  email: { presence: true, email: true },
  password: { presence: true }
};

// Connect the form to the store
export default connectReduxForm({
  form: 'signIn',
  fields: [ 'email', 'password' ],
  validate: vals => validate(vals, constraints) || {}
})(SignInForm);