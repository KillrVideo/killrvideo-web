import React, { Component, PropTypes } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { validateForm } from 'lib/validation';

import Icon from 'components/shared/icon';
import Input from 'components/shared/input';

class RegistrationForm extends Component {
  render() {
    const { fields: { firstName, lastName, email, password, retypePassword }, handleSubmit, submitting, error } = this.props;
    
    return (
      <form role="form" onSubmit={handleSubmit}>
        <Alert bsStyle="info" className={error ? 'hidden' : undefined}>
          Register for an account to upload and comment on videos.
        </Alert>
        <Alert bsStyle="danger" className={error ? undefined : 'hidden'}>{error}</Alert>
        
        <Row>
          <Col md={5}>
            <Input {...firstName} type="text" placeholder="First name" label="First name" focusOnMount />
          </Col>
          <Col md={7}>
            <Input {...lastName} type="text" placeholder="Last name" label="Last name" />
          </Col>
        </Row>
        <Input {...email} type="email" placeholder="Enter email address" label="Email address" />
        <Input {...password} type="password" placeholder="Choose a password" label="Password" />
        <Input {...retypePassword} type="password" placeholder="Retype your password" label="Retype password" />
        
        <Button type="submit" bsStyle="primary" disabled={submitting}>
          <Icon name="cog" animate="spin" className={submitting ? undefined : 'hidden'} /> Register
        </Button>
      </form>
    );
  }
}

// Prop validation
RegistrationForm.propTypes = {
  // Provided by redux-form
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  error: PropTypes.string
};

// Validation constraints
const constraints = {
  firstName: { presence: true },
  lastName: { presence: true },
  email: { presence: true, email: true },
  password: { presence: true },
  retypePassword: { presence: true, equality: 'password' }
};

// Connect the form to the store
export default reduxForm({
  form: 'registration',
  fields: [ 'firstName', 'lastName', 'email', 'password', 'retypePassword' ],
  validate: vals => validateForm(vals, constraints)
})(RegistrationForm);