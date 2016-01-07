import React, { Component, PropTypes } from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { isUndefined, isNumber, find } from 'lodash';

import Icon from 'components/shared/icon';
import VideoLocationTypes from 'lib/video-location-types'

const defaultSource = { icon: '', text: 'Select a video source' };
const sources = [
  { icon: 'folder-open', text: 'Local Computer', value: VideoLocationTypes.UPLOAD },
  { icon: 'youtube', text: 'YouTube', value: VideoLocationTypes.YOUTUBE }
];

// Component for selecting the source for a new video
class VideoSourceSelector extends Component {
  constructor(props) {
    super(props);
    
    // Some private fields that don't have any bearing on rendering, so keep them outside of react state
    this._hasFocus = false;
    this._blurTimer = null;
    
    // Figure out initial value based on prop values
    const initialValue = !isUndefined(props.value)
      ? props.value
      : !isUndefined(props.defaultValue)
        ? props.defaultValue
        : null;
    
    this.state = {
      value: initialValue
    };
  }
  
  componentWillReceiveProps(nextProps) {
    // React to prop value changes and set state
    if (this.props.value !== nextProps.value && !isUndefined(nextProps.value)) {
      this.setState({ value: nextProps.value });
    }
  }
  
  handleFocus() {
    // Cancel any blur timers since we still have focus
    if (this._blurTimer !== null) {
      clearTimeout(this._blurTimer);
    }
    
    // Only fire the focus handler if we're actually changing focus state
    if (this._hasFocus === false) {
      this._hasFocus = true;
      if (this.props.onFocus) {
        this.props.onFocus();
      }
    }
  }
  
  handleBlur() {
    // A blur event from the dropdown may be immediately followed by a focus event (i.e. when going from the toggle button
    // to the dropdown menu), so change the state and fire the event on a timeout to give that a chance to happen
    this._blurTimer = setTimeout(() => {
      this._hasFocus = false;
      if (this.props.onBlur) {
        this.props.onBlur();
      }
    }, 1);
  }
  
  handleSelect(selectedValue) {
    if (this.state.value !== selectedValue) {
      this.setState({ value: selectedValue });
      
      if (this.props.onChange) {
        this.props.onChange(selectedValue);
      }
    }
  }
    
  render() {
    const { value } = this.state;
    const selectedSource = !isNumber(value) ? defaultSource : find(sources, { value });
    
    return (
      <Dropdown vertical block id="add-video-source" onSelect={(event, eventKey) => this.handleSelect(eventKey)}
                onFocus={() => this.handleFocus()} onBlur={() => this.handleBlur()}>
        <Dropdown.Toggle className="form-control btn-inverse">
          <span className="h4"><Icon name={selectedSource.icon} fixedWidth /> {selectedSource.text}</span>
        </Dropdown.Toggle>
        <Dropdown.Menu id="add-video-source-menu">
          {sources.map((source, idx) => {
            return (
              <MenuItem eventKey={source.value} key={source.value} active={value === source.value}>
                <span className="h4"><Icon name={source.icon} fixedWidth /> {source.text}</span>
              </MenuItem>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

// Prop validation
VideoSourceSelector.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default VideoSourceSelector;