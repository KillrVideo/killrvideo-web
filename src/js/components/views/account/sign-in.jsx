const React = require('react');
const Bootstrap = require('react-bootstrap');
const ValidatedInput = require('components/shared/validated-input');
const ValidatedForm = require('components/shared/validated-form');
const Row = Bootstrap.Row;
const Col = Bootstrap.Col;
const Panel = Bootstrap.Panel;
const Alert = Bootstrap.Alert;
const ButtonInput = Bootstrap.ButtonInput;

// Validation constraints
const EMAIL_VALIDATION = { presence: true, email: true };
const PASSWORD_VALIDATION = { presence: true };

// The Sign In View
class SignIn extends React.Component {
  signIn(e) {
    // TODO: Sign in
    e.preventDefault();
    console.log('Signing in!');
  }
  
  render() {
    return (
      <Row>
        <Col md={4} mdOffset={4}>
          <Panel header="Sign In" id="signin-account">
            <Alert bsStyle="info">
              If you've already got an account, sign in with your username and password below.
            </Alert>
            
            { /* <uimessages params="queues: signInUrl"></uimessages> */ }
              
            <ValidatedForm role="form" onSubmit={e => this.signIn(e)} inputIds={[ 'signin-email', 'signin-password' ]}>
              <ValidatedInput id="signin-email" type="email" placeholder="Enter email address" label="Email address" 
                              validationConstraints={EMAIL_VALIDATION} validateOnBlur />
              <ValidatedInput id="signin-password" type="password" placeholder="Password" label="Password" 
                              validationConstraints={PASSWORD_VALIDATION} validateOnBlur />
              <ButtonInput type="submit" value="Sign In" bsStyle="primary" />
            </ValidatedForm>
          </Panel>
        </Col>
      </Row>
    );
  }
}

export default SignIn;