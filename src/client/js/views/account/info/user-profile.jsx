import React, { Component, PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { isUndefined } from 'lodash';

import LoadingSpinner from 'components/shared/loading-spinner';
import UserProfileImage from 'components/users/user-profile-image';

class UserProfile extends Component {
  render() {
    const { isLoading, email, firstName, lastName } = this.props.user;
    
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    if (isUndefined(email)) {
      return <div></div>;
    }
    
    return (
      <Row>
        <Col md={3}>
          <UserProfileImage email={email} className="img-responsive img-circle" /> 
        </Col>
        <Col md={9}>
          <strong>{firstName} {lastName}</strong><br/>
          {email}
        </Col>
      </Row>
    );
  }
}

// Prop validation
UserProfile.propTypes = {
  user: PropTypes.object.isRequired
};

// Falcor queries
UserProfile.queries = {
  user() {
    return [
      [ ['email', 'firstName', 'lastName'] ]
    ];
  }
};

export default UserProfile;