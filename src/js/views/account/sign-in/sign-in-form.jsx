import React, { Component, PropTypes } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { validateForm } from 'lib/validation';

import Input from 'components/shared/input';
import Icon from 'components/shared/icon';

class SignInForm extends Component {
  render() {
    const { fields: { email, password }, handleSubmit, submitting, error } = this.props;
    
    return (
      <form role="form" onSubmit={handleSubmit}>
        <Alert bsStyle="info" className={error ? 'hidden' : undefined}>
          If you've already got an account, sign in with your email address and password below.
        </Alert>
        <Alert bsStyle="danger" className={error ? undefined : 'hidden'}>{error}</Alert>
        
        <Input {...email} id="signin-email" type="email" placeholder="Enter email address" label="Email address" focusOnMount />
        <Input {...password} id="signin-password" type="password" placeholder="Password" label="Password" />
        <Button type="submit" bsStyle="primary" block disabled={submitting}>
          <Icon name="cog" animate="spin" className={submitting ? undefined : 'hidden'} /> Sign In
        </Button>
      </form>
    );
  }
}

// Prop validation
SignInForm.propTypes = {
  // Provided by redux-form
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
};

// Validation constraints
const constraints = {
  email: { presence: true, email: true },
  password: { presence: true }
};

// Connect the form to the store
export default reduxForm({
  form: 'signIn',
  fields: [ 'email', 'password' ],
  touchOnBlur: false,
  validate: vals => validateForm(vals, constraints)
})(SignInForm);