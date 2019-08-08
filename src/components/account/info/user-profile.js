
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { isUndefined } from 'lodash';

import LoadingSpinner from 'components/shared/loading-spinner';
import UserProfileImage from 'components/users/user-profile-image';

class UserProfile extends React.Component {
  render() {
    const { isLoading, email, firstName, lastName } = this.props.user;
    
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    if (isUndefined(email)) {
      return <div></div>;
    }
    
    return (
      <Row id="user-profile-row">
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


// Falcor queries
UserProfile.queries = {
  // user() {
  //   return [
  //     [ ['email', 'firstName', 'lastName'] ]
  //   ];
  // }
};

export default UserProfile;