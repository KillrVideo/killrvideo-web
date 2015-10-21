import React, { Component, PropTypes } from 'react';
import md5 from 'md5';

// Show an image for a user profile
class UserProfileImage extends Component {
  render() {
    const hash = md5(this.props.email);
    const imageUrl = `https://robohash.org/${hash}?gravatar=hashed&set=any&bgset=any`;
    const alt = `Profile image for ${this.props.email}`;
    return (
      <img src={imageUrl} alt={alt} className="user-gravatar" />
    );
  }
}

// Prop validation
UserProfileImage.propTypes = {
  email: PropTypes.string.isRequired
};

export default UserProfileImage;