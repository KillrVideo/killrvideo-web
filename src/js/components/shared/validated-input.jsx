const React = require('react');
const Input = require('react-bootstrap').Input;
const ValidationActions = require('lib/validation/validation-actions');
const ValidationStore = require('lib/validation/validation-store');


// Validated react-bootstrap input
class ValidatedInput extends React.Component {
  componentWillMount() {
    let fieldName = this.props.validationName || this.props.label;
    if (!fieldName) {
      throw new Error('No validationName or label property defined');
    }
    
    ValidationActions.addInput(this.props.id, fieldName, this.props.validationConstraints, this.props.value);
    
    // Set the initial state
    this.setState(ValidationStore.getValidationState(this.props.id));
  }
  
  componentDidMount() {
    // Listen for changes and update state
    ValidationStore.addChangeListener(this.updateState, this);
  }    
  
  componentWillUnmount() {
    ValidationStore.removeChangeListener(this.updateState, this);
    ValidationActions.removeInput(this.props.id);
  }
      
  updateState() {
    this.setState(ValidationStore.getValidationState(this.props.id));
  }
  
  handleChange(e) {
    ValidationActions.trackInputValue(this.props.id, e.target.value);
    if (this.props.validateOnChange) {
      ValidationActions.validateInputs(this.props.id);
      ValidationActions.showMessages(this.props.id);
    }
    
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }
  
  handleBlur(e) {
    if (this.props.validateOnBlur) {
      ValidationActions.validateInputs(this.props.id);
      ValidationActions.showMessages(this.props.id);
    }
    
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  render() {
    let bsStyle, helpText;
    if (this.state.validationVisible) {
      if (this.state.isValid) {
        bsStyle = 'success';
      } else {
        bsStyle = 'error';
        helpText = this.state.validationMessages.join('. ');
      }
    }
    
    return (
      <Input {...this.props} bsStyle={bsStyle} help={helpText}
          onChange={e => this.handleChange(e)} onBlur={e => this.handleBlur(e)} />
    );
  }
}

// Prop validation
ValidatedInput.propTypes = {
  id: React.PropTypes.string.isRequired,
  validationConstraints: React.PropTypes.object.isRequired
}

export default ValidatedInput;