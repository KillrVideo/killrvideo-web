const React = require('react');

// Component for the site's footer
class Footer extends React.Component {
  render() {
    let sampleData;
    if (this.props.dev) {
      sampleData = <li><a href="/sampledata">Add Sample Data</a></li>
    }
    
    return (
      <footer className="small">
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