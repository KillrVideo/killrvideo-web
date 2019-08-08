import React from 'react';
import { connect } from 'react-redux';

import { Row, Col, Panel, Button } from 'react-bootstrap';
import SignInForm from './sign-in-form';
import {changeScreen} from '../../../actions/NavActions'

class SignInContainer extends React.Component {
  
  render() {
    return (
      <div className="body-content container">
        <Row>
          <Col md={4} mdOffset={4}>
            <Panel header="Sign In" id="signin-account">
              <SignInForm />
              <div className="section-divider text-center muted">
                <span>New to KillrVideo?</span>
              </div>
              
              <Button bsStyle="default" block onClick={() => this.changeScreen("Register")}>
                Register for an Account
              </Button>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
    return {
    };
}



const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        changeScreen: (page) => {
            dispatch(changeScreen(page))
        },
    }
}


const SignIn = connect(
    mapStateToProps,
    mapDispatchToProps
)(SignInContainer)

export default SignIn
