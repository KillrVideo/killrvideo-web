const React = require('react');

const Image = require('../shared/image');
const WhatIsThis = require('./what-is-this');
const SearchBox = require('./search-box');

class Header extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      showWhatIsThis: false,
      loggedIn: false,
      loggedInUser: {
        firstName: '',
        lastName: '',
        profileImageUrl: ''
      }
    };
  }
  
  logoutUser() {
    // TODO: Logout user
  }
  
  toggleWhatIsThis() {
    this.setState({ showWhatIsThis: !this.state.showWhatIsThis });
  }
  
  render() {
    // TODO: Switch to react-bootstrap navbar once brand/header with collapse is implemented
    // (see https://github.com/react-bootstrap/react-bootstrap/pull/1184)
    return (
      <div id="header">
        <nav className="navbar navbar-default navbar-fixed-top" role="navigation" id="navbar-main">
          <div className="container">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a href="/" className="navbar-brand" id="logo">
                <Image src="killrvideo.png" alt="KillrVideo.com Logo" />
              </a>
            </div>
            <div className="navbar-collapse collapse">
              <SearchBox />

              <ul className="nav navbar-nav navbar-right">
                <li>
                  <a href="#" onClick={e => this.toggleWhatIsThis()} className={this.state.showWhatIsThis ? 'dropup' : ''}>
                    What is this? <span className="caret"></span>
                  </a>
                </li>
                { /* Registration/sign in for users that aren't logged in */ }
                <li className={this.state.loggedIn ? 'hidden' : ''}>
                  <a id="sign-in" href="/account/signin" className="text-uppercase">Sign in</a>
                </li>
                <li className={this.state.loggedIn ? 'hidden' : ''}>
                  <a id="register" href="/account/register" className="bg-success text-uppercase">Register</a>
                </li>

                { /* Menu for users that are logged in */ }
                <li className="dropdown" className={!this.state.loggedIn ? 'hidden' : ''}>
                  <a id="loggedin-user" href="#" className="dropdown-toggle" data-toggle="dropdown">
                    {this.state.loggedInUser.firstName + ' ' + this.state.loggedInUser.lastName}
                    <img src={this.state.loggedInUser.profileImageUrl} alt="Profile image" className="img-circle user-gravatar"/>
                    <span className="caret"></span>
                  </a>
                  <ul className="dropdown-menu" role="menu">
                    <li><a id="my-account" href="/account/info"><i className="fa fa-cog fa-fw"></i> My Account</a></li>
                    <li><a id="add-video-link" href="/videos/add"><i className="fa fa-video-camera fa-fw"></i> Add a Video</a></li>
                    <li className="divider"></li>
                    <li><a href="#" onClick={e => this.logoutUser()}><i className="fa fa-sign-out fa-fw"></i> Sign Out</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <WhatIsThis open={this.state.showWhatIsThis} toggleOpen={() => this.toggleWhatIsThis()} />
      </div>
    );
  }
}

export default Header;