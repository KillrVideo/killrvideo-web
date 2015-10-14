import React, { Component, PropTypes } from 'react';
import { Input as BootstrapInput } from 'react-bootstrap';

// Wrapper component for a Bootstrap input that adds some extra information from validation
// props and allows for focusing the input once mounted
class Input extends Component {
  componentDidMount() {
    if (this.props.focusOnMount) {
      this._input.getInputDOMNode().focus();
    }
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
    return (
      <BootstrapInput {...this.props} {...this.getBootstrapProps(this.props.touched, this.props.error)}
                      ref={c => this._input = c} />
    );
  }
}

Input.propTypes = {
  touched: PropTypes.bool,
  error: PropTypes.array,
  focusOnMount: PropTypes.bool
};

export default Input;