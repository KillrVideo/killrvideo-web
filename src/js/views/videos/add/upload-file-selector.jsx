import React, { Component, PropTypes } from 'react';
import Dropzone from 'react-dropzone';
import { isUndefined } from 'lodash';

import Icon from 'components/shared/icon';

// Component for selecting a video file for upload
class UploadFileSelector extends Component {
  constructor(props){
    super(props);
    
    this.state = {
      value: null
    };
  }
  
  componentWillReceiveProps(nextProps) {
    // Keep state in sync with prop changes to value
    if (this.props.value !== nextProps.value && !isUndefined(nextProps.value)) {
      this.setState({ value: nextProps.value });
    }
  }
  
  handleDropzoneKeys(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      this.refs.dropzone.open();
      e.preventDefault();
    }
  }
  
  handleDropzoneDrop(files) {
    const value = files[0];
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
  
  handleFocus(e) {
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  }
  
  handleBlur(e) {
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  }
  
  render() {
    return (
      <Dropzone multiple={false} tabIndex="0" className="add-video-upload-drop" activeClassName="active" ref="dropzone"
                onDrop={files => this.handleDropzoneDrop(files)} onFocus={e => this.handleFocus(e)}
                onBlur={e => this.handleBlur(e)} onKeyPress={e => this.handleDropzoneKeys(e)}>
        <div>
          <Icon name="file-video-o" size="4x" /><br/>
          Drag and drop a file to upload<br/>
          <span className="text-muted">Or click to choose a file</span>
        </div>
      </Dropzone>
    );
  }
}

// Prop validation
UploadFileSelector.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

// Export the component
export default UploadFileSelector;