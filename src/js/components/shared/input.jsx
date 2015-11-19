import React, { Component, PropTypes } from 'react';
import { Input as BootstrapInput } from 'react-bootstrap';

// Wrapper component for a Bootstrap input that adds some extra information from validation
// props and allows for focusing the input once mounted
class Input extends Component {
  componentDidMount() {
    if (this.props.focusOnMount) {
      this.focus();
    }
  }
  
  focus() {
    this._input.getInputDOMNode().focus();
  }
  
  getBootstrapProps(touched, error) {
    if (!touched) {
      return {};
    }
    
    return error 
      ? { bsStyle: 'error', help: error.join('. ') } 
      : { bsStyle: 'success' };
  }
  
  render() {
    // React treats undefined differently for textarea inputs so we need to change undefined
    // to an empty string here to prevent it from being uncontrolled (and thus not responding to a reset)
    // (see: https://github.com/facebook/react/issues/2533)
    let textAreaValue;
    if (this.props.type === 'textarea') {
      textAreaValue = this.props.value || '';
    }
    
    return (
      <BootstrapInput {...this.props} {...this.getBootstrapProps(this.props.touched, this.props.error)}
                      value={textAreaValue} ref={c => this._input = c} />
    );
  }
}

Input.propTypes = {
  touched: PropTypes.bool,
  error: PropTypes.array,
  focusOnMount: PropTypes.bool
};

export default Input;