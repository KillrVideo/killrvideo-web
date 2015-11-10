import React, { Component, PropTypes } from 'react';
import { Row, Col, ButtonInput } from 'react-bootstrap';
import { connectReduxForm } from 'redux-form';
import validate from 'validate.js';

import Input from 'components/shared/input';

class RegistrationForm extends Component {
  componentWillMount() {
    this.props.resetForm();
  }
  
  render() {
    const { fields: { firstName, lastName, email, password, retypePassword }, handleSubmit } = this.props;
    
    return (
      <form role="form" onSubmit={handleSubmit}>
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
        
        <ButtonInput type="submit" value="Register" bsStyle="primary" />
      </form>
    );
  }
}

// Prop validation
RegistrationForm.propTypes = {
  // Provided by redux-form
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired
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
export default connectReduxForm({
  form: 'registration',
  fields: [ 'firstName', 'lastName', 'email', 'password', 'retypePassword' ],
  validate: vals => validate(vals, constraints) || {}
})(RegistrationForm);