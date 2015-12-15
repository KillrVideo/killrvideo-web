import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import validate from 'validate.js';

import Icon from 'components/shared/icon';
import Input from 'components/shared/input';

class RegistrationForm extends Component {
  render() {
    const { fields: { firstName, lastName, email, password, retypePassword }, handleSubmit, submitting, hideForm } = this.props;
    
    return (
      <form role="form" onSubmit={handleSubmit} className={this.props.hideForm ? 'hidden' : undefined}>
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
  resetForm: PropTypes.func.isRequired,
  // Provided by screen
  hideForm: PropTypes.bool.isRequired
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
  validate: vals => validate(vals, constraints) || {}
})(RegistrationForm);