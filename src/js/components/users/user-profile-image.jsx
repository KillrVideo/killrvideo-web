import React, { Component, PropTypes } from 'react';
import md5 from 'md5';
import classNames from 'classnames';

// Show an image for a user profile
class UserProfileImage extends Component {
  render() {
    const hash = md5(this.props.email);
    const imageUrl = `https://robohash.org/${hash}?gravatar=hashed&set=any&bgset=any`;
    const alt = `Profile image for ${this.props.email}`;
    const imgClass = classNames(this.props.className, 'user-gravatar');
    
    return (
      <img src={imageUrl} alt={alt} className={imgClass} />
    );
  }
}

// Prop validation
UserProfileImage.propTypes = {
  email: PropTypes.string.isRequired
};

export default UserProfileImage;