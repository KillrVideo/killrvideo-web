import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { validateForm } from 'lib/validation';
import classNames from 'classnames';

import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import Input from 'components/shared/input';
import Icon from 'components/shared/icon';
import { addAnotherComment } from 'actions/view-video';

class VideoAddComment extends Component {
  componentWillReceiveProps(nextProps) {
    // If the comment field was touched, but doesn't have a value, just reset the form so we don't show validation
    if (nextProps.fields.comment.touched && nextProps.fields.comment.value === '') {
      this.props.resetForm();
    }
  }
  
  componentDidUpdate(prevProps) {
    // If the form was just reset to add another comment, focus the comment input
    if (this.props.commentAdded === false && prevProps.commentAdded === true) {
      this.refs.commentInput.focus();
    }
  }
  
  addAnotherComment() {
    this.props.resetForm();
    this.props.addAnotherComment();
  }
  
  render() {
    const { 
      fields: { comment },
      invalid, 
      handleSubmit,
      isLoggedIn,
      addedComments: { commentAdded, isLoading },
      location: { pathname, search }
    } = this.props;
    
    const formClasses = classNames({
      inProgress: comment.active || comment.dirty,
      hidden: !isLoggedIn || commentAdded
    });
    
    // Data for where to send a user if they aren't signed in or registered yet
    const redirectAfterLogin = { pathname, search };
    const registerLinkTo = {
      pathname: '/account/register',
      state: { redirectAfterLogin }
    };
    const signInLinkTo = {
      pathname: '/account/signin',
      state: { redirectAfterLogin }
    };
    
    return (
      <div className="video-add-comment">
        <Alert bsStyle="success" className={commentAdded ? 'small' : 'small hidden'}>
          Comment added successfully. <a className="alert-link" href="#" onClick={() => this.addAnotherComment()}>Click here</a> to add another.
        </Alert>
        
        <Alert bsStyle="warning" className={isLoggedIn ? 'small hidden' : 'small'}>
          You must <Link to={registerLinkTo} className="alert-link">register</Link> or <Link to={signInLinkTo} className="alert-link">sign in</Link> first
          to post comments.
        </Alert>
        
        <form role="form" onSubmit={handleSubmit} className={formClasses}>
          <Input {...comment} ref="commentInput" type="textarea" className="small" placeholder="Leave a comment" />
          
          <div className="text-right">
            <Button type="submit" bsStyle="primary" disabled={isLoading || invalid}>
              <Icon name="cog" animate="spin" className={isLoading ? undefined : 'hidden'} /> Add Comment
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

// Prop validation
VideoAddComment.propTypes = {
  // Provided by redux-form
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
  resetForm: PropTypes.func.isRequired,
  
  // Passed in
  isLoggedIn: PropTypes.bool.isRequired,
  addedComments: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  
  // Actions
  addAnotherComment: PropTypes.func.isRequired
};

// Validation constraints
const constraints = {
  comment: { presence: true }
};

export default reduxForm({
  form: 'addComment',
  fields: [ 'comment' ],
  validate: vals => validateForm(vals, constraints)
})(VideoAddComment);