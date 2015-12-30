import React, { Component, PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { validateForm } from 'lib/validation';

import Input from 'components/shared/input';
import Icon from 'components/shared/icon';

class SignInForm extends Component {
  render() {
    const { fields: { email, password }, handleSubmit, submitting } = this.props;
    
    return (
      <form role="form" onSubmit={handleSubmit}>
        <Input {...email} id="signin-email" type="email" placeholder="Enter email address" label="Email address" focusOnMount />
        <Input {...password} id="signin-password" type="password" placeholder="Password" label="Password" />
        <Button type="submit" bsStyle="primary" disabled={submitting}>
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
  handleSubmit: PropTypes.func.isRequired
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
  validate: vals => validateForm(vals, constraints)
})(SignInForm);