
import React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import RegistrationForm from './registration-form';
import { register } from '../../../actions/UserActions';

class RegisterContainer extends React.Component {
    componentWillReceiveProps(nextProps) {

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

function mapStateToProps(state) {
    return {
        currentUser: state.UserReducer.currentUser
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        register: (firstname, lastname, email,password) => {
            dispatch(register(firstname, lastname, email,password))
        }
    }
}


const Register = connect(
    mapStateToProps,
    mapDispatchToProps
)(RegisterContainer)
export default Register;