import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// Component that ouputs a link to a user profile
class UserProfileLink extends Component {
  render() {
    const { children, to, ...others } = this.props;
    const profileUrl = `/account/info/${this.props.userId}`;
    return <Link to={profileUrl} {...others}>{children}</Link>;
  }
}

// Prop validation
UserProfileLink.propTypes = {
  userId: PropTypes.string.isRequired
};

export default UserProfileLink;