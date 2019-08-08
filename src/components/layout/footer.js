import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router';

// Component for the site's footer
class Footer extends React.Component {
  render() {
    let sampleData;
    if (this.props.dev) {
      sampleData = <li><Link to="/sampledata">Add Sample Data</Link></li>
    }
    
    const footerClass = classNames('small', this.props.className);
    
    return (
      <footer className={footerClass}>
        <div className="container">
          <ul className="list-inline pull-left">
            {sampleData}
          </ul>
          <div className="pull-right">
            &copy; {new Date().getFullYear()} - KillrVideo
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;