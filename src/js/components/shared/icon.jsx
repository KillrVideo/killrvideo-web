const React = require('react');

// Create component for displaying Font Awesome icons
class Icon extends React.Component {
  render() {
    let fontAwesomeClass = 'fa fa-' + this.props.icon; 
    return (
      <i className={fontAwesomeClass}></i>
    );
  }
}

export default Icon;