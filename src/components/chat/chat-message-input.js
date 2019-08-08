
import React from 'react';
import { Button } from 'react-bootstrap';
import Input from 'components/shared/input';

import { reduxForm } from 'redux-form';
import { validateForm } from 'lib/validation';

class ChatMessageInput extends React.Component {
  componentWillReceiveProps(nextProps) {
    // If the message field was touched, but doesn't have a value, just reset the form so we don't show validation
    if (nextProps.fields.message.touched && nextProps.fields.message.value === '') {
      this.props.resetForm();
    }
    
    // If we just finished submitting, reset the form if there are no errors
    if (nextProps.submitting === false && this.props.submitting === true && nextProps.invalid === false) {
      this.props.resetForm();
    }
  }
  
  render() {
    const {
      fields: { message },
      invalid,
      handleSubmit,
      submitting
    } = this.props;
    
    return (
      <form onSubmit={handleSubmit}>
        <Input {...message} type="text" id="chat-message-input" placeholder="Enter a chat message" 
               buttonAfter={<Button bsStyle="primary" disabled={invalid || submitting} onClick={handleSubmit}>Send</Button>} />
      </form>
    );
  }
}

// Validation constraints
const constraints = {
  message: { presence: true }
};

export default reduxForm({
  form: 'chatMessageInput',
  fields: [ 'message' ],
  validate: vals => validateForm(vals, constraints)
})(ChatMessageInput);