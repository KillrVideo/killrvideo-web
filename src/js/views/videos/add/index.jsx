import React, { Component, PropTypes } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import validate from 'validate.js';

import ViewVideoLink from 'components/videos/view-video-link';
import SourceSelector from './source-selector';
import Input from 'components/shared/input';

class AddVideo extends Component {
  render() {
    const { 
      videoId,
      showCommonDetails,
      fields: { source, name, description, tags } 
    } = this.props;
    
    // Center columns until we're showing the common video details column
    const columnPush = showCommonDetails === false ? 3 : undefined;
    
    let successAlert;
    if (videoId !== null) {
      successAlert = (
        <Alert bsStyle="success">
          Your video has successfully been added. <ViewVideoLink videoId={videoId} className="alert-link">Click here</ViewVideoLink> to view it.
        </Alert>
      );
    }
    
    return (
      <div id="video-add">
        <Row>
          <Col sm={6} smPush={columnPush}>
            <h3><em>Add</em> Video</h3>
            
            {/*TODO: UiMessages? */}
            
            {successAlert}
          </Col>
        </Row>
        <Row>
          <form className={videoId !== null ? 'hidden' : ''}>
            {/* Source selection and source-specific form fields */}
            <Col sm={6} smPush={columnPush}>
              <Input {...source} label="Source">
                <SourceSelector {...source} />
              </Input>
            </Col>
            {/* Common video details */}
            <Col sm={6} className={showCommonDetails === false ? 'hidden' : ''}>
              <Input {...name} type="text" placeholder="Video name" label="Name" />
              <Input {...description} type="textarea" placeholder="Video description" label="Description" />
              <Input {...tags} type="text" label="Tags" />
            </Col>
          </form>
        </Row>
      </div>
    );
  }
}

// Prop validation
AddVideo.propTypes = {
  // From redux state
  videoId: PropTypes.string,
  showCommonDetails: PropTypes.bool.isRequired,
  
  // From redux form state
  fields: PropTypes.object.isRequired,
};

// Map redux store state to component props
function mapStateToProps(state) {
  const { addVideo } = state;
  return {
    ...addVideo
  };
}

// Form validation constraints
const constraints = {
  source: { presence: true },
  name: { presence: true },
  description: { presence: true },
  tags: { presence: true }
};

export default reduxForm({
  form: 'addVideo',
  fields: [ 'source', 'name', 'description', 'tags' ],
  validate: vals => validate(vals, constraints) || {}
}, mapStateToProps)(AddVideo);