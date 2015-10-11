const React = require('react');
const Input = require('react-bootstrap').Input;
const ValidationActions = require('lib/validation/validation-input-actions');
const ValidationStore = require('lib/validation/validation-input-store');


// Validated react-bootstrap input
class ValidatedInput extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      validationVisible: false
    };
  }
  
  componentWillMount() {
    // Tell everyone about the new validated input
    let fieldName = this.props.validationName || this.props.label;
    if (!fieldName) {
      throw new Error('No validationName or label property defined');
    }
    
    ValidationActions.add(this.props.id, fieldName, this.props.validationConstraints, this.props.value);
  }
  
  componentDidMount() {
    // Listen for changes and update state
    ValidationStore.addChangeListener(this.updateState, this);
  }    
  
  componentWillUnmount() {
    ValidationStore.removeChangeListener(this.updateState, this);
    ValidationActions.remove(this.props.id);
  }
      
  updateState() {
    this.setState(ValidationStore.getValidationState(this.props.id));
  }
  
  handleChange(e) {
    ValidationActions.trackValue(this.props.id, e.target.value);
    if (this.props.validateOnChange) {
      ValidationActions.validate(this.props.id);
      ValidationActions.show(this.props.id);
    }
    
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }
  
  handleBlur(e) {
    if (this.props.validateOnBlur) {
      ValidationActions.validate(this.props.id);
      ValidationActions.show(this.props.id);
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