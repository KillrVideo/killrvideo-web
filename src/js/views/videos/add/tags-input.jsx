import React, { Component, PropTypes } from 'react';
import { isUndefined } from 'lodash';
import { Label, Glyphicon } from 'react-bootstrap';

// Component for entering tags (i.e. keywords) for a video
class TagsInput extends Component {
  constructor(props) {
    super(props);
    
    const val = isUndefined(props.value) ? props.defaultValue : props.value;
    
    // Set initial state
    this.state = {
      value: val,
      tagValue: ''
    };
  }
  
  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value && !isUndefined(nextProps.value)) {
      this.setState({ value: nextProps.value });
    }
  }
  
  focus() {
    this.refs.tagValueInput.focus();
  }
  
  blur() {
    this.refs.tagValueInput.blur();
  }
    
  handleTagChange(e) {
    this.setState({ tagValue: e.target.value });
  }
  
  handleTagKeyDown(e) {
    const isTagEmpty = this.state.tagValue === '';
    
    switch(e.keyCode) {
      case 13: // Enter key
        if (!isTagEmpty) {
          this.addTag();
          e.preventDefault();
        }
        break;
        
      case 8: // Backspace
        if (isTagEmpty && this.state.value.length > 0) {
          this.removeTag(this.state.value.length - 1);
          e.preventDefault();
        }
        break;
    }
  }
  
  handleFocus(e) {
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  }
  
  handleBlur(e) {
    // If there is some input in the tagValue box when blurred, add that as a tag
    if (this.state.tagValue !== '') {
      this.addTag();
    }
    
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  }
  
  addTag() {
    const value = [ ...this.state.value, this.state.tagValue ];
    this.setState({
      value,
      tagValue: ''
    });
    
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
  
  removeTag(idx) {
    const value = [ ...this.state.value ];
    value.splice(idx, 1);
    this.setState({
      value
    });
    
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }
  
  render() {
    // Only show placeholder when we don't have any values
    const placeholder = this.state.value.length > 0 ? undefined : this.props.placeholder;
    
    return (
      <div className="add-video-tags form-control" onClick={e => this.focus()}>
        {this.state.value.map((tag, idx) => {
          return (
            <Label key={idx} onClick={() => this.removeTag(idx)}>
              {tag} <Glyphicon glyph="remove" />
            </Label>
          )
        })}
        <input type="text" value={this.state.tagValue} ref="tagValueInput" placeholder={placeholder}
               onChange={e => this.handleTagChange(e)} onKeyDown={e => this.handleTagKeyDown(e)}
               onFocus={e => this.handleFocus(e)} onBlur={e => this.handleBlur(e)} />
      </div>
    );
  }
}

// Prop validation
TagsInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  defaultValue: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string,
  
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default TagsInput;