import React, { Component, PropTypes } from 'react';
import { connectReduxForm } from 'redux-form';
import validate from 'validate.js';
import classNames from 'classnames';

import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import Input from 'components/shared/input';
import Icon from 'components/shared/icon';

class VideoAddComment extends Component {
  componentWillReceiveProps(nextProps) {
    // If the comment field was touched, but doesn't have a value, just reset the form so we don't show validation
    if (nextProps.fields.comment.touched && nextProps.fields.comment.value === '') {
      this.props.resetForm();
    }
  }
  
  render() {
    const { fields: { comment }, handleSubmit, submitting, invalid, isLoggedIn, commentAdded } = this.props;
    const formClasses = classNames({
      inProgress: comment.active || comment.dirty,
      hidden: !isLoggedIn || commentAdded
    });
    
    return (
      <div className="video-add-comment">
        <Alert bsStyle="success" className={commentAdded ? 'small' : 'small hidden'}>
          Comment added successfully. <a className="alert-link" href="#">Click here</a> to add another.
        </Alert>
        
        <Alert bsStyle="warning" className={isLoggedIn ? 'small hidden' : 'small'}>
          You must <Link to="/account/register" className="alert-link">register</Link> or <Link to="/account/signin" className="alert-link">sign in</Link> first
          to post comments.
        </Alert>
        
        <form role="form" onSubmit={handleSubmit} className={formClasses}>
          <Input {...comment} type="textarea" className="small" placeholder="Leave a comment" />
          
          <div className="text-right">
            <Button type="submit" bsStyle="primary" disabled={submitting || invalid}>
              <Icon name="cog" animate="spin" className={submitting ? undefined : 'hidden'} /> Add Comment
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
  submitting: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  resetForm: PropTypes.func.isRequired,
  // Passed in
  isLoggedIn: PropTypes.bool.isRequired,
  commentAdded: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired
};

// Validation constraints
const constraints = {
  comment: { presence: true }
};

export default connectReduxForm({
  form: 'addComment',
  fields: [ 'comment' ],
  validate: vals => validate(vals, constraints) || {}
})(VideoAddComment);