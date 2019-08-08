import React from 'react';
import { Link } from 'react-router';

// Component that ouputs a link to a user profile
class UserProfileLink extends React.Component {
  render() {
    const { children, to, ...others } = this.props;
    const profileUrl = `/account/info/${this.props.userId}`;
    return <Link to={profileUrl} {...others}>{children}</Link>;
  }
}

export default UserProfileLink;