import { connect } from 'react-redux';
import { logout } from 'actions/authentication';
import React from 'react';
import { Link } from 'react-router';
import { Alert } from 'react-bootstrap';

class SignOut extends React.Component {
  componentDidMount() {
    // Sign the user out
    this.props.logout();
  }
  
  render() {
    return (
      <div className="body-content container">
        <h2>Sign Out</h2>
        <Alert bsStyle="success">
          You have successfully signed out. <Link to="/" className="alert-link">Click here</Link> to return to the home page.
        </Alert>
      </div>
    );
  }
}

// Export component
export default connect(null, { logout })(SignOut);