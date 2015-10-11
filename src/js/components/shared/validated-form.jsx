const React = require('react');
const _ = require('lodash');
const ValidationActions = require('lib/validation/validation-actions');
const ValidationStore = require('lib/validation/validation-store');

class ValidatedForm extends React.Component {
  constructor(props) {
    super(props);
    
    // Set initial state
    this.state = { isValid: false };
  }
  
  componentDidMount() {
    ValidationStore.addChangeListener(this.updateState, this);
  }
  
  componentWillUnmount() {
    ValidationStore.removeChangeListener(this.updateState, this);
  }
  
  updateState() {
    // Look for any invalid inputs and set state accordingly
    let isInvalid = _.any(this.props.inputIds, function(inputId) {
      // Just skip any inputs that don't have validation state by returning false
      let validationState = ValidationStore.getValidationState(inputId);
      return validationState ? validationState.isValid === false : false;
    });
    
    this.setState({ isValid: !isInvalid });
  }
  
  handleSubmit(e) {
    ValidationActions.validateInputs(this.props.inputIds);
    
    if (!this.state.isValid) {
      ValidationActions.showMessages(this.props.inputIds);
      e.preventDefault();
      return;
    }
    
    if (this.props.onSubmit) {
      this.props.onSubmit(e);
    }
  }
  
  render() {
    let { children, inputIds, ...other } = this.props;
    return (
      <form {...other} onSubmit={e => this.handleSubmit(e)} noValidate>
        {children}
      </form>
    );
  }
}

// Prop validation
ValidatedForm.propTypes = {
  inputIds: React.PropTypes.arrayOf(React.PropTypes.string)
};

// Export control
export default ValidatedForm;